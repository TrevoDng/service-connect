import React, { useState } from 'react';
import './EmailVerification.css';

export const EmailVerification: React.FC = () => {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    console.log('Verifying email with code:', code);
  };

  return (
    <div className="email-verification">
      <h2>Verify Your Email</h2>
      <p>Enter the verification code sent to your email</p>
      <input
        type="text"
        placeholder="Verification Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleSubmit}>Verify</button>
    </div>
  );
};
