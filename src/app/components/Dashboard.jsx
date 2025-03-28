import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // Call your backend to check session
    fetch('https://testapp-capl.onrender.com/auth/status', {
      credentials: 'include', // 🔥 include cookies for session check
    })
    .then((res) => res.json())
    .then((data) => {
        if (!data.loggedIn) {
          navigate('/'); // redirect to login if not authenticated
        }
      })
      .catch(() => {
        navigate('/'); // fallback in case of error
      });
  }, []);
  return (
    <div>
      <h1>Welcome to NetSuite Dashboard</h1>

      <div>
        <button onClick={() => navigate('/apply-leave')}>📝 Apply Leave</button>
        <button onClick={() => navigate('/approve')}>✅ Approve Transactions</button>
        <button onClick={() => navigate('/submit')}>📦 Submit Transactions</button>
      </div>
    </div>
  );
};

export default Dashboard;