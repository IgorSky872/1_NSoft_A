import React, { useEffect, useState } from 'react';
import { Card, List, Button, Tag, Spin, Alert, Space } from 'antd';
import { useWorkflow } from '../context/WorkflowContext';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectDevice, loading: workflowLoading } = useWorkflow();

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/devices');
      setDevices(res.data.devices);
    } catch (err) {
      Alert.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const createMockDevice = async () => {
    try {
      await api.post('/devices/mock');
      loadDevices();
    } catch (err) {
      Alert.error('Failed to create mock device');
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
            renderItem={dev => (
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