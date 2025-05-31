import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const VideoCallScreen = () => {
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const location = useLocation();
  const receiverId = location.state?.receiverId; // 전화 걸 친구 이메일

  const [stompClient, setStompClient] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [callerId, setCallerId] = useState(null);
  const [pendingOffer, setPendingOffer] = useState(null);
  const [remoteDescriptionSet, setRemoteDescriptionSet] = useState(false);
  const iceCandidateQueue = useRef([]);
  const [incomingCallVisible, setIncomingCallVisible] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("useremail");
    if (!token) alert("JWT 토큰이 없습니다. 로그인 후 다시 시도해주세요.");
    if (!user) alert("유저 ID가 없습니다.");
    setCurrentUserId(user || "");
  }, []);

const connectWebSocket = (handleAnswer, handleCandidate, closePeerConnection, setStompClient) => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    alert("JWT 토큰이 없습니다. 로그인 후 다시 시도해주세요.");
    return;
  }

  const stomp = new Client({
    brokerURL: `ws://localhost:8080/ws-signaling?token=${encodeURIComponent(accessToken)}`,
    reconnectDelay: 5000,
    heartbeatIncoming: 0,
    heartbeatOutgoing: 0,

    onConnect: () => {
      console.log("✅ MeetingPage WebSocket 연결됨");

      stomp.subscribe("/user/queue/signal", (message) => {
        const data = JSON.parse(message.body);

        switch (data.type) {
          case "answer":
            handleAnswer(data);
            break;

          case "candidate":
            handleCandidate(data);
            break;

          case "reject":
            alert("상대방이 통화를 거절했습니다.");
            closePeerConnection();
            break;

          case "end":
            alert("상대방이 통화를 종료했습니다.");
            closePeerConnection();
            break;

          default:
            console.warn("⚠️ MeetingPage에서 알 수 없는 메시지 타입:", data.type);
        }
      });
    },

    onStompError: (frame) => {
      console.error("❌ STOMP 에러 발생:", frame);
    },
  });

  stomp.activate();
  setStompClient(stomp);

  return () => {
    stomp.deactivate();
    console.log("🔌 MeetingPage WebSocket 연결 해제됨");
  };
};

  // 카메라 켜기 (트랙 새로 가져와서 추가, enabled는 true)
  const startCamera = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      const videoTrack = cameraStream.getVideoTracks()[0];

      if (!localStreamRef.current) {
        localStreamRef.current = new MediaStream();
      }

      // 기존 비디오 트랙 제거 및 중지
      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        localStreamRef.current.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }

      videoTrack.enabled = true; // 활성화 상태
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

  // 마이크 켜기 (트랙 새로 가져와서 추가, enabled는 true)
  const startMic = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioTrack = micStream.getAudioTracks()[0];

      if (!localStreamRef.current) {
        localStreamRef.current = new MediaStream();
      }

      // 기존 오디오 트랙 제거 및 중지
      const oldAudioTrack = localStreamRef.current.getAudioTracks()[0];
      if (oldAudioTrack) {
        localStreamRef.current.removeTrack(oldAudioTrack);
        oldAudioTrack.stop();
      }

      audioTrack.enabled = true; // 활성화 상태
      localStreamRef.current.addTrack(audioTrack);

      setIsMicOn(true);
      console.log("🎤 마이크 시작됨");
    } catch (err) {
      console.error("❌ 마이크 시작 실패:", err);
      alert("마이크 권한을 확인해주세요.");
    }
  };

  const createPeerConnection = () => {
    const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
    const pc = new RTCPeerConnection(config);

    if (localStream) {
      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && stompClient) {
        stompClient.publish({
          destination: "/app/signal",
          body: JSON.stringify({
            type: "candidate",
            to: receiverId,
            from: currentUserId,
            data: event.candidate,
          }),
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = event.streams[0];
    };

    iceCandidateQueue.current = [];
    setRemoteDescriptionSet(false);
    setPeerConnection(pc);
    return pc;
  };

  const createOffer = async () => {
    if (!stompClient) {
      alert("서버에 연결되지 않았습니다.");
      return;
    }

    const pc = peerConnection || createPeerConnection();
    if (!pc) return;

    try {
      const res = await fetch(
        `/api/is-connected/${encodeURIComponent(receiverId)}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
          },
        }
      );

      if (!res.ok) {
        alert(`서버 응답 오류: ${res.status}`);
        return;
      }

      const connected = await res.json();

      if (!connected) {
        alert("상대방이 아직 WebSocket에 연결되지 않았습니다.");
        return;
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      stompClient.publish({
        destination: "/app/signal",
        body: JSON.stringify({
          type: "offer",
          to: receiverId,
          data: offer,
        }),
      });
    } catch (err) {
      console.error(err);
      alert("통화 시작 중 오류가 발생했습니다.");
    }
  };

  const handleIncomingCall = (data) => {
    setCallerId(data.from);
    setPendingOffer(data.data);
    setIncomingCallVisible(true);
  };

  const handleAnswer = async (data) => {
    try {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.data)
      );
      setRemoteDescriptionSet(true);
      for (const c of iceCandidateQueue.current) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(c));
      }
      iceCandidateQueue.current = [];
      console.log("✅ Answer 수신 완료");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCandidate = (data) => {
    if (!data.data) return;
    if (remoteDescriptionSet && peerConnection) {
      peerConnection
        .addIceCandidate(new RTCIceCandidate(data.data))
        .catch(console.error);
    } else {
      iceCandidateQueue.current.push(data.data);
    }
  };

  const closePeerConnection = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    setRemoteDescriptionSet(false);
    iceCandidateQueue.current = [];
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const endCall = () => {
    if (!stompClient) return;
    stompClient.publish({
      destination: "/app/signal",
      body: JSON.stringify({
        type: "end",
        to: callerId || receiverId,
      }),
    });
    closePeerConnection();
    console.log("🔚 통화 종료");
  };

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

      <button onClick={connectWebSocket}>서버 연결</button>
      {/* 카메라 on/off 아이콘 버튼 */}
      <IconButton
        src={isCameraOn ? "/camera-on.png" : "/camera-off.png"}
        alt="카메라"
        onClick={() => {
          if (isCameraOn) {
            const track = localStreamRef.current?.getVideoTracks()[0];
            if (track) track.enabled = false; // 비활성화
            setIsCameraOn(false);
            console.log("📷 카메라 끔 (track.enabled = false)");
          } else {
            startCamera();
          }
        }}
      />

      {/* 마이크 on/off 아이콘 버튼 */}
      <IconButton
        src={isMicOn ? "/mic-on.png" : "/mic-off.png"}
        alt="마이크"
        onClick={() => {
          if (isMicOn) {
            const track = localStreamRef.current?.getAudioTracks()[0];
            if (track) track.enabled = false; // 비활성화
            setIsMicOn(false);
            console.log("🎤 마이크 끔 (track.enabled = false)");
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