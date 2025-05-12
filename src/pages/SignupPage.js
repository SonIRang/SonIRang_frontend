import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const navigate = useNavigate();

  return (
    <BackgroundDiv>
      <div
        style={{
          width: "539px",
          height: "792px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 4px 32.6px rgba(149, 138, 181, 1)",
          gap: "10px",
          padding: "10px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "368px",
            height: "588px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <label style={{ padding: "10px" }}>이름</label>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            style={{
                height: "48px",
                paddingLeft: "10px",
                paddingRight: "10px",
                gap: "10px",
                backgroundColor: "#F9F9F9",
                color: "#808080",
                border: "none",
                borderRadius: "6px",
              }}
          />

          <label style={{ padding: "10px" }}>이메일</label>
          <div>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              style={{
                height: "48px",
                paddingLeft: "10px",
                paddingRight: "10px",
                gap: "10px",
                backgroundColor: "#F9F9F9",
                color: "#808080",
                border: "none",
                borderRadius: "6px",
              }}
            />
            <button
              style={{
                width: "102px",
                height: "48px",
                padding: "10px",
                backgroundColor: "#CA9CC3",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              인증번호 받기
            </button>
          </div>

          <label style={{ padding: "10px" }}>인증번호 확인</label>
          <div
            style={{
                marginBottom: "20px",

            }}>
            <input
              type="text"
              placeholder="인증번호를 입력하세요"
              style={{
                height: "48px",
                paddingLeft: "10px",
                paddingRight: "10px",
                gap: "10px",
                backgroundColor: "#F9F9F9",
                color: "#808080",
                border: "none",
                borderRadius: "6px",
              }}
            />
            <button
              style={{
                width: "102px",
                height: "48px",
                padding: "10px",
                backgroundColor: "#CA9CC3",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              확인
            </button>
          </div>

          <label style={{ padding: "10px" }}>비밀번호</label>
          <input
            type="text"
            placeholder="비밀번호를 입력하세요"
            style={{
                height: "48px",
                paddingLeft: "10px",
                paddingRight: "10px",
                gap: "10px",
                marginBottom: "5px",
                backgroundColor: "#F9F9F9",
                color: "#808080",
                border: "none",
                borderRadius: "6px",
              }}
          />
          <input
            type="text"
            placeholder="비밀번호 확인"
            style={{
                height: "48px",
                paddingLeft: "10px",
                paddingRight: "10px",
                gap: "10px",
                backgroundColor: "#F9F9F9",
                color: "#808080",
                border: "none",
                borderRadius: "6px",
              }}
          />

          <button
            style={{
              padding: "12px",
              backgroundColor: "#CA9CC3",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              marginTop: "20px",
            }}
            onClick={() => navigate("/login")}
          >
            회원가입
          </button>
        </div>
      </div>
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
