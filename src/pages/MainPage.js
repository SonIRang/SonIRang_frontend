import React,  { useState, useEffect } from 'react';
import styled from 'styled-components';
import User from '../models/user';
import AddFriendPopup from '../components/AddFriendPopup';
import FriendList from '../components/FriendList';
import FriendProfilePopup from '../components/FriendProfilePopup';
import MyProfilePopup from '../components/MyProfilePopup';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username");
  const useremail = localStorage.getItem("useremail");
  const userbio = localStorage.getItem("userbio");
  const userprofile = localStorage.getItem("userprofile");
  
  // useEffect(() => {
  //   // 사용자 정보 없으면 /login으로 리디렉트
  //   if (!username || !useremail) {
  //     navigate("/login");
  //   }
  // }, [navigate]);
  
  const myUser = new User({
    profileImage: userprofile,
    name: username,
    email: useremail,
    bio: userbio
  });


  // 여기서 DB에서 친구 목록 불러오기 예정
  const dummyFriends = [
    new User({
      name: '김수연',
      callHistory: ['2024-04-11', '2024-04-16'],
      email: 'sooyeon@example.com',
      bio: '안녕하세요! 저는 개발을 싫어합니다.',
    }),
    new User({
      name: '김수연',
      callHistory: ['2024-04-11', '2024-04-16'],
      email: 'sooyeon@example.com',
      bio: '안녕하세요! 저는 개발을 싫어합니다.',
    }),
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
        <Logo src="/logo-title.png" alt="Logo" />
        <ProfileImage 
          src={myUser.profileImage && myUser.profileImage !== "null" ? myUser.profileImage : "/profile.png"} 
          alt="사용자 프로필" 
          onClick={() => setPopupType('myProfile')} 
        />
      </Header>
      <MainContainer>
        <LeftPanel>
          <Title>친구 목록</Title>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="친구 이름 검색"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <SearchButton onClick={openAddFriendPopup}>
              <img alt='친구추가' src='/btnNewFriend.png' />
            </SearchButton>
          </SearchContainer>
          {filteredFriends.length > 0 ? (
            <FriendList friends={filteredFriends} onFriendClick={openProfilePopup} />
          ) : (
            <NoResultText>검색 결과가 없습니다.</NoResultText>
          )}
        </LeftPanel>
        <RightPanel>
          {popupType === 'myProfile' && <MyProfilePopup user={myUser} onClose={closePopup} />}
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
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
`;

const Header = styled.header`
  height: 80px;
  background-color: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  min-width: 0; /* 중요: 자식 요소가 부모 폭 넘는 것을 방지 */
`;

const Logo = styled.img`
  height: 40px;
`;

const ProfileImage = styled.img`
  height: 40px;
  width: 40px;
  border-radius: 50%;
  cursor: pointer;
`;

const LeftPanel = styled.div`
  width: 25%;
  background-color: #F2F2F7;
  margin: 10px;
  padding: 20px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const RightPanel = styled.div`
  width: 300px;
  flex: 1;
  background-color: #fff;
`;

const Title = styled.h2`
  margin-top: 0;
  margin-bottom: 16px;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 70%;
  height: 40px;
  padding: 0 15px;
  border-radius: 10px;
  border: none;
  outline: none;
  font-size: 1rem;
  box-sizing: border-box;
`;

const SearchButton = styled.button`
  width: 70px;
  height: 40px;
  background-color: #CA9CC3;
  border: none;
  border-radius: 10px;
  padding-left: 5px;
  cursor: pointer;

  & > img {
    width: 24px;
    height: 24px;
  }
`;

const NoResultText = styled.p`
  color: #999;
  text-align: center;
  margin-top: 20px;
`;
