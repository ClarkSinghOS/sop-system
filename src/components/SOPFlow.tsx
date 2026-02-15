'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import SOPNode from './SOPNode';
import { SOPNodeData } from '@/types/sop';

interface SOPFlowProps {
  initialNodes: Node<SOPNodeData>[];
  initialEdges: Edge[];
}

export default function SOPFlow({ initialNodes, initialEdges }: SOPFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(() => ({ sopNode: SOPNode }), []);

  const defaultEdgeOptions = {
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
  };

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="rgba(255,255,255,0.1)" 
        />
        <Controls className="!bg-slate-800 !border-white/10" />
        <MiniMap
          nodeColor={(node) => {
            const automatable = (node.data as SOPNodeData)?.automatable;
            if (automatable === 'full') return '#10b981';
            if (automatable === 'partial') return '#f59e0b';
            return '#ef4444';
          }}
          maskColor="rgba(15, 23, 42, 0.8)"
          className="!bg-slate-800 !border-white/10"
        />
      </ReactFlow>
    </div>
  );
}
