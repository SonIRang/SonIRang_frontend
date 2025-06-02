import React, { useState } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import ChatWindow from "../components/Chat";
import VideoCallScreen from "../components/VideoCallScreen";

export default function MeetingPaget() {
  const [chatOpen, setChatOpen] = useState(false);

  const location = useLocation();
  const {
    callerId,
    receiverId,
    incoming,
    offer: offerFromCaller,
  } = location.state || {};

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  return (
    <Container>
      <LeftPanel isChatOpen={chatOpen}>
        <VideoCallScreen
          callerId={callerId}
          receiverId={receiverId}
          offer={offerFromCaller}
          incoming={incoming}
        />
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

const RightPanel = styled.div`
  height: 80%;
  padding: 5px;
  flex-direction: column;
  z-index: 2;
`;
