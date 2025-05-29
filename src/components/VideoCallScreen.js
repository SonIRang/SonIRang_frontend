import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const VideoCallScreen = ({ currentUser, receiver }) => {
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

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

  // 카메라만 시작
  const startCamera = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const videoTrack = cameraStream.getVideoTracks()[0];

      if (!localStreamRef.current) {
        localStreamRef.current = new MediaStream();
      }

      // 기존 영상 트랙이 있으면 제거
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        localStreamRef.current.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }

      localStreamRef.current.addTrack(videoTrack);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setIsCameraOn(true);
      console.log("📷 카메라 시작됨");
    } catch (err) {
      console.error("❌ 카메라 시작 실패:", err);
      alert("카메라 권한을 확인해주세요.");
    }
  };

  // 마이크만 시작
  const startMic = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioTrack = micStream.getAudioTracks()[0];

      if (!localStreamRef.current) {
        localStreamRef.current = new MediaStream();
      }

      // 기존 오디오 트랙이 있으면 제거
      const oldAudioTrack = localStreamRef.current.getAudioTracks()[0];
      if (oldAudioTrack) {
        localStreamRef.current.removeTrack(oldAudioTrack);
        oldAudioTrack.stop();
      }

      localStreamRef.current.addTrack(audioTrack);

      setIsMicOn(true);
      console.log("🎤 마이크 시작됨");
    } catch (err) {
      console.error("❌ 마이크 시작 실패:", err);
      alert("마이크 권한을 확인해주세요.");
    }
  };

  const createPeerConnection = () => {
    // if (!localStreamRef.current) {
    //   alert("먼저 미디어를 시작해주세요.");
    //   return;
    // }
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
      alert("WebSocket 연결 및 상대방 이메일일를 확인해주세요.");
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
      alert(`${receiver} 님이 아직 WebSocket에 연결되지 않았습니다.`);
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
      <VideoArea>
        <LocalVideoWrapper>
          <LocalVideo
            ref={localVideoRef}
            autoPlay
            muted
            $isCameraOn={isCameraOn}
          />
          {!isCameraOn && (
            <CenterProfileImage src="/profile.png" alt="프로필 이미지" />
          )}
        </LocalVideoWrapper>
        <RemoteVideo ref={remoteVideoRef} autoPlay />
      </VideoArea>
      {/* <Spacer />
      <InfoText>내 ID (자동 설정됨): {currentUser}</InfoText>
      <InfoText>상대방 ID: {receiver}</InfoText> */}
      {/* <Button onClick={startMedia}>카메라 시작</Button>
      <Button onClick={createOffer}>통화 시작</Button> */}
      <ButtonSide>
        <IconButton
          src={isCameraOn ? "/camera-on.png" : "/camera-off.png"}
          alt="카메라"
          onClick={() => {
            if (isCameraOn) {
              const track = localStreamRef.current?.getVideoTracks()[0];
              if (track) track.enabled = false;
              setIsCameraOn(false);
            } else {
              startCamera();
            }
          }}
        />
        <IconButton
          src={isMicOn ? "/mic-on.png" : "/mic-off.png"}
          alt="마이크"
          onClick={() => {
            if (isMicOn) {
              const track = localStreamRef.current?.getAudioTracks()[0];
              if (track) track.enabled = false;
              setIsMicOn(false);
            } else {
              startMic();
            }
          }}
        />
        <IconButton
          src="/endcall.png"
          alt="통화 종료"
          onClick={() => navigate("/")}
        />
      </ButtonSide>
    </VideoContainer>
  );
};

export default VideoCallScreen;

// styled-components는 컴포넌트 함수 아래에 위치

const VideoContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const VideoArea = styled.div`
  margin: auto;
  width: 90%;
  max-height: 85vh;
  aspect-ratio: 16 / 9;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
`;

// 상대방 비디오가 크게 나오는 영역
const RemoteVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: black;
  border-radius: 20px;
  z-index: 1;
`;

// 내 비디오를 오른쪽 아래에 작게 띄우는 영역
const LocalVideoWrapper = styled.div`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 30%;
  aspect-ratio: 16 / 9;
  z-index: 2;
  border-radius: 16px;
  overflow: hidden;
  background-color: #bcbcbc;
`;

// 내 비디오
const LocalVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  background-color: ${(props) => (props.$isCameraReady ? "black" : "#bcbcbc")};
`;

const CenterProfileImage = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  object-fit: cover;
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

const ButtonSide = styled.div`
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f2f2f7;
  border-radius: 30px;
  box-sizing: border-box;
  padding: 1rem;
`;

const IconButton = styled.img`
  height: 100%;         /* 부모 컨테이너 높이의 80% */
  width: auto
  cursor: pointer;
  margin: 0 0.5rem;    /* 좌우 간격 */
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;
