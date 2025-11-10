import React, { useState } from 'react';
import { Card, Upload, Button, Tabs, Table, Image, Space, Alert } from 'antd';
import { UploadOutlined, PlayCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useWorkflow } from '../context/WorkflowContext';
import api from '../services/api';
import OnnxGraph from '../components/OnnxGraph';

const { TabPane } = Tabs;

const Inference: React.FC = () => {
  const [firmware, setFirmware] = useState<File | null>(null);
  const [dataset, setDataset] = useState<File[]>([]);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { selectedDevice } = useWorkflow();
  const [firmwareFlashed, setFirmwareFlashed] = useState(false);

  const columns = [
    { title: 'Input', dataIndex: 'input', key: 'input' },
    { title: 'Prediction', dataIndex: 'prediction', key: 'prediction' },
    { title: 'Confidence', dataIndex: 'confidence', key: 'confidence', render: (v: number) => `${(v * 100).toFixed(2)}%` },
    { title: 'Latency (ms)', dataIndex: 'latency_ms', key: 'latency_ms' },
  ];

  const flashFirmware = async () => {
    if (!firmware) return;
    const formData = new FormData();
    formData.append('firmware', firmware);
    formData.append('device_id', selectedDevice!);
    try {
      await api.post('/inference/flash', formData);
      setFirmwareFlashed(true);
      Alert.success('Firmware flashed successfully');
    } catch (err) {
      Alert.error('Failed to flash firmware');
    }
  };

  const runInference = async () => {
    setRunning(true);
    const formData = new FormData();
    dataset.forEach(file => formData.append('data', file));
    formData.append('device_id', selectedDevice!);

    try {
      const res = await api.post('/inference/infer', formData);
      setResults(res.data.results);
    } catch (err) {
      Alert.error('Inference failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <h1>Inference on {selectedDevice}</h1>

      <Tabs>
        <TabPane tab="1. Flash Firmware" key="flash">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                beforeUpload={file => { setFirmware(file); return false; }}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>Select Firmware</Button>
              </Upload>
              <Button onClick={flashFirmware} type="primary" disabled={!firmware || firmwareFlashed}>
                Flash Firmware
              </Button>
              {firmwareFlashed && (
                <Alert message="Firmware flashed" type="success" showIcon icon={<CheckCircleOutlined />} />
              )}
            </Space>
          </Card>
        </TabPane>

        <TabPane tab="2. Load Test Data" key="data" disabled={!firmwareFlashed}>
          <Card>
            <Upload.Dragger
              multiple
              beforeUpload={file => { setDataset(prev => [...prev, file]); return false; }}
            >
              <p>Upload test dataset (images, tensors, etc.)</p>
            </Upload.Dragger>
            <p>Loaded: {dataset.length} files</p>
          </Card>
        </TabPane>

        <TabPane tab="3. Run Inference" key="run" disabled={dataset.length === 0}>
          <Button
            onClick={runInference}
            loading={running}
            type="primary"
            icon={<PlayCircleOutlined />}
            size="large"
            block
          >
            Start Inference
          </Button>
        </TabPane>
      </Tabs>

      {results.length > 0 && (
        <Card title="Inference Results" style={{ marginTop: 24 }}>
          <Table dataSource={results} columns={columns} rowKey="input" />
        </Card>
      )}
    </div>
  );
};

export default Inference;