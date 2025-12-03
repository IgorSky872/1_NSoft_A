// frontend/src/App.tsx
import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkflowProvider } from './context/WorkflowContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Diagnostics from './pages/Diagnostics';
import Compiler from './pages/Compiler';
import Inference from './pages/Inference';
import Sidebar from './components/Sidebar';
import './App.css';

// Компонент Layout для защищенных страниц (с Sidebar)
const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app">
      <Sidebar isOpen={true} />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

// Компонент для публичных страниц (Login без Sidebar)
const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // ✅ ГРАДИЕНТ ТОЛЬКО ЗДЕСЬ, в одном месте
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      //background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', //Hi-Tech
      background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', //Minimalism
      //background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', // Night
      //background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', //Blue
      //background: 'linear-gradient(135deg, #001529 0%, #f0f2f5 50%, #cfdef3 100%)', //My 1
      //background: 'linear-gradient(135deg, #001529 0%, #f0f2f5 100%)', //My 2
      zIndex: 9999,
      margin: 0,
      padding: 0,
    }}>
      <Outlet />
    </div>
  );
};

// Конфигурация маршрутов
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/login", element: <Login /> },
    ],
  },
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/diagnostics", element: <Diagnostics /> },
      { path: "/compiler", element: <Compiler /> },
      { path: "/inference", element: <Inference /> },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
  },
});

function App() {
  return (
    <AuthProvider>
      <WorkflowProvider>
        <RouterProvider router={router} />
      </WorkflowProvider>
    </AuthProvider>
  );
}

export default App;