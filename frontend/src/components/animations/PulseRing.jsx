export default function PulseRing({
  size   = 120,
  color  = '#1D9E75',
  rings  = 3,
  style  = {}
}) {
  return (
    <div style={{
      position: 'relative',
      width:    size,
      height:   size,
      ...style
    }}>
      {Array.from({ length: rings }).map((_, i) => (
        <div
          key={i}
          style={{
            position:     'absolute',
            inset:        0,
            borderRadius: '50%',
            border:       `1px solid ${color}`,
            opacity:      0,
            animation:    `pulse-ring 3s ease-out ${i * 1}s infinite`,
          }}
        />
      ))}
      <div style={{
        position:        'absolute',
        inset:           '35%',
        borderRadius:    '50%',
        background:      color,
        opacity:         0.25,
        animation:       `heartbeat 2s ease-in-out infinite`,
      }} />
    </div>
  );
}