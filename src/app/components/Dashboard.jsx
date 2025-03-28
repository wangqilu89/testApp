import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const checkLoginStatus = async () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        const res = await fetch('https://testapp-capl.onrender.com/auth/status', {
          credentials: 'include',
        });
        const data = await res.json();
  
        if (data.loggedIn) {
          navigate('/dashboard');
          return;
        }
  
        // Wait a bit before retrying
        await new Promise((res) => setTimeout(res, 500));
      }
  
      // If still not logged in, redirect to login
      navigate('/');
    };
  
    checkLoginStatus();
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