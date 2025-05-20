import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const MyProfilePopup = ({ user, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("정말 로그아웃 하시겠어요?");
    if (confirmed) {
      localStorage.clear();
      navigate("/login");
    }
  };

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

      <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton> 
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
  position: relative;
`;

const PopupImage = styled.img`
  width: 100px;
  border-radius: 50%;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 10px;
  top: 10px;
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
`;

const UserName = styled.h2`
  margin-top: 10px;
`;

const LogoutButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #CA9CC3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #b184b1;
  }
`;
