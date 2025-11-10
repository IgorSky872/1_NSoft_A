import React, { useState } from 'react';
import { Card, Upload, Button, Select, Space, Alert, Tabs } from 'antd';
import { UploadOutlined, BarChartOutlined } from '@ant-design/icons';
import { useWorkflow } from '../context/WorkflowContext';
import api from '../services/api';
import OnnxGraph from '../components/OnnxGraph';

const { TabPane } = Tabs;

const Compiler: React.FC = () => {
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [graphPath, setGraphPath] = useState<string | null>(null);
  const [quantType, setQuantType] = useState('int8');
  const [quantizing, setQuantizing] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [quantizedPath, setQuantizedPath] = useState<string | null>(null);
  const { selectedDevice, unlockStep } = useWorkflow();

  const handleUpload = async (file: File) => {
    setModelFile(file);
    const url = URL.createObjectURL(file);
    setGraphPath(url);
  };

  const handleQuantize = async () => {
    if (!modelFile) return;
    setQuantizing(true);

    const formData = new FormData();
    formData.append('file', modelFile);
    formData.append('type', quantType);

    try {
      const res = await api.post('/compiler/quantize', formData);
      setQuantizedPath(res.data.quantized_path);
      Alert.success(`Quantization complete! Size reduction: ${res.data.size_reduction}`);
    } catch (err) {
      Alert.error('Quantization failed');
    } finally {
      setQuantizing(false);
    }
  };

  const handleCompile = async () => {
    setCompiling(true);
    try {
      const res = await api.post('/compiler/compile', { device_id: selectedDevice });
      Alert.success(`Firmware compiled: ${res.data.firmware_path}`);
      unlockStep('inference');
    } catch (err) {
      Alert.error('Compilation failed');
    } finally {
      setCompiling(false);
    }
  };

  return (
    <div>
      <h1>Neural Network Compiler: {selectedDevice}</h1>

      <Card title="1. Upload ONNX Model">
        <Upload.Dragger
          beforeUpload={file => { handleUpload(file); return false; }}
          accept=".onnx"
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48 }} />
          </p>
          <p>Click or drag ONNX file to this area</p>
        </Upload.Dragger>
      </Card>

      {graphPath && (
        <Card title="2. Model Visualization" style={{ marginTop: 24 }}>
          <Tabs>
            <TabPane tab="Original Graph" key="original">
              <OnnxGraph modelPath={graphPath} />
            </TabPane>
            {quantizedPath && (
              <TabPane tab="Quantized Graph" key="quantized">
                <OnnxGraph modelPath={quantizedPath} />
              </TabPane>
            )}
          </Tabs>
        </Card>
      )}

      <Card title="3. Quantization" style={{ marginTop: 24 }}>
        <Space>
          <Select value={quantType} onChange={setQuantType} style={{ width: 120 }}>
            <Select.Option value="int8">INT8</Select.Option>
            <Select.Option value="uint8">UINT8</Select.Option>
          </Select>
          <Button
            onClick={handleQuantize}
            loading={quantizing}
            type="primary"
            disabled={!modelFile}
          >
            Quantize
          </Button>
        </Space>
      </Card>

      <Card title="4. Compile Firmware" style={{ marginTop: 24 }}>
        <Button
          onClick={handleCompile}
          loading={compiling}
          type="primary"
          block
          disabled={!quantizedPath}
        >
          Compile for {selectedDevice}
        </Button>
      </Card>
    </div>
  );
};

export default Compiler;