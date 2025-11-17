import React, { useEffect, useRef, useState } from 'react';
import Cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { Tabs, message } from 'antd';
import type { OnnxData, OnnxNode, OnnxEdge } from '../types';

Cytoscape.use(dagre);

interface OnnxGraphProps {
  modelPath?: string | null;
  onnxData?: OnnxData | null;
}

const OnnxGraph: React.FC<OnnxGraphProps> = ({ modelPath, onnxData }) => {
  const [activeTab, setActiveTab] = useState('graph');
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Уничтожаем предыдущий граф перед рендером нового
    if (cyRef.current) {
      cyRef.current.destroy();
      cyRef.current = null;
    }

    const renderGraph = () => {
      try {
        // Генерируем уникальные ID для дубликатов узлов
        const nodeIdCounter = new Map<string, number>();

        const nodes = (onnxData?.nodes || []).map((node: OnnxNode) => {
          const baseId = node.name || node.op_type;
          const count = (nodeIdCounter.get(baseId) || 0) + 1;
          nodeIdCounter.set(baseId, count);
          const uniqueId = count === 1 ? baseId : `${baseId}_${count}`;

          return {
            data: {
              id: uniqueId,
              label: node.name || node.op_type,
              op_type: node.op_type,
              inputs: node.inputs,
              outputs: node.outputs,
              attributes: node.attributes,
            },
          };
        });

        const edges = (onnxData?.edges || []).map((edge: OnnxEdge, index: number) => ({
          data: {
            id: `edge_${index}`,
            source: edge.from,
            target: edge.to,
            label: edge.label,
          },
        }));

        // Валидация перед рендером
        if (nodes.length === 0) {
          message.warning('No nodes to render in ONNX graph');
          return;
        }

        const cy = Cytoscape({
          container: containerRef.current,
          elements: { nodes, edges },
          style: [
            {
              selector: 'node',
              style: {
                'background-color': '#1890ff',
                'label': 'data(label)',
                'width': '80px',
                'height': '40px',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '10px',
                'color': '#fff',
                'text-outline-width': 2,
                'text-outline-color': '#1890ff',
                'shape': 'rectangle',
                'border-radius': '4px',
              },
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
                'line-color': '#d9d9d9',
                'target-arrow-color': '#d9d9d9',
                'target-arrow-shape': 'triangle',
                'label': 'data(label)',
                'font-size': '8px',
                'color': '#666',
                'curve-style': 'bezier',
              },
            },
            {
              selector: ':selected',
              style: {
                'background-color': '#52c41a',
                'line-color': '#52c41a',
                'target-arrow-color': '#52c41a',
              },
            },
          ],
          layout: {
            name: 'dagre',
            rankDir: 'LR',
            padding: 20,
            nodeSep: 50,
            rankSep: 100,
          },
          minZoom: 0.5,
          maxZoom: 2,
        });

        // Обработчик клика по узлу
        cy.on('tap', 'node', (event) => {
          const node = event.target;
          console.log('Node clicked:', {
            id: node.id(),
            data: node.data()
          });
        });

        cyRef.current = cy;
      } catch (error) {
        console.error('Error rendering graph:', error);
        message.error('Failed to render ONNX graph');
      }
    };

    renderGraph();

    // Cleanup при размонтировании
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [onnxData]);

  if (!modelPath && !onnxData) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#999' }}>
        Upload an ONNX file to visualize the graph
      </div>
    );
  }

  if (onnxData && onnxData.nodes.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#faad14' }}>
        No graph data available in this ONNX model
      </div>
    );
  }

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
            borderRadius: '8px',
            background: '#fafafa',
          }}
        />
      ),
    },
  ];

  return <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />;
};

export default OnnxGraph;