import React from 'react';

const Login = () => {
  const handleLogin = () => {
    window.location.href = '/auth/start'; // backend route that redirects to NetSuite
  };

  return (
    <div className="login-page">
      <h1>Welcome</h1>
      <p>Please login to NetSuite to continue</p>
      <button onClick={handleLogin} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Login with NetSuite</button>
    </div>
  );
};

export default Login;