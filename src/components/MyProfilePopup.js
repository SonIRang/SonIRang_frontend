import React from 'react';
import styled from 'styled-components';

const MyProfilePopup = ({ onClose }) => {
  return (
    <PopupContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <img src="/profile.png" alt="My Profile" style={{ width: '100px', borderRadius: '50%' }} />
      <h2>유시은</h2>
      <p><strong>Email:</strong> sieun@example.com</p>
      <p><strong>소개:</strong> 안녕하세요! 저는 개발을 좋아합니다.</p>
    </PopupContainer>
  );
};

export default MyProfilePopup;

const PopupContainer = styled.div`
  width: 40%;
  padding: 20px;
  background-color: white;
  border: 1px solid #ccc;
`;

const CloseButton = styled.button`
  float: right;
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
`;
