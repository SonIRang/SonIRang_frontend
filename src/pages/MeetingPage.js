import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import ChatWindow from "../components/Chat";
import VideoCallScreen from "../components/VideoCallScreen";

export default function ResponsiveChatLayout() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  return (
    <Container>
      <LeftPanel isChatOpen={chatOpen}>
        <VideoCallScreen/>
        <ButtonSide>
          <img
            src="/camera-on.png"
            alt="카메라"
            className="w-10 h-10 cursor-pointer hover:opacity-80"
            onClick={() => console.log("카메라 클릭")}
          />
          {/* 마이크 버튼 */}
          <img
            src="/mic-on.png"
            alt="마이크"
            className="w-10 h-10 cursor-pointer hover:opacity-80"
            onClick={() => console.log("마이크 클릭")}
          />
          {/* 통화 종료 버튼 */}
          <img
            src="/endcall.png"
            alt="통화 종료"
            className="w-10 h-10 cursor-pointer hover:opacity-80"
            onClick={() => navigate("/")}
          />
        </ButtonSide>
      </LeftPanel>

      <RightPanel>
        <ChatWindow isOpen={chatOpen} toggleChat={toggleChat} />
      </RightPanel>
    </Container>
  );
}

// 스타일 컴포넌트

const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  flex-grow: 1;
  padding: 5px;
  transition: margin-right 0.3s ease;
  border-radius: 30px;

  margin-right: ${(props) =>
    props.isChatOpen ? "30%" : "0"}; /* 채팅창 너비만큼 밀림 */

  @media (max-width: 768px) {
    margin-right: 0; /* 모바일에선 전체 화면 */
  }
`;

const ButtonSide = styled.div`
  hight: calc(15%-30px);
  margin-botom: 30px;
  display: flex;
  background-color: #f2f2f7;
  border-radius: 30px;
  flex-direction: low;
  justify-content: center;
  align-items: center;
`;

const RightPanel = styled.div`
  hight: 80%;
  padding: 5px;
  flex-direction: column;
`;
