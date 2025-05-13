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
        <img
          src="/login-Frame.png"
          alt="Login Frame"
          style={{ height: "100vh" }}
        />
      </LeftPanel>

      <RightPanel
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "#ffffff",
          gap: "10px",
          padding: "10px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ width: "368px" }}>
          <div className="login-header">
            <p>
              수화로 연결되는 세상,
              <br />
              소통에 경계는 없다
            </p>
            <h2 style={{ color: "#CA9CC3" }}>SONIRANG</h2>
          </div>

          <label style={{ padding: "10px" }}>아이디</label>
          <div
            class="id_input"
            style={{
              height: "48px",
              width: "368px",
              backgroundColor: "#F9F9F9",
              color: "#808080",
              border: "none",
              borderRadius: "6px",
              boxSizing: "border-box",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <input
              type="email"
              placeholder="아이디를 입력하세요"
              value={id}
              onChange={(e) => setId(e.target.value)}
              style={{
                height: "44px",
                width: "320px",
                backgroundColor: "#F9F9F9",
                color: "#808080",
                border: "none",
                borderRadius: "6px",
              }}
            />
            <img
              src="./id-clear-icon.png"
              alt="clear"
              className="clear-icon"
              onClick={handleClearId}
            />
          </div>

          <label style={{ padding: "10px" }}>비밀번호</label>
          <div
            class="id_pwword"
            style={{
              height: "48px",
              width: "368px",
              backgroundColor: "#F9F9F9",
              color: "#808080",
              border: "none",
              borderRadius: "6px",
              boxSizing: "border-box",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                height: "44px",
                width: "320px",
                backgroundColor: "#F9F9F9",
                color: "#808080",
                border: "none",
                borderRadius: "6px",
              }}
            />
            <img
              src="./pw-watch-icon.png"
              alt="watch PW"
              className="watch-icon"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          </div>

          <div className="login-options">
            <ToggleSwitch style={{ height: "20px", width: "40px" }} />
            <label style={{ paddingLeft: "8px" }}>자동 로그인</label>
            <a href="#" style={{ color: "#CA9CC3" }}>
              비밀번호를 잊으셨나요?
            </a>
          </div>

          <button
            style={{
              height: "40px",
              width: "368px",
              padding: "10px",
              gap: "10px",
              backgroundColor: "#CA9CC3",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "20px",
            }}
            onClick={() => navigate("/")}
          >
            로그인
          </button>

          <button
            style={{
              height: "40px",
              width: "368px",
              padding: "10px",
              gap: "10px",
              backgroundColor: "#FFFFFF",
              color: "#CA9CC3",
              border: "1px solid #CA9CC3 ",
              borderRadius: "6px",
              cursor: "pointer",
              marginTop: "5px",
            }}
            onClick={() => navigate("/signup")}
          >
            회원가입
          </button>
        </div>

        <p className="login-footer">소셜아이디로 간편하게 로그인</p>
        <div className="social-icons">
          <img src="./kakao-icon.png" alt="Kakao" />
        </div>
      </RightPanel>

      {/* <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold mb-4">로그인</h1>
        <p onClick={() => navigate("/signup")}> 회원가입 </p>
      </div> */}
    </BackgroundDiv>
  );
};

export default LoginPage;

const BackgroundDiv = styled.div`
  width: 100vw;
  height: 100vh;
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
  width, hight: 100%;
`;

const RightPanel = styled.div`
  hight: "100vh";
  flex: 1;
  background-color: #fff;
`;
