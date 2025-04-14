import React,  { useState } from 'react';
import styled from 'styled-components';
import User from '../models/user';

function MainPage() {
  // 여기서 DB에서 친구 목록 불러오기 예정
  const dummyFriends = [
    new User({
      name: '김수연',
      callHistory: ['2024-04-11', '2024-04-16'],
      email: 'sooyeon@example.com',
      bio: '안녕하세요! 저는 개발을 싫어합니다.',
    }),
    new User({
      profileImage: '/profile.png',
      name: '유시은',
      callHistory: ['2024-04-01', '2024-04-03'],
      email: 'sieun@example.com',
      bio: '안녕하세요! 저는 개발을 좋아합니다.',
    })
  ];

  const [search, setSearch] = useState('');

  const filteredFriends = dummyFriends.filter(friend =>
    friend.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <Logo src="/logo-title.png" alt="Logo" style={{height:'60px'}}/>
        <ProfileImage src="/profile.png" alt="User Profile" />
      </Header>

      <LeftPanel>
        <h2>Friends</h2>
        <input
        type="text"
        placeholder="친구 이름 검색"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          padding: '8px',
          width: '100%',
          marginBottom: '16px',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
      />
    {filteredFriends.length > 0 ? (
      <ul>
        {filteredFriends.map((friend, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px',
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
      </ul>) : (
    <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}> 검색 결과가 없습니다. </p>
  )}
      </LeftPanel>
      <RightPanel>
        {/* 팝업창 뜰 곳 */}
      </RightPanel>
    </Container>
  );
}

export default MainPage;

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Header = styled.header`
  height: 80px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
`;

const Logo = styled.img`
  height: 40px;
`;

const ProfileImage = styled.img`
  height: 40px;
  width: 40px;
  border-radius: 50%;
`;

const LeftPanel = styled.div`
  width: 300px;
  background-color: #f0f0f0;
  padding: 20px;
`;

const RightPanel = styled.div`
  flex: 1;
  background-color: #fff;
`;
