import React from 'react'; 
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const MyProfilePopup = ({ user, onClose }) => {
  const navigate = useNavigate();

  const handleSettingClick = () => {
    alert("구현중입니다");
  };

  const handleEditProfile = () => {
    alert("구현중입니다");
    // 추후 프로필 수정 페이지로 연결
    // navigate("/edit-profile");
  };

  return (
    <PopupContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <PopupImage
        src={user.profileImage && user.profileImage !== "null" ? user.profileImage : "/profile.png"}
        alt="My Profile"
      />
      <UserName>
        {user.name}
        <SettingIcon onClick={handleSettingClick}>⚙️</SettingIcon>
      </UserName>

      <BioBox>
        {user.bio && user.bio.trim() !== "" ? user.bio : "작성된 자기소개가 없습니다."}
      </BioBox>

      <EditButton onClick={handleEditProfile}>프로필 수정하기</EditButton> 
    </PopupContainer>
  );
};

export default MyProfilePopup;

// 스타일 정의
const PopupContainer = styled.div`
  width: 400px;
  padding: 30px 20px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
`;

const PopupImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 15px;
  top: 15px;
  font-size: 30px;
  background: none;
  border: none;
  color: #CA9CC3;
  cursor: pointer;
`;

const UserName = styled.h2`
  margin: 10px 0;
  font-size: 1.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

const SettingIcon = styled.span`
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    opacity: 0.7;
  }
`;

const BioBox = styled.div`
  margin-top: 20px;
  padding: 20px;
  min-height: 100px;
  background-color: #f9f9f9;
  border-radius: 12px;
  color: #333;
  font-size: 0.95rem;
`;

const EditButton = styled.button`
  margin-top: 30px;
  padding: 12px 0;
  width: 100%;

  background-color: #CA9CC3;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #b184b1;
  }
`;
