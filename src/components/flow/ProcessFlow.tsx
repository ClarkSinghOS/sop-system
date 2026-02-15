'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ProcessNode from './ProcessNode';
import { ProcessStep } from '@/types/process';

interface ProcessFlowProps {
  steps: ProcessStep[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
}

export default function ProcessFlow({ steps, selectedStepId, onSelectStep }: ProcessFlowProps) {
  // Convert steps to nodes
  const initialNodes: Node[] = useMemo(() => {
    return steps.map((step, index) => ({
      id: step.stepId,
      type: 'processNode',
      position: step.position || { x: 250, y: index * 220 },
      data: {
        ...step,
        onSelect: onSelectStep,
        isSelected: step.stepId === selectedStepId,
      },
    }));
  }, [steps, selectedStepId, onSelectStep]);

  // Create edges based on triggers
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    
    steps.forEach((step, index) => {
      // Connect to next step by default
      if (index < steps.length - 1) {
        const nextStep = steps[index + 1];
        edges.push({
          id: `e-${step.stepId}-${nextStep.stepId}`,
          source: step.stepId,
          target: nextStep.stepId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'var(--accent-cyan)', strokeWidth: 2 },
        });
      }

      // Add decision branches
      if (step.decision && step.decision.branches) {
        step.decision.branches.forEach((branch, bi) => {
          if (branch.targetStepId !== steps[index + 1]?.stepId) {
            edges.push({
              id: `e-${step.stepId}-${branch.targetStepId}-${bi}`,
              source: step.stepId,
              target: branch.targetStepId,
              type: 'smoothstep',
              label: branch.conditionReadable.substring(0, 30) + (branch.conditionReadable.length > 30 ? '...' : ''),
              labelStyle: { fill: 'var(--text-tertiary)', fontSize: 10 },
              labelBgStyle: { fill: 'var(--bg-secondary)', fillOpacity: 0.8 },
              labelBgPadding: [4, 2] as [number, number],
              style: { stroke: 'var(--accent-purple)', strokeWidth: 2, strokeDasharray: '5 5' },
            });
          }
        });
      }
    });

    return edges;
  }, [steps]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const nodeTypes = useMemo(() => ({ processNode: ProcessNode }), []);

  // Update node selection state when it changes
  useMemo(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: node.id === selectedStepId,
        },
      }))
    );
  }, [selectedStepId, setNodes]);

  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
        minZoom={0.2}
        maxZoom={2}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={30}
          size={1}
          color="rgba(255,255,255,0.05)"
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const auto = node.data?.automationLevel;
            if (auto === 'full') return 'var(--auto-full)';
            if (auto === 'partial') return 'var(--auto-partial)';
            return 'var(--auto-none)';
          }}
          maskColor="rgba(10, 10, 15, 0.8)"
          style={{ background: 'var(--bg-elevated)' }}
        />
      </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
