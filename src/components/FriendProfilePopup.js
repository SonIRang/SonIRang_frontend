import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

function FriendProfilePopup({ friend, onClose }) {
  const navigate = useNavigate();

  const handleCallClick = () => {
    navigate('/meeting');
  };

  return (
    <PopupContainer>
      <ProfileImage src={friend.profileImage || '/profile.png'} alt={friend.name} />
      <Name>{friend.name}</Name>
      <Email>{friend.email}</Email>
      <Bio>{friend.bio}</Bio>

      <SectionTitle>통화 기록</SectionTitle>
      <CallHistoryList>
        {friend.callHistory?.length > 0 ? (
          friend.callHistory.map((call, index) => (
            <CallItem key={index}>{call}</CallItem>
          ))
        ) : (
          <CallItem>기록 없음</CallItem>
        )}
      </CallHistoryList>

      <ButtonGroup>
        <CloseBtn onClick={onClose}>닫기</CloseBtn>
        <CallBtn onClick={handleCallClick}>전화 걸기</CallBtn>
      </ButtonGroup>
    </PopupContainer>
  );
}

export default FriendProfilePopup;

const PopupContainer = styled.div`
  width: 360px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 20px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 20px;
`;

const Name = styled.h2`
  font-size: 22px;
  margin: 0;
`;

const Email = styled.p`
  color: #555;
  margin-bottom: 30px;
  margin-top: 0px;
`;

const Bio = styled.p`
  margin-bottom: 30px;
  color: rgb(190, 120, 196);
  text-align: left;
  background:rgb(244, 244, 244);
  border-radius: 10px;
  padding: 10px;
`

const SectionTitle = styled.p`
  font-weight: bold;
  margin-bottom: 10px;
`;

const CallHistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
`;

const CallItem = styled.div`
  background: #f5f5f5;
  border-radius: 10px;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const CloseBtn = styled.button`
  flex: 1;
  padding: 12px;
  background-color: #d9d9d9;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
`;

const CallBtn = styled.button`
  flex: 1;
  padding: 12px;
  background-color: #47b647;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
`;
