import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const KakaoRedirectHandler = () => {
  const navigate = useNavigate();
  const code = new URL(window.location.href).searchParams.get("code");
  console.log("🔑 인가 코드:", code);


  useEffect(() => {
    
    if (code) {
      axios
        .get(`http://15.164.249.16:8080/kakao-login?code=${code}`)
        .then((res) => {
          console.log("✅ 백엔드 응답 데이터:", res.data);
          const { accessToken, refreshToken } = res.data;

          if (accessToken && refreshToken) {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
            console.log("🎉 로그인 성공, 토큰 저장 완료");
            navigate("/"); // 메인 페이지로 이동
          } else {
            throw new Error("토큰 누락");
          }
        })
        .catch((err) => {
          console.error("카카오 로그인 실패:", err);
          alert("로그인에 실패했습니다.");
          navigate("/login");
        });
    } else {
      alert("인가 코드가 없습니다.");
      navigate("/login");
    }
  }, [navigate]);

  return null; // UI 없이 처리만
};

export default KakaoRedirectHandler;
