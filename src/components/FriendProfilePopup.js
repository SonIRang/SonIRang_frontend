import React, { useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function FriendProfilePopup({ friend, onClose }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userid");

  const handleCallClick = () => {
    const receiverId = friend.userId;
    alert(
      "상대방 ID: " +
        receiverId +
        "\n상대방 email: " +
        friend.email +
        "\n전화 연결을 시도합니다."
    );
    if (!receiverId) {
      alert("상대방 ID가 정의되지 않았습니다.");

      return;
    }
    localStorage.setItem("receiverId", receiverId);
    navigate("/meeting", {
      state: {
        callerId: localStorage.getItem("usereamil"), // 로그인한 사용자 ID
        receiverId: friend.email,
        incoming: false, // 전화를 거는 쪽이므로 false
      },
    });
  };

  const handleDeleteClick = async () => {
    try {
      const response = await axios.post(
        `/api/friends/delete?requesterId=${userId}`,
        {
          targetEmail: friend.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        alert(friend.name + "님이 삭제되었습니다.");
        onClose();
      } else {
        alert("친구 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("친구 삭제 오류:", error);
      alert("친구 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <PopupContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <ProfileImage
        src={friend.profileImage || "/profile.png"}
        alt={friend.name}
      />
      <Name>{friend.name}</Name>
      <Email>{friend.email}</Email>
      <Bio>{friend.bio || "작성된 자기소개가 없습니다."}</Bio>

      <SectionTitle>통화 기록</SectionTitle>
      <CallHistoryList>
        {friend.callHistory?.length > 0 ? (
          friend.callHistory.map((call, index) => (
            <CallItem key={index}>{call}</CallItem>
          ))
        ) : (
          <CallItem>기록 없음</CallItem>
        )}
      </CallHistoryList>

      <ButtonGroup>
        <CallBtn onClick={handleCallClick}>전화 걸기</CallBtn>
        <DeleteBtn onClick={handleDeleteClick}>삭제</DeleteBtn>
      </ButtonGroup>
    </PopupContainer>
  );
}

export default FriendProfilePopup;

const PopupContainer = styled.div`
  width: 400px;
  padding: 30px 20px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 15px;
  top: 15px;
  font-size: 30px;
  background: none;
  border: none;
  color: #ca9cc3;
  cursor: pointer;
`;

const Name = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
`;

const Email = styled.p`
  color: #555;
  margin-bottom: 30px;
  margin-top: 0px;
`;

const Bio = styled.p`
  margin-top: 20px;
  padding: 20px;
  min-height: 50px;
  background-color: #f9f9f9;
  border-radius: 12px;
  color: #333;
  font-size: 0.95rem;
`;

const SectionTitle = styled.p`
  font-weight: bold;
  margin-bottom: 10px;
`;

const CallHistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
`;

const CallItem = styled.div`
  background: #f5f5f5;
  border-radius: 10px;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const DeleteBtn = styled.button`
  flex: 0.4;
  padding: 12px;

  background-color: #d9d9d9;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
`;

const CallBtn = styled.button`
  flex: 1;
  padding: 12px;

  background-color: #47b647;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  font-size: 1rem;
`;
