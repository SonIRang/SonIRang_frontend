import React from 'react';

function FriendList({ friends, onFriendClick }) {
  return (
    <ul>
      {friends.map((friend, index) => (
        <li
          key={index}
          onClick={() => onFriendClick(friend)}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
            cursor: 'pointer',
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
            }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{friend.name}</div>
            <div style={{ fontSize: '0.9rem', color: '#888' }}>
              최근 통화일:{' '}
              {friend.callHistory?.[friend.callHistory.length - 1] || '없음'}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default FriendList;
