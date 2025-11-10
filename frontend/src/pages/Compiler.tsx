import React, { useState } from 'react';
import { Card, Upload, Button, Select, Space, Tabs, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useWorkflow } from '../context/WorkflowContext';
import api from '../services/api';
import OnnxGraph from '../components/OnnxGraph';

const { Dragger } = Upload;
const { Option } = Select;

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
    if (!modelFile) {
      message.error('Please upload a model first');
      return;
    }

    setQuantizing(true);

    const formData = new FormData();
    formData.append('file', modelFile);
    formData.append('quant_type', quantType); // ВАЖНО: правильное имя параметра

    try {
      const res = await api.post('/compiler/quantize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setQuantizedPath(res.data.quantized_path);
      message.success(`Quantization complete! Size reduction: ${res.data.size_reduction}`);
    } catch (error: any) {
      // ВАЖНО: покажет точную ошибку в консоли
      console.error('Quantize error details:', error.response?.data);
      message.error(error.response?.data?.detail || 'Quantization failed');
    } finally {
      setQuantizing(false);
    }
  };

  const handleCompile = async () => {
    if (!modelFile) {
      message.error('Please upload a model first');
      return;
    }

    setCompiling(true);
    try {
      const res = await api.post('/compiler/compile', { device_id: selectedDevice });
      message.success(`Firmware compiled: ${res.data.firmware_path}`);
      unlockStep('inference');
    } catch (err: any) {
      console.error('Compile error:', err);
      message.error('Compilation failed');
    } finally {
      setCompiling(false);
    }
  };

  const items = [
    {
      key: 'upload',
      label: 'Upload Model',
      children: (
        <Card title="Upload ONNX Model">
          <Dragger
            beforeUpload={file => { handleUpload(file); return false; }}
            accept=".onnx"
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48 }} />
            </p>
            <p>Click or drag ONNX file to this area</p>
          </Dragger>
        </Card>
      ),
    },
    {
      key: 'graph',
      label: 'Graph View',
      disabled: !graphPath,
      children: graphPath && (
        <Card title="Model Visualization">
          <OnnxGraph modelPath={graphPath} />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <h1>Neural Network Compiler: {selectedDevice}</h1>
      <Tabs defaultActiveKey="upload" items={items} />

      <Card title="Quantization" style={{ marginTop: 24 }}>
        <Space>
          <Select value={quantType} onChange={setQuantType} style={{ width: 120 }}>
            <Option value="int8">INT8</Option>
            <Option value="uint8">UInt8</Option>
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

      <Card title="Compile Firmware" style={{ marginTop: 24 }}>
        <Button
          onClick={handleCompile}
          loading={compiling}
          type="primary"
          block
          disabled={!modelFile}
        >
          Compile for {selectedDevice}
        </Button>
      </Card>
    </div>
  );
};

export default Compiler;