'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface AutomationData {
  name: string;
  value: number;
  color: string;
}

interface AutomationChartProps {
  data: AutomationData[];
}

export default function AutomationChart({ data }: AutomationChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
      
      return (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
          </div>
          <div className="text-xs text-[var(--text-secondary)]">
            {item.value} step{item.value !== 1 ? 's' : ''} ({percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate automation score (weighted: full=100, partial=50, manual=0)
  const automationScore = Math.round(
    ((data.find(d => d.name === 'Fully Automated')?.value || 0) * 100 +
     (data.find(d => d.name === 'Partially Automated')?.value || 0) * 50) / 
    (total || 1)
  );

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] font-display">
          Automation Coverage
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Distribution of step automation levels
        </p>
      </div>
      
      <div className="h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Score */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold font-display text-[var(--accent-cyan)]">
              {automationScore}%
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">Automation</p>
          </div>
        </div>
      </div>

      {/* Breakdown List */}
      <div className="space-y-3 mt-4 pt-4 border-t border-[var(--border-subtle)]">
        {data.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-[var(--text-secondary)]">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: item.color 
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-[var(--text-primary)] w-8 text-right">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
