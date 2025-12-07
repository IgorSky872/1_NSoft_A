// frontend/src/pages/diagnostics/Diagnostics.tsx
import React, { useState } from 'react';
import { Card, Button, Progress, Alert, Spin, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useWorkflow } from '../../context/WorkflowContext';
import api from '../../services/api';
import './Diagnostics.css';

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
    // ВНЕШНИЙ КОНТЕЙНЕР — КРИТИЧЕСКИЙ ЭЛЕМЕНТ!
    <div style={{ width: '100%', minHeight: '100%' }}>
      <div className="diagnostics-wrapper">
        {/* Основная область */}
        <div className="diagnostics-main-area">
          <div className="diagnostics-header">
            <h1 className="diagnostics-title">Diagnostics: {selectedDevice}</h1>
          </div>

          <Card className="diagnostics-card">
            <Spin spinning={running}>
              <Button
                onClick={runDiagnostics}
                loading={running}
                type="primary"
                icon={<CheckCircleOutlined />}
                className="run-diagnostics-btn"
              >
                Run Full Diagnostics
              </Button>
              {running && <Progress percent={progress} status="active" className="diagnostics-progress" />}
            </Spin>
          </Card>

          {!running && progress === 100 && (
            <Card title="Results" className="results-card">
              <Alert
                message="Diagnostics passed"
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
              />
              <p className="results-text">Device {selectedDevice} is healthy and ready for compilation.</p>
            </Card>
          )}
        </div>

        {/* Боковая панель - ВИДНА ПОСТОЯННО */}
        <div className="diagnostics-panel-fix">
          <div className="diagnostics-panel-content">
            <div className="panel-header">
              <h2 className="panel-title">Diagnostics Details</h2>
            </div>

            <Card className="panel-card">
              <p>Results and device information will be displayed here...</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;