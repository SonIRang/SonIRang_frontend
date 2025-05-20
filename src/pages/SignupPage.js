import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showError, setShowError] = useState(false); // 오류 표시 여부

  const handleSignup = () => {
    if (password !== confirmPassword) {
      setShowError(true); // 불일치 시 에러 표시
      return;
    }

    navigate("/login");

  };

  return (
    <BackgroundDiv>
      <SignupContainer>
        <FormContainer>
          <Label>이름</Label>
          <Input type="text" placeholder="이름을 입력하세요" />

          <Label>이메일</Label>
          <Row>
            <Input type="email" placeholder="이메일을 입력하세요" />
            <Button>인증번호 받기</Button>
          </Row>

          <Label>인증번호 확인</Label>
          <Row style={{ marginBottom: "20px" }}>
            <Input type="text" placeholder="인증번호를 입력하세요" />
            <Button>확인</Button>
          </Row>

          <Label>비밀번호</Label>
          <Input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setShowError(false);
            }}
          />
          <Input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setShowError(false);
            }}
          />
          {showError && password !== confirmPassword && (
            <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>
          )}

          <SubmitButton onClick={handleSignup}>
            회원가입
          </SubmitButton>
        </FormContainer>
      </SignupContainer>
    </BackgroundDiv>
  );
}

export default SignupPage;

const BackgroundDiv = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url("/sign-bg.png");
  background-color: rgba(185, 207, 227, 0.4);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const SignupContainer = styled.div`
  width: 28vw ;
  height: 75vh ;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 32.6px rgba(149, 138, 181, 1);
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.div`
  width: 20vw ;
  height: 55vh ;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Label = styled.label`
  padding: 10px;
`;

const Input = styled.input`
  height: 48px;
  padding: 0 10px;
  margin-bottom: 5px;
  background-color: #f9f9f9;
  color: #808080;
  border: none;
  border-radius: 6px;
`;

const Row = styled.div`
  height: 48px;
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 5px;
`;

const Button = styled.button`
  width: 102px;
  height: 48px;
  padding: 10px;
  background-color: #ca9cc3;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  padding: 12px;
  background-color: #ca9cc3;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 13px;
  margin-top: 5px;
`;
