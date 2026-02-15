'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';

interface BottleneckData {
  name: string;
  fullName: string;
  stepId: string;
  score: number;
  avgOverrun: number;
  automationLevel: 'full' | 'partial' | 'manual';
}

interface BottleneckChartProps {
  data: BottleneckData[];
}

export default function BottleneckChart({ data }: BottleneckChartProps) {
  const getBarColor = (score: number) => {
    if (score >= 50) return '#ef4444';
    if (score >= 30) return '#f97316';
    if (score >= 15) return '#f59e0b';
    return '#84cc16';
  };

  const getAutomationBadge = (level: string) => {
    switch (level) {
      case 'full':
        return { text: 'Auto', color: 'bg-emerald-500/20 text-emerald-400' };
      case 'partial':
        return { text: 'Hybrid', color: 'bg-yellow-500/20 text-yellow-400' };
      default:
        return { text: 'Manual', color: 'bg-red-500/20 text-red-400' };
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const badge = getAutomationBadge(item.automationLevel);
      
      return (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{item.fullName}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-tertiary)]">Bottleneck Score:</span>
              <span 
                className="font-medium"
                style={{ color: getBarColor(item.score) }}
              >
                {item.score}/100
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-tertiary)]">Avg Overrun:</span>
              <span className={`font-medium ${item.avgOverrun > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {item.avgOverrun > 0 ? '+' : ''}{item.avgOverrun} min
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-tertiary)]">Type:</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${badge.color}`}>
                {badge.text}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Show top 7 bottlenecks
  const topBottlenecks = data.slice(0, 7);

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] font-display">
          Bottleneck Analysis
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Steps that slow down process completion
        </p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topBottlenecks}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
              tickLine={{ stroke: 'var(--border-subtle)' }}
              axisLine={{ stroke: 'var(--border-subtle)' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
              tickLine={{ stroke: 'var(--border-subtle)' }}
              axisLine={{ stroke: 'var(--border-subtle)' }}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={30} stroke="#f59e0b" strokeDasharray="5 5" opacity={0.5} />
            <ReferenceLine x={50} stroke="#ef4444" strokeDasharray="5 5" opacity={0.5} />
            <Bar dataKey="score" radius={[0, 4, 4, 0]}>
              {topBottlenecks.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.score)}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-lime-500" />
          <span className="text-xs text-[var(--text-tertiary)]">Low (&lt;15)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span className="text-xs text-[var(--text-tertiary)]">Medium (15-30)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span className="text-xs text-[var(--text-tertiary)]">High (30-50)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-xs text-[var(--text-tertiary)]">Critical (&gt;50)</span>
        </div>
      </div>
    </div>
  );
}
