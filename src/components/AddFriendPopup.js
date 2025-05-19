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
  const [searched, setSearched] = useState(false);  // 검색 여부 상태 추가

  const handleSearch = () => {
    const foundUser = dummyUsers.find(user => user.email === emailInput.trim());
    setSearchResult(foundUser || null);
    setSearched(true);  // 검색 버튼 누르면 true로 변경
  };

  const handleAdd = () => {
    alert(`친구추가: 아직 구현중;;`);
  };

  return (
    <PopupWrapper>
      <CloseButton onClick={onClose}>X</CloseButton>
      <Title>친구 추가</Title>

      <Container>
        <EmailInput
          type="text"
          placeholder="이메일로 검색"
          value={emailInput}
          onChange={(e) => {
            setEmailInput(e.target.value);
            setSearched(false);  // 입력 변경 시 검색 초기화 (메시지 숨기기)
            setSearchResult(null);
          }}
        />
        <SearchButton onClick={handleSearch}>검색</SearchButton>
      </Container>

      {searchResult ? (
        <ResultWrapper>
          <UserInfo>
            <ProfileImage
              src={searchResult.profileImage || '/profile.png'}
              alt={searchResult.name}
            />
            <UserName>{searchResult.name}</UserName>
          </UserInfo>
          <AddButton onClick={handleAdd}>추가</AddButton>
        </ResultWrapper>
      ) : (
        searched && <NoResult>검색 결과가 없습니다.</NoResult>  // searched가 true일 때만 표시
      )}
    </PopupWrapper>
  );
};

export default AddFriendPopup;

const PopupWrapper = styled.div`
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
  width: 40%;
  border: 1px solid #ccc;
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  background-color: white;
  font-size: 16px;
  cursor: pointer;
`;

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
`;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const EmailInput = styled.input`
  width: 100%;
  padding: 8px;
  margin-right: 12px;
  box-sizing: border-box;
`;

const SearchButton = styled.button`
  padding: 8px 16px;
  cursor: pointer;
`;

const ResultWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
`;

const UserName = styled.span`
  font-weight: 500;
`;

const AddButton = styled.button`
  cursor: pointer;
`;

const NoResult = styled.p`
  color: #999;
  margin-top: 0;
`;
