import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import StatCard from '../components/ui/StatCard';
import AnomalyBadge from '../components/ui/AnomalyBadge';
import PulseRing from '../components/animations/PulseRing';
import { getAnomalySummary, getPatients, getVitalsStats } from '../api';
import { SkeletonStatCard, SkeletonCard,} from '../components/ui/Skeleton';

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary,  setSummary]  = useState(null);
  const [patients, setPatients] = useState(null);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      getAnomalySummary(),
      getPatients({ per_page: 5 }),
      getVitalsStats(),
    ]).then(([s, p, v]) => {
      setSummary(s.data);
      setPatients(p.data);
      setStats(v.data);
      setLoading(false);
    });
  }, []);

  const critical = summary?.by_severity?.find(s => s.severity === 'critical')?.count || 0;
  const warning  = summary?.by_severity?.find(s => s.severity === 'warning')?.count  || 0;
  const low      = summary?.by_severity?.find(s => s.severity === 'low')?.count      || 0;

  if (loading) return (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <TopBar title="Dashboard" subtitle="CLINICAL OVERVIEW" />
    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
      <div style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap:                 12,
        marginBottom:        '1.5rem',
      }}>
        {[1,2,3,4].map(i => <SkeletonStatCard key={i} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SkeletonCard style={{ height: 220 }}><div/></SkeletonCard>
        <SkeletonCard style={{ height: 220 }}><div/></SkeletonCard>
        <SkeletonCard style={{ gridColumn: '1 / -1', height: 160 }}><div/></SkeletonCard>
      </div>
    </div>
  </div>
);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Dashboard" subtitle="CLINICAL OVERVIEW" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

        {/* Background pulse rings */}
        <div style={{ position: 'fixed', top: 80, right: 60, zIndex: 0, pointerEvents: 'none', opacity: 0.4 }}>
          <PulseRing size={180} color="var(--accent)" rings={3} />
        </div>
        <div style={{ position: 'fixed', bottom: 60, left: 260, zIndex: 0, pointerEvents: 'none', opacity: 0.25 }}>
          <PulseRing size={120} color="var(--accent2)" rings={2} />
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Stat Cards */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap:                 12,
            marginBottom:        '1.5rem',
          }}>
            <StatCard
              label="Total Patients"
              value={patients?.total || 0}
              sub="Synthea generated"
              color="var(--accent)"
              delay={0}
              icon="17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <StatCard
              label="Total Anomalies"
              value={summary?.total || 0}
              sub="Detected by ensemble"
              color="var(--accent2)"
              delay={0.1}
              icon="12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
            <StatCard
              label="Critical"
              value={critical}
              sub="Require immediate attention"
              color="var(--accent3)"
              delay={0.2}
              icon="4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
            <StatCard
              label="Vitals Readings"
              value={stats?.total_readings || 0}
              sub="Across all patients"
              color="var(--accent)"
              delay={0.3}
              icon="9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </div>

          {/* Main grid */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:                 12,
          }}>

            {/* Anomaly breakdown */}
            <div className="card" style={{ animation: 'fade-up 0.5s ease 0.4s both' }}>
              <div style={{
                fontFamily:    'var(--font-display)',
                fontWeight:    700,
                fontSize:      14,
                marginBottom:  '1rem',
                color:         'var(--text-primary)',
              }}>Anomaly Breakdown</div>

              {[
                { label: 'Critical', count: critical, color: 'var(--accent3)', pct: summary?.total ? (critical/summary.total*100).toFixed(1) : 0 },
                { label: 'Warning',  count: warning,  color: 'var(--accent2)', pct: summary?.total ? (warning/summary.total*100).toFixed(1)  : 0 },
                { label: 'Low',      count: low,      color: 'var(--accent)',  pct: summary?.total ? (low/summary.total*100).toFixed(1)      : 0 },
              ].map((item, i) => (
                <div key={item.label} style={{ marginBottom: 14, animation: `fade-up 0.4s ease ${0.5 + i*0.1}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: item.color }}>
                      {item.count.toLocaleString()} ({item.pct}%)
                    </span>
                  </div>
                  <div style={{
                    height:       6,
                    borderRadius: 3,
                    background:   'var(--bg-surface3)',
                    overflow:     'hidden',
                  }}>
                    <div style={{
                      height:       '100%',
                      width:        `${item.pct}%`,
                      background:   item.color,
                      borderRadius: 3,
                      transition:   'width 1.2s ease',
                    }}/>
                  </div>
                </div>
              ))}

              <div style={{
                marginTop:     '1rem',
                paddingTop:    '1rem',
                borderTop:     '0.5px solid var(--border)',
                display:       'flex',
                justifyContent:'space-between',
                fontSize:      12,
                color:         'var(--text-muted)',
                fontFamily:    'var(--font-mono)',
              }}>
                <span>Reviewed: {summary?.reviewed || 0}</span>
                <span>Unreviewed: {summary?.unreviewed || 0}</span>
              </div>
            </div>

            {/* Vitals averages */}
            <div className="card" style={{ animation: 'fade-up 0.5s ease 0.5s both' }}>
              <div style={{
                fontFamily:   'var(--font-display)',
                fontWeight:   700,
                fontSize:     14,
                marginBottom: '1rem',
                color:        'var(--text-primary)',
              }}>Average Vitals</div>

              {stats && [
                { label: 'Heart Rate',      value: stats.avg_heart_rate?.toFixed(0),      unit: 'bpm',  color: '#E24B4A' },
                { label: 'Systolic BP',     value: stats.avg_systolic_bp?.toFixed(0),     unit: 'mmHg', color: '#EF9F27' },
                { label: 'Diastolic BP',    value: stats.avg_diastolic_bp?.toFixed(0),    unit: 'mmHg', color: '#BA7517' },
                { label: 'Temperature',     value: stats.avg_temperature?.toFixed(1),     unit: '°C',   color: '#3b82f6' },
                { label: 'O₂ Saturation',   value: stats.avg_oxygen_saturation?.toFixed(1), unit: '%', color: '#1D9E75' },
              ].map((item, i) => (
                <div key={item.label} style={{
                  display:        'flex',
                  justifyContent: 'space-between',
                  alignItems:     'center',
                  padding:        '8px 0',
                  borderBottom:   '0.5px solid var(--border-light)',
                  animation:      `fade-up 0.4s ease ${0.6 + i*0.08}s both`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width:        8,
                      height:       8,
                      borderRadius: '50%',
                      background:   item.color,
                      flexShrink:   0,
                    }}/>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize:   13,
                    color:      item.color,
                    fontWeight: 700,
                  }}>
                    {item.value} <span style={{ fontSize: 10, opacity: 0.7 }}>{item.unit}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Recent high-risk patients */}
            <div className="card" style={{
              gridColumn: '1 / -1',
              animation:  'fade-up 0.5s ease 0.6s both',
            }}>
              <div style={{
                display:       'flex',
                justifyContent:'space-between',
                alignItems:    'center',
                marginBottom:  '1rem',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize:   14,
                  color:      'var(--text-primary)',
                }}>High Risk Patients</div>
                <button
                  onClick={() => navigate('/patients')}
                  style={{
                    fontSize:     11,
                    fontFamily:   'var(--font-mono)',
                    color:        'var(--accent)',
                    background:   'var(--accent-dim)',
                    border:       'none',
                    borderRadius: 'var(--radius-sm)',
                    padding:      '4px 10px',
                    cursor:       'pointer',
                  }}
                >View all</button>
              </div>

              <div style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap:                 10,
              }}>
                {patients?.patients?.map((p, i) => {
                  const severity = p.anomaly_count > 10 ? 'critical' : p.anomaly_count > 3 ? 'warning' : 'low';
                  const initials = `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`.toUpperCase();
                  return (
                    <div
                      key={p.patient_id}
                      onClick={() => navigate(`/patients/${p.patient_id}`)}
                      style={{
                        display:       'flex',
                        alignItems:    'center',
                        gap:           10,
                        padding:       '10px 12px',
                        borderRadius:  'var(--radius-md)',
                        background:    'var(--bg-surface2)',
                        border:        '0.5px solid var(--border)',
                        cursor:        'pointer',
                        animation:     `fade-up 0.4s ease ${0.7 + i*0.07}s both`,
                        transition:    'all 0.2s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <div style={{
                        width:          34,
                        height:         34,
                        borderRadius:   '50%',
                        background:     'var(--accent-dim)',
                        border:         '1.5px solid var(--accent)',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        fontFamily:     'var(--font-display)',
                        fontWeight:     700,
                        fontSize:       12,
                        color:          'var(--accent)',
                        flexShrink:     0,
                      }}>{initials}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                          {p.first_name} {p.last_name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          Age {p.age} · {p.city}
                        </div>
                      </div>
                      <AnomalyBadge severity={severity} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}