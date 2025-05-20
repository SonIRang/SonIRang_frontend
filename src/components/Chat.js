import React, { useState } from "react";
import styled from "styled-components";

// Chat.js
const ChatWindow = ({ isOpen, toggleChat }) => {
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
          <p>메세지</p>
        </ChatBox>
        <ChatInput>
          <input type="text" placeholder="메세지를 입력하세요." />
          <img src="./chat-send.png" alt="Send" width="100" height="40" />
        </ChatInput>
      </ChatContainer>
    </div>
  );
};

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
  right: ${(props) => (props.isOpen ? "0" : "-500px")};
  top: 0;
  height: 100%;
  width: 500px;
  background-color: #f2f2f7;
  transition: right 0.3s ease-in-out;
`;

const ChatHeader = styled.div`
  hight: 40px;
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
    width: 40px; /* 크기 조정 가능 */
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
    // width: 460px;
    // hight: 150px;
    border-radius: 20px;
    outline: none;
  }

  button {
    background-color: #919fc6;
    color: white;
    border: none;
    padding: 10px 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #0056b3;
    }
  }
`;
