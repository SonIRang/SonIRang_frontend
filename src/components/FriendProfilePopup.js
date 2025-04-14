import React from 'react';
import styled from 'styled-components';

function FriendProfilePopup({ friend, onClose }) {
  return (
    <PopupContainer
    style={{textAlign:'center'}}>
      <CloseButton onClick={onClose}>×</CloseButton>
      <img src={friend.profileImage || '/profile.png'} alt={friend.name}
      style={{width:'15%', padding:'auto', margin:'auto'}} />
      <h2>{friend.name}</h2>
      <p><strong>Email:</strong> {friend.email}</p>
      <p><strong>소개:</strong> {friend.bio}</p>
      <p><strong>최근 통화:</strong> {friend.callHistory?.length > 0 ? friend.callHistory.join(', ') : '없음'}</p>

    </PopupContainer>
  );
}

export default FriendProfilePopup;

const PopupContainer = styled.div`
  width: 40%
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
