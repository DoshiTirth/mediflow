export function SkeletonBlock({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius: radius,
      background:   'var(--bg-surface3)',
      backgroundImage: `linear-gradient(
        90deg,
        var(--bg-surface3) 0%,
        var(--bg-hover) 50%,
        var(--bg-surface3) 100%
      )`,
      backgroundSize: '200% 100%',
      animation:    'skeleton-shimmer 1.5s ease-in-out infinite',
      flexShrink:   0,
      ...style,
    }}/>
  );
}

export function SkeletonCard({ children, style = {} }) {
  return (
    <div className="card" style={{ ...style }}>
      {children}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <SkeletonCard style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SkeletonBlock width={80} height={10} />
        <SkeletonBlock width={28} height={28} radius={6} />
      </div>
      <SkeletonBlock width={100} height={28} radius={6} />
      <SkeletonBlock width={120} height={10} />
    </SkeletonCard>
  );
}

export function SkeletonPatientCard() {
  return (
    <SkeletonCard style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <SkeletonBlock width={40} height={40} radius={50} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <SkeletonBlock width="55%" height={12} />
        <SkeletonBlock width="40%" height={10} />
      </div>
      <SkeletonBlock width={70} height={22} radius={20} />
    </SkeletonCard>
  );
}

export function SkeletonAnomalyCard() {
  return (
    <SkeletonCard style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <SkeletonBlock width={70} height={22} radius={20} />
          <SkeletonBlock width={120} height={12} />
        </div>
        <SkeletonBlock width={80} height={10} />
      </div>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <SkeletonBlock width={80} height={10} />
          <SkeletonBlock width={50} height={18} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <SkeletonBlock width={80} height={10} />
          <SkeletonBlock width={70} height={18} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <SkeletonBlock width={80} height={28} radius={6} />
        <SkeletonBlock width={100} height={28} radius={6} />
      </div>
    </SkeletonCard>
  );
}

export function SkeletonChartCard() {
  return (
    <SkeletonCard style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <SkeletonBlock width={120} height={14} />
      <SkeletonBlock width="100%" height={280} radius={8} />
    </SkeletonCard>
  );
}

export function SkeletonPatientHeader() {
  return (
    <SkeletonCard style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <SkeletonBlock width={64} height={64} radius={50} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonBlock width="30%" height={20} />
        <SkeletonBlock width="45%" height={12} />
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
            <SkeletonBlock width={60} height={24} radius={6} />
            <SkeletonBlock width={60} height={10} />
          </div>
        ))}
      </div>
      <SkeletonBlock width={140} height={40} radius={10} />
    </SkeletonCard>
  );
}