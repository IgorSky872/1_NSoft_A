// frontend/src/components/CreateMockDeviceModal.tsx
import React from 'react';
import { Modal, Form, InputNumber, Select, Switch, Input, Divider, Space, Tag } from 'antd';
import type { MockDeviceConfig } from '../../types';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onCreate: (config: MockDeviceConfig) => void;
}

const CreateMockDeviceModal: React.FC<Props> = ({ visible, onCancel, onCreate }) => {
  const [form] = Form.useForm();

  const defaultConfig: MockDeviceConfig = {
    core_count: 8,
    memristors_per_core: 32,
    clock_frequency: 1000,
    memory_bandwidth: 128,
    supported_dtypes: ["int8", "float16"],
    architecture_type: "simd",
    sparsity_support: true,
    crossbar_topology: "full_mesh",
    firmware_version: "1.0.0",
    // Neural network defaults
    supported_activations: ["relu", "relu6", "leaky_relu", "tanh", "sigmoid"],
    supported_layers: ["conv2d", "maxpool", "avgpool", "fc", "batchnorm"],
    leakage_types: ["stuck_at_0", "stuck_at_1", "random_flip"]
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onCreate(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="Configure Mock Device"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
      okText="Create"
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={defaultConfig}
      >
        <Divider orientation="left">Hardware Configuration</Divider>

        <Form.Item label="Cores" name="core_count" rules={[{ required: true }]}>
          <InputNumber min={1} max={128} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Memristors per Core" name="memristors_per_core" rules={[{ required: true }]}>
          <InputNumber min={8} max={256} step={8} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Clock Frequency (MHz)" name="clock_frequency" rules={[{ required: true }]}>
          <InputNumber min={100} max={5000} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Memory Bandwidth (GB/s)" name="memory_bandwidth" rules={[{ required: true }]}>
          <InputNumber min={16} max={1024} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Supported Data Types" name="supported_dtypes" rules={[{ required: true }]}>
          <Select mode="tags" tokenSeparators={[',']}>
            <Select.Option value="int8">int8</Select.Option>
            <Select.Option value="int16">int16</Select.Option>
            <Select.Option value="float16">float16</Select.Option>
            <Select.Option value="float32">float32</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Architecture Type" name="architecture_type" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="simd">SIMD</Select.Option>
            <Select.Option value="mimd">MIMD</Select.Option>
            <Select.Option value="dataflow">Dataflow</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Sparsity Support" name="sparsity_support" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item label="Crossbar Topology" name="crossbar_topology" rules={[{ required: true }]}>
          <Select>
            <Select.Option value="full_mesh">Full Mesh</Select.Option>
            <Select.Option value="systolic">Systolic Array</Select.Option>
            <Select.Option value="hierarchical">Hierarchical</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Firmware Version" name="firmware_version" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Divider orientation="left">Neural Network Support</Divider>

        <Form.Item
          label="Supported Activations"
          name="supported_activations"
          rules={[{ required: true, message: 'Select at least one activation' }]}
        >
          <Select mode="multiple" placeholder="Select activation functions">
            <Select.Option value="relu">ReLU</Select.Option>
            <Select.Option value="relu6">ReLU6</Select.Option>
            <Select.Option value="leaky_relu">Leaky ReLU</Select.Option>
            <Select.Option value="tanh">Tanh</Select.Option>
            <Select.Option value="sigmoid">Sigmoid</Select.Option>
            <Select.Option value="softmax">Softmax</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Supported Layers"
          name="supported_layers"
          rules={[{ required: true, message: 'Select at least one layer type' }]}
        >
          <Select mode="multiple" placeholder="Select layer types">
            <Select.Option value="conv2d">Conv2D</Select.Option>
            <Select.Option value="maxpool">MaxPooling</Select.Option>
            <Select.Option value="avgpool">AvgPooling</Select.Option>
            <Select.Option value="fc">Fully Connected</Select.Option>
            <Select.Option value="batchnorm">BatchNorm</Select.Option>
            <Select.Option value="dropout">Dropout</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Leakage Types"
          name="leakage_types"
          rules={[{ required: true, message: 'Select at least one leakage type' }]}
        >
          <Select mode="multiple" placeholder="Select leakage types">
            <Select.Option value="stuck_at_0">Stuck-at-0</Select.Option>
            <Select.Option value="stuck_at_1">Stuck-at-1</Select.Option>
            <Select.Option value="random_flip">Random Flip</Select.Option>
            <Select.Option value="bit_flip">Bit Flip</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateMockDeviceModal;