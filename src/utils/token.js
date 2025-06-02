// src/utils/auth.js

// JWT 만료 여부 확인 함수
export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (err) {
    console.error("❌ 토큰 파싱 실패", err);
    return true;
  }
};

// accessToken 재발급 함수
export const refreshAccessToken = async (refreshToken) => {
  const email = localStorage.getItem("useremail");
  // const refreshToken = localStorage.getItem("refreshToken");

  console.log("재발급 토큰:",refreshToken);

  if (!email || !refreshToken) {
    console.warn("❌ 이메일 또는 리프레시 토큰 없음");
    return null;
  }

  const query = new URLSearchParams({ email, refreshToken }).toString();

  try {
    const response = await fetch(
      `/api/auth/reissue?${query}`,
      {
        method: "POST",
        headers: {
          accept: "*/*",
        },
      }
    );

    if (!response.ok) {
      console.error("❌ 토큰 재발급 실패:", response.status);
      return null;
    }

    const data = await response.json();
    localStorage.setItem("accessToken", data.accessToken);
    return data.accessToken;
  } catch (err) {
    console.error("❌ 토큰 재발급 중 예외 발생:", err);
    return null;
  }
};
