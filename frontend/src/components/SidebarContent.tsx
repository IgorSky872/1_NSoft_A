// frontend/src/components/SidebarContent.tsx

import React, { useState, useEffect } from 'react';

interface WeightItem {
  name: string;
  shape: number[];
  dtype: string;
  values: number[];
}

interface SidebarContentProps {
  type: 'metadata' | 'node' | 'weights';
  data: any;
  selectedNode: any;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ type, data, selectedNode }) => {
  const [channelIndex, setChannelIndex] = useState(0);

  useEffect(() => {
    setChannelIndex(0);
  }, [selectedNode?.name]);

  if (!data) return <p>Upload an ONNX model to view details.</p>;

  if (type === 'metadata') {
    return (
      <div>
        <h3>Model Metadata</h3>
        <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
          {JSON.stringify(data.model_metadata || {}, null, 2)}
        </pre>
      </div>
    );
  }

  if (type === 'node' && selectedNode) {
    const allNodeWeights: WeightItem[] = selectedNode.inputs
      .map((input: string) => {
        const w = data.weights?.[input];
        if (!w) return null;
        return { name: input, shape: w.shape, dtype: w.dtype, values: w.values };
      })
      .filter(Boolean) as WeightItem[];

    const biasWeight = allNodeWeights.find(w => w.name.toLowerCase().includes('bias'));
    const mainWeights = biasWeight ? allNodeWeights.filter(w => w !== biasWeight) : allNodeWeights;

    const getMatrix = (weight: WeightItem, index: number): number[][] => {
      const shape = weight.shape;
      const values = weight.values;
      const matrix: number[][] = [];

      if (shape.length === 4) {
        const [outC, inC, H, W] = shape;
        const kernelSize = H * W;
        for (let i = 0; i < inC; i++) {
          const row: number[] = [];
          for (let h = 0; h < H; h++) {
            for (let w = 0; w < W; w++) {
              const idx = index * inC * kernelSize + i * kernelSize + h * W + w;
              row.push(values[idx]);
            }
          }
          matrix.push(row);
        }
      } else if (shape.length === 2) {
        const [outF, inF] = shape;
        const row: number[] = [];
        for (let i = 0; i < inF; i++) {
          row.push(values[index * inF + i]);
        }
        matrix.push(row);
      }

      return matrix;
    };

    const getBiasColumn = (weight: WeightItem): number[] => {
      return weight.values;
    };

    return (
      <div>
        <h3>Node: {selectedNode.name}</h3>
        <p><strong>Op Type:</strong> {selectedNode.op_type}</p>
        <p><strong>Inputs:</strong> {selectedNode.inputs?.join(', ') || '—'}</p>
        <p><strong>Outputs:</strong> {selectedNode.outputs?.join(', ') || '—'}</p>

        <h4>Attributes:</h4>
        <pre style={{ fontSize: 11, background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
          {JSON.stringify(selectedNode.attributes || {}, null, 2)}
        </pre>

        <h4>Weights ({allNodeWeights.length})</h4>

        {mainWeights.map(weight => {
          const shape = weight.shape;
          const isConv = shape.length === 4;
          const isFC = shape.length === 2;
          if (!isConv && !isFC) return null;

          const outDim = isConv ? shape[0] : shape[0];
          const matrix = getMatrix(weight, channelIndex);

          return (
            <div
              key={weight.name}
              style={{
                marginBottom: 28,
                padding: 16,
                border: '1px solid #e0e0e0',
                borderRadius: 8,
                background: '#fafafa',
                fontSize: 12,
              }}
            >
              <strong style={{ color: '#1565c0', fontSize: 14, display: 'block', marginBottom: 6 }}>
                {weight.name}
              </strong>
              <div style={{ color: '#555', fontSize: 11, marginBottom: 12 }}>
                <strong>Shape:</strong> {shape.join(' × ')} | <strong>DType:</strong> {weight.dtype}
                <span style={{ marginLeft: 12, color: '#777' }}>
                  ({weight.values.length.toLocaleString()} values)
                </span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>
                  {isConv ? 'Output Channel' : 'Output Neuron'}: {channelIndex + 1} / {outDim}
                </div>
                <input
                  type="range"
                  min="0"
                  max={outDim - 1}
                  value={channelIndex}
                  onChange={e => setChannelIndex(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${matrix[0]?.length || 1}, 1fr)`,
                  gap: '5px',
                  fontFamily: 'monospace',
                  fontSize: 10,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: '4px',
                  background: '#fff',
                  borderRadius: 4,
                }}
              >
                {matrix.map((row, i) => (
                  <React.Fragment key={i}>
                    {row.map((val, j) => (
                      <div
                        key={j}
                        style={{
                          padding: '6px 3px',
                          textAlign: 'center',
                          background: val >= 0 ? '#e8f5e9' : '#ffebee',
                          borderRadius: 4,
                          color: Math.abs(val) > 0.5 ? '#b71c1c' : '#333',
                          fontWeight: Math.abs(val) > 1 ? 'bold' : 'normal',
                          minWidth: '50px',
                        }}
                      >
                        {val.toFixed(4)}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>

              {isFC && (
                <div style={{ marginTop: 6, fontSize: 10, color: '#888', textAlign: 'center' }}>
                  Input Feature {channelIndex * shape[1] + 1} → {Math.min((channelIndex + 1) * shape[1], shape[1])}
                </div>
              )}
            </div>
          );
        })}

        {/* Bias — в столбец */}
        {biasWeight && (
          <div style={{ marginTop: 28, paddingTop: 16, borderTop: '2px dashed #bbb', paddingBottom: 20 }}>
            <h4 style={{ color: '#c62828', marginBottom: 12 }}>Bias</h4>
            <div
              style={{
                padding: 14,
                border: '1px solid #ffcdd2',
                borderRadius: 8,
                background: '#fff5f5',
                fontSize: 12,
              }}
            >
              <strong style={{ color: '#b71c1c', display: 'block', marginBottom: 6 }}>
                {biasWeight.name}
              </strong>
              <div style={{ color: '#555', fontSize: 11, marginBottom: 10 }}>
                <strong>Shape:</strong> {biasWeight.shape.join(' × ')} | <strong>DType:</strong> {biasWeight.dtype}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '4px',
                  fontFamily: 'monospace',
                  fontSize: 10.5,
                  maxHeight: '300px',
                  overflowY: 'auto',
                  paddingBottom: '10px', // Дополнительный отступ внутри скролла
                }}
              >
                {getBiasColumn(biasWeight).map((val, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '6px 8px',
                      background: val >= 0 ? '#e8f5e9' : '#ffebee',
                      borderRadius: 4,
                      color: Math.abs(val) > 0.5 ? '#b71c1c' : '#333',
                      textAlign: 'center',
                    }}
                  >
                    {val.toFixed(4)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {allNodeWeights.length === 0 && <p>No weights.</p>}
      </div>
    );
  }

  return <p>Select a node.</p>;
};

export default SidebarContent;