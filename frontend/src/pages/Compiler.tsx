import React, { useState } from 'react';
import { Card, Upload, Button, Select, Space, Tabs, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useWorkflow } from '../context/WorkflowContext';
import api from '../services/api';
import OnnxGraph from '../components/OnnxGraph';
import type { OnnxData } from '../types';  // ← Импорт правильного типа

const { Dragger } = Upload;
const { Option } = Select;

const Compiler: React.FC = () => {
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [graphPath, setGraphPath] = useState<string | null>(null);
  const [onnxData, setOnnxData] = useState<OnnxData | null>(null);  // ← ТИПИЗИРОВАННЫЙ STATE
  const [quantType, setQuantType] = useState('int8');
  const [quantizing, setQuantizing] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [quantizedPath, setQuantizedPath] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);  // ← НОВЫЙ STATE для индикатора
  const { selectedDevice, unlockStep } = useWorkflow();

  // ✅ УЛУЧШЕННАЯ ФУНКЦИЯ С ВАЛИДАЦИЕЙ и ДЕТАЛЬНОЙ ОБРАБОТКОЙ ОШИБОК
  const parseOnnxModel = async (file: File) => {
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/parse-onnx', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // === ВАЛИДАЦИЯ ОТВЕТА ===
      if (!response.data) {
        throw new Error('Empty response from server');
      }

      if (!Array.isArray(response.data.nodes)) {
        throw new Error('Invalid ONNX data structure: missing nodes array');
      }

      if (response.data.nodes.length === 0) {
        message.warning('No graph nodes found in this ONNX model');
      }

      setOnnxData(response.data);
      message.success(`Model parsed successfully: ${response.data.nodes.length} nodes`);

    } catch (error: any) {
      console.error('Error parsing ONNX:', error);

      // === ДЕТАЛЬНАЯ ОБРАБОТКА ОШИБОК ===
      let errorMessage = 'Failed to parse ONNX model';

      if (error.response?.status === 400) {
        errorMessage = `Invalid model format: ${error.response.data?.detail || 'Unknown error'}`;
      } else if (error.response?.status === 413) {
        errorMessage = 'Model file too large (>10MB)';
      } else if (error.message?.includes('nodes')) {
        errorMessage = error.message; // Наша кастомная ошибка валидации
      } else if (!error.response) {
        errorMessage = 'Network error: Cannot connect to server';
      }

      message.error(errorMessage);

      // === ОЧИСТКА СОСТОЯНИЯ ПРИ ОШИБКЕ ===
      setOnnxData(null);
      setGraphPath(null);

    } finally {
      setParsing(false);
    }
  };

  const handleUpload = async (file: File) => {
    setModelFile(file);
    const url = URL.createObjectURL(file);
    setGraphPath(url);
    await parseOnnxModel(file); // Парсим немедленно после загрузки
  };

  const handleQuantize = async () => {
    if (!modelFile) {
      message.error('Please upload a model first');
      return;
    }

    setQuantizing(true);
    const formData = new FormData();
    formData.append('file', modelFile);
    formData.append('quant_type', quantType);

    try {
      const res = await api.post('/compiler/quantize', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setQuantizedPath(res.data.quantized_path);
      message.success(`Quantization complete! Size reduction: ${res.data.size_reduction}`);
    } catch (error: any) {
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
          {parsing && <div style={{ marginTop: 16 }}>Parsing model...</div>}
        </Card>
      ),
    },
    {
      key: 'graph',
      label: 'Graph View',
      disabled: !graphPath || parsing,
      children: graphPath && (
        <Card title="Model Visualization">
          <OnnxGraph modelPath={graphPath} onnxData={onnxData} />
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