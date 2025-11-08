import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Device {
  id: string;
  status: string;
  version: string;
}

const Dashboard: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/devices')
      .then(res => {
        setDevices(res.data.devices);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ marginLeft: 250, padding: 20 }}>
      <h1>Welcome to Neuro App!</h1>
      <p>Select a mode from the sidebar.</p>

      <div style={{ marginTop: 30, padding: 20, background: '#f8f9fa', borderRadius: 8 }}>
        <h2>Connected Devices</h2>
        {loading ? <p>Loading...</p> : devices.length > 0 ? (
          <ul>
            {devices.map(dev => (
              <li key={dev.id}>
                <strong>{dev.id}</strong>: {dev.status} (v{dev.version})
              </li>
            ))}
          </ul>
        ) : (
          <p>No devices found (stub mode).</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;