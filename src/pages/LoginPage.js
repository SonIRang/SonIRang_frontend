import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import ToggleSwitch from "../components/ToggleSwitch";

const LoginPage = () => {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleClearId = () => {
    setId("");
  };

  const handleMouseEnter = () => {
    setShowPassword(true);
  };

  const handleMouseLeave = () => {
    setShowPassword(false);
  };

  return (
    <BackgroundDiv>
      <LeftPanel>
        <img src="/login-logo.png" alt="Login Frame" style={{ height: "100vh" }} />
      </LeftPanel>

      <RightPanel>
        <LoginContainer>
          <LoginHeader>
            <p>
              수화로 연결되는 세상,
              <br />
              소통에 경계는 없다
            </p>
            <h2>SONIRANG</h2>
          </LoginHeader>

          <Label>아이디</Label>
          <InputWrapper>
            <Input
              type="email"
              placeholder="아이디를 입력하세요"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <Icon src="./id-clear-icon.png" alt="clear" onClick={handleClearId} />
          </InputWrapper>

          <Label>비밀번호</Label>
          <InputWrapper>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Icon
              src="./pw-watch-icon.png"
              alt="watch PW"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </InputWrapper>

          <LoginOptions>
            <ToggleSwitch style={{ height: "20px", width: "40px" }} />
            <AutoLoginLabel>자동 로그인</AutoLoginLabel>
            <ForgotPassword href="#">비밀번호를 잊으셨나요?</ForgotPassword>
          </LoginOptions>

          <LoginButton onClick={() => navigate("/")}>로그인</LoginButton>
          <SignupButton onClick={() => navigate("/signup")}>회원가입</SignupButton>
        </LoginContainer>

        <FooterText>소셜아이디로 간편하게 로그인</FooterText>
        <SocialIcons>
          <img src="./kakao-icon.png" alt="Kakao" />
        </SocialIcons>
      </RightPanel>
    </BackgroundDiv>
  );
};

export default LoginPage;

const BackgroundDiv = styled.div`
  height: calc(100vh - 80px);
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  background-image: url("/sign-bg.png");
  background-color: #ffffff;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const LeftPanel = styled.div`
  width: 100%;
  height: 100%;
`;

const RightPanel = styled.div`
  width: 100vw;
  height: calc(100vh - 80px);
  background-color: #ffffff;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LoginContainer = styled.div`
  width: 368px;
  display: flex;
  flex-direction: column;
`;

const LoginHeader = styled.div`
  margin-bottom: 20px;
  p {
    margin: 0;
  }
  h2 {
    color: #ca9cc3;
  }
`;

const Label = styled.label`
  padding: 10px;
`;

const InputWrapper = styled.div`
  height: 48px;
  width: 368px;
  background-color: #f9f9f9;
  color: #808080;
  border: none;
  border-radius: 6px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;

const Input = styled.input`
  height: 44px;
  width: 320px;
  background-color: #f9f9f9;
  color: #808080;
  border: none;
  border-radius: 6px;
`;

const Icon = styled.img`
  cursor: pointer;
`;

const LoginOptions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
`;

const AutoLoginLabel = styled.label`
  padding-left: 8px;
`;

const ForgotPassword = styled.a`
  color: #ca9cc3;
`;

const LoginButton = styled.button`
  height: 40px;
  width: 368px;
  padding: 10px;
  background-color: #ca9cc3;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 20px;
`;

const SignupButton = styled.button`
  height: 40px;
  width: 368px;
  padding: 10px;
  background-color: #ffffff;
  color: #ca9cc3;
  border: 1px solid #ca9cc3;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 5px;
`;

const FooterText = styled.p`
  margin-top: 20px;
`;

const SocialIcons = styled.div`
  margin-top: 10px;
`;
