import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface BarChartDataPoint {
  name: string;
  value: number;
}

export interface BarChartProps {
  title: string;
  description?: string;
  data: BarChartDataPoint[];
  height?: number;
  color?: string;
}

/**
 * BarChart Component
 * Displays data in a bar chart format
 * @param {BarChartProps} props - Chart configuration
 * @returns {JSX.Element} Rendered chart
 */
export function BarChart({
  title,
  description,
  data,
  height = 300,
  color = '#f59e0b',
}: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
          {description && <CardDescription className="text-slate-400">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <p className="text-slate-400">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const barWidth = 30;
  const barGap = 20;
  const totalWidth = data.length * (barWidth + barGap) + 100;

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        {description && <CardDescription className="text-slate-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height, position: 'relative' }} className="w-full overflow-x-auto">
          {/* SVG Chart - Bar Chart */}
          <svg width={totalWidth} height={height} viewBox={`0 0 ${totalWidth} ${height}`}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = height - 40 - ratio * (height - 80);
              return (
                <g key={`grid-${ratio}`}>
                  <line x1="50" y1={y} x2={totalWidth - 20} y2={y} stroke="#334155" strokeDasharray="4" strokeWidth="1" />
                  <text x="40" y={y + 5} fontSize="12" fill="#94a3b8" textAnchor="end">
                    {(minValue + ratio * range).toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((d, i) => {
              const x = 60 + i * (barWidth + barGap);
              const normalizedValue = (d.value - minValue) / range;
              const barHeight = normalizedValue * (height - 80);
              const y = height - 40 - barHeight;

              return (
                <g key={`bar-${i}`}>
                  {/* Bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={color}
                    opacity="0.8"
                    rx="4"
                  />
                  {/* Value label on bar */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    fontSize="12"
                    fill="#e2e8f0"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {d.value.toFixed(0)}
                  </text>
                  {/* X-axis label */}
                  <text
                    x={x + barWidth / 2}
                    y={height - 10}
                    fontSize="12"
                    fill="#94a3b8"
                    textAnchor="middle"
                  >
                    {d.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
