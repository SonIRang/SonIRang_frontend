import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import ToggleSwitch from "../components/ToggleSwitch";

const KAKAO_JS_KEY = "YOUR_KAKAO_JAVASCRIPT_KEY"; // 개발자 센터에서 복사

const LoginPage = () => {
  const navigate = useNavigate();
  const [userId, setuserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  //더미사용자
  const dummyUsers = [
    {
      email: "test1@example.com",
      name: "홍길동",
      password: "1234",
    },
    {
      email: "test2@example.com",
      name: "이순신",
      password: "abcd",
    },
  ];

  const handleLogin = () => {
    // 이메일과 비밀번호가 일치하는 더미 유저 찾기
    const user = dummyUsers.find(
      (u) => u.email === userId && u.password === password
    );

    if (user) {
      // 서버와 통신하여 로그인 요청 (예시로 생략)
      // 로그인 성공 시 사용자 정보 저장
      localStorage.setItem("username", "사용자");
      localStorage.setItem("userId", user.userId);
      localStorage.setItem("userPassword", user.password);
      localStorage.setItem("userprofile", "/profile.png");
      alert(`${user.name}님 환영합니다!`);

      navigate("/");
    } else {
      alert("❌ 로그인 실패: 이메일 또는 비밀번호가 틀렸습니다.");
    }
  };

  const handleClearId = () => {
    setuserId("");
  };

  const handleMouseEnter = () => {
    setShowPassword(true);
  };

  const handleMouseLeave = () => {
    setShowPassword(false);
  };

  // 카카오 로그인
  useEffect(() => {
    const checkKakao = () => {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) {
          window.Kakao.init(KAKAO_JS_KEY);
          console.log("✅ Kakao SDK Initialized");
        }
      } else {
        setTimeout(checkKakao, 100); // SDK가 로드될 때까지 재시도
      }
    };

    checkKakao();
  }, []);

  const loginWithKakao = () => {
    //SDK확인
    if (!window.Kakao || !window.Kakao.Auth) {
      alert("Kakao SDK가 아직 준비되지 않았습니다.");
      return;
    }

    window.Kakao.Auth.login({
      scope: "profile_nickname, account_email",
      success: function (authObj) {
        console.log("카카오 로그인 성공:", authObj);

        window.Kakao.API.request({
          url: "/v2/user/me",
          success: function (res) {
            console.log("카카오 사용자 정보:", res);

            // 백엔드에 전송
            fetch("http://15.164.249.16:8080/get-code", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                kakao_id: res.id,
                email: res.kakao_account.email,
                nickname: res.properties.nickname,
              }),
            })
              .then((response) => response.json())
              .then((data) => {
                console.log("백엔드 응답:", data);
                // 토큰 저장 및 이동
                localStorage.setItem("token", data.token); // 예시
                alert(`${res.properties.nickname}님 환영합니다!`);
                navigate("/");
              })
              .catch((err) => {
                console.error("백엔드 통신 오류:", err);
              });
          },
          fail: function (error) {
            console.error("사용자 정보 요청 실패:", error);
          },
        });
      },
      fail: function (err) {
        console.error("카카오 로그인 실패:", err);
      },
    });
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
              value={userId}
              onChange={(e) => setuserId(e.target.value)}
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
            onClick={loginWithKakao}
          />
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
