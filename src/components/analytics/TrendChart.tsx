'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';

interface TrendData {
  date: string;
  fullDate: string;
  executions: number;
  completions: number;
  failures: number;
  avgDuration: number;
}

interface TrendChartProps {
  data: TrendData[];
}

export default function TrendChart({ data }: TrendChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      
      return (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{item.fullDate}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                <span className="text-[var(--text-tertiary)]">Executions:</span>
              </span>
              <span className="text-[var(--accent-cyan)] font-medium">{item.executions}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#84cc16]" />
                <span className="text-[var(--text-tertiary)]">Completions:</span>
              </span>
              <span className="text-[var(--accent-lime)] font-medium">{item.completions}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                <span className="text-[var(--text-tertiary)]">Failures:</span>
              </span>
              <span className="text-red-400 font-medium">{item.failures}</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">Avg Duration:</span>
              <span className="text-[var(--text-secondary)] font-medium">{item.avgDuration} min</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] font-display">
          Execution Trends
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Process executions over the last 30 days
        </p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="executionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
              tickLine={{ stroke: 'var(--border-subtle)' }}
              axisLine={{ stroke: 'var(--border-subtle)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
              tickLine={{ stroke: 'var(--border-subtle)' }}
              axisLine={{ stroke: 'var(--border-subtle)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value) => (
                <span className="text-xs text-[var(--text-secondary)]">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="executions"
              name="Executions"
              stroke="#06b6d4"
              fill="url(#executionGradient)"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="completions"
              name="Completions"
              stroke="#84cc16"
              strokeWidth={2}
              dot={{ fill: '#84cc16', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#84cc16' }}
            />
            <Line
              type="monotone"
              dataKey="failures"
              name="Failures"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#ef4444', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#ef4444' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
