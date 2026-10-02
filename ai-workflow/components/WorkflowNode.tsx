'use client';
import { Handle, Position } from 'reactflow';
import { useState } from 'react';

interface WorkflowNodeProps {
    data: {
        prompt: string;
        label: string;
        status?: 'idle' | 'running' | 'yes' | 'no' | 'error';
        onPromptChange: (prompt: string) => void;
    };
}

const statusColors: Record<string, string> ={
  idle: 'border-gray-300 bg-white',
  running: 'border-blue-400 bg-blue-50 animate-pulse',
  yes: 'border-green-400 bg-green-50',
  no: 'border-red-400 bg-red-50',
  error: 'border-orange-400 bg-orange-50',
};

export default function WorkflowNode({ data }: WorkflowNodeProps) {
    const [editing, setEditing] = useState(false);
    const[draft, setDraft] = useState(data.prompt);
    const status = data.status || 'idle';

    return (
     <div className={`rounded-lg border-2 p-3 w-64 shadow-sm transition-all ${statusColors[status]}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <div className="text-xs font-bold text-gray-500 uppercase mb-1">{data.label}</div>

      {editing ? (
        <div className="flex flex-col gap-1">
          <textarea
            className="text-sm border rounded p-1 w-full resize-none"
            rows={3}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            autoFocus
          />
          <div className="flex gap-1">
            <button
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
              onClick={() => { data.onPromptChange(draft); setEditing(false); }}
            >Save</button>
            <button
              className="text-xs bg-gray-200 px-2 py-1 rounded"
              onClick={() => { setDraft(data.prompt); setEditing(false); }}
            >Cancel</button>
          </div>
        </div>
      ) : (
        <div
          className="text-sm text-gray-700 cursor-pointer min-h-[40px] hover:bg-gray-50 rounded p-1"
          onClick={() => setEditing(true)}
          title="Click to edit prompt"
        >
          {data.prompt || <span className="text-gray-400 italic">Click to add prompt...</span>}
        </div>
      )}

      {status !== 'idle' && status !== 'running' && (
        <div className={`mt-2 text-xs font-bold text-center ${status === 'yes' ? 'text-green-600' : status === 'error' ? 'text-orange-600' : 'text-red-600'}`}>
          {status.toUpperCase()}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        style={{ left: '30%' }}
        className="w-3 h-3 bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        style={{ left: '70%' }}
        className="w-3 h-3 bg-red-500"
      />
    </div>
  );

}