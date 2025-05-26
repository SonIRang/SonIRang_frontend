import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

function FriendList({ friends, onFriendClick }) {
  const navigate = useNavigate();

  return (
    <List>
      {friends.map((friend, index) => (
        <ListItem key={index} onClick={() => onFriendClick(friend)}>
          <ProfileImage
            src={friend.profileImage || '/profile.png'}
            alt={friend.name}
          />
          <InfoContainer>
            <FriendName>{friend.name}</FriendName>
            <LastCall>
              최근 통화일:{' '}
              {friend.callHistory?.[friend.callHistory.length - 1] || '없음'}
            </LastCall>
          </InfoContainer>
          <CallIconWrapper>
            <CallIcon
              src="/callicon.png"
              onClick={(e) => {
                e.stopPropagation(); // li 클릭 이벤트 막기
                navigate('/meeting');
              }}
              alt="call icon"
            />
          </CallIconWrapper>
        </ListItem>
      ))}
    </List>
  );
}

export default FriendList;

const List = styled.ul`
  padding: 0;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
  gap: 10px;
  background-color: white;
  border-radius: 10px;
  height: 60px;
  width: 100%;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  margin-left: 20px;
`;

const InfoContainer = styled.div`
  width: 60%;
`;

const FriendName = styled.div`
  font-weight: bold;
`;

const LastCall = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

const CallIconWrapper = styled.div`
  padding: 5px;
`;

const CallIcon = styled.img`
  width: 25px;
  height: 25px;
  margin-left: 10px;
`;