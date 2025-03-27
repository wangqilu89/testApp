import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

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