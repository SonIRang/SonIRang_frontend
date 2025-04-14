import React, { useState } from 'react';
import User from '../models/user';

const dummyUsers = [
  new User({ name: '심은지', email: 'eunji@gmail.com' }),
  new User({ name: '이지윤', email: 'jy@gmail.com' }),
  new User({ name: '최효민', email: 'choi@gmail.com' }),
];

const AddFriendPopup = ({ onClose }) => {
  const [emailInput, setEmailInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  const handleSearch = () => {
    const foundUser = dummyUsers.find(user => user.email === emailInput.trim());
    setSearchResult(foundUser || null);
  };

  const handleAdd = () => {
    alert(`${searchResult.name}님을 친구로 추가했습니다!`);
    onClose();
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#fff',
      width: '100%',
    }}>
      <h3>친구 추가</h3>
      <input
        type="text"
        placeholder="이메일로 검색"
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
      />
      <button onClick={handleSearch} style={{ marginBottom: '16px' }}>검색</button>

      {searchResult ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={searchResult.profileImage || '/profile.png'}
              alt={searchResult.name}
              style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px' }}
            />
            <span>{searchResult.name}</span>
          </div>
          <button onClick={handleAdd}>추가</button>
        </div>
      ) : (
        emailInput && <p style={{ color: '#999' }}>검색 결과가 없습니다.</p>
      )}
    </div>
  );
};

export default AddFriendPopup;
