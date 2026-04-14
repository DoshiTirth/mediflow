import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const VITAL_COLORS = {
  heart_rate:        '#E24B4A',
  systolic_bp:       '#EF9F27',
  diastolic_bp:      '#BA7517',
  temperature_c:     '#3b82f6',
  oxygen_saturation: '#1D9E75',
};

const VITAL_LABELS = {
  heart_rate:        'Heart Rate',
  systolic_bp:       'Systolic BP',
  diastolic_bp:      'Diastolic BP',
  temperature_c:     'Temperature',
  oxygen_saturation: 'O₂ Saturation',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

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
      minWidth:     160,
    }}>
      <div style={{
        color:        'var(--text-secondary)',
        marginBottom: 8,
        fontSize:     11,
      }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{
          display:       'flex',
          justifyContent:'space-between',
          gap:           16,
          marginBottom:  4,
          color:         p.color,
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>{VITAL_LABELS[p.dataKey]}</span>
          <span style={{ fontWeight: 700 }}>{p.value?.toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
}

export default function VitalsChart({ data, visibleLines }) {
  // sample down to max 40 points to avoid overcrowding
  const sampled = data.length > 40
    ? data.filter((_, i) => i % Math.ceil(data.length / 40) === 0)
    : data;

  const formatted = sampled.map(row => ({
    ...row,
    date: formatDate(row.recorded_at),
  }));

  const active = visibleLines || Object.keys(VITAL_COLORS);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={formatted}
        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{
            fontSize:   10,
            fill:       'var(--text-muted)',
            fontFamily: 'Space Mono, monospace',
          }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
          minTickGap={40}
        />
        <YAxis
          tick={{
            fontSize:   10,
            fill:       'var(--text-muted)',
            fontFamily: 'Space Mono, monospace',
          }}
          tickLine={false}
          axisLine={false}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            fontSize:   11,
            fontFamily: 'Space Mono, monospace',
            paddingTop: 8,
          }}
          formatter={(value) => (
            <span style={{ color: 'var(--text-secondary)' }}>
              {VITAL_LABELS[value] || value}
            </span>
          )}
        />
        {active.map(key => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={key}
            stroke={VITAL_COLORS[key]}
            strokeWidth={1.8}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            animationDuration={1500}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}