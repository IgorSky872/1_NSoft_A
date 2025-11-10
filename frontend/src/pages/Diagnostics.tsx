import React, { useState } from 'react';
import { Card, Button, Progress, Alert, List, Tag, Spin, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useWorkflow } from '../context/WorkflowContext';
import api from '../services/api';

const Diagnostics: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { selectedDevice, unlockStep } = useWorkflow();

  const runDiagnostics = async () => {
    setRunning(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 300);

    try {
      await api.post('/diagnostics', { device_id: selectedDevice });

      clearInterval(interval);
      setProgress(100);
      unlockStep('compiler');
      message.success('Diagnostics completed successfully!');
    } catch (err) {
      message.error('Diagnostics failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <h1>Diagnostics: {selectedDevice}</h1>
      <Card>
        <Spin spinning={running}>
          <Button
            onClick={runDiagnostics}
            loading={running}
            type="primary"
            icon={<CheckCircleOutlined />}
          >
            Run Full Diagnostics
          </Button>
          {running && <Progress percent={progress} status="active" style={{ marginTop: 16 }} />}
        </Spin>
      </Card>

      {!running && progress === 100 && (
        <Card title="Results" style={{ marginTop: 24 }}>
          <Alert
            message="Diagnostics passed"
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
          <p style={{ marginTop: 16 }}>Device {selectedDevice} is healthy and ready for compilation.</p>
        </Card>
      )}
    </div>
  );
};

export default Diagnostics;