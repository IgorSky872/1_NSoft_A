import React, { useState } from 'react';
import { Card, Button, Progress, Alert, List, Tag, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useWorkflow } from '../context/WorkflowContext';
import api from '../services/api';

const Diagnostics: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const { selectedDevice, unlockStep } = useWorkflow();

  const runDiagnostics = async () => {
    setRunning(true);
    setProgress(0);

    // Симуляция прогресса
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 300);

    try {
      await api.post('/diagnostics', { device_id: selectedDevice });
      clearInterval(interval);
      setProgress(100);

      // Получить результаты
      const deviceRes = await api.get(`/devices/${selectedDevice}`);
      setResults(deviceRes.data.diagnostics);
      unlockStep('compiler');
    } catch (err) {
      Alert.error('Diagnostics failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <h1>Diagnostics: {selectedDevice}</h1>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            onClick={runDiagnostics}
            loading={running}
            type="primary"
            icon={<CheckCircleOutlined />}
          >
            Run Full Diagnostics
          </Button>
          {running && <Progress percent={progress} status="active" />}
        </Space>
      </Card>

      {results && (
        <>
          <Card title="Results" style={{ marginTop: 24 }}>
            <Alert
              message={`Diagnostics ${results.overall_status}`}
              type={results.overall_status === 'passed' ? 'success' : 'error'}
              showIcon
              icon={results.overall_status === 'passed' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            />
          </Card>

          <Card title="Core Status" style={{ marginTop: 16 }}>
            <List
              dataSource={results.cores}
              renderItem={core => (
                <List.Item>
                  <Tag color={core.status === 'healthy' ? 'green' : 'red'}>
                    Core {core.id}: {core.status}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>

          <Card title="Available Resources" style={{ marginTop: 16 }}>
            <p>Memristors: {results.memristors.available}/{results.memristors.total} available</p>
          </Card>
        </>
      )}
    </div>
  );
};

export default Diagnostics;