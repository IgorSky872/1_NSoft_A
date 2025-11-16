import React, { useEffect, useRef, useState } from 'react';
import Cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Card, Tabs } from 'antd';

// Регистрируем dagre layout
Cytoscape.use(dagre);

interface OnnxNode {
  name: string;
  op_type: string;
  inputs: string[];
  outputs: string[];
  attributes: Record<string, any>;
}

interface OnnxEdge {
  from: string;
  to: string;
  label: string;
}

interface OnnxData {
  nodes: OnnxNode[];
  edges: OnnxEdge[];
}

interface OnnxGraphProps {
  modelPath?: string;
  onnxData?: OnnxData | null;
}

const OnnxGraph: React.FC<OnnxGraphProps> = ({ modelPath, onnxData }) => {
  const [activeTab, setActiveTab] = useState('graph');
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Очистка предыдущего графа
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    const parseAndRender = async () => {
      try {
        let elements: any;

        // ✅ ИСПРАВЛЕНО: Используем реальные данные если они есть
        if (onnxData?.nodes && onnxData.nodes.length > 0) {
          console.log('Rendering real ONNX data:', onnxData);

          const nodes = onnxData.nodes.map((node: OnnxNode) => ({
            data: {
              id: node.name,
              label: node.name,
              op_type: node.op_type,
              inputs: node.inputs,
              outputs: node.outputs,
              attributes: node.attributes,
            },
          }));

          const edges = onnxData.edges.map((edge: OnnxEdge) => ({
            data: {
              source: edge.from,
              target: edge.to,
              label: edge.label,
            },
          }));

          elements = { nodes, edges };
        }
        // Показываем плейсхолдер если файл загружен но данных еще нет
        else if (modelPath) {
          elements = {
            nodes: [
              { data: { id: 'loading', label: 'Loading graph...' } },
            ],
            edges: [],
          };
        } else {
          return; // Ничего не делаем
        }

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
                'font-size': '10px',
              },
            },
            {
              selector: 'edge',
              style: {
                'curve-style': 'bezier',
                'source-arrow-shape': 'triangle',
                'line-color': '#ddd',
                'target-arrow-color': '#ddd',
                'label': 'data(label)',
                'font-size': '8px',
                'color': '#666',
              },
            },
          ],
          layout: {
            name: 'dagre',
            rankDir: 'LR',
            padding: 20,
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
  }, [modelPath, onnxData]); // Перерендер при изменении данных

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

  if (!modelPath && !onnxData) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Upload an ONNX file to visualize the graph</div>;
  }

  return <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />;
};

export default OnnxGraph;