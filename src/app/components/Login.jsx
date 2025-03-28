import React from 'react';

const Login = () => {
  const handleLogin = () => {
    window.location.href = '/auth/start'; // backend route that redirects to NetSuite
  };

  return (
    <div className="login-page">
      <h1>Welcome</h1>
      <p>Please login to NetSuite to continue</p>
      <button onClick={handleLogin}>Login with NetSuite</button>
    </div>
  );
};

export default Login;