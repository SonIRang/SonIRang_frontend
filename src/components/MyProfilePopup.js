import React from 'react';
import styled from 'styled-components';

const MyProfilePopup = ({ user, onClose }) => {
  return (
    <PopupContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <PopupImage
        src={user.profileImage && user.profileImage !== "null" ? user.profileImage : "/profile.png"}
        alt="My Profile"
      />
      <UserName>{user.name}</UserName>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>소개:</strong> {user.bio}</p>
    </PopupContainer>
  );
};

export default MyProfilePopup;

// 스타일 정의
const PopupContainer = styled.div`
  width: 40%;
  padding: 20px;
  background-color: white;
  border: 1px solid #ccc;
  text-align: center;
`;

const PopupImage = styled.img`
  width: 100px;
  border-radius: 50%;
`;

const CloseButton = styled.button`
  float: right;
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
`;

const UserName = styled.h2`
  margin-top: 10px;
`;