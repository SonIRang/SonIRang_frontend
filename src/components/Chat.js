import React, { useState } from "react";
import styled from "styled-components";

function ChatWindow({ isOpen, toggleChat }) {
  const [text, setText] = useState('');
  const [chat, setChat] = useState([]);

  const handleChatInput = (e) => setText(e.target.value);

  const handleSubmitBtn = () => {
    if (text.trim() !== '') {
      setChat([...chat, text]);
      setText('');
    }
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
          {chat.map((msg, idx) => (
            <div key={idx}>{msg}</div>
          ))}
        </ChatBox>

        <ChatInput>
          <input
            type="text"
            value={text}
            onChange={handleChatInput}
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

// Styled Components (기존 코드 유지하면서 오타만 수정)
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
  right: ${(props) => (props.isOpen ? "0" : "-40%")};
  top: 0;
  height: 100%;
  width: 30%;
  background-color: #f2f2f7;
  transition: right 0.3s ease-in-out;
`;

const ChatHeader = styled.div`
  height: 40px;
  background-color: #f2f2f7;
  color: #fff;
  padding-bottom: 35px;
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
  padding: 20px;
  height: calc(100% - 120px);
  background-color: #f2f2f7;
  overflow-y: auto;
`;

const ChatInput = styled.div`
  display: flex;
  padding: 10px;
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: #f2f2f7;
  gap: 8px;

  input {
    flex: 1;
    padding: 20px;
    border: none;
    border-radius: 20px;
    outline: none;
  }

  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;

    img {
      width: 100px;
      height: 40px;
    }
  }
`;
