import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();

    return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold mb-4">로그인</h1>
      <p onClick={() => navigate('/signup')}> 회원가입 </p>
    </div>

    );

};

export default LoginPage;