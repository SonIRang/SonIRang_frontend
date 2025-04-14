import React from 'react';
import styled from 'styled-components';

function MainPage() {
  // 여기서 DB에서 친구 목록 불러오기 예정
  const dummyFriends = ['Alice', 'Bob', 'Charlie'];

  return (
    <Container>
      <Header>
        <Logo src="/logo-title.png" alt="Logo" />
        <ProfileImage src="/profile.png" alt="User Profile" />
      </Header>

      <LeftPanel>
        <h2>Friends</h2>
        <ul>
          {dummyFriends.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
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
`;

const Header = styled.header`
  height: 60px;
  background-color: #f5f5f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
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
