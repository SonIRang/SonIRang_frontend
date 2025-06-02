import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useStompClient } from "../context/StompContext";


const VideoCallScreen = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const receiverId = location.state?.receiverId;
  const callerId = location.state?.callerId;
  const offer = location.state?.offer;
  const incoming = location.state?.incoming;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceCandidateQueue = useRef([]);

  // StompClient와 연결 상태를 Context에서 가져옴
  const { stompClient, connected } = useStompClient();

  const [peerConnection, setPeerConnection] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  const sendSignalToPeer = (type, to, data = null) => {
    if (!stompClient || !stompClient.connected) {
      console.warn("❗ STOMP 클라이언트가 연결되지 않음");
      return;
    }
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

  // 기존 connectWebSocket 함수는 제거 (WebSocket 연결은 StompProvider가 담당)
  // 대신 연결 확인용 effect 추가

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

  // WebSocket 메시지 구독 설정은 여기서 stompClient가 변경될 때마다 등록
  useEffect(() => {
    if (!stompClient || !connected) return;

    const subscription = stompClient.subscribe(
      "/user/queue/signal",
      (message) => {
        const data = JSON.parse(message.body);
        switch (data.type) {
          case "offer":
            (async () => {
              if (!peerConnection) {
                createPeerConnection();
              }
              try {
                await peerConnection.setRemoteDescription(
                  new RTCSessionDescription(data.data)
                );
                setRemoteDescriptionSet(true);
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                sendSignalToPeer("answer", data.from, answer);
              } catch (e) {
                console.error("❌ Offer 처리 실패:", e);
              }
            })();
            break;
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
      }
    );

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [stompClient, connected, peerConnection]);

  useEffect(() => {
    const initCall = async () => {
      await startCamera();
      await startMic();
      const user = localStorage.getItem("useremail");
      setCurrentUserId(user);

      if (!incoming && callerId && receiverId) {
        createOffer();
      }
    };

    initCall();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
        console.log("🔌 WebSocket 연결 해제됨");
      }
      closePeerConnection();
    };
  }, []);

  return (
    <VideoContainer>
      <VideoArea>
        <LocalVideoWrapper>
          <video ref={localVideoRef} autoPlay muted />
          {!isCameraOn && (
            <CenterProfileImage src="/profile.png" alt="프로필 이미지" />
          )}
        </LocalVideoWrapper>
        <RemoteVideo ref={remoteVideoRef} autoPlay />
      </VideoArea>

      <ButtonSide>
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

        <IconButton
          src="/endcall.png"
          alt="통화 종료"
          onClick={() => navigate("/")}
        />
        <button onClick={createOffer}>통화 시작</button>
      </ButtonSide>
    </VideoContainer>
  );
};

export default VideoCallScreen;

const VideoContainer = styled.div`
  width: 100%;
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

const RemoteVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: black;
  border-radius: 20px;
  z-index: 1;
`;

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
  height: 100%;
  width: auto;
  cursor: pointer;
  margin: 0 0.5rem;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;
