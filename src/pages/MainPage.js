import React,  { useState } from 'react';
import styled from 'styled-components';
import User from '../models/user';
import AddFriendPopup from '../components/AddFriendPopup';
import FriendList from '../components/FriendList';
import FriendProfilePopup from '../components/FriendProfilePopup';

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
  const [popupType, setPopupType] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const filteredFriends = dummyFriends.filter(friend =>
    friend.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAddFriendPopup = () => {
    setPopupType('addFriend');
    setSelectedFriend(null);
  };

  const openProfilePopup = (friend) => {
    setPopupType('profile');
    setSelectedFriend(friend);
  };

  const closePopup = () => {
    setPopupType(null);
    setSelectedFriend(null);
  };

  return (
    <Container>
      <Header>
        <Logo src="/logo-title.png" alt="Logo" style={{height:'60px'}}/>
        <ProfileImage src="/profile.png" alt="User Profile" />
      </Header>
      <MainContainer>
        <LeftPanel>
          <h2>친구 목록</h2>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input type="text"
              placeholder="친구 이름 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '70%',
                height: '40px',
                padding: ' 0 15px',
                margin: '0px',
                borderRadius: '10px',
                border: '0px',
              }}
              />
            <button onClick={() => openAddFriendPopup(true)}
              style={{
                width: '70px',
                height: '40px',
                backgroundColor: '#CA9CC3',
                border: 'none',
                borderRadius: '10px',
                paddingLeft: '5px',
                cursor: 'pointer',
              }}
              >
              <img src='/btnNewFriend.png' />
            </button>
          </div>
          {filteredFriends.length > 0 ? (<FriendList friends={filteredFriends}
          onFriendClick={openProfilePopup} />) : (
            <p style={{ color: '#999', textAlign: 'center', marginTop: '20px' }}> 검색 결과가 없습니다. </p>
          )}
        </LeftPanel>
        <RightPanel>
        {popupType === 'addFriend' && <AddFriendPopup onClose={closePopup} />}
        {popupType === 'profile' && selectedFriend && (
          <FriendProfilePopup friend={selectedFriend} onClose={closePopup} />
        )}
        </RightPanel>
      </MainContainer>
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
  background-color:rgb(255, 255, 255);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
`;

const MainContainer = styled.div`
  display: flex;
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
  width: 25%;
  background-color: #F2F2F7;
  margin: 10px;
  padding: 20px;
`;

const RightPanel = styled.div`
  width: 300px;
  flex: 1;
  background-color: #fff;
`;
