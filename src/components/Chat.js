import React, { useState } from "react";
import styled from "styled-components";

function ChatWindow({ isOpen, toggleChat }) {
  const [text, setText] = useState("");
  const [chat, setChat] = useState([
    { text: "안녕하세요!", isMe: false },
    { text: "반갑습니다.", isMe: true },
  ]);

  // const [chat, setChat] = useState([]); //백엔드 연동시

  const handleChatInput = (e) => setText(e.target.value);

  const handleSubmitBtn = () => {
    if (text.trim() !== "") {
      setChat([...chat, { text, isMe: true }]);
      setText("");
    }
  };

  //백 연결 후
  //   const handleSubmitBtn = () => {
  //   if (text.trim() !== "") {
  //     const now = new Date();
  //     const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  //     setChat([...chat, { sender: "me", text, timestamp }]);
  //     setText("");
  //   }
  // };

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
          {chat.map((msg, idx) => (
            <ChatRow key={idx} isMe={idx % 2 === 0}>
              <ChatBubble isMe={idx % 2 === 0}>{msg.text}</ChatBubble>
            </ChatRow>
          ))}

          {/* 백 연동 후
          {chat.map((msg, idx) => (
            <ChatRow key={idx} isMe={msg.sender === "me"}>
              <div>
                <ChatBubble isMe={msg.sender === "me"}>{msg.text}</ChatBubble>
                <TimeStamp isMe={msg.sender === "me"}>
                  {msg.timestamp}
                </TimeStamp>
              </div>
            </ChatRow>
          ))} */}

        </ChatBox>

        <ChatInput>
          <textarea
            type="text"
            value={text}
            onChange={handleChatInput}
            maxLength={120}
            placeholder="메세지를 입력하세요."
          />
          <button onClick={handleSubmitBtn}>
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
  bottom: 20px;
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