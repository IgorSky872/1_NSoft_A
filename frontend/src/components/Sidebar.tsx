// frontend/src/components/Sidebar.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: 'Home' },
    { path: '/diagnostics', label: 'Diagnostics', icon: 'Tools' },
    { path: '/inference', label: 'Inference', icon: 'Brain' },
    { path: '/compiler', label: 'Compiler', icon: 'Gear' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        left: isOpen ? 0 : -250,
        top: 0,
        width: 250,
        minWidth: 200,
        height: '100vh',
        background: '#2c3e50',
        color: 'white',
        padding: '20px 0',
        overflowY: 'auto',
        zIndex: 1000,
        transition: 'left 0.3s ease',
        boxShadow: isOpen ? '2px 0 10px rgba(0,0,0,0.1)' : 'none',
        paddingBottom: '120px', // КЛЮЧЕВОЙ ФИКС: отступ снизу
        boxSizing: 'border-box', // чтобы padding не ломал высоту
      }}
    >
      <h2 style={{ textAlign: 'center', margin: '0 0 40px 0', fontSize: 22 }}>Neuro App</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {menuItems.map(item => (
          <li key={item.path}>
            <Link
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 20px',
                color: location.pathname === item.path ? '#ecf0f1' : '#bdc3c7',
                background: location.pathname === item.path ? '#34495e' : 'transparent',
                textDecoration: 'none',
                transition: '0.3s',
                fontSize: 15,
              }}
            >
              <span style={{ fontSize: 24, marginRight: 12 }}>{item.icon}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div style={{ padding: '0 20px', marginTop: 'auto' }}>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            window.location.reload();
          }}
          style={{
            width: '100%',
            padding: '12px',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 15,
            marginBottom: 20,
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;