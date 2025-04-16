import React from 'react';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
    const navigate = useNavigate();

    return (
        <body
            style={{
                backgroundImage: `url('/sign-bg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat:'no-repeat',
                width: "100vw",
                height: "100vh",
                margin: 0,
                padding: 0,
                overflow: "hidden"
            }}
        >
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-semibold mb-4">회원가입</h1>
                <p onClick={() => navigate('/login')}> 로그인 </p>
            </div>
        </body>

    );

};

export default SignupPage;