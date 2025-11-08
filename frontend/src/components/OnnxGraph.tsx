// frontend/src/components/OnnxGraph.tsx

import React, { useRef, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
cytoscape.use(dagre);

interface Node {
  name: string;
  op_type: string;
  inputs: string[];
  outputs: string[];
  attributes: Record<string, any>;
}

interface ParsedData {
  nodes: Node[];
  edges: { from: string; to: string; label: string }[];
  model_metadata: Record<string, any>;
}

interface OnnxGraphProps {
  data: ParsedData | null;
  onNodeSelect: (node: Node | null) => void;
  cyRef: React.MutableRefObject<any>;
}

const OnnxGraph: React.FC<OnnxGraphProps> = ({ data, onNodeSelect, cyRef }) => {
  const internalCyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!internalCyRef.current || !data) return;

    const cy = internalCyRef.current;
    cyRef.current = cy;

    cy.elements().remove();

    data.nodes.forEach(node => {
      cy.add({
        group: 'nodes',
        data: { id: node.name, label: `${node.op_type}\n(${node.name})` },
      });
    });

    data.edges.forEach(edge => {
      cy.add({
        group: 'edges',
        data: { source: edge.from, target: edge.to, label: edge.label },
      });
    });

    cy.style([
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'text-wrap': 'wrap',
          'font-size': 11,
          'color': '#fff',
          'shape': 'round-rectangle',
          'width': 'label',
          'height': 'label',
          'padding': 8,
          'border-width': 1,
          'border-color': '#555',
        },
      },
      {
        selector: 'edge',
        style: {
          'width': 2,
          'line-color': '#aaa',
          'target-arrow-color': '#aaa',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': 9,
          'text-rotation': 'autorotate',
          'text-margin-y': -8,
        },
      },
      {
        selector: 'node:selected',
        style: { 'border-width': 3, 'border-color': '#ff9800' },
      },
    ]);

    cy.layout({
      name: 'dagre',
      rankDir: 'TB',
      nodeSep: 60,
      rankSep: 80,
    }).run();

    // ФИКС: Клик по ноде
    cy.on('tap', 'node', (evt) => {
      const nodeId = evt.target.id();
      const node = data.nodes.find(n => n.name === nodeId);
      onNodeSelect(node || null);
    });

    // ФИКС: Клик вне ноды — сбрасываем выбор
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        onNodeSelect(null);
      }
    });

  }, [data, onNodeSelect, cyRef]);

  return (
    <CytoscapeComponent
      elements={[]}
      style={{ width: '100%', height: '100%', background: '#f9f9f9' }}
      cy={(cy) => {
        internalCyRef.current = cy;
        cyRef.current = cy;
      }}
    />
  );
};

export default OnnxGraph;