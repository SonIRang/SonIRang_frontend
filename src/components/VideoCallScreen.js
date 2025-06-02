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

  const { stompClient, connected } = useStompClient();

  const [peerConnection, setPeerConnection] = useState(null);
  const peerConnectionRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState("");
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState("");
  
  useEffect(() => {
    peerConnectionRef.current = peerConnection;
  }, [peerConnection]);

  const getDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const video = devices.filter((d) => d.kind === "videoinput");
      const audio = devices.filter((d) => d.kind === "audioinput");
      setVideoDevices(video);
      setAudioDevices(audio);
      if (video[0]) setSelectedVideoDeviceId(video[0].deviceId);
      if (audio[0]) setSelectedAudioDeviceId(audio[0].deviceId);
    } catch (err) {
      console.error("장치 가져오기 실패:", err);
    }
  };

  const sendSignalToPeer = (type, to, data = null) => {
    if (!stompClient || !stompClient.connected) return;
    stompClient.publish({
      destination: "/app/signal",
      body: JSON.stringify({ type, to, from: currentUserId, data }),
    });
  };

  const createPeerConnection = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

        // ✅ ICE 연결 상태 변화 핸들러 추가
    pc.oniceconnectionstatechange = () => {
      console.log("📡 ICE 연결 상태 변화:", pc.iceConnectionState);

      switch (pc.iceConnectionState) {
        case "connected":
          console.log("✅ 연결 완료 (connected)");
          break;
        case "disconnected":
          console.warn("⚠️ 연결 끊김 (disconnected)");
          break;
        case "failed":
          console.error("❌ ICE 연결 실패");
          // 필요시 자동 재시도 또는 종료 로직 추가
          break;
        case "closed":
          console.log("🔒 연결 종료됨 (closed)");
          break;
        default:
          console.log("ℹ️ 현재 ICE 상태:", pc.iceConnectionState);
      }
    };

    // ICE 후보 수집 핸들러
    pc.onicecandidate = (e) => {
      console.log("🌐 ICE 상태:", pc.iceConnectionState);
      if (e.candidate) {
        console.log("📨 ICE 후보 전송:", e.candidate);
        sendSignalToPeer("candidate", receiverId || callerId, e.candidate);
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    setPeerConnection(pc);
    peerConnectionRef.current = pc;
    setRemoteDescriptionSet(false);
    iceCandidateQueue.current = [];
    return pc;
  };

  const createOffer = async () => {
    let pc = peerConnection;
    if (!pc) pc = createPeerConnection();
    if (!pc) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignalToPeer("offer", receiverId, offer);
    } catch (err) {
      console.error("Offer 생성 실패:", err);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setRemoteDescriptionSet(true);
      setCallAccepted(true);
      for (const c of iceCandidateQueue.current) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(c));
      }
      iceCandidateQueue.current = [];
    } catch (err) {
      console.error("Answer 처리 실패:", err);
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
  };

  const endCall = () => {
    sendSignalToPeer("end", receiverId || callerId);
    closePeerConnection();
    navigate("/");
  };

  const startCamera = async (deviceId = selectedVideoDeviceId) => {
    try {
      const constraints = {
        video: { deviceId: deviceId ? { exact: deviceId } : undefined },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTrack = stream.getVideoTracks()[0];

      if (!localStreamRef.current) localStreamRef.current = new MediaStream();

      const oldTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldTrack) {
        localStreamRef.current.removeTrack(oldTrack);
        oldTrack.stop();
      }

      localStreamRef.current.addTrack(videoTrack);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setIsCameraOn(true);
    } catch (err) {
      alert("카메라 권한 또는 장치 설정을 확인해주세요.");
      console.error(err);
    }
  };

  const startMic = async (deviceId = selectedAudioDeviceId) => {
    try {
      const constraints = {
        audio: { deviceId: deviceId ? { exact: deviceId } : undefined },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const audioTrack = stream.getAudioTracks()[0];

      if (!localStreamRef.current) localStreamRef.current = new MediaStream();

      const oldTrack = localStreamRef.current.getAudioTracks()[0];
      if (oldTrack) {
        localStreamRef.current.removeTrack(oldTrack);
        oldTrack.stop();
      }

      localStreamRef.current.addTrack(audioTrack);
      setIsMicOn(true);
    } catch (err) {
      alert("마이크 권한 또는 장치 설정을 확인해주세요.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (!stompClient || !connected) return;

    const subscription = stompClient.subscribe("/user/queue/signal", (message) => {
      const data = JSON.parse(message.body);
      switch (data.type) {
        case "offer":
          (async () => {
            let pc = peerConnection;
            if (!pc) pc = createPeerConnection();
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(data.data));
              setRemoteDescriptionSet(true);
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              sendSignalToPeer("answer", data.from, answer);
            } catch (e) {
              console.error("Offer 처리 실패:", e);
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
          console.warn("알 수 없는 메시지 타입:", data.type);
      }
    });

    return () => subscription.unsubscribe();
  }, [stompClient, connected, peerConnection]);

  useEffect(() => {
    const init = async () => {
      await getDevices();
      await startCamera();
      await startMic();
      const user = localStorage.getItem("useremail");
      setCurrentUserId(user);
      if (!incoming && callerId && receiverId) createOffer();
    };

    init();
  }, []);

  return (
    <VideoContainer>
      {callAccepted && <AcceptedMessage>상대방이 전화를 받았습니다</AcceptedMessage>}
      <VideoArea>
        <RemoteVideo ref={remoteVideoRef} autoPlay />
        <LocalVideoWrapper>
          <LocalVideo ref={localVideoRef} autoPlay muted />
        </LocalVideoWrapper>
      </VideoArea>

      <DeviceSelectArea>
        <label>
          🎥 카메라:
          <select
            value={selectedVideoDeviceId}
            onChange={(e) => {
              setSelectedVideoDeviceId(e.target.value);
              startCamera(e.target.value);
            }}
          >
            {videoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `카메라 ${device.deviceId}`}
              </option>
            ))}
          </select>
        </label>

        <label>
          🎤 마이크:
          <select
            value={selectedAudioDeviceId}
            onChange={(e) => {
              setSelectedAudioDeviceId(e.target.value);
              startMic(e.target.value);
            }}
          >
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `마이크 ${device.deviceId}`}
              </option>
            ))}
          </select>
        </label>
      </DeviceSelectArea>

      <ButtonSide>
        <IconButton
          src={isCameraOn ? "/camera-on.png" : "/camera-off.png"}
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
        <IconButton src="/endcall.png" onClick={endCall} />
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
  z-index: 1;
  background-color: #bcbcbc;
`;

const CenterProfileImage = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30%;
  height: auto;
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
const AcceptedMessage = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 128, 0, 0.8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  font-weight: bold;
  z-index: 999;
`;
const DeviceSelectArea = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem;
`;