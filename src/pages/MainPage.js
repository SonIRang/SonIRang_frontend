import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import User from "../models/user";
import { useNavigate, useNavigate as useHistory } from "react-router-dom";
import { useStompClient } from "../context/StompContext";

import MyProfilePopup from "../components/MyProfilePopup";
import FriendList from "../components/FriendList";
import FriendProfilePopup from "../components/FriendProfilePopup";
import AddFriendPopup from "../components/AddFriendPopup";
import EditProfilePopup from "../components/EditProfilePopup";

// 수신 알림 모달 컴포넌트
const IncomingCallModal = ({ callerId, onAccept, onReject }) => {
  return (
    <ModalBackdrop>
      <ModalContent>
        <p>{callerId}님이 통화를 걸고 있습니다.</p>
        <button onClick={onAccept}>수락</button>
        <button onClick={onReject}>거절</button>
      </ModalContent>
    </ModalBackdrop>
  );
};

function MainPage() {
  const navigate = useNavigate();
  const { stompClient, connected } = useStompClient();

  const userId = localStorage.getItem("userid");
  const username = localStorage.getItem("username");
  const useremail = localStorage.getItem("useremail");
  const userbio = localStorage.getItem("userbio");
  const userprofile = localStorage.getItem("userprofile");

  const myUser = new User({
    userId,
    profileImage: userprofile,
    name: username,
    email: useremail,
    bio: userbio,
  });

  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [popupType, setPopupType] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const [incomingCallData, setIncomingCallData] = useState(null); // { from, data }

  useEffect(() => {
    if (!username || !useremail) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await axios.get("/api/friends/list", {
          params: { userId },
        });
        const friendData = response.data.data.map(
          (friend) =>
            new User({
              userId: friend.userId,
              name: friend.nickname,
              email: friend.email,
              profileImage: friend.profileImageUrl,
              lastCallTime: friend.lastCallTime,
              lastCallDuration: friend.lastCallDuration,
            })
        );
        setFriends(friendData);
      } catch (error) {
        console.error("❌ 친구 목록 로딩 실패:", error);
      }
    };
    fetchFriends();
  }, []);

  const filteredFriends = friends.filter((friend) =>
    (friend.name ?? "").toLowerCase().includes((search ?? "").toLowerCase())
  );

  const openAddFriendPopup = () => {
    setPopupType("addFriend");
    setSelectedFriend(null);
  };

  const openProfilePopup = (friend) => {
    setPopupType("profile");
    setSelectedFriend(friend);
  };

  const handleEditSave = (updatedUser) => {
    localStorage.setItem("username", updatedUser.name);
    localStorage.setItem("useremail", updatedUser.email);
    localStorage.setItem("userbio", updatedUser.bio);
    setPopupType("myProfile");
  };

  const closePopup = () => {
    setPopupType(null);
    setSelectedFriend(null);
  };

  // WebRTC 신호 수신 처리
  const handleSignalMessage = (message) => {
    const { type, from, data } = message;
    if (type === "offer") {
      setIncomingCallData({ from, data });
    }
  };

  // STOMP 구독 처리
  useEffect(() => {
    if (!stompClient || !connected) return;

    const subscription = stompClient.subscribe("/user/queue/signal", (msg) => {
      const message = JSON.parse(msg.body);
      handleSignalMessage(message);
    });

    return () => subscription.unsubscribe();
  }, [stompClient, connected]);

  // 수신 수락/거절 핸들링
  const acceptCall = () => {
    navigate("/meeting", {
      state: {
        incoming: true,
        callerId: useremail,
        receiverId: incomingCallData.from, // 수신자 ID 추가
        offer: incomingCallData.data,
      },
    });
    setIncomingCallData(null);
    localStorage.setItem("receiverEmail", incomingCallData.from);
    localStorage.setItem("callerEmail", useremail);
  };

  const rejectCall = () => {
    setIncomingCallData(null);
    // 필요 시 "거절" 신호 보내기
  };

  return (
    <MainContainer>
      {incomingCallData && (
        <IncomingCallModal
          callerId={incomingCallData.from}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      )}
      <LeftSection>
        <Header>
          <Logo src="/title.png" alt="Logo" />
          <Name>
            <strong>{myUser.name}</strong>
          </Name>
          <ProfileImage
            src={
              myUser.profileImage && myUser.profileImage !== "null"
                ? myUser.profileImage
                : "/profile.png"
            }
            alt="사용자 프로필"
            onClick={() => setPopupType("myProfile")}
          />
        </Header>
        <LeftPanel>
          <SerchTitle>친구 목록</SerchTitle>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="친구 이름 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <SearchButton onClick={openAddFriendPopup}>
              <img alt="친구추가" src="/btnNewFriend.png" />
            </SearchButton>
          </SearchContainer>
          {filteredFriends.length > 0 ? (
            <FriendList
              friends={filteredFriends}
              onFriendClick={openProfilePopup}
            />
          ) : (
            <NoResultText>검색 결과가 없습니다.</NoResultText>
          )}
        </LeftPanel>
      </LeftSection>

      <RightPanel>
        {popupType === null && (
          <LogoCenter src="/logo-title-ver2.png" alt="Main Logo" />
        )}
        {popupType === "myProfile" && (
          <MyProfilePopup
            key={myUser.email + myUser.name}
            user={myUser}
            onClose={closePopup}
            onEditProfile={() => setPopupType("editProfile")}
          />
        )}
        {popupType === "addFriend" && <AddFriendPopup onClose={closePopup} />}
        {popupType === "profile" && selectedFriend && (
          <FriendProfilePopup
            client={stompClient}
            friend={selectedFriend}
            onClose={closePopup}
          />
        )}
        {popupType === "editProfile" && (
          <EditProfilePopup
            user={myUser}
            onClose={closePopup}
            onSave={handleEditSave}
          />
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
  color: #ca9cc3;
  margin-right: 10px;
`;
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
  background-color: #f2f2f7;
  border-radius: 20px;
  width: 70%;

  padding: 25px;

  overflow-y: auto;
  flex: 1;
`;

const RightPanel = styled.div`
  width: 300px;
  flex: 1;
  background-image: url("/sign-bg.png");
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
  background-color: #ca9cc3;
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

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
`;