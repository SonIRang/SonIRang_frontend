import React, { useState } from 'react';
import styled from 'styled-components';
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
    alert(`친구추가: 아직 구현중;;`);
  };

  return (
    <div style={{
      borderRadius: '8px',
      padding: '20px',
      backgroundColor: '#fff',
      width: '40%',
      border: '1px solid #ccc'
    }}>
      <button 
      style={{
      float: 'right',
      border: 'none',
      backgroundColor:'white'
      }}
      onClick={onClose}>X</button>
      <h3>친구 추가</h3>

    <Container>
    <input
        type="text"
        placeholder="이메일로 검색"
        value={emailInput}
        onChange={(e) => setEmailInput(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
      />
      <button onClick={handleSearch} style={{ marginBottom: '16px' }}>검색</button>
      </Container>

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

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;