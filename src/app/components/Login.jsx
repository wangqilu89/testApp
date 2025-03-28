import React from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate(); // ✅ hook must be inside the component

  const handleLogin = () => {
    navigate('/authenticate');
  };

  return (
    <div>
      <h1>Welcome</h1>
      <p>Please login to NetSuite to continue</p>
      <button onClick={handleLogin}>Login with NetSuite</button>
    </div>
  );
};

export default Login;