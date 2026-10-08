import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

type ScorePoint = { week: string; score: number }

export default function ScoreHistoryChart({ data, legend }: { data: ScorePoint[]; legend: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 14, right: 6, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7769f0" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#7769f0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#f0f0f5" strokeDasharray="3 5" />
        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#a0a1ae', fontSize: 10 }} dy={10} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #eeeef3', fontSize: 11, boxShadow: '0 8px 24px #27244812' }}
          formatter={value => [`${value}/100`, legend]}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#6d60e9"
          strokeWidth={2.5}
          fill="url(#scoreFill)"
          activeDot={{ r: 5, fill: '#6d60e9', stroke: 'white', strokeWidth: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
