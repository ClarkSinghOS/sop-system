'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Process } from '@/types/process';

interface ProcessMapProps {
  processes: Process[];
  onSelectProcess: (processId: string) => void;
  onSelectStep: (processId: string, stepId: string) => void;
}

// Department colors
const departmentColors: Record<string, string> = {
  Marketing: '#06b6d4',
  Sales: '#10b981',
  Operations: '#f59e0b',
  HR: '#a855f7',
  Executive: '#ef4444',
  Finance: '#3b82f6',
  default: '#71717a',
};

// Custom Process Node
function ProcessNode({ data }: { data: any }) {
  return (
    <div
      className="px-6 py-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${data.color}15, ${data.color}05)`,
        borderColor: data.color,
        boxShadow: `0 4px 20px ${data.color}20`,
        minWidth: '200px',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: data.color }}
        />
        <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase">
          {data.department}
        </span>
      </div>
      <h3 className="font-display font-semibold text-[var(--text-primary)] text-sm mb-1">
        {data.label}
      </h3>
      <p className="text-xs text-[var(--text-tertiary)]">
        {data.stepsCount} steps • {data.status}
      </p>
      {data.triggers && data.triggers.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
          <p className="text-[10px] text-[var(--text-tertiary)]">
            Triggers: {data.triggers.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

// Custom Step Node (smaller, for expanded view)
function StepNode({ data }: { data: any }) {
  return (
    <div
      className="px-4 py-2 rounded-lg border cursor-pointer transition-all hover:scale-105"
      style={{
        background: `${data.color}10`,
        borderColor: `${data.color}50`,
        minWidth: '150px',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold"
          style={{ background: data.color, color: '#000' }}
        >
          {data.stepNumber}
        </div>
        <span className="text-xs font-medium text-[var(--text-secondary)] truncate">
          {data.label}
        </span>
      </div>
    </div>
  );
}

const nodeTypes = {
  processNode: ProcessNode,
  stepNode: StepNode,
};

export default function ProcessMap({
  processes,
  onSelectProcess,
  onSelectStep,
}: ProcessMapProps) {
  // Build nodes and edges from processes
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Layout configuration
    const processSpacingX = 350;
    const processSpacingY = 200;
    const processesPerRow = 3;

    // Group processes by department
    const byDepartment = processes.reduce((acc, proc) => {
      if (!acc[proc.department]) acc[proc.department] = [];
      acc[proc.department].push(proc);
      return acc;
    }, {} as Record<string, Process[]>);

    let globalIndex = 0;

    Object.entries(byDepartment).forEach(([department, deptProcesses], deptIndex) => {
      // Department label node
      const deptY = deptIndex * (processSpacingY * Math.ceil(deptProcesses.length / processesPerRow) + 100);
      
      nodes.push({
        id: `dept-${department}`,
        type: 'default',
        position: { x: -100, y: deptY },
        data: { label: department },
        style: {
          background: 'transparent',
          border: 'none',
          fontSize: '14px',
          fontWeight: 'bold',
          color: departmentColors[department] || departmentColors.default,
          transform: 'rotate(-90deg)',
          transformOrigin: 'center center',
          width: '150px',
        },
        draggable: false,
        selectable: false,
      });

      deptProcesses.forEach((process, idx) => {
        const row = Math.floor(idx / processesPerRow);
        const col = idx % processesPerRow;
        const x = col * processSpacingX + 100;
        const y = deptY + row * processSpacingY;

        const color = departmentColors[process.department] || departmentColors.default;

        // Process node
        nodes.push({
          id: process.processId,
          type: 'processNode',
          position: { x, y },
          data: {
            label: process.name,
            department: process.department,
            status: process.status,
            stepsCount: process.steps.length,
            color,
            triggers: process.triggers?.slice(0, 2),
          },
        });

        // Create edges for related processes
        if (process.relatedProcesses) {
          process.relatedProcesses.forEach((relatedId) => {
            // Only create edge if target exists
            if (processes.some(p => p.processId === relatedId)) {
              const edgeId = `${process.processId}-${relatedId}`;
              // Avoid duplicate edges
              if (!edges.some(e => e.id === edgeId || e.id === `${relatedId}-${process.processId}`)) {
                edges.push({
                  id: edgeId,
                  source: process.processId,
                  target: relatedId,
                  type: 'smoothstep',
                  animated: false,
                  style: { stroke: '#71717a', strokeWidth: 1, strokeDasharray: '5,5' },
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#71717a',
                    width: 15,
                    height: 15,
                  },
                });
              }
            }
          });
        }

        // Create edges for triggers
        if (process.triggeredBy) {
          process.triggeredBy.forEach((triggerId) => {
            if (processes.some(p => p.processId === triggerId)) {
              edges.push({
                id: `trigger-${triggerId}-${process.processId}`,
                source: triggerId,
                target: process.processId,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#06b6d4', strokeWidth: 2 },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#06b6d4',
                  width: 15,
                  height: 15,
                },
              });
            }
          });
        }

        globalIndex++;
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [processes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.type === 'processNode') {
        onSelectProcess(node.id);
      } else if (node.type === 'stepNode' && node.data.processId) {
        onSelectStep(String(node.data.processId), node.id);
      }
    },
    [onSelectProcess, onSelectStep]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.03)" gap={40} />
        <Controls
          showInteractive={false}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
          }}
        />
        <MiniMap
          nodeStrokeColor={(n): string => {
            if (n.type === 'processNode' && n.data?.color) return String(n.data.color);
            return '#71717a';
          }}
          nodeColor={(n): string => {
            if (n.type === 'processNode' && n.data?.color) return `${n.data.color}30`;
            return '#71717a30';
          }}
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
          }}
          maskColor="rgba(0,0,0,0.8)"
        />
      </ReactFlow>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-[var(--bg-secondary)]/90 backdrop-blur border border-[var(--border-default)]">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          Departments
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(departmentColors).filter(([key]) => key !== 'default').map(([dept, color]) => (
            <div key={dept} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: color }}
              />
              <span className="text-xs text-[var(--text-secondary)]">{dept}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 40 10">
                <line x1="0" y1="5" x2="30" y2="5" stroke="#71717a" strokeWidth="1" strokeDasharray="5,5" />
                <polygon points="30,2 40,5 30,8" fill="#71717a" />
              </svg>
              Related
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 40 10">
                <line x1="0" y1="5" x2="30" y2="5" stroke="#06b6d4" strokeWidth="2" />
                <polygon points="30,2 40,5 30,8" fill="#06b6d4" />
              </svg>
              Triggers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
