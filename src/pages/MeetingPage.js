import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";
import ChatWindow from "../components/Chat";
import VideoCallScreen from "../components/VideoCallScreen";

export default function ResponsiveChatLayout() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  const location = useLocation();
  const { callerId, offer, incoming } = location.state || {};

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  // if (!currentUser || !receiver) {
  //   return <div>유저 정보가 없습니다. 로그인 또는 통화 상대를 선택해주세요.</div>;
  // }

  return (
    <Container>
      <LeftPanel isChatOpen={chatOpen}>
        <VideoCallScreen
          callerId={callerId}
          offer={offer}
          incoming={incoming}
        />
        {/* <ButtonSide>
          <img
            src="/camera-on.png"
            alt="카메라"
            className="w-10 h-10 cursor-pointer hover:opacity-80"
            onClick={() => console.log("카메라 클릭")}
          />
          <img
            src="/mic-on.png"
            alt="마이크"
            className="w-10 h-10 cursor-pointer hover:opacity-80"
            onClick={() => console.log("마이크 클릭")}
          />
          <img
            src="/endcall.png"
            alt="통화 종료"
            className="w-10 h-10 cursor-pointer hover:opacity-80"
            onClick={() => navigate("/")}
          />
        </ButtonSide> */}
      </LeftPanel>

      <RightPanel>
        <ChatWindow isOpen={chatOpen} toggleChat={toggleChat} />
      </RightPanel>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  height: 85%;
`;

const LeftPanel = styled.div`
  height: calc(100% - 30px);
  flex-grow: 1;
  padding: 5px;
  transition: margin-right 0.3s ease;
  border-radius: 30px;
  z-index: 1;
  margin-right: ${(props) => (props.isChatOpen ? "30%" : "0")};

  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

// const ButtonSide = styled.div`
//   height: 15%;
//   margin-bottom: 30px;
//   display: flex;
//   background-color: #f2f2f7;
//   border-radius: 30px;
//   flex-direction: row;
//   justify-content: center;
//   align-items: center;
// `;

const RightPanel = styled.div`
  height: 80%;
  padding: 5px;
  flex-direction: column;
  z-index: 2;
`;
