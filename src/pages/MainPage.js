import React,  { useState, useEffect } from 'react';
import axios from 'axios';
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

  const [friends, setFriends] = useState([]);

  useEffect(() => {

    const fetchFriends = async () => {
      try {
        const response = await axios.get('/api/friends/list', {
          params: { userId: 1 }, // 테스트용 임시 지정
        });

        const friendData = response.data.data.map(friend => new User({
          name: friend.nickname,
          email: friend.email,
          profileImage: friend.profileImageUrl,
          // 아직 서버에 구현 안 됨
          //callHistory: ,
          // bio: ,
        }));

        setFriends(friendData);
      } catch (error) {
        console.error('친구 목록을 불러오는데 실패했습니다:', error);
      }
    };

    fetchFriends();
  }, []);

  const [search, setSearch] = useState('');
  const [popupType, setPopupType] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const filteredFriends = friends.filter(friend =>
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
    <MainContainer>
      <LeftSection>
        <Header>
          <Logo src="/title.png" alt="Logo" />
          <Name><strong>{myUser.name}</strong></Name>
          <ProfileImage 
            src={myUser.profileImage && myUser.profileImage !== "null" ? myUser.profileImage : "/profile.png"} 
            alt="사용자 프로필" 
            onClick={() => setPopupType('myProfile')} 
          />
        </Header>
        <LeftPanel>
          <SerchTitle>친구 목록</SerchTitle>
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
      </LeftSection>
        
      <RightPanel>
        {popupType === null && <LogoCenter src="/logo-title-ver2.png" alt="Main Logo" />}
        {popupType === 'myProfile' && <MyProfilePopup user={myUser} onClose={closePopup} />}
        {popupType === 'addFriend' && <AddFriendPopup onClose={closePopup} />}
        {popupType === 'profile' && selectedFriend && (
          <FriendProfilePopup friend={selectedFriend} onClose={closePopup} />
        )}
      </RightPanel>
    </MainContainer>
  );
}

export default MainPage;

const MainContainer = styled.div`
  height: calc(100vh - 30px);
  display: flex;
  flex: 1;
  margin: 0;
  padding: 15px;
`;

const LeftSection = styled.div`
  width: 30vw;
  min-width: 300px;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.img`
  height: 25px;
  margin-right: 50px;
`;
const ProfileImage = styled.img`
  height: 40px;
  width: 40px;
  border-radius: 50%;
  cursor: pointer;
  
`;
const Name = styled.div`
  width: 70px;
  text-align: right;
  color:#CA9CC3;
  margin-right: 10px;
`
const Header = styled.header`
  height: 80px;
  width: 70%;
  background-color: #fff;

  padding: 10px 25px 10px 25px;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftPanel = styled.div`
  background-color: #F2F2F7;
  border-radius: 20px;
  width: 70%;

  padding: 25px;

  overflow-y: auto;
  flex: 1;
`;

const RightPanel = styled.div`
  width: 300px;
  flex: 1;
  background-image: url('/sign-bg.png');
  background-size: cover;
  background-position: center;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const LogoCenter = styled.img`
  width: 60%;
  max-width: 400px;
  object-fit: contain;
`;

const SerchTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 78%;
  height: 40px;
  padding-left: 15px;
  border-radius: 10px;
  border: none;
  outline: none;
  font-size: 1rem;
  box-sizing: border-box;
`;

const SearchButton = styled.button`
  width: 60px;
  height: 40px;
  background-color: #CA9CC3;
  border: none;
  border-radius: 10px;
  padding-left: 5px;
  cursor: pointer;

  & > img {
    width: 20px;
  }
`;

const NoResultText = styled.p`
  color: #999;
  text-align: center;
  margin-top: 20px;
`;
