import React from 'react';
import styled from 'styled-components';

function FriendProfilePopup({ friend, onClose }) {
  return (
    <PopupContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <ProfileImage src={friend.profileImage || '/profile.png'} alt={friend.name} />
      <h2>{friend.name}</h2>
      <p><strong>Email:</strong> {friend.email}</p>
      <p><strong>소개:</strong> {friend.bio}</p>
      <p><strong>최근 통화:</strong> {friend.callHistory?.length > 0 ? friend.callHistory.join(', ') : '없음'}</p>
    </PopupContainer>
  );
}

export default FriendProfilePopup;

// ✅ 스타일 컴포넌트들
const PopupContainer = styled.div`
  width: 40%;
  padding: 20px;
  background-color: white;
  border: 1px solid #ccc;
  text-align: center;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 15px;
`;

const CloseButton = styled.button`
  float: right;
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
`;