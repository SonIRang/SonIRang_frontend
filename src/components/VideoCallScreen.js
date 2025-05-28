import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const VideoCallScreen = ({ currentUser, receiver }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [client, setClient] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const localStreamRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);
  const remoteDescriptionSetRef = useRef(false);

  const rtcConfig = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    if (!currentUser) return;
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("JWT 토큰이 없습니다. 로그인 후 다시 시도해주세요.");
      return;
    }

    const socket = new SockJS(
      `http://localhost:8080/ws-signaling?token=${encodeURIComponent(
        accessToken
      )}`
    );

    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
      onConnect: (frame) => {
        console.log("✅ WebSocket 연결됨:", frame);
        stompClient.subscribe("/user/queue/signal", (message) => {
          const data = JSON.parse(message.body);
          switch (data.type) {
            case "offer":
              handleOffer(data);
              break;
            case "answer":
              handleAnswer(data);
              break;
            case "candidate":
              handleCandidate(data);
              break;
            default:
              console.warn("알 수 없는 메시지 타입:", data.type);
          }
        });
      },
      onStompError: (frame) => {
        alert("WebSocket 연결 실패: " + frame.headers["message"]);
        console.error("❌ WebSocket 연결 실패:", frame);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [currentUser]);

  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      console.log("🎥 로컬 미디어 시작됨");
    } catch (err) {
      console.error("❌ 미디어 시작 실패:", err);
      alert("카메라/마이크 권한을 확인해주세요.");
    }
  };

  const createPeerConnection = () => {
    if (!localStreamRef.current) {
      alert("먼저 미디어를 시작해주세요.");
      return;
    }
    const pc = new RTCPeerConnection(rtcConfig);

    localStreamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && client && receiver) {
        client.publish({
          destination: "/app/signal",
          body: JSON.stringify({
            type: "candidate",
            to: receiver,
            data: event.candidate,
          }),
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    iceCandidateQueueRef.current = [];
    remoteDescriptionSetRef.current = false;
    setPeerConnection(pc);
  };

  const createOffer = async () => {
    if (!client || !receiver) {
      alert("WebSocket 연결 및 상대방 ID를 확인해주세요.");
      return;
    }
    if (!peerConnection) createPeerConnection();
    if (!peerConnection) return;

    const connected = await fetch(
      `/api/is-connected/${encodeURIComponent(receiver)}`
    )
      .then((res) => res.json())
      .catch(() => false);

    if (!connected) {
      alert("상대방이 아직 WebSocket에 연결되지 않았습니다.");
      return;
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    client.publish({
      destination: "/app/signal",
      body: JSON.stringify({
        type: "offer",
        to: receiver,
        data: offer,
      }),
    });
  };

  const handleOffer = async (data) => {
    if (!peerConnection) createPeerConnection();
    if (!peerConnection) return;

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.data)
    );
    remoteDescriptionSetRef.current = true;

    for (const c of iceCandidateQueueRef.current) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        console.error(e);
      }
    }
    iceCandidateQueueRef.current = [];

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    if (client) {
      client.publish({
        destination: "/app/signal",
        body: JSON.stringify({
          type: "answer",
          to: data.from,
          data: answer,
        }),
      });
    }
    console.log("📞 Offer 수신 → Answer 전송 완료");
  };

  const handleAnswer = async (data) => {
    if (!peerConnection) return;
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.data)
    );
    remoteDescriptionSetRef.current = true;

    for (const c of iceCandidateQueueRef.current) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        console.error(e);
      }
    }
    iceCandidateQueueRef.current = [];

    console.log("✅ Answer 수신 완료");
  };

  const handleCandidate = (data) => {
    if (!data.data) {
      console.warn("ICE 후보 없음");
      return;
    }

    if (remoteDescriptionSetRef.current && peerConnection) {
      peerConnection
        .addIceCandidate(new RTCIceCandidate(data.data))
        .catch(console.error);
    } else {
      iceCandidateQueueRef.current.push(data.data);
    }
  };

  return (
    <VideoContainer>
      <LocalVideo ref={localVideoRef} autoPlay muted />
      <RemoteVideo ref={remoteVideoRef} autoPlay />
      <Spacer />
      <InfoText>내 ID (자동 설정됨): {currentUser}</InfoText>
      <InfoText>상대방 ID: {receiver}</InfoText>
      <Button onClick={startMedia}>카메라 시작</Button>
      <Button onClick={createOffer}>통화 시작</Button>
    </VideoContainer>
  );
};

export default VideoCallScreen;

// styled-components는 컴포넌트 함수 아래에 위치

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 80%;
`;

const LocalVideo = styled.video`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  // background-color: #808080;
  border: 1px solid gray;
  z-index: 1;
`;

const RemoteVideo = styled.video`
  position: absolute;
  // bottom: 1rem;
  // right: 1rem;
  width: 30%;
  border: 1px solid gray;
  z-index: 2;
`;

const Button = styled.button`
  margin: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background-color: #0056b3;
  }
`;

const InfoText = styled.p`
  margin: 0.3rem 0;
`;

const Spacer = styled.div`
  height: 1rem;
`;
