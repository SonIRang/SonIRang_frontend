import React, { useState } from 'react';
import styled from 'styled-components';
import User from '../models/user';

const dummyUsers = [
  new User({ name: '심은지', email: 'eunji@gmail.com' }),
  new User({ name: '이지윤', email: 'jy@gmail.com' }),
  new User({ name: '최효민', email: 'choi@gmail.com' }),
];

const AddFriendPopup = ({ onClose }) => {
  const [emailInput, setEmailInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const trimmed = emailInput.trim().toLowerCase();
    const foundUser = dummyUsers.find(user => user.email.toLowerCase() === trimmed);
    setSearchResult(foundUser || null);
    setSearched(true);
  };

  const handleAdd = () => {
    alert('친구추가: 구현 중입니다');
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