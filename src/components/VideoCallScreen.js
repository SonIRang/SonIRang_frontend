import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useStompClient } from "../context/StompContext";
import {
  FilesetResolver,
  FaceLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

const VideoCallScreen = ({ setCallHistoryId }) => {
  const navigate = useNavigate();

  const location = useLocation();
  const receiverId = location.state?.receiverId;
  const callerId = location.state?.callerId;
  const incoming = location.state?.incoming;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const iceCandidateQueue = useRef([]);

  // StompClient와 연결 상태를 Context에서 가져옴
  const { stompClient, connected } = useStompClient();

  const [peerConnection, setPeerConnection] = useState(null);
  const peerConnectionRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);

  const [cameraDevices, setCameraDevices] = useState([]);
  const [micDevices, setMicDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [selectedMicId, setSelectedMicId] = useState(null);

  const faceLandmarkerRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

useEffect(() => {
  (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );

faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath:
      "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
  },
  runningMode: "VIDEO",
  numFaces: 1,
});

handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath:
      "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
  },
  runningMode: "VIDEO",
  numHands: 2,
});

    setModelsLoaded(true);
    console.log("✅ MediaPipe 모델 로드 완료");
  })();
}, []);
  

  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameraDevices(devices.filter((d) => d.kind === "videoinput"));
      setMicDevices(devices.filter((d) => d.kind === "audioinput"));
    };
    getDevices();
  }, []);

  useEffect(() => {
    if (selectedCameraId !== null) {
      startCamera();
    }
  }, [selectedCameraId]);

  useEffect(() => {
    if (selectedMicId !== null) {
      startMic();
    }
  }, [selectedMicId]);

  useEffect(() => {
    peerConnectionRef.current = peerConnection;
  }, [peerConnection]);

  useEffect(() => {
    let intervalId;
    if (isCameraOn) {
      intervalId = setInterval(async () => {
      if (!faceLandmarkerRef.current || !handLandmarkerRef.current) {
        console.log("model not loaded yet");
        return;
      }

      const videoElement = localVideoRef.current;
        if (!videoElement) return;

      try {
        const nowInMs = performance.now();
        const faceResult = await faceLandmarkerRef.current.detectForVideo(videoElement, nowInMs);
        const handResult = await handLandmarkerRef.current.detectForVideo(videoElement, nowInMs);

        let faceCoords = [];
        if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
          faceCoords = faceResult.faceLandmarks[0].map((p) => [p.x, p.y, p.z]).flat();
        }
        let handCoords = [];
        if (handResult.landmarks && handResult.landmarks.length > 0) {
          handResult.landmarks.forEach((landmarkArray) => {
            handCoords = handCoords.concat(landmarkArray.map((p) => [p.x, p.y, p.z]).flat());
          });
        }

        // console.log({ face: faceCoords, hand: handCoords });
        sendDataToServer({ face: faceCoords, hand: handCoords });
      } catch (e) {
        console.error("detectForVideo error:", e);
      }
    }, 300);
  }
   return () => {
    clearInterval(intervalId); // 컴포넌트 unmount 또는 카메라 종료 시 제거
  };
  }, [isCameraOn, modelsLoaded]);

