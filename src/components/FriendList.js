import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

function FriendList({ friends, onFriendClick }) {
  const navigate = useNavigate();

  return (
    <List>
      {friends.map((friend, index) => (
        <ListItem key={index} onClick={() => onFriendClick(friend)}>
          <ProfileImage
            src={friend.profileImage || "/profile.png"}
            alt={friend.name}
          />
          <InfoContainer>
            <FriendName>{friend.name}</FriendName>
            <LastCall>
              최근 통화일:{" "}
              {friend.callHistory?.[friend.callHistory.length - 1] || "없음"}
            </LastCall>
          </InfoContainer>
          <CallIconWrapper>
            <CallIcon
              src="/callicon.png"
              onClick={(e) => {
                e.stopPropagation(); // li 클릭 이벤트 막기
                const receiverId = friend.userId;
                alert(
                  "상대방 ID: " +
                    receiverId +
                    "\n상대방 email: " +
                    friend.email +
                    "\n전화 연결을 시도합니다."
                );

                if (!receiverId) {
                  alert("상대방 ID가 localStorage에 없습니다.");
                  return;
                }

                localStorage.setItem("receiverId", receiverId);
                navigate("/meeting", {
                  state: {
                    callerId: localStorage.getItem("useremail"), // 로그인한 사용자 ID
                    receiverId: friend.email,
                    incoming: false, // 전화를 거는 쪽이므로 false  
                  },
                });
              }}
              alt="call icon"
            />
          </CallIconWrapper>
        </ListItem>
      ))}
    </List>
  );
}

export default FriendList;

const List = styled.ul`
  padding: 0;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
  gap: 10px;
  background-color: white;
  border-radius: 10px;
  height: 60px;
  width: 100%;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  margin-left: 20px;
`;

const InfoContainer = styled.div`
  width: 60%;
`;

const FriendName = styled.div`
  font-weight: bold;
`;

const LastCall = styled.div`
  font-size: 0.9rem;
  color: #888;
`;

const CallIconWrapper = styled.div`
  padding: 5px;
`;

const CallIcon = styled.img`
  width: 25px;
  height: 25px;
  margin-left: 10px;
`;
