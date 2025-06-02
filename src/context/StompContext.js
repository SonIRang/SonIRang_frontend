import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const StompContext = createContext(null);

export const StompProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const stompClient = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem("userid");
    const accessToken = localStorage.getItem("generalAccessToken");
    if (!userId || !accessToken) return;

    const socketUrl = `http://15.164.249.16:8080/ws-signaling?token=${encodeURIComponent(accessToken)}`;

    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      onConnect: (frame) => {
        console.log("STOMP 연결됨:", frame);
        setConnected(true);
        // 필요시 구독도 여기서 설정 가능
      },
      onStompError: (frame) => {
        console.error("STOMP 에러:", frame.headers["message"]);
      },
      onWebSocketClose: () => {
        setConnected(false);
      },
      onWebSocketError: (evt) => {
        console.error("WebSocket 에러", evt);
      },
    });

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
      setConnected(false);
      stompClient.current = null;
    };
  }, []);

  // value에 stompClient 객체와 연결 상태 둘 다 넣어줌
  return (
    <StompContext.Provider value={{ stompClient: stompClient.current, connected }}>
      {children}
    </StompContext.Provider>
  );
};

// 훅은 이렇게 1개만, Context value에서 필요한 값 꺼내 쓰도록 함
export const useStompClient = () => {
  const context = useContext(StompContext);
  if (!context) {
    throw new Error("useStompClient must be used within a StompProvider");
  }
  return context; // { stompClient, connected }
};
