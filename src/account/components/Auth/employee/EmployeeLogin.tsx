import React, { useState, FormEvent } from 'react';
import './EmployeeLogin.css';

export const EmployeeLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Employee login:', { email, password });
  };

  return (
    <div className="employee-login">
      <h2>Employee Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Employee Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login as Employee</button>
      </form>
    </div>
  );
};
