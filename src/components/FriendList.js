import React from 'react';
import { useNavigate } from 'react-router-dom';

function FriendList({ friends, onFriendClick }) {
  const navigate = useNavigate();

  return (
    <ul
    style={{padding: '0'}}>
      {friends.map((friend, index) => (
        <li
          key={index}
          onClick={() => onFriendClick(friend)}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            cursor: 'pointer',
            gap: '10px',
            backgroundColor:'white',
            borderRadius: '10px',
            height: '60px',
            width: '100%'
          }}
        >
          <img
            src={friend.profileImage || '/profile.png'}
            alt={friend.name}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              marginRight: '12px',
              marginLeft: '20px'
            }}
          />
          <div
          style={{ width: '60%'}}>
            <div style={{ fontWeight: 'bold' }}>{friend.name}</div>
            <div style={{ fontSize: '0.9rem', color: '#888' }}>
              최근 통화일:{' '}
              {friend.callHistory?.[friend.callHistory.length - 1] || '없음'}
            </div>
          </div>
          <div
          style={{
            padding: '5px'
          }}>
            <img src="/callicon.png"
            style={{
              width:'25px',
              height:'25px',
              marginLeft:'10px'}
            }
            onClick={()=> navigate('/meeting')}
            />
            </div>
        </li>
      ))}
    </ul>
  );
}

export default FriendList;
