import React, { useEffect, useRef, useState } from 'react';
import Cytoscape from 'cytoscape';
import { Card, Tabs } from 'antd';

interface OnnxGraphProps {
  modelPath?: string;
}

const OnnxGraph: React.FC<OnnxGraphProps> = ({ modelPath }) => {
  const [activeTab, setActiveTab] = useState('graph');
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Cytoscape.Core | null>(null);

  useEffect(() => {
    if (!modelPath || !containerRef.current) return;

    // Очистка предыдущего графа
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    const parseAndRender = async () => {
      try {
        // Моковые данные для визуализации
        const elements = {
          nodes: [
            { data: { id: 'input', label: 'Input' } },
            { data: { id: 'conv1', label: 'Conv1' } },
            { data: { id: 'relu1', label: 'ReLU1' } },
            { data: { id: 'output', label: 'Output' } },
          ],
          edges: [
            { data: { source: 'input', target: 'conv1' } },
            { data: { source: 'conv1', target: 'relu1' } },
            { data: { source: 'relu1', target: 'output' } },
          ],
        };

        const cy = Cytoscape({
          container: containerRef.current,
          elements: elements,
          style: [
            {
              selector: 'node',
              style: {
                'background-color': '#1890ff',
                'label': 'data(label)',
                'text-valign': 'center',
                'color': '#fff',
                'text-outline-width': 2,
                'text-outline-color': '#1890ff',
                'height': 50,
                'width': 120,
              },
            },
            {
              selector: 'edge',
              style: {
                'curve-style': 'bezier',
                'source-arrow-shape': 'triangle',
                'line-color': '#ddd',
                'target-arrow-color': '#ddd',
              },
            },
          ],
          layout: {
            name: 'grid',
            rows: 1,
          },
        });

        cyRef.current = cy;
      } catch (error) {
        console.error('Error rendering graph:', error);
      }
    };

    parseAndRender();

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [modelPath]);

  const items = [
    {
      key: 'graph',
      label: 'Graph',
      children: (
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '600px',
            border: '1px solid #d9d9d9',
            background: '#fafafa'
          }}
        />
      ),
    },
  ];

  if (!modelPath) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Upload an ONNX file to visualize the graph</div>;
  }

  return <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />;
};

export default OnnxGraph;