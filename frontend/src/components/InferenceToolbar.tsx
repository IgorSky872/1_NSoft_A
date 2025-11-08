// frontend/src/components/InferenceToolbar.tsx

import React from 'react';

interface ToolbarProps {
  onUpload: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onModelProps: () => void;
  onNodeProps: () => void;
}

const InferenceToolbar: React.FC<ToolbarProps> = ({
  onUpload, onZoomIn, onZoomOut, onModelProps, onNodeProps
}) => {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button onClick={onUpload} style={btnStyle}>Upload Model</button>
      <button onClick={onZoomIn} style={btnStyle}>Zoom In</button>
      <button onClick={onZoomOut} style={btnStyle}>Zoom Out</button>
      <button onClick={onModelProps} style={btnStyle}>Model</button>
      <button onClick={onNodeProps} style={btnStyle}>Node</button>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 14,
  border: '1px solid #ddd',
  background: '#fff',
  borderRadius: 6,
  cursor: 'pointer',
  transition: '0.2s',
};

export default InferenceToolbar;