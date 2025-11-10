import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { selectedDevice, currentStep } = useWorkflow();
  const location = useLocation();

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

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
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
  );
};

export default Sidebar;