import { BaseEdge, EdgeLabelRenderer, getStraightPath } from 'reactflow';

export default function WorkflowEdge({
  id, sourceX, sourceY, targetX, targetY, data, style
}: any) {
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const isYes = data?.label === 'YES';

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ ...style, stroke: isYes ? '#22c55e' : '#ef4444', strokeWidth: 2 }} />
      <EdgeLabelRenderer>
        <div
          style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all' }}
          className={`text-xs font-bold px-1 rounded ${isYes ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
        >
          {data?.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}