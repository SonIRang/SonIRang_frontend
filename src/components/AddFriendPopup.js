import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const AddFriendPopup = ({ onClose }) => {
  const [emailInput, setEmailInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searched, setSearched] = useState(false);

const handleSearch = async () => {
  const trimmed = emailInput.trim().toLowerCase();
  if (!trimmed) return;

  try {
    const response = await axios.get(
      `/api/friends/search?email=${encodeURIComponent(trimmed)}`
    );

    if (response.status === 200 && response.data.data) {
      const user = response.data.data;
      setSearchResult({
        name: user.name,
        email: user.email,
        profileImage: user.profileImageUrl
      });
    } else {
      setSearchResult(null);
    }
  } catch (error) {
    console.error('유저 검색 오류:', error);
    setSearchResult(null);
  } finally {
    setSearched(true);
  }
};

  const handleAdd = async () => {
    const userId = localStorage.getItem("userid");
    if (!searchResult) return;

    try {
      const response = await axios.post(
        `/api/friends/add?requesterId=${userId}`, 
        {
          targetEmail: searchResult.email,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        alert('친구가 성공적으로 추가되었습니다!');
        onClose(); // 팝업 닫기
      } else {
        alert('친구 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('친구 추가 오류:', error);
      alert('친구 추가 중 오류가 발생했습니다.');
    }
  };

  return (
    <PopupContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <Title>친구 추가</Title>

      <SearchContainer>
        <EmailInput
          type="text"
          placeholder="이메일을 입력하세요"
          value={emailInput}
          onChange={(e) => {
            setEmailInput(e.target.value);
            setSearched(false);
            setSearchResult(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <SearchButton onClick={handleSearch}>검색</SearchButton>
      </SearchContainer>

      {searched && (
        searchResult ? (
          <ResultWrapper>
            <UserInfo>
              <ProfileImage
                src={searchResult.profileImage || '/profile.png'}
                alt={searchResult.name}
              />
              <UserName>{searchResult.name}</UserName>
            </UserInfo>
            <AddButton onClick={handleAdd}>
              <img alt='친구추가' src='/btnNewFriend.png' />
            </AddButton>
          </ResultWrapper>
        ) : (
          <NoResult>검색 결과가 없습니다.</NoResult>
        )
      )}
    </PopupContainer>
  );
};

export default AddFriendPopup;

const PopupContainer = styled.div`
width: 400px;
padding: 32px;
background-color: #fff;
border-radius: 16px;
box-shadow: 0px 4px 20px rgba(0 , 0, 0, 0.1);
position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 15px;
  top: 15px;
  font-size: 30px;
  background: none;
  border: none;
  color: #CA9CC3;
  cursor: pointer;
`;

const Title = styled.h3`
  margin: 0 0 20px 0;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
`;

const EmailInput = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  outline: none;
  background-color: #f9f9f9;
`;

const SearchButton = styled.button`
  padding: 10px 20px;
  background-color: #d2a8d2;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #c194c1;
  }
`;

const ResultWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ProfileImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
`;

const UserName = styled.span`
  font-weight: 500;
`;

const AddButton = styled.button`
  background-color: #d2a8d2;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 16px;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #c194c1;
  }
`;

const NoResult = styled.p`
  color: #999;
  font-size: 0.9rem;
`;