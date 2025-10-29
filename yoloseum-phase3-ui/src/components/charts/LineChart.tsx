import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface LineChartDataPoint {
  name: string;
  value: number;
}

export interface LineChartProps {
  title: string;
  description?: string;
  data: LineChartDataPoint[];
  height?: number;
  color?: string;
}

/**
 * LineChart Component
 * Displays data in a line chart format
 * @param {LineChartProps} props - Chart configuration
 * @returns {JSX.Element} Rendered chart
 */
export function LineChart({
  title,
  description,
  data,
  height = 300,
  color = '#f59e0b',
}: LineChartProps) {
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

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        {description && <CardDescription className="text-slate-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height, position: 'relative' }} className="w-full">
          {/* SVG Chart - Simple Line Chart */}
          <svg width="100%" height={height} viewBox={`0 0 ${(data.length - 1) * 50 + 100} ${height}`}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = height - 40 - ratio * (height - 80);
              return (
                <g key={`grid-${ratio}`}>
                  <line x1="50" y1={y} x2={`${(data.length - 1) * 50 + 50}`} y2={y} stroke="#334155" strokeDasharray="4" strokeWidth="1" />
                  <text x="10" y={y + 5} fontSize="12" fill="#94a3b8" textAnchor="end">
                    {(minValue + ratio * range).toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Data line */}
            <polyline
              points={data
                .map((d, i) => {
                  const x = 50 + i * 50;
                  const normalizedValue = (d.value - minValue) / range;
                  const y = height - 40 - normalizedValue * (height - 80);
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />

            {/* Data points */}
            {data.map((d, i) => {
              const x = 50 + i * 50;
              const normalizedValue = (d.value - minValue) / range;
              const y = height - 40 - normalizedValue * (height - 80);
              return (
                <circle key={`point-${i}`} cx={x} cy={y} r="3" fill={color} />
              );
            })}

            {/* X-axis labels */}
            {data.map((d, i) => {
              if (data.length > 10 && i % Math.ceil(data.length / 10) !== 0) return null;
              const x = 50 + i * 50;
              return (
                <text key={`label-${i}`} x={x} y={height - 10} fontSize="12" fill="#94a3b8" textAnchor="middle">
                  {d.name}
                </text>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
