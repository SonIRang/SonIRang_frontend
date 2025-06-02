import React, { useState, useRef } from "react";
import styled from "styled-components";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

function ChatWindow({ isOpen, toggleChat }) {
  const [callHistoryId, setCallHistoryId] = useState("");
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const stompClientRef = useRef(null);

  // WebSocket 연결 함수
  const connectWebSocket = () => {
    const accessToken = localStorage.getItem("accessToken");
    const senderEmail = localStorage.getItem("userEmail");

    if (!accessToken || !callHistoryId || !senderEmail) {
      alert("accessToken과 callHistoryId, senderEmail이 모두 필요합니다.");
      return;
    }

    const socket = new SockJS("http://localhost:8080/ws/chat");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      onConnect: () => {
        console.log("✅ WebSocket 연결됨");
        stompClient.subscribe(`/sub/chat/room/${callHistoryId}`, (message) => {
          const msg = JSON.parse(message.body);
          const sender = msg.senderEmail || "알 수 없음";
          const content = msg.messageContent || "(내용 없음)";
          appendMessage(`[${sender}] ${content}`);
        });
        alert(`채팅방 ${callHistoryId}에 연결되었습니다.`);
      },
      onStompError: (error) => {
        console.error("❌ WebSocket 연결 실패", error);
        alert("WebSocket 연결 실패");
      },
    });
    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  // 메시지 전송 함수
  const sendMessage = () => {
    const accessToken = localStorage.getItem("accessToken");
    const senderEmail = localStorage.getItem("userEmail");

    if (!stompClientRef.current || !stompClientRef.current.connected) {
      alert("WebSocket 연결을 먼저 하세요.");
      return;
    }

    const chatMessage = {
      callHistoryId: Number(callHistoryId),
      senderEmail: senderEmail,
      receiverEmail: null, // 필요시 서버에서 처리
      messageType: "TEXT",
      messageContent: message,
      createdAt: new Date().toISOString(),
    };

    stompClientRef.current.publish({
      destination: "/pub/chat/send",
      body: JSON.stringify(chatMessage),
    });
    setMessage("");
  };

  // WebSocket 연결 종료 함수
  const disconnectWebSocket = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      alert("WebSocket 연결 종료");
    }
  };

  // 채팅 메시지를 화면에 추가
  const appendMessage = (msg) => {
    setChatLog((prevLog) => [...prevLog, msg]);
  };

  return (
    <div>
      {!isOpen && (
        <OpenButton onClick={toggleChat}>
          <img src="./chat-open.png" alt="Open Chat" />
        </OpenButton>
      )}

      <ChatContainer isOpen={isOpen}>
        <ChatHeader>
          <CloseButton onClick={toggleChat}>
            <img src="./chat-close.png" alt="Close Chat" />
          </CloseButton>
        </ChatHeader>

        <ChatBox>
          {chatLog.map((msg, idx) => {
            const isMe = msg.includes(localStorage.getItem("userEmail"));
            return (
              <ChatRow key={idx} isMe={isMe}>
                <ChatBubble isMe={isMe}>{msg}</ChatBubble>
              </ChatRow>
            );
          })}
        </ChatBox>

        <ChatInput>
          <textarea
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={120}
            placeholder="메세지를 입력하세요."
          />
          <button onClick={sendMessage}>
            <img src="./chat-send.png" alt="Send" width="100" height="40" />
          </button>
        </ChatInput>
      </ChatContainer>
    </div>
  );
}

export default ChatWindow;

// Styled Components
const OpenButton = styled.button`
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 1000;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  img {
    width: 60px;
    height: 60px;
  }
`;

const ChatContainer = styled.div`
  position: fixed;
  right: ${(props) => (props.isOpen ? "0" : "-30%")};
  top: 0;
  height: calc(100% - 20px);
  width: calc(30% - 10px);
  margin: 10px 10px 10px 20px;
  background-color: #f2f2f7;
  border-radius: 30px;
  transition: right 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  height: 40px;
  background-color: #f2f2f7;
  color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  img {
    width: 40px;
    height: 40px;
  }
`;

const ChatBox = styled.div`
  flex-direction: column-reverse;
  justify-content: flex-start;
  padding: 20px;
  height: calc(100% - 120px);
  background-color: #f2f2f7;
  overflow-y: auto;
`;

const ChatInput = styled.div`
  height: 25%;
  display: flex;
  align-items: flex-start;
  padding: 10px;
  margin: 20px;
  width: calc(100% - 40px);
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 20px;
  gap: 8px;

  textarea {
    width: calc(100%-10px);
    height: 100%;
    flex: 1;
    margin-bottom: 10px;
    padding: 10px;
    outline: none;
    border: none;
    box-sizing: border-box;
  }

  button {
    background: none;
    border: none;
    margin-left: 20px;
    cursor: pointer;

    img {
      width: 100px;
      height: 40px;
    }
  }
`;

const ChatRow = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isMe ? "flex-end" : "flex-start")};
  width: 100%;
  margin-bottom: 10px;
`;

const ChatBubble = styled.div`
  display: inline-block;
  padding: 10px 14px;
  margin-bottom: 8px;
  border-radius: 18px;
  background-color: ${(props) => (props.isMe ? "#fff" : "#fff")};
  color: ${(props) => (props.isMe ? "#000" : "#000")};
  align-self: ${(props) => (props.isMe ? "flex-end" : "flex-start")};
  max-width: 70%;
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.4;
`;

// const TimeStamp = styled.div`
//   font-size: 10px;
//   color: gray;
//   margin-top: 4px;
//   text-align: ${(props) => (props.isMe ? "right" : "left")};
// `;
