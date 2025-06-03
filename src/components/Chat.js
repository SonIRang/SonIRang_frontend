import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";

const ChatWindow = () => {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const messagesEndRef = useRef(null);

  const email = localStorage.getItem("useremail");
  const accessToken = localStorage.getItem("generalAccessToken");
  const callHistoryId = localStorage.getItem("callHistoryId") || "6";
  const receiverEmail = localStorage.getItem("receiverEmail");
  const senderEmail = localStorage.getItem("callerEmail");

  const connectWebSocket = () => {
    if (!callHistoryId) {
      alert("callHistoryId가 필요합니다.");
      return;
    }

    if (stompClient && stompClient.connected) {
      alert("이미 연결되어 있습니다.");
      return;
    }

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
            const sender = msg.senderEmail || "알 수 없음";
            const content = msg.messageContent || "(내용 없음)";
            const fullMsg = `[${sender}] ${content}`;
            console.log("📥 수신된 메시지:", fullMsg);

            setMessages((prev) => [...prev, fullMsg]);
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

    const chatMessage = {
      callHistoryId: Number(callHistoryId),
      senderEmail,
      receiverEmail,
      messageType: "TEXT",
      messageContent: messageInput,
      createdAt: new Date().toISOString(),
    };

    stompClient.send("/pub/chat/send", {}, JSON.stringify(chatMessage));
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
    <div style={{ padding: "20px" }}>
      <h2>🧪 채팅 테스트 (React)</h2>
      <button onClick={connectWebSocket}>🔌 WebSocket 연결</button>
      <button onClick={disconnectWebSocket}>❌ 연결 종료</button>

      <hr />

      <input
        type="text"
        placeholder="메시지 입력"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        style={{ width: "60%" }}
      />
      <button onClick={sendMessage}>📤 보내기</button>

      <hr />

      <h3>💬 채팅 내용</h3>
      <ul style={{ maxHeight: "300px", overflowY: "auto" }}>
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
        <div ref={messagesEndRef} />
      </ul>
    </div>
  );
};

export default ChatWindow;
