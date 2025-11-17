// frontend/src/pages/Login.tsx
import React, { useState } from 'react';
import { Card, Form, Input, Button, Alert, Spin, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      await login(values.username, values.password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ УБРАЛИ ВНЕШНИЙ DIV С ГРАДИЕНТОМ - он теперь только в PublicLayout
  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        borderRadius: 12,
        backgroundColor: 'white', // Явно белый фон карточки
      }}
      headStyle={{
        textAlign: 'center',
        borderBottom: 'none',
        paddingTop: 32,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          NSoft AI Compiler
        </Title>
        <p style={{ color: '#666', marginTop: 8 }}>Sign in to continue</p>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      <Spin spinning={loading}>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          initialValues={{ username: 'admin' }}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#ccc' }} />}
              placeholder="Username"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 5, message: 'Password must be at least 5 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#ccc' }} />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button type="primary" htmlType="submit" block>
              Log In
            </Button>
          </Form.Item>
        </Form>
      </Spin>

      <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
        <small style={{ color: '#999' }}>
          Default: <strong>admin</strong> / <strong>secret</strong>
        </small>
      </div>
    </Card>
  );
};

export default Login;