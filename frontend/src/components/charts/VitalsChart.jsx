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

export default function VitalsChart({ data, visibleLines }) {
  const formatted = data.map(row => ({
    ...row,
    date: row.recorded_at ? row.recorded_at.split('T')[0] : '',
  }));

  const active = visibleLines || Object.keys(VITAL_COLORS);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'Space Mono' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--text-muted)', fontFamily: 'Space Mono' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background:   'var(--bg-surface)',
            border:       '0.5px solid var(--border)',
            borderRadius: 10,
            fontSize:     12,
            fontFamily:   'Space Mono',
            boxShadow:    'var(--shadow-elevated)',
          }}
          labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, fontFamily: 'Space Mono', paddingTop: 8 }}
        />
        {active.map(key => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={VITAL_LABELS[key]}
            stroke={VITAL_COLORS[key]}
            strokeWidth={1.8}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            animationDuration={1500}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}