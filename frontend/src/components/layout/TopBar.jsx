import ECGLine from '../animations/ECGLine';

export default function TopBar({ title, subtitle }) {
  return (
    <header style={{
      height:     'var(--topbar-height)',
      background: 'var(--bg-surface)',
      borderBottom:'0.5px solid var(--border)',
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding:    '0 1.5rem',
      position:   'sticky',
      top:        0,
      zIndex:     50,
    }}>
      <div>
        <h1 style={{
          fontFamily:   'var(--font-display)',
          fontSize:     17,
          fontWeight:   700,
          color:        'var(--text-primary)',
          letterSpacing:'-0.02em',
        }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* ECG animation strip */}
      <div style={{ width: 200, opacity: 0.7 }}>
        <ECGLine color="var(--accent)" height={32} speed={6} />
      </div>

      {/* Live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{
          width:        7,
          height:       7,
          borderRadius: '50%',
          background:   'var(--accent)',
          animation:    'heartbeat 2s ease-in-out infinite',
        }}/>
        <span style={{
          fontSize:     11,
          fontFamily:   'var(--font-mono)',
          color:        'var(--accent)',
          letterSpacing:'0.06em',
        }}>LIVE</span>
      </div>
    </header>
  );
}