import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const EditProfilePopup = ({ user, onClose, onSave }) => {
    const [name, setName] = useState(user.name || '');
    const [nickname, setNickname] = useState(user.name || '');
    const [bio, setBio] = useState(user.bio || '');
    const [password, setPassword] = useState('');
    
    const handleSave = async () => {
        if (!password.trim()) {
            alert("비밀번호를 입력해주세요.");
            return;
        }
        
        const userId = localStorage.getItem("userid");
        if (!userId) {
            alert("사용자 ID를 찾을 수 없습니다.");
            return;
        }
        
        try {
            const response = await axios.put(`/api/users/info/${userId}`, {
                name,
                nickname,
                selfIntroduction: bio,
                password,
            });
            
            if (response.status === 200) {
                const updatedUser = {
                    ...user,
                    name,
                    bio,
                };
                
                // 저장 완료 → MainPage에서 MyProfilePopup 띄우게
                onSave(updatedUser);
            } else {
                alert("프로필 수정에 실패했습니다.");
            }
        } catch (error) {
            console.error("수정 요청 실패:", error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    };
    
    return (
        <PopupContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <PopupImage
        src={user.profileImage && user.profileImage !== 'null' ? user.profileImage : '/profile.png'}
        alt="Edit Profile"
        />

      <InputLabel>이름</InputLabel>
      <Input value={name} onChange={(e) => setName(e.target.value)} />

      <InputLabel>닉네임</InputLabel>
      <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />

      <InputLabel>비밀번호 변경</InputLabel>
      <Input
        type="password"
        placeholder="새로운 비밀번호를 입력하세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        />

      <InputLabel>자기소개</InputLabel>
      <TextArea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="자기소개를 입력하세요"
        />

      <ButtonGroup>
        <SaveButton onClick={handleSave}>저장</SaveButton>
        <CancelButton onClick={onClose}>취소</CancelButton>
      </ButtonGroup>
    </PopupContainer>
  );
};
  
  export default EditProfilePopup;
  
  // 스타일 정의
  const PopupContainer = styled.div`
  width: 400px;
  padding: 30px 20px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  `;

const PopupImage = styled.img`
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
  color: #CA9CC3;
  cursor: pointer;
`;

const InputLabel = styled.label`
  display: block;
  margin-top: 15px;
  margin-bottom: 5px;
  font-weight: bold;
  text-align: left;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ccc;
  font-size: 1rem;
  resize: none;
`;

const ButtonGroup = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const SaveButton = styled.button`
  flex: 1;
  padding: 12px;
  background-color: #CA9CC3;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background-color: #b184b1;
  }
`;

const CancelButton = styled.button`
  flex: 0.4;
  padding: 12px;
  background-color: #d9d9d9;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
`;
