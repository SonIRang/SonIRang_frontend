import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { Client } from "@stomp/stompjs";

const VideoCallScreen = () => {
  const location = useLocation();
  const receiverId = location.state?.receiverId;
  const callerId = location.state?.callerId;
  const offer = location.state?.offer;
  const incoming = location.state?.incoming;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceCandidateQueue = useRef([]);

  const [stompClient, setStompClient] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  const sendSignalToPeer = (type, to, data = null) => {
    if (!stompClient) return;
    stompClient.publish({
      destination: "/app/signal",
      body: JSON.stringify({ type, to, from: currentUserId, data }),
    });
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignalToPeer("candidate", receiverId || callerId, e.candidate);
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    setPeerConnection(pc);
    setRemoteDescriptionSet(false);
    iceCandidateQueue.current = [];

    return pc;
  };

  const createOffer = async () => {
    const pc = peerConnection || createPeerConnection();
    if (!pc) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignalToPeer("offer", receiverId, offer);
    } catch (err) {
      console.error("❌ Offer 생성 실패:", err);
    }
  };

  const connectWebSocket = () => {
    const accessToken = localStorage.getItem("generalAccessToken");
    const user = localStorage.getItem("useremail");
    if (!accessToken || !user) {
      alert("JWT 또는 유저 정보가 없습니다.");
      return;
    }
    setCurrentUserId(user);

    const client = new Client({
      brokerURL: `ws://localhost:8080/ws-signaling?token=${encodeURIComponent(
        accessToken
      )}`,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ WebSocket 연결됨");

        client.subscribe("/user/queue/signal", async (message) => {
          const data = JSON.parse(message.body);

          switch (data.type) {
            case "answer":
              handleAnswer(data.data);
              break;
            case "candidate":
              handleCandidate(data.data);
              break;
            case "end":
              closePeerConnection();
              break;
            default:
              console.warn("⚠️ 알 수 없는 메시지 타입:", data.type);
          }
        });

        if (receiverId) {
          createOffer();
        }
      },
      onStompError: (frame) => {
        console.error("❌ STOMP 에러:", frame);
      },
    });

    client.activate();
    setStompClient(client);
  };

  const handleAnswer = async (answer) => {
    try {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setRemoteDescriptionSet(true);
      for (const c of iceCandidateQueue.current) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(c));
      }
      iceCandidateQueue.current = [];
    } catch (err) {
      console.error("❌ Answer 처리 실패:", err);
    }
  };

  const handleCandidate = (candidate) => {
    if (!candidate) return;
    if (remoteDescriptionSet && peerConnection) {
      peerConnection
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch(console.error);
    } else {
      iceCandidateQueue.current.push(candidate);
    }
  };

  const closePeerConnection = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    setRemoteDescriptionSet(false);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    console.log("🔚 PeerConnection 종료");
  };

  const endCall = () => {
    sendSignalToPeer("end", receiverId || callerId);
    closePeerConnection();
  };

  const startCamera = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const videoTrack = cameraStream.getVideoTracks()[0];

      if (!localStreamRef.current) {
        localStreamRef.current = new MediaStream();
      }

      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        localStreamRef.current.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }

      videoTrack.enabled = true;
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

  const startMic = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioTrack = micStream.getAudioTracks()[0];

      if (!localStreamRef.current) {
        localStreamRef.current = new MediaStream();
      }

      const oldAudioTrack = localStreamRef.current.getAudioTracks()[0];
      if (oldAudioTrack) {
        localStreamRef.current.removeTrack(oldAudioTrack);
        oldAudioTrack.stop();
      }

      audioTrack.enabled = true;
      localStreamRef.current.addTrack(audioTrack);

      setIsMicOn(true);
      console.log("🎤 마이크 시작됨");
    } catch (err) {
      console.error("❌ 마이크 시작 실패:", err);
      alert("마이크 권한을 확인해주세요.");
    }
  };

  useEffect(() => {
    connectWebSocket();
    startCamera();
    startMic();

    // ✅ 내가 거는 쪽(caller)일 때 자동으로 offer 생성
    if (!incoming && callerId && receiverId) {
      const tryOffer = async () => {
        // 카메라, 마이크가 다 준비되고 나서 약간의 시간 여유를 줌 (필요 시 제거 가능)
        await new Promise((res) => setTimeout(res, 1000));
        await createOffer(); // offer 생성 및 sendSignalToPeer 내부 호출
      };
      tryOffer();
    }

    return () => {
      if (stompClient) {
        stompClient.deactivate();
        console.log("🔌 MeetingPage WebSocket 연결 해제됨");
      }
      closePeerConnection();
    };
  }, []);

  return (
    <div>
      <h2>1:1 WebRTC 화상통화</h2>
      <p>
        내 ID: <b>{currentUserId || "로그인 필요"}</b>
      </p>
      <p>
        상대방 ID: <b>{receiverId || "없음"}</b>
      </p>

      <div>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          style={{ width: "45%", border: "1px solid gray" }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          style={{ width: "45%", border: "1px solid gray" }}
        />
      </div>

      <IconButton
        src={isCameraOn ? "/camera-on.png" : "/camera-off.png"}
        alt="카메라"
        onClick={() => {
          if (isCameraOn) {
            const track = localStreamRef.current?.getVideoTracks()[0];
            if (track) track.enabled = false;
            setIsCameraOn(false);
            console.log("📷 카메라 끔");
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
            console.log("🎤 마이크 끔");
          } else {
            startMic();
          }
        }}
      />

      <button onClick={createOffer}>통화 시작</button>
      <button onClick={endCall}>통화 종료</button>
    </div>
  );
};

export default VideoCallScreen;

const IconButton = styled.img`
  width: 32px;
  height: 32px;
  cursor: pointer;
  margin: 0 10px;
`;
