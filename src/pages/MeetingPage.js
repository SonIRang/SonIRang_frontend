// src/pages/MeetingPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
// import VideoCallScreen from "../components/VideoCallScreen";
import ChatWindow from "../components/Chat";


const MeetingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* 왼쪽: 영상통화 화면 + 버튼 */}
      <div className="flex flex-col flex-1 items-center justify-between py-6">
        {/* 영상 통화 화면 */}
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl font-bold">영상통화 화면</h1>
          {/* <VideoCallScreen/> */}
        </div>

        <div className="flex-1 flex items-center justify-center">
          <h2 className="text-2xl font-bold"
          onClick={() => navigate("/signup")}>회원가입</h2>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex justify-center space-x-6 py-6">
          {/* 카메라 버튼 */}
          <img
            src="/camera-on.png"
            alt="카메라"
            className="w-12 h-12 cursor-pointer hover:opacity-80"
            onClick={() => console.log("카메라 클릭")}
          />
          {/* 마이크 버튼 */}
          <img
            src="/mic-on.png"
            alt="마이크"
            className="w-12 h-12 cursor-pointer hover:opacity-80"
            onClick={() => console.log("마이크 클릭")}
          />
          {/* 통화 종료 버튼 */}
          <img
            src="/endcall.png"
            alt="통화 종료"
            className="w-12 h-12 cursor-pointer hover:opacity-80"
            onClick={() => navigate("/")}
          />
        </div>
      </div>

      <div>
        <ChatWindow />
      </div>
    </div>
  );
};

export default MeetingPage;
