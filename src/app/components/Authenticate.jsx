import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Authenticate = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 👇 Open popup window to backend /auth/start
    const authWindow = window.open(
      'https://testapp-capl.onrender.com/auth/start',
      'netsuite-oauth',
      'width=600,height=700'
    );

    // 👇 Listen for message from popup
    const handleMessage = (event) => {
      // Validate origin
      if (event.origin !== 'https://testapp-capl.onrender.com') return;

      if (event.data === 'auth-success') {
        window.removeEventListener('message', handleMessage);
        navigate('/dashboard'); // ✅ go to dashboard
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup listener if component unmounts
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <h1 className="text-2xl font-semibold mb-4">Pending Authentication</h1>
      <p>Please complete the login in the popup window...</p>
    </div>
  );
};

export default Authenticate;