// frontend/src/pages/Inference.tsx

import React, { useState, useRef } from 'react';
import api from '../services/api';
import OnnxGraph from '../components/OnnxGraph';
import InferenceToolbar from '../components/InferenceToolbar';
import SidebarContent from '../components/SidebarContent';

interface ParsedData {
  nodes: any[];
  edges: any[];
  weights: any;
  model_metadata: any;
}

const Inference: React.FC = () => {
  const [data, setData] = useState<ParsedData | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [sidebarType, setSidebarType] = useState<'metadata' | 'node' | 'weights'>('metadata');
  const [showSidebar, setShowSidebar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cyRef = useRef<any>(null);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/parse-onnx', formData);
      setData(res.data);
      setSidebarType('metadata');
      setShowSidebar(true);
    } catch (err) {
      alert('Failed to parse ONNX model');
    }
  };

  const zoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const zoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() / 1.2);

  const handleNodeSelect = (node: any) => {
    setSelectedNode(node);
    setSidebarType(node ? 'node' : 'metadata');
    setShowSidebar(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Граф */}
      <div style={{ flex: 1, position: 'relative', background: '#f9f9f9' }}>
        <OnnxGraph
          data={data}
          onNodeSelect={handleNodeSelect}
          cyRef={cyRef}
        />

        {!data && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: '#888',
            }}
          >
            <h2>Upload ONNX Model</h2>
            <p>Click "Upload Model" below to begin.</p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div style={{ padding: '12px 20px', background: '#fff', borderTop: '1px solid #eee' }}>
        <InferenceToolbar
          onUpload={() => fileInputRef.current?.click()}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onModelProps={() => {
            setSidebarType('metadata');
            setShowSidebar(true);
          }}
          onNodeProps={() => {
            setSidebarType('node');
            setShowSidebar(true);
          }}
        />
      </div>

      <input
        type="file"
        accept=".onnx"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />

      {/* Sidebar справа */}
      {showSidebar && data && (
        <div
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            width: 'min(380px, 90vw)',
            height: '100%',
            background: 'white',
            borderLeft: '1px solid #ddd',
            padding: '20px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
            paddingBottom: '0px',     // ФИКС: отступ снизу
            boxSizing: 'border-box',    // padding не ломает высоту
          }}
        >
          <button
            onClick={() => setShowSidebar(false)}
            style={{
              position: 'absolute',
              top: 15,
              right: 15,
              background: 'none',
              border: 'none',
              fontSize: 28,
              cursor: 'pointer',
              color: '#aaa',
            }}
          >
            Close
          </button>

          <SidebarContent
            type={sidebarType}
            data={data}
            selectedNode={selectedNode}
          />
        </div>
      )}
    </div>
  );
};

export default Inference;