import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:   'var(--bg-surface)',
      border:       '0.5px solid var(--border)',
      borderRadius: 10,
      padding:      '10px 14px',
      fontSize:     12,
      fontFamily:   'Space Mono, monospace',
      boxShadow:    'var(--shadow-elevated)',
    }}>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 8, fontSize: 11 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{
          display:        'flex',
          justifyContent: 'space-between',
          gap:            16,
          marginBottom:   4,
          color:          p.color,
        }}>
          <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p.dataKey}</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function TrendsChart({ data }) {
  // pivot rows into { month, critical, warning, low }
  const map = {};
  data.forEach(row => {
    if (!map[row.month]) map[row.month] = { month: row.month, critical: 0, warning: 0, low: 0 };
    map[row.month][row.severity] = row.count;
  });

  const formatted = Object.values(map).sort((a, b) => a.month.localeCompare(b.month));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="gradCritical" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#E24B4A" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#E24B4A" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gradWarning" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#EF9F27" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#EF9F27" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="gradLow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#1D9E75" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}
          tickLine={false}
          axisLine={false}
          minTickGap={30}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'Space Mono, monospace' }}
          tickLine={false}
          axisLine={false}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, fontFamily: 'Space Mono, monospace', paddingTop: 8 }}
          formatter={value => (
            <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{value}</span>
          )}
        />
        <Area type="monotone" dataKey="critical" stroke="#E24B4A" strokeWidth={1.8}
          fill="url(#gradCritical)" dot={false} animationDuration={1500}/>
        <Area type="monotone" dataKey="warning"  stroke="#EF9F27" strokeWidth={1.8}
          fill="url(#gradWarning)" dot={false} animationDuration={1500}/>
        <Area type="monotone" dataKey="low"      stroke="#1D9E75" strokeWidth={1.8}
          fill="url(#gradLow)" dot={false} animationDuration={1500}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}