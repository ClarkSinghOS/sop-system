'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ExecutionTimeData {
  name: string;
  fullName: string;
  stepId: string;
  estimated: number;
  actual: number;
  variance: number;
}

interface ExecutionTimeChartProps {
  data: ExecutionTimeData[];
}

export default function ExecutionTimeChart({ data }: ExecutionTimeChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isOverrun = item.actual > item.estimated;
      
      return (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-3 shadow-xl">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{item.fullName}</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-tertiary)]">Estimated:</span>
              <span className="text-[var(--accent-cyan)] font-medium">{item.estimated} min</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-tertiary)]">Actual:</span>
              <span className="text-[var(--accent-lime)] font-medium">{item.actual} min</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-tertiary)]">Variance:</span>
              <span className={`font-medium ${isOverrun ? 'text-red-400' : 'text-emerald-400'}`}>
                {isOverrun ? '+' : ''}{item.variance}%
              </span>
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
          Estimated vs Actual Execution Time
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Compare planned duration against real performance
        </p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
              tickLine={{ stroke: 'var(--border-subtle)' }}
              axisLine={{ stroke: 'var(--border-subtle)' }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis
              tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }}
              tickLine={{ stroke: 'var(--border-subtle)' }}
              axisLine={{ stroke: 'var(--border-subtle)' }}
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value) => (
                <span className="text-xs text-[var(--text-secondary)]">{value}</span>
              )}
            />
            <Bar
              dataKey="estimated"
              name="Estimated"
              fill="#06b6d4"
              radius={[4, 4, 0, 0]}
              fillOpacity={0.8}
            />
            <Bar
              dataKey="actual"
              name="Actual"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.actual > entry.estimated ? '#f97316' : '#84cc16'}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