const sendDataToServer = async (data) => {
  try {
    await fetch('/api/landmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    console.log("✅ 서버로 데이터 전송 성공");
  } catch (error) {
    console.error("❌ 서버 전송 실패:", error);
  }
};

const sendCallhistoryId = async (data) => {
  try {
    await fetch('/api/landmark/prepare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    console.log("✅ callHistoryId 전송 성공");
  } catch (error) {
    console.error("❌ callHistoryId 전송 실패:", error);
  }
};
  
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
    console.log("📞 createPeerConnection 호출됨");

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

    // 1. ICE 후보가 생기면 상대방에게 전송
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("📤 ICE 후보 전송:", event.candidate);
        sendSignalToPeer("candidate", receiverId || callerId, event.candidate);
      }
    };

    // 2. 원격 스트림 수신 시 처리
    pc.ontrack = (event) => {
      console.log("🎥 원격 스트림 수신");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // 3. 연결 상태 모니터링
    pc.onconnectionstatechange = () => {
      console.log("🔄 연결 상태:", pc.connectionState);
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed"
      ) {
        console.warn("⚠️ 연결 끊김 - 연결 종료 처리");
        closePeerConnection();
      }
    };

    // 4. 로컬 스트림이 있다면 트랙 추가
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // 상태 업데이트
    setPeerConnection(pc);
    peerConnectionRef.current = pc;
    setRemoteDescriptionSet(false);
    iceCandidateQueue.current = [];

    return pc;
  };

  const createOffer = async () => {
    let pc = peerConnection;

    if (!pc) {
      pc = createPeerConnection(); // ✅ 리턴값을 반드시 사용
      setPeerConnection(pc);
    }

    if (!pc) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignalToPeer("offer", receiverId, offer);
    } catch (err) {
      console.error("❌ Offer 생성 실패:", err);
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
      console.log("✅ Answer 처리 성공:");
    } catch (err) {
      console.error("❌ Answer 처리 실패:", err);
    }
  };

  const handleCandidate = useCallback(
    (candidate) => {
      if (!candidate) return;
      if (remoteDescriptionSet && peerConnection) {
        peerConnection
          .addIceCandidate(new RTCIceCandidate(candidate))
          .then(() => console.log("✅ ICE 후보 추가 성공"))
          .catch((err) => console.error("❌ ICE 후보 추가 실패:", err));
      } else {
        console.log("📥 ICE 후보 대기열에 저장");
        iceCandidateQueue.current.push(candidate);
      }
    },
    [peerConnection, remoteDescriptionSet]
  );

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
  if (!modelsLoaded) {
    console.warn("모델이 아직 로드되지 않았습니다.");
    return;
  }
  try {
    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: selectedCameraId ? { deviceId: { exact: selectedCameraId } } : true,
    });
    console.log("✅ getUserMedia (video) 성공", cameraStream);

    const videoTrack = cameraStream.getVideoTracks()[0];
    if (!localStreamRef.current) {
      localStreamRef.current = new MediaStream();
    }
    const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
    if (oldVideoTrack) {
      localStreamRef.current.removeTrack(oldVideoTrack);
      oldVideoTrack.stop();
    }

    localStreamRef.current.addTrack(videoTrack);
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    console.log("로컬 스트림:", localStreamRef.current);
    setIsCameraOn(true);

    const videoElement = localVideoRef.current;
    console.log("videoElement:", videoElement);
    console.log("videoElement.readyState:", videoElement?.readyState);
  } catch (err) {
    console.error("❌ 카메라 시작 실패:", err);
    alert("카메라 권한을 확인해주세요.");
  }
};


  const startMic = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: selectedMicId ? { deviceId: { exact: selectedMicId } } : true,
      });

      console.log("✅ getUserMedia (audio) 성공", micStream);

      const audioTrack = micStream.getAudioTracks()[0];
      if (!audioTrack) {
        console.warn("⚠️ 오디오 트랙이 없습니다.");
        return;
      }

      if (!localStreamRef.current) {
        localStreamRef.current = new MediaStream();
      }

      const oldAudioTrack = localStreamRef.current.getAudioTracks()[0];
      if (oldAudioTrack) {
        console.log("🔄 기존 오디오 트랙 제거");
        localStreamRef.current.removeTrack(oldAudioTrack);
        oldAudioTrack.stop();
      }

      audioTrack.enabled = true;
      localStreamRef.current.addTrack(audioTrack);

      setIsMicOn(true);
      console.log("🎤 마이크 시작됨");
    } catch (err) {
      console.error("❌ 마이크 시작 실패:", err);
      if (err.name === "NotAllowedError") {
        alert("마이크 권한이 차단되어 있습니다. 브라우저 설정을 확인해주세요.");
      } else if (err.name === "NotFoundError") {
        alert("마이크 장치를 찾을 수 없습니다.");
      } else {
        alert("마이크 권한을 확인해주세요.");
      }
    }
  };

  // WebSocket 메시지 구독 설정은 여기서 stompClient가 변경될 때마다 등록
  useEffect(() => {
    if (!stompClient || !connected) return;

    const subscription = stompClient.subscribe(
      "/user/queue/signal",
      (message) => {
        const data = JSON.parse(message.body);
        console.log("📩 시그널 수신:", data);
        switch (data.type) {
          case "offer":
            (async () => {
              let pc = peerConnection;
              if (!pc) {
                pc = createPeerConnection(); // 👉 반환값을 반드시 받아야 함
                setPeerConnection(pc);
              }
              try {
                await pc.setRemoteDescription(
                  new RTCSessionDescription(data.data)
                );
                setRemoteDescriptionSet(true);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
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
          case "callHistoryCreated":
            console.log("✅ 통화 기록 생성됨:", data.callHistoryId);
            // 💡 callHistoryId를 부모에서 내려준 setCallHistoryId를 호출해서 저장
            if (setCallHistoryId) {
              setCallHistoryId(data.callHistoryId);
            }
            sendCallhistoryId({ callHistoryId: data.callHistoryId, senderEmail: location.state?.callerId });
            break;
          default:
            console.warn("⚠️ 알 수 없는 메시지 타입:", data.type);
        }
      }
    );

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [stompClient, connected, handleCandidate]);

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
  }, []);

  return (
    <VideoContainer>
      {callAccepted && (
        <AcceptedMessage>상대방이 전화를 받았습니다</AcceptedMessage>
      )}

      

      <VideoArea>
        <StartCallButton onClick={createOffer}>통화 시작</StartCallButton>
        <RemoteVideo autoPlay playsInline ref={remoteVideoRef} />
        <LocalVideoWrapper>
          <LocalVideo ref={localVideoRef} autoPlay muted />
          {!isCameraOn && (
            <CenterProfileImage src="/profile.png" alt="프로필 이미지" />
          )}
        </LocalVideoWrapper>
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
          onClick={() => {
            endCall();
            navigate("/");
          }}
        />
      </ButtonSide>
      <div style={{ padding: "10px", background: "#fff" }}>
        <label>카메라 선택:</label>
        <select
          onChange={(e) => setSelectedCameraId(e.target.value)}
          value={selectedCameraId || ""}
        >
          <option value="">기본 카메라</option>
          {cameraDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || "카메라"}
            </option>
          ))}
        </select>

        <label style={{ marginLeft: "1rem" }}>마이크 선택:</label>
        <select
          onChange={(e) => setSelectedMicId(e.target.value)}
          value={selectedMicId || ""}
        >
          <option value="">기본 마이크</option>
          {micDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || "마이크"}
            </option>
          ))}
        </select>
      </div>
    </VideoContainer>
  );
};

export default VideoCallScreen;

const StartCallButton = styled.button`
position: absolute;
  width: 100px;
  height: 30px;
  padding: 10px;
  margin: 10px;
  background-color: #ca9cc3;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2 ;
`;

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
