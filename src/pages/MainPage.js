import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import styled from "styled-components";
import User from "../models/user";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

import MyProfilePopup from "../components/MyProfilePopup";
import FriendList from "../components/FriendList";
import FriendProfilePopup from "../components/FriendProfilePopup";
import AddFriendPopup from "../components/AddFriendPopup";
import EditProfilePopup from "../components/EditProfilePopup";
import MeetingPage from "./MeetingPage";

function MainPage() {
  const navigate = useNavigate();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [connected, setConnected] = useState(false);

  const stompClient = useRef(null); // useRef로 변경

  const userId = localStorage.getItem("userid");
  const username = localStorage.getItem("username");
  const useremail = localStorage.getItem("useremail");
  const userbio = localStorage.getItem("userbio");
  const userprofile = localStorage.getItem("userprofile");
  const useraccesstoken = localStorage.getItem("accessToken");

  const [incomingCallData, setIncomingCallData] = useState(null); // { from: callerId, data: offer }
  const [showModal, setShowModal] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);

  useEffect(() => {
    // 사용자 정보 없으면 /login으로 리디렉트
    if (!username || !useremail) {
      navigate("/login");
      return;
    }
  });

  const myUser = new User({
    userId: userId,
    profileImage: userprofile,
    name: username,
    email: useremail,
    bio: userbio,
  });

  const [friends, setFriends] = useState([]);

  // 친구 목록 불러오기
  useEffect(() => {
    const fetchFriends = async () => {
      if (!userId) {
        console.warn("userId 없음");
        return;
      }

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
        console.error("친구 목록을 불러오는데 실패했습니다:", error);
      }
    };

    fetchFriends();
  }, []);

  const [search, setSearch] = useState("");
  const [popupType, setPopupType] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

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

  // const handleSignalMessage = (data) => {
  //   if (data.type === "offer") {
  //     setIncomingCallData(data);
  //     setShowModal(true);
  //   }
  // };

  // STOMP 연결 처리
  useEffect(() => {
    if (!userId) return;

    console.log("userid:", userId);

    const socketUrl = `http://localhost:8080/ws-signaling?user-id=${encodeURIComponent(
      userId
    )}`;

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      debug: (str) => {
        console.log(str);
      },
      onConnect: (frame) => {
        console.log("STOMP 연결됨:", frame);
        setConnected(true);

        client.subscribe(`/user/queue/signal`, (msg) => {
          const message = JSON.parse(msg.body);
          console.log("수신 메시지:", message);
          handleSignalMessage(message);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP 에러:", frame.headers["message"]);
      },
      onWebSocketClose: (evt) => {
        console.warn("WebSocket 연결 종료", evt);
        setConnected(false);
      },
      onWebSocketError: (evt) => {
        console.error("WebSocket 에러", evt);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [userId]);

  const handleSignalMessage = (message) => {
    const { type, from, data } = message;

    switch (type) {
      case "offer":
        console.log("통화 요청 받음:", from);
        setIncomingCallData({ from, data });
        setShowModal(true); // IncomingCallModal 표시
        break;
      case "answer":
        // WebRTC 연결 단계 처리
        break;
      case "ice-candidate":
        // ICE 후보 추가
        break;
      default:
        console.warn("알 수 없는 메시지 타입:", type);
    }
  };

  return (
    <MainContainer>
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
            key={myUser.email + myUser.name} // 프로필이 바뀌면 key도 바뀜
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
            isSocketConnected={isSocketConnected}
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
