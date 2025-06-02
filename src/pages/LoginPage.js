import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import ToggleSwitch from "../components/ToggleSwitch";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  //일반 로그인
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("🟢 handleLogin 호출됨");

    try {
      const response = await fetch("/api/users/general-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
      }

      console.log("Content-Type:", response.headers.get("Content-Type"));

      const data = await response.json();
      console.log("✅ 응답 내용:", data);

      const { tokenResponse, user } = data;

      if (!tokenResponse?.accessToken || !tokenResponse?.refreshToken) {
        throw new Error("로그인 응답에 토큰이 없습니다.");
      }

      localStorage.setItem("generalAccessToken", tokenResponse.accessToken);
      localStorage.setItem("generalRefreshToken", tokenResponse.refreshToken);
      localStorage.setItem("userid", user.userId);
      localStorage.setItem("useremail", user.email);
      localStorage.setItem("nickname", user.nickname);
      localStorage.setItem("username", user.name);
      localStorage.setItem("userbio", user.selfIntroduction || "");
      localStorage.setItem("userprofile", user.profileImageUrl || "");

      // const handleAuthLogin = async (useremail) => {
      //   const query = new URLSearchParams({ useremail }).toString();

      //   const response = await fetch(`/api/auth/login?${query}`, {
      //     method: "POST",
      //     headers: {
      //       accept: "*/*",
      //     },
      //     body: "", // 빈 바디
      //   });

      //                 await handleAuthLogin(email);

      //   if (!response.ok) {
      //     console.error("❌ Auth login failed");
      //     return;
      //   }

      //   // 응답 본문은 그냥 텍스트 (예: "로그인 성공")
      //   const text = await response.text();
      //   console.log("✅ Response body:", text);

      //   // 🔑 헤더에서 토큰 꺼내기
      //   const authaccessToken = response.headers.get("access-token");
      //   const authrefreshToken = response.headers.get("refresh-token");

      //   console.log("📥 accessToken:", authaccessToken);
      //   console.log("📥 refreshToken:", authrefreshToken);

      //   if (!authaccessToken || !authrefreshToken) {
      //     console.error("❌ 토큰 헤더가 없습니다.");
      //     return;
      //   }

      //   // 🧠 저장
      //   localStorage.setItem("authAccessToken", authaccessToken);
      //   localStorage.setItem("authRefreshToken", authrefreshToken);

      //   console.log(
      //     "✅ 저장된 accessToken:",
      //     localStorage.getItem("authAccessToken")
      //   );
      //   console.log(
      //     "✅ 저장된 refreshToken:",
      //     localStorage.getItem("authRefreshToken")
      //   );

      //   // 토큰 저장
      //   localStorage.setItem("authAccessToken", data.tokenResponse.accessToken);
      //   localStorage.setItem(
      //     "authRefreshToken",
      //     data.tokenResponse.refreshToken
      //   );

      //   console.log("Auth tokens saved");
      // };

      setMessage("로그인 성공!");
      // 로그인 성공 후 메인 페이지 이동
      navigate("/");

      console.log(
        "저장된 auth accessToken:",
        localStorage.getItem("authAccessToken")
      );
      console.log(
        "저장된 auth refreshToken:",
        localStorage.getItem("authRefreshToken")
      );
    } catch (error) {
      console.error("❌ 로그인 실패:", error.message);
      alert(error.message);
    }
    
  };

  // 카카오 로그인
  const kakaologinHandler = () => {
    //카카오 로그인 키, 로그인화면면
    const CLIENT_ID = "85fcaa39c8736077176b6c19a498acd5"; // 개발자 센터에서 복사
    const REDIRECT_URI = "http://localhost:3000/login/oauth/kakao"; //프론트 주소
    const link = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    //http://localhost:3000/login/oauth/kakao

    window.location.href = link;
  };

  //아이디,비밀번호 입력창과 관련된 부분분
  const handleClearId = () => {
    setEmail("");
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
        <img
          src="/login-logo.png"
          alt="Login Frame"
          style={{ height: "100vh" }}
        />
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Icon
              src="./id-clear-icon.png"
              alt="clear"
              onClick={handleClearId}
            />
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

          <LoginButton onClick={handleLogin}>로그인</LoginButton>
          <SignupButton onClick={() => navigate("/signup")}>
            회원가입
          </SignupButton>
        </LoginContainer>

        <FooterText>소셜아이디로 간편하게 로그인</FooterText>
        <SocialIcons>
          <img
            src="./kakao-icon.png"
            alt="Kakao"
            style={{ cursor: "pointer" }}
            onClick={kakaologinHandler}
          />
        </SocialIcons>
      </RightPanel>
    </BackgroundDiv>
  );
};

export default LoginPage;

const BackgroundDiv = styled.div`
  height: 100vh;
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
  width: 100%;
  height: 100vh;
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
