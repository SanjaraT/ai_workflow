import {Node, Edge } from 'reactflow';

export const initialNodes: Node[] = [
  {
    id: '1',
    type: 'workflowNode',
    position: { x: 250, y: 50 },
    data: { label: 'Start', prompt: 'Is this a support request?' },
  },
  {
    id: '2',
    type: 'workflowNode',
    position: { x: 80, y: 220 },
    data: { label: 'Node', prompt: 'Is the issue urgent?' },
  },
  {
    id: '3',
    type: 'workflowNode',
    position: { x: 420, y: 220 },
    data: { label: 'Node', prompt: 'Is this a new lead?' },
  },
];

export const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', sourceHandle: 'yes', target: '2', type: 'workflowEdge', data: { label: 'YES' } },
  { id: 'e1-3', source: '1', sourceHandle: 'no', target: '3', type: 'workflowEdge', data: { label: 'NO' } },
];