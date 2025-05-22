// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import MeetingPage from './pages/MeetingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import KakaoRedirectHandler from "./components/KakaoRedirectHandler";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/meeting" element={<MeetingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/kakao-redirect" element={<KakaoRedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
