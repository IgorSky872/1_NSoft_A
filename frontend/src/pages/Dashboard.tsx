import React, { useEffect, useState } from 'react';
import { Card, List, Button, Tag, Spin, Space, message } from 'antd';
import { useWorkflow } from '../context/WorkflowContext';
import api from '../services/api';
import type { Device } from '../types';  // ← Импорт типов

const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);  // ← Убрали any
  const [loading, setLoading] = useState(false);
  const { selectDevice, loading: workflowLoading } = useWorkflow();

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ devices: Device[] }>('/devices');  // ← Указали тип
      setDevices(res.data.devices);
    } catch (err) {
      message.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const createMockDevice = async () => {
    try {
      await api.post('/devices/mock');
      loadDevices();
    } catch (err) {
      message.error('Failed to create mock device');
    }
  };

  return (
    <div>
      <h1>Device Selection</h1>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button onClick={createMockDevice} type="dashed">
          + Create Mock Device
        </Button>
        <Spin spinning={loading || workflowLoading}>
          <List
            grid={{ gutter: 16, column: 2 }}
            dataSource={devices}
            renderItem={(dev: Device) => (  // ← Указали тип
              <List.Item>
                <Card
                  title={dev.id}
                  extra={<Tag color={dev.status === 'idle' ? 'green' : 'red'}>{dev.status}</Tag>}
                  actions={[
                    <Button
                      onClick={() => selectDevice(dev.id)}
                      type="primary"
                      disabled={dev.status !== 'idle'}
                    >
                      Select Device
                    </Button>
                  ]}
                >
                  <p><strong>Version:</strong> {dev.version}</p>
                  <p><strong>Type:</strong> {dev.is_mock ? 'Mock Device' : 'Physical Device'}</p>
                </Card>
              </List.Item>
            )}
          />
        </Spin>
      </Space>
    </div>
  );
};

export default Dashboard;