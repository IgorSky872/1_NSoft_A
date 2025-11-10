import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkflowProvider } from './context/WorkflowContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Compiler from './pages/Compiler';
import Inference from './pages/Inference';
import Sidebar from './components/Sidebar';
import './App.css';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Sidebar isOpen={true} />
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/compiler" element={<PrivateRoute><Compiler /></PrivateRoute>} />
            <Route path="/inference" element={<PrivateRoute><Inference /></PrivateRoute>} />
            <Route path="/diagnostics" element={<PrivateRoute><Diagnostics /></PrivateRoute>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <WorkflowProvider>
        <AppContent />
      </WorkflowProvider>
    </AuthProvider>
  );
}

export default App;