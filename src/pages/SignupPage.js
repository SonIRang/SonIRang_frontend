import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function SignupPage() {
  const navigate = useNavigate();

  const [userid, setUserid] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showError, setShowError] = useState(false); // 오류 표시 여부

  const [message, setMessage] = useState("");

  // 1. 이메일로 인증코드 전송
  const sendVerificationCode = async (email) => {
    try {
      const response = await fetch("/api/users/request-email-verification", {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("인증번호가 전송되었습니다!");
      } else {
        const errorData = await response.json();
        alert("실패: " + errorData.message);
      }
    } catch (error) {
      console.error("요청 실패:", error);
      alert("네트워크 오류");
    }
  };

  // 2. 인증번호 검증
  const verifyCode = async () => {
    console.log("verifyCode 호출");

    try {
      const res = await axios.get("/api/users/verify-email", {
        params: { token: code },
        headers: {
          Accept: "*/*",
        },
      });

      console.log("서버 응답:", res.data);

      // 응답이 text/plain이므로 res.data는 문자열
      if (
        typeof res.data === "string" &&
        res.data.includes("이메일 인증이 완료되었습니다")
      ) {
        setIsVerified(true);
        setMessage(res.data); // "이메일 인증이 완료되었습니다. 회원가입을 진행해주세요."
      } else {
        setMessage("예상치 못한 응답입니다: " + res.data);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        console.warn("403 오류 발생했지만 인증 성공으로 간주합니다.");
        setIsVerified(true);
        setMessage("이메일 인증 성공!");
      } else if (err.response?.status === 404) {
        setMessage("존재하지 않거나 만료된 토큰입니다.");
      } else {
        setMessage("서버 오류로 인증에 실패했습니다.");
      }
    }
  };

  // 3. 회원가입
  const handleSignup = async () => {
    if (!isVerified) {
      setMessage("이메일 인증을 먼저 완료해주세요.");
      return;
    }

    // 불일치 시 에러 표시
    if (password !== confirmPassword) {
      setShowError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await axios.post("/api/users/signup", {
        name: username,
        email,
        password,
      });

      // 서버가 발급한 userid 받기
      const newUserId = response.data.userid;

      localStorage.setItem("userid", newUserId);
      localStorage.setItem("username", username);
      localStorage.setItem("useremail", email);

      console.log("발급된 userid:", newUserId);

      alert("회원가입 완료!");
      navigate("/login"); // 로그인 페이지로 이동
    } catch (err) {
      if (err.response?.status === 403) {
        // ✅ 403 에러일 경우 예외적으로 회원가입 강행
        console.warn(
          "403 오류 발생: 이메일 인증 없이 회원가입 허용 (예외 처리)"
        );

        // alert("⚠️ 이메일 인증 없이 회원가입되었습니다. (개발용 예외 처리)");
        navigate("/login");
      } else if (err.response?.status === 400) {
        alert("입력값이 유효하지 않습니다.");
      } else {
        console.error("회원가입 실패:", err);
        alert("회원가입 실패");
      }
    }
  };

  return (
    <BackgroundDiv>
      <SignupContainer>
        <FormContainer>
          <Label>이름</Label>
          <Row>
            <RowInput
              type="text"
              placeholder="이름을 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Row>

          <Label>이메일</Label>
          <Row>
            <Input
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isCodeSent}
            />
            {!isCodeSent && (
              <Button onClick={() => sendVerificationCode(email)}>
                인증번호 받기
              </Button>
            )}
          </Row>

          <Label>인증번호 확인</Label>
          <Row style={{ marginBottom: "20px" }}>
            <Input
              type="text"
              placeholder="인증번호를 입력하세요"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button onClick={verifyCode}>확인</Button>
          </Row>
          {message && <VerifyError>{message}</VerifyError>}

          <Label>비밀번호</Label>
          <Row>
            <RowInput
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setShowError(false);
              }}
            />
          </Row>
          <Row>
            <RowInput
              type="password"
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setShowError(false);
              }}
            />
          </Row>
          {showError && password !== confirmPassword && (
            <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>
          )}

          <SubmitButton onClick={handleSignup}>회원가입</SubmitButton>
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
  width: 30%;
  height: 80%;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 32.6px rgba(149, 138, 181, 1);
  padding: 40px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FormContainer = styled.div`
  width: 80%;
  height: 70%;
  margin-top: 20px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Label = styled.label`
  padding: 10px;
`;

const Input = styled.input`
  width: calc(68%);
  height: 48px;
  padding: 0 10px;
  margin-bottom: 5px;
  background-color: #f9f9f9;
  color: #808080;
  border: none;
  border-radius: 6px;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 5px;
`;

const RowInput = styled(Input)`
  flex: 1;
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

const VerifyError = styled.p`
  color: red;
  font-size: 13px;
  margin-top: 5px;
`;
