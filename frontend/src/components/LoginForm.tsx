import React, { useState } from 'react';
import api from '../services/api';
import axios from 'axios';

const LoginForm: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/login', new URLSearchParams({ username, password }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      localStorage.setItem('token', res.data.access_token);
      onLogin();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        width: '400px', textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '20px', color: '#333' }}>Neuro App Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc' }}
            required
          />
          <button type="submit" style={{
            width: '100%', padding: '12px', background: '#667eea', color: 'white',
            border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px'
          }}>
            Login
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        <p style={{ marginTop: '20px', color: '#666' }}>Demo: test / test</p>
      </div>
    </div>
  );
};

export default LoginForm;