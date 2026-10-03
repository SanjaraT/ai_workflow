'use client';
import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  addEdge, Background, Controls, MiniMap,
  useNodesState, useEdgesState, Connection,
  ReactFlowProvider, ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import WorkflowNode from '@/components/WorkflowNode';
import WorkflowEdge from '@/components/WorkflowEdge';
import { initialNodes, initialEdges } from '@/lib/initialData';

const nodeTypes = { workflowNode: WorkflowNode };
const edgeTypes = { workflowEdge: WorkflowEdge };
let nodeIdCounter = 4;

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const updatePrompt = useCallback((nodeId: string, prompt: string) => {
    setNodes(nds => nds.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, prompt } } : n
    ));
  }, [setNodes]);

  const nodesWithHandlers = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onPromptChange: (prompt: string) => updatePrompt(node.id, prompt),
    },
  }));

  const onConnect = useCallback((connection: Connection) => {
    const label = connection.sourceHandle === 'yes' ? 'YES' : 'NO';
    setEdges(eds => addEdge(
      { ...connection, type: 'workflowEdge', data: { label } },
      eds
    ));
  }, [setEdges]);

  const addNode = useCallback(() => {
    const id = String(nodeIdCounter++);
    const newNode = {
      id,
      type: 'workflowNode',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      data: { label: 'Node', prompt: '', onPromptChange: () => {} },
    };
    setNodes(nds => [...nds, newNode]);
  }, [setNodes]);

  const runWorkflow = useCallback(async () => {
  if (!nodes.length) return;
  setIsRunning(true);
  setLogs(['Starting workflow...']);

  // reset all nodes to idle first
  setNodes(nds => nds.map(n => ({
    ...n,
    data: { ...n.data, status: 'idle', onPromptChange: (prompt: string) => updatePrompt(n.id, prompt) }
  })));

  try {
    const res = await fetch('/api/workflow/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodes, edges }),
    });

    const result = await res.json();

    if (result.error) {
      setLogs(['✗ Error: ' + result.error]);
      setIsRunning(false);
      return;
    }

    if (result.executionPath && result.executionPath.length > 0) {
      for (const step of result.executionPath) {
        const status = step.result === 'YES' ? 'yes' : 'no';

        // use functional update so we always have fresh state
        setNodes(nds => nds.map(n =>
          n.id === step.nodeId
            ? { ...n, data: { ...n.data, status, onPromptChange: (prompt: string) => updatePrompt(n.id, prompt) } }
            : n
        ));

        setLogs(prev => [...prev, `"${step.prompt}" → ${step.result}`]);

        // pause between each node so you can see the animation
        await new Promise(r => setTimeout(r, 800));
      }
      setLogs(prev => [...prev, '✓ Workflow complete']);
    } else {
      setLogs(['✗ No execution path returned']);
    }

  } catch (err: any) {
    setLogs(prev => [...prev, '✗ Error: ' + err.message]);
  } finally {
    setIsRunning(false);
  }
}, [nodes, edges, setNodes, updatePrompt]);

  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 text-white">
        <span className="font-bold text-lg">AI Workflow</span>
        <button
          onClick={addNode}
          className="ml-auto bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm"
        >+ Add Node</button>
        <button
          onClick={runWorkflow}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-1 rounded text-sm font-bold"
        >{isRunning ? 'Running...' : '▶ Run Workflow'}</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodesWithHandlers}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        {/* Logs panel */}
        <div className="w-64 bg-gray-950 text-green-400 font-mono text-xs p-3 overflow-y-auto">
          <div className="font-bold text-gray-400 mb-2 uppercase tracking-wide">Execution Log</div>
          {logs.length === 0
            ? <div className="text-gray-600">No runs yet.</div>
            : logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)
          }
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}