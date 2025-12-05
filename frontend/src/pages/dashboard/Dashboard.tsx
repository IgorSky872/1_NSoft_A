import React, { useEffect, useState } from 'react';
import { Card, List, Button, Tag, Spin, Space, message, Row, Col, Divider, Descriptions, Badge, Modal } from 'antd';
import { useWorkflow } from '../../context/WorkflowContext';
import api from '../../services/api';
import type { Device } from '../../types';
import { DeleteOutlined, InfoCircleOutlined, CloseOutlined } from '@ant-design/icons';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeviceInfo, setSelectedDeviceInfo] = useState<Device | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const { selectDevice, loading: workflowLoading } = useWorkflow();

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

  const createMockDevice = async () => {
    try {
      await api.post('/devices/mock');
      message.success('Mock device created successfully');
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

  const showDeviceProperties = (device: Device) => {
    setSelectedDeviceInfo(device);
    setShowPropertiesPanel(true);
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
    <div className="dashboard-wrapper">
      {/* Основная область устройств */}
      <div className={`devices-main-area ${showPropertiesPanel ? 'compact' : ''}`}>
        <div className="dashboard-header">
          <h1 className="dashboard-title">Device Selection</h1>
          <Button
            onClick={createMockDevice}
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
            <Button type="primary" onClick={createMockDevice}>
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
                  <Descriptions.Item label="Memristors">
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

            {selectedDeviceInfo.memristors && (
              <Card title="Memristor Details" className="property-card">
                <List
                  size="small"
                  dataSource={selectedDeviceInfo.memristors}
                  renderItem={(mem: any) => (
                    <List.Item>
                      <div className="memristor-item">
                        <span>Memristor {mem.id}</span>
                        <Tag color={mem.status === 'active' ? 'success' : 'error'}>
                          {mem.status}
                        </Tag>
                      </div>
                    </List.Item>
                  )}
                  className="memristors-list"
                />
              </Card>
            )}

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
    </div>
  );
};

export default Dashboard;