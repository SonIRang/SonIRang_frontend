// src/pages/MeetingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import VideoCallScreen from "../components/VideoCallScreen";

const MeetingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mb-4">영상통화 페이지</h1>

      {/* VideoCall 화면 삽입 */}
      <VideoCallScreen />

      {/* 통화 종료 버튼 */}
      <img
        src="/endcall.png"
        alt="통화 종료"
        onClick={() => navigate('/')}
        className="mt-6 w-12 h-12 cursor-pointer hover:opacity-80"
      />
    </div>
  );

};

export default MeetingPage;