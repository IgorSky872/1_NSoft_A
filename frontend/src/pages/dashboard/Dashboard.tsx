// frontend/src/pages/dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Card, List, Button, Tag, Spin, Space, message, Descriptions, Badge, Modal } from 'antd';
import { useWorkflow } from '../../context/WorkflowContext';
import api from '../../services/api';
import type { Device, MockDeviceConfig } from '../../types';
import { DeleteOutlined, InfoCircleOutlined, CloseOutlined } from '@ant-design/icons';
import CreateMockDeviceModal from '../../components/create_mock_device_modal/CreateMockDeviceModal';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeviceInfo, setSelectedDeviceInfo] = useState<Device | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const { selectDevice, loading: workflowLoading } = useWorkflow();
  const [showConfigModal, setShowConfigPanel] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ devices: Device[] }>('/devices');
      setDevices(res.data.devices);
    } catch (err) {
      message.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const createMockDevice = async (config?: MockDeviceConfig) => {
    try {
      const res = await api.post('/devices/mock', config || {});
      message.success(`Mock device created: ${res.data.device.id}`);
      loadDevices();
    } catch (err) {
      message.error('Failed to create mock device');
    }
  };

  const deleteDevice = async (deviceId: string) => {
    Modal.confirm({
      title: 'Delete Device',
      content: `Are you sure you want to delete device ${deviceId}?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await api.delete(`/devices/${deviceId}`);
          message.success('Device deleted successfully');
          loadDevices();
          if (selectedDeviceInfo?.id === deviceId) {
            setShowPropertiesPanel(false);
            setSelectedDeviceInfo(null);
          }
        } catch (err) {
          message.error('Failed to delete device');
        }
      }
    });
  };

  const showDeviceProperties = async (device: Device) => {
    try {
      // Загружаем полные детали устройства
      const response = await api.get<Device>(`/devices/${device.id}/details`);
      setSelectedDeviceInfo(response.data);
      setShowPropertiesPanel(true);
    } catch (error) {
      message.error('Failed to load device details');
    }
  };

  const closePropertiesPanel = () => {
    setShowPropertiesPanel(false);
    setSelectedDeviceInfo(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'success';
      case 'active': return 'processing';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle': return 'Idle';
      case 'active': return 'Active';
      case 'error': return 'Error';
      default: return status;
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100%' }}>
      <div className="dashboard-wrapper">
        {/* Основная область устройств */}
        <div className={`devices-main-area ${showPropertiesPanel ? 'compact' : ''}`}>
          <div className="dashboard-header">
            <h1 className="dashboard-title">Device Selection</h1>
            <Button
              onClick={() => setShowConfigPanel(true)}
              type="dashed"
              icon={<InfoCircleOutlined />}
              className="create-device-btn"
            >
              Create Mock Device
            </Button>
          </div>

          <Spin spinning={loading || workflowLoading} className="devices-loader">
            <List
              grid={{
                gutter: 16,
                column: showPropertiesPanel ? 2 : 3,
                xs: 1,
                sm: 1,
                md: 2,
                lg: showPropertiesPanel ? 2 : 3,
                xl: showPropertiesPanel ? 2 : 3,
                xxl: showPropertiesPanel ? 2 : 4
              }}
              dataSource={devices}
              className="devices-grid-fix"
              renderItem={(dev: Device) => (
                <List.Item>
                  <Card
                    title={
                      <div className="device-card-header">
                        <span className="device-id" title={dev.id}>
                          {dev.id}
                        </span>
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDevice(dev.id);
                          }}
                          className="delete-device-btn"
                          danger
                        />
                      </div>
                    }
                    extra={
                      <Badge
                        status={getStatusColor(dev.status) as any}
                        text={getStatusText(dev.status)}
                      />
                    }
                    actions={[
                      <Button
                        onClick={() => selectDevice(dev.id)}
                        type="primary"
                        disabled={dev.status !== 'idle'}
                        className="select-device-btn"
                      >
                        Select Device
                      </Button>,
                      <Button
                        onClick={() => showDeviceProperties(dev)}
                        type="default"
                        icon={<InfoCircleOutlined />}
                        className="properties-btn"
                      >
                        Properties
                      </Button>
                    ]}
                    hoverable
                    className={`device-card ${selectedDeviceInfo?.id === dev.id ? 'selected' : ''}`}
                  >
                    <div className="device-card-body">
                      <Descriptions column={1} size="small" className="device-info">
                        <Descriptions.Item label="Version">
                          <Tag color="blue">{dev.version}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Type">
                          <Tag color={dev.is_mock ? 'orange' : 'green'}>
                            {dev.is_mock ? 'Mock Device' : 'Physical Device'}
                          </Tag>
                        </Descriptions.Item>
                        {dev.diagnostics && (
                          <Descriptions.Item label="Health">
                            <Tag color={dev.diagnostics.overall_status === 'passed' ? 'success' : 'error'}>
                              {dev.diagnostics.overall_status}
                            </Tag>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </Spin>

          {devices.length === 0 && !loading && (
            <div className="empty-state-fix">
              <div className="empty-devices-icon">📱</div>
              <h3>No devices found</h3>
              <p>Create a mock device to get started</p>
              <Button type="primary" onClick={() => setShowConfigPanel(true)}>
                Create First Device
              </Button>
            </div>
          )}
        </div>

        {/* Правая панель свойств */}
        {showPropertiesPanel && selectedDeviceInfo && (
          <div className="properties-panel-fix">
            <div className="properties-content-fix">
              <div className="properties-header">
                <h2 className="properties-title">Device Properties</h2>
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={closePropertiesPanel}
                  className="close-panel-btn"
                />
              </div>

              <Card className="property-card">
                <Descriptions column={1} className="property-descriptions">
                  <Descriptions.Item label="Device ID">
                    <strong>{selectedDeviceInfo.id}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Badge
                      status={getStatusColor(selectedDeviceInfo.status) as any}
                      text={getStatusText(selectedDeviceInfo.status)}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Version">
                    {selectedDeviceInfo.version}
                  </Descriptions.Item>
                  <Descriptions.Item label="Type">
                    <Tag color={selectedDeviceInfo.is_mock ? 'orange' : 'green'}>
                      {selectedDeviceInfo.is_mock ? 'Mock Device' : 'Physical Device'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Hardware Configuration (только ключевые параметры) */}
              {(selectedDeviceInfo.cores || selectedDeviceInfo.memristors) && (
                <Card title="Hardware Configuration" className="property-card">
                  <Descriptions column={1} className="property-descriptions">
                    <Descriptions.Item label="Cores">
                      <Tag color="blue">
                        {selectedDeviceInfo.cores?.length || 0}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Memristors per Core">
                      <Tag color="purple">
                        {selectedDeviceInfo.memristors && selectedDeviceInfo.cores
                          ? Math.floor(selectedDeviceInfo.memristors.length / selectedDeviceInfo.cores.length)
                          : 'N/A'}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              {/* Neural Network Capabilities (только ключевые параметры) */}
              {(selectedDeviceInfo.supported_layers || selectedDeviceInfo.supported_activations) && (
                <Card title="Neural Network Support" className="property-card">
                  <Descriptions column={1} className="property-descriptions">
                    {selectedDeviceInfo.supported_layers && (
                      <Descriptions.Item label="Supported Layers">
                        <Space size={[0, 8]} wrap>
                          {selectedDeviceInfo.supported_layers.map(layer => (
                            <Tag key={layer} color="purple" style={{ marginBottom: '4px' }}>
                              {layer}
                            </Tag>
                          ))}
                        </Space>
                      </Descriptions.Item>
                    )}
                    {selectedDeviceInfo.supported_activations && (
                      <Descriptions.Item label="Activations">
                        <Space size={[0, 8]} wrap>
                          {selectedDeviceInfo.supported_activations.map(act => (
                            <Tag key={act} color="cyan" style={{ marginBottom: '4px' }}>
                              {act}
                            </Tag>
                          ))}
                        </Space>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              )}

              {selectedDeviceInfo.diagnostics && (
                <Card title="Diagnostics" className="property-card">
                  <Descriptions column={1} className="property-descriptions">
                    <Descriptions.Item label="Overall Status">
                      <Tag color={selectedDeviceInfo.diagnostics.overall_status === 'passed' ? 'success' : 'error'}>
                        {selectedDeviceInfo.diagnostics.overall_status}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Available Cores">
                      {selectedDeviceInfo.diagnostics.cores?.length || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Memristors available / total">
                      {selectedDeviceInfo.diagnostics.memristors?.available || 0} /
                       {selectedDeviceInfo.diagnostics.memristors?.total || 0}
                    </Descriptions.Item>
                  </Descriptions>

                  {selectedDeviceInfo.diagnostics.cores && (
                    <div className="cores-list">
                      <h4>Cores Status</h4>
                      <div className="cores-grid">
                        {selectedDeviceInfo.diagnostics.cores.map((core: any) => (
                          <Tag key={core.id} color={core.status === 'healthy' ? 'success' : 'error'} className="core-tag">
                            Core {core.id}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Memristor Details убран - будет добавлен позже */}

              <div className="panel-actions">
                <Button
                  onClick={() => selectDevice(selectedDeviceInfo.id)}
                  type="primary"
                  disabled={selectedDeviceInfo.status !== 'idle'}
                  className="select-device-panel-btn"
                >
                  Select This Device
                </Button>
                <Button
                  onClick={() => deleteDevice(selectedDeviceInfo.id)}
                  type="default"
                  danger
                  className="delete-device-panel-btn"
                >
                  Delete Device
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно создания устройства */}
        <CreateMockDeviceModal
          visible={showConfigModal}
          onCancel={() => setShowConfigPanel(false)}
          onCreate={createMockDevice}
        />
      </div>
    </div>
  );
};

export default Dashboard;