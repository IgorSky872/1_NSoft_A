// frontend/src/components/main_sidebar/Sidebar.tsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkflow } from '../../context/WorkflowContext';
import { Button, Modal, message, Spin } from 'antd';
import { LogoutOutlined, ClockCircleOutlined } from '@ant-design/icons';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { selectedDevice, currentStep } = useWorkflow();
  const { logout, user } = useAuth();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [sessionTime, setSessionTime] = useState('');

  // Обновляем время сессии каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      if (user?.loginTime) {
        const elapsed = Math.floor((Date.now() - user.loginTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        setSessionTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user]);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '🏠', step: 'dashboard' },
    { path: '/diagnostics', label: 'Diagnostics', icon: '🔧', step: 'diagnostics' },
    { path: '/compiler', label: 'Compiler', icon: '⚙️', step: 'compiler' },
    { path: '/inference', label: 'Inference', icon: '🧠', step: 'inference' },
  ];

  const isStepEnabled = (step: string) => {
    const steps = ['dashboard', 'diagnostics', 'compiler', 'inference'];
    return steps.indexOf(step) <= steps.indexOf(currentStep);
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm logout',
      content: 'Are you sure you want to log out? All unsaved progress will be lost.',
      okText: 'Logout',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk: async () => {
        setLoggingOut(true);
        // Имитация корректного завершения сессии
        await new Promise(resolve => setTimeout(resolve, 500));
        logout();
        message.success('You have been logged out successfully');
        setLoggingOut(false);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="sidebar">
      {/* Верхняя часть с меню - без Spin */}
      <div className="sidebar-menu">
        <ul>
          {menuItems.map(item => {
            const enabled = isStepEnabled(item.step);
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={enabled ? item.path : '#'}
                  className={`${isActive ? 'active' : ''} ${!enabled ? 'disabled' : ''}`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Нижняя часть с пользователем - Spin только здесь */}
      <div className="sidebar-footer">
        <Spin spinning={loggingOut} tip="Logging out...">
          <div className="user-info">
            <div className="username">{user?.username || 'Guest'}</div>
            <div className="role">{user?.role || 'user'}</div>
          </div>

          {user?.loginTime && (
            <div className="session-info">
              <ClockCircleOutlined />
              <span>Session: {sessionTime}</span>
            </div>
          )}

          <Button
            type="text"
            danger
            onClick={handleLogout}
            block
            className="logout-button"
            icon={<LogoutOutlined />}
            disabled={loggingOut}
          >
            Logout
          </Button>
        </Spin>
      </div>
    </div>
  );
};

export default Sidebar;