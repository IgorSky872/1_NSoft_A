// frontend/src/App.tsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginForm from './components/LoginForm';
import Dashboard from './pages/Dashboard';
import Diagnostics from './pages/Diagnostics';
import Inference from './pages/Inference';
import Compiler from './pages/Compiler';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const checkToken = () => {
      if (!localStorage.getItem('token')) setIsAuthenticated(false);
    };
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Кнопка гамбургер — только если Sidebar скрыт */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              position: 'fixed',
              top: 15,
              left: 15,
              zIndex: 1100,
              background: '#2c3e50',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '8px 10px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            Menu
          </button>
        )}

        {/* Контент — с отступом, если Sidebar открыт */}
        <div
          style={{
            flex: 1,
            marginLeft: sidebarOpen ? 250 : 0,
            transition: 'margin-left 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Кнопка "скрыть Sidebar" — внутри контента */}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                position: 'absolute',
                top: 15,
                left: 15,
                zIndex: 1000,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: '6px 10px',
                cursor: 'pointer',
                boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
                fontSize: 14,
              }}
            >
              Hide Menu
            </button>
          )}

          <main style={{ flex: 1, overflow: 'auto', paddingTop: 50 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/diagnostics" element={<Diagnostics />} />
              <Route path="/inference" element={<Inference />} />
              <Route path="/compiler" element={<Compiler />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;