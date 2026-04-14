import { useEffect, useRef } from 'react';

export default function StatCard({ label, value, sub, color = 'var(--accent)', delay = 0, icon }) {
  const valueRef = useRef(null);

  useEffect(() => {
    const el = valueRef.current;
    if (!el || typeof value !== 'number') return;
    let start     = 0;
    const end     = value;
    const duration = 1200;
    const step    = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      el.textContent = Math.floor(progress * end).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);

  return (
    <div className="card" style={{
      animation:  `fade-up 0.5s ease ${delay}s both`,
      borderLeft: `3px solid ${color}`,
      display:    'flex',
      flexDirection: 'column',
      gap:        8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize:   11,
          fontFamily: 'var(--font-mono)',
          color:      'var(--text-muted)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>{label}</span>
        {icon && (
          <div style={{
            width:        30,
            height:       30,
            borderRadius: 'var(--radius-sm)',
            background:   `${color}18`,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke={color} strokeWidth="1.8" strokeLinecap="round">
              <path d={icon}/>
            </svg>
          </div>
        )}
      </div>
      <div
        ref={valueRef}
        style={{
          fontFamily:   'var(--font-display)',
          fontSize:     28,
          fontWeight:   700,
          color:        'var(--text-primary)',
          letterSpacing:'-0.03em',
          lineHeight:   1,
        }}
      >
        {typeof value === 'number' ? '0' : value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
      )}
    </div>
  );
}