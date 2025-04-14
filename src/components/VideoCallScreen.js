import React, { useEffect, useRef, useState } from "react";

const VideoCallScreen = () => {
  const localVideoRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    // 컴포넌트 언마운트 시 카메라 정리
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = localStream;
      setStream(localStream);
      setIsCameraOn(true);
      setIsMicOn(true);
    } catch (err) {
      console.error("카메라/마이크크 접근 실패:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
      setIsMicOn(false);
    }
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMicOn(track.enabled);
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-xl font-bold mb-4">영상통화 화면</h2>
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-md rounded-2xl shadow-lg border border-gray-300"
      />

      <img
        src={isMicOn ? "/speak-on.png" : "/speak-off.png"}
        alt="마이크 상태"
        className="w-full h-full object-contain"
      />

      <div className="mt-4 space-x-2">
        {!isCameraOn ? (//카메라 켜기
          <img src="/camera-on.png"
            onClick={startCamera} />

        ) : ( //카메라 끄기
          <img src="/camera-off.png"
            onClick={stopCamera} />

        )}
      </div>
    </div>
  );
};

export default VideoCallScreen;