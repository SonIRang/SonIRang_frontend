import React, { useState } from "react";
import styled from "styled-components";
import { useLocation } from "react-router-dom";
import ChatWindow from "../components/Chat";
import VideoCallScreen from "../components/VideoCallScreen";

export default function MeetingPaget() {
  const [chatOpen, setChatOpen] = useState(false);
  const [callHistoryId, setCallHistoryId] = useState(null);

  const [callerIdFromSignal, setCallerIdFromSignal] = useState(null);
  const [receiverIdFromSignal, setReceiverIdFromSignal] = useState(null);

  const location = useLocation();
  const {
    callerId: initialCallerId,
    receiverId: initialReceiverId,
    incoming,
    offer: offerFromCaller,
  } = location.state || {};

  const toggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  const callerId = callerIdFromSignal || initialCallerId;
  const receiverId = receiverIdFromSignal || initialReceiverId;

  console.log("아이디 확인",callerId, receiverId);

  return (
    <Container>
      <LeftPanel isChatOpen={chatOpen}>
        <VideoCallScreen
          callerId={callerId}
          receiverId={receiverId}
          offer={offerFromCaller}
          incoming={incoming}
          setCallHistoryId={setCallHistoryId}
          setCallerId={setCallerIdFromSignal}
          setReceiverId={setReceiverIdFromSignal}
        />
      </LeftPanel>

      <RightPanel>
        <ChatWindow
          isOpen={chatOpen}
          toggleChat={toggleChat}
          callerId={callerId}
          receiverId={receiverId}
          callHistoryId={callHistoryId}
        />
      </RightPanel>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  height: 85%;
  position: relative;
`;

const LeftPanel = styled.div`
  flex-grow: 1;
  height: 100%;
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
  }
`;
