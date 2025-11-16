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
        <Outlet /> {/* Здесь рендерятся вложенные маршруты */}
      </div>
    </div>
  );
};

// Компонент для публичных страниц (Login без Sidebar)
const PublicLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Если уже авторизован, перенаправляем на дашборд
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// Конфигурация маршрутов с future flags
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