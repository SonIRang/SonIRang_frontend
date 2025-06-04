import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import styled from "styled-components";

const ChatWindow = ({
  isOpen,
  toggleChat,
  callHistoryId,
  callerId,
  receiverId,
}) => {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const messagesEndRef = useRef(null);

  const email = localStorage.getItem("useremail");
  const accessToken = localStorage.getItem("generalAccessToken");
  const senderEmail = localStorage.getItem("callerEmail") || ""; // caller 이메일Add commentMore actions
  const receiverEmail = localStorage.getItem("receiverEmail") || "";

  const connectWebSocket = () => {
    if (!callHistoryId) {
      alert("callHistoryId가 필요합니다.");
      return;
    }

    if (stompClient && stompClient.connected) {
      alert("이미 연결되어 있습니다.");
      return;
    }

    console.log("💬 callHistoryId 확인:", callHistoryId);

    const socket = new SockJS("http://15.164.249.16:8080/ws/chat");
    const client = over(socket);

    client.connect(
      { Authorization: `Bearer ${accessToken}` },
      (frame) => {
        console.log("✅ WebSocket 연결됨", frame);

        const subscribePath = `/sub/chat/room/${callHistoryId}`;
        client.subscribe(subscribePath, (message) => {
          try {
            if (!message.body) return;

            const msg = JSON.parse(message.body);
            console.log("📥 수신된 메시지:", msg);

            setMessages((prev) => {
              console.log("이전 메시지 리스트:", prev);
              const updated = [...prev, msg];
              console.log("업데이트된 메시지 리스트:", updated);
              return updated;
            });
          } catch (e) {
            console.error("메시지 파싱 오류", e);
          }
        });

        alert(`채팅방 ${callHistoryId}에 연결되었습니다.`);
        setStompClient(client);
      },
      (error) => {
        console.error("❌ WebSocket 연결 실패", error);
        alert("WebSocket 연결 실패");
      }
    );
  };

  const sendMessage = () => {
    if (!stompClient || !stompClient.connected) {
      alert("WebSocket 연결을 먼저 하세요.");
      return;
    }

    if (!senderEmail || !receiverEmail) {
      alert("❌ senderEmail 또는 receiverEmail이 없습니다.");
      return;
    }

    const chatMessage = {
      callHistoryId: Number(callHistoryId),
      senderEmail,
      receiverEmail,
      messageType: "TEXT",
      messageContent: messageInput,
      createdAt: new Date().toISOString(),
    };
    stompClient.send("/pub/chat/send", {}, JSON.stringify(chatMessage));
    // setMessages((prev) => [...prev, chatMessage]); // ✅ 여기서만 사용
    setMessageInput("");
  };

  const disconnectWebSocket = () => {
    if (stompClient) {
      stompClient.disconnect(() => {
        console.log("🔌 WebSocket 연결 종료");
        alert("WebSocket 연결 종료");
        setStompClient(null);
      });
    }
  };

  // 메시지 수신 후 스크롤 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
          <SoketButtonSide>
            <SoketButton onClick={connectWebSocket}>연결</SoketButton>
            <SoketButton onClick={disconnectWebSocket}>종료</SoketButton>
          </SoketButtonSide>
        </ChatHeader>

        <ChatBox>
          {messages.map((msg, idx) => {
            const isMe = msg.senderEmail === senderEmail;
            return (
              <ChatRow key={idx} isMe={isMe}>
                <div>
                  <ChatBubble isMe={isMe}>{msg.messageContent}</ChatBubble>
                </div>
              </ChatRow>
            );
          })}
          <div ref={messagesEndRef} />
        </ChatBox>

        <ChatInput>
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="메세지를 입력하세요."
            maxLength={120}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          />
          <button onClick={sendMessage}>
            <img src="./chat-send.png" alt="Send" width="100" height="40" />
          </button>
        </ChatInput>
      </ChatContainer>
    </div>
  );
};

export default ChatWindow;

// Styled Components

const SoketButton = styled.button`
  width: 50px;
  height: 30px;
  padding: 10px;
  margin: 2px;
  background-color: #ca9cc3;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SoketButtonSide = styled.div`
  display: flex;
  align-items: center;
  gap: 2px; /* 버튼 사이 간격 */
`;

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

const ChatRow = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isMe ? "flex-end" : "flex-start")};
  width: 100%;
  margin-bottom: 10px;
`;

const ChatBubble = styled.div`Add commentMore actions
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

const ChatInput = styled.div`
  height: 25%;
  display: flex;
  align-items: flex-start;
  padding: 10px;
  margin: 20px;
  width: calc(100% - 40px);
  background-color: #ffffff;
  border-radius: 20px;
  gap: 8px;

  textarea {
    flex: 1;
    width: calc(100%-10px);
    height: 100%;
    margin-bottom: 10px;
    padding: 10px;
    border: none;
    outline: none;
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
