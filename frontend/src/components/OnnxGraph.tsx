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
  const [graphKey, setGraphKey] = useState(0); // Для принудительного перерендера

  useEffect(() => {
    if (!containerRef.current || !onnxData) return;

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

        // КРИТИЧНО: Фиксируем размеры контейнера ЖЕСТКО
        const container = containerRef.current!;
        const containerWidth = container.parentElement?.clientWidth || 800;
        const containerHeight = 600;

        container.style.width = `${containerWidth}px`;
        container.style.height = `${containerHeight}px`;
        container.style.minWidth = '0';
        container.style.maxWidth = '100%';
        container.style.overflow = 'hidden';
        container.style.position = 'relative';

        const cy = Cytoscape({
          container: container,
          elements: { nodes, edges },
          style: [
            {
              selector: 'node',
              style: {
                'background-color': '#1890ff',
                'label': 'data(label)',
                'width': '60px', // Уменьшили размер для лучшей посадки
                'height': '30px',
                'text-valign': 'center',
                'text-halign': 'center',
                'font-size': '9px',
                'color': '#fff',
                'text-outline-width': 1,
                'text-outline-color': '#1890ff',
                'shape': 'rectangle',
                'border-radius': '3px',
              },
            },
            {
              selector: 'edge',
              style: {
                'width': 1.5,
                'line-color': '#d9d9d9',
                'target-arrow-color': '#d9d9d9',
                'target-arrow-shape': 'triangle',
                'label': 'data(label)',
                'font-size': '7px',
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
            padding: 10,
            nodeSep: 40,
            rankSep: 80,
            fit: true, // ВАЖНО: подгоняем граф под контейнер
            spacingFactor: 0.7,
          },
          minZoom: 0.3,
          maxZoom: 3,
          // Параметры для предотвращения скачков
          boxSelectionEnabled: false,
          autounselectify: true,
        });

        // Обработчик клика по узлу
        cy.on('tap', 'node', (event) => {
          const node = event.target;
          console.log('Node clicked:', {
            id: node.id(),
            data: node.data()
          });
        });

        // Фиксируем размер после готовности графа
        cy.ready(() => {
          container.style.overflow = 'hidden';
          // Принудительно подгоняем граф
          setTimeout(() => {
            cy.fit();
            cy.center();
          }, 100);
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
  }, [onnxData, graphKey]); // Добавляем graphKey для перерендера

  // Принудительный перерендер при изменении данных
  useEffect(() => {
    if (onnxData) {
      setGraphKey(prev => prev + 1);
    }
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
            maxWidth: '100%',
            height: '600px',
            border: '1px solid #d9d9d9',
            borderRadius: '8px',
            background: '#fafafa',
            // КРИТИЧНО: Предотвращаем любое расширение
            overflow: 'hidden !important',
            flexShrink: 0,
            minWidth: 0,
            position: 'relative',
          }}
        />
      ),
    },
  ];

  return (
    <div style={{
      maxWidth: '100%',
      overflow: 'hidden',
      width: '100%',
      position: 'relative'
    }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        style={{ maxWidth: '100%' }}
      />
    </div>
  );
};

export default OnnxGraph;