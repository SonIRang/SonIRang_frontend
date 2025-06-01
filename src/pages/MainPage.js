import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import User from "../models/user";
import { useNavigate } from "react-router-dom";
// import SockJS from "sockjs-client";
// import { Client } from "@stomp/stompjs";

import MyProfilePopup from "../components/MyProfilePopup";
import FriendList from "../components/FriendList";
import FriendProfilePopup from "../components/FriendProfilePopup";
import AddFriendPopup from "../components/AddFriendPopup";
import EditProfilePopup from "../components/EditProfilePopup";
import MeetingPage from "./MeetingPage";
import { refreshAccessToken, isTokenExpired } from "../utils/token";

// import IncomingCallModal from "../components/IncomingCallModal";

function MainPage({ client }) {
  const navigate = useNavigate();
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [stompClient, setStompClient] = useState(null);

  const userId = useState(localStorage.getItem("userid"));
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

  // 이메일로 userId 가져오기
  useEffect(() => {
    const fetchUserIdByEmail = async () => {
      if (!useremail) return;

      try {
        const response = await axios.get(
          `/api/friends/search?email=${encodeURIComponent(useremail)}`
        );

        if (response.status === 200 && response.data.data) {
          const fetchedUserId = response.data.data.userId;
          const fetchedUserProfile = response.data.data.profileImageUrl;
          localStorage.setItem("userid", fetchedUserId);
          localStorage.setItem("userprofile", fetchedUserProfile);
          console.log("userId 저장됨:", fetchedUserId);
        } else {
          console.warn("userId를 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("userId를 불러오는 데 실패했습니다:", error);
      }
    };

    fetchUserIdByEmail();
  }, [useremail]);

  // 친구 목록 불러오기
  useEffect(() => {
    const fetchFriends = async () => {
      const userId = localStorage.getItem("userid");
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
  // useEffect(() => {
  //   let socket = null;
  //   let isMounted = true;

  //   const setupWebSocket = async () => {
  //     let token = localStorage.getItem("generalAccessToken");
  //     const refreshToken = localStorage.getItem("generalRefreshToken");

  //     console.log("accessToken:", token);
  //     console.log("refreshToken:", refreshToken);

  //     if (!token || isTokenExpired(token)) {
  //       console.warn("⏳ 토큰이 없거나 만료됨. 재발급 시도.");
  //       const newToken = await refreshAccessToken(refreshToken);
  //       if (!newToken) {
  //         console.error("❌ 토큰 재발급 실패");
  //         return;
  //       }
  //       token = newToken;
  //     }

  //     if (!token || !useremail) {
  //       console.warn("⚠️ 토큰 또는 사용자 이메일이 없음. WebSocket 연결 생략.");
  //       return;
  //     }

  //     const wsUrl =
  //       window.location.hostname === "localhost"
  //         ? "ws://localhost:8080/ws-signaling"
  //         : "ws://15.164.249.16:8080/ws-signaling";

  //     socket = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);

  //     socket.onopen = () => {
  //       if (!isMounted) return;
  //       console.log("✅ WebSocket connected");
  //       socket.send("hello");
  //     };

  //     socket.onmessage = (event) => {
  //       if (!isMounted) return;
  //       console.log("📨 Message received:", event.data);
  //     };

  //     socket.onerror = (err) => {
  //       if (!isMounted) return;
  //       console.error("❌ WebSocket error:", err);
  //     };

  //     socket.onclose = (event) => {
  //       if (!isMounted) return;
  //       console.warn("WebSocket closed:", event.code, event.reason);
  //     };
  //   };

  //   setupWebSocket();

  //   return () => {
  //     isMounted = false;
  //     if (socket) {
  //       socket.close();
  //     }
  //   };
  // }, [useremail]);

  useEffect(() => {
    let socket = null;
    let isMounted = true;

    const setupWebSocket = async () => {
      const userid = localStorage.getItem("userid");

      if (!userid) {
        console.warn("⚠️ 사용자 ID가 없습니다. WebSocket 연결 생략.");
        return;
      }

      const wsUrl =
        window.location.hostname === "localhost"
          ? "ws://localhost:8080/ws-signaling"
          : "ws://15.164.249.16:8080/ws-signaling";

      socket = new WebSocket(`${wsUrl}?userid=${encodeURIComponent(userid)}`);

      socket.onopen = () => {
        if (!isMounted) return;
        console.log("✅ WebSocket connected");
        socket.send("hello");
      };

      socket.onmessage = (event) => {
        if (!isMounted) return;
        console.log("📨 Message received:", event.data);
      };

      socket.onerror = (err) => {
        if (!isMounted) return;
        console.error("❌ WebSocket error:", err);
      };

      socket.onclose = (event) => {
        if (!isMounted) return;
        console.warn("WebSocket closed:", event.code, event.reason);
      };
    };

    setupWebSocket();

    return () => {
      isMounted = false;
      if (socket) {
        socket.close();
      }
    };
  }, [useremail]); // 또는 필요하면 useremail도 제거 가능

  const handleAccept = () => {
    if (!stompClient || !incomingCallData) return;

    // 1) 상대방(통화요청자)에게 'answer-ready' 신호 보내기 (optional)
    stompClient.publish({
      destination: "/app/signal",
      body: JSON.stringify({
        type: "answer-ready",
        to: incomingCallData.from,
      }),
    });

    // 2) 화상통화 페이지로 이동하면서 offer 데이터 전달
    navigate("/meeting", {
      state: {
        callerId: incomingCallData.from,
        offer: incomingCallData.offer,
        incoming: true,
      },
    });
  };

  const handleReject = () => {
    if (stompClient && incomingCallData) {
      stompClient.publish({
        destination: "/app/signal",
        body: JSON.stringify({
          type: "reject",
          to: incomingCallData.from,
        }),
      });
    }
    setIncomingCallData(null);
  };

  const acceptCall = () => {
    if (!stompClient || !incomingCallData) return;

    // 상대방에게 수락 신호 보내기
    stompClient.publish({
      destination: "/api/signal/send",
      body: JSON.stringify({
        type: "accept",
        to: incomingCallData.from,
      }),
    });

    setCallAccepted(true);
    setShowModal(false);
  };

  const rejectCall = () => {
    if (!stompClient || !incomingCallData) return;

    // 상대방에게 거절 신호 보내기
    stompClient.publish({
      destination: "/app/signal",
      body: JSON.stringify({
        type: "reject",
        to: incomingCallData.from,
      }),
    });

    setShowModal(false);
    setIncomingCallData(null);
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

      {incomingCallData && (
        <div style={{ padding: 10, border: "1px solid gray" }}>
          <p>📞 {incomingCallData.from} 님의 통화 요청이 있습니다.</p>
          <button onClick={handleAccept}>수락</button>
          <button onClick={handleReject}>거절</button>
        </div>
      )}
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
