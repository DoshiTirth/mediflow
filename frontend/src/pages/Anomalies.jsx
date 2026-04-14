import { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import AnomalyBadge from '../components/ui/AnomalyBadge';
import { getAnomalies, explainAnomaly, markReviewed } from '../api';
import { SkeletonAnomalyCard } from '../components/ui/Skeleton';

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [severity,  setSeverity]  = useState('');
  const [loading,   setLoading]   = useState(true);
  const [explaining, setExplaining] = useState(null);
  const [explanations, setExplanations] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    getAnomalies({ page, per_page: 20, severity, search })
      .then(res => {
        setAnomalies(res.data.anomalies);
        setTotal(res.data.total);
        setLoading(false);
      });
  }, [page, severity, search]);

  const handleExplain = async (anomalyId) => {
    if (explanations[anomalyId]) return;
    setExplaining(anomalyId);
    try {
      const res = await explainAnomaly(anomalyId);
      setExplanations(prev => ({ ...prev, [anomalyId]: res.data.explanation }));
    } finally {
      setExplaining(null);
    }
  };

  const handleReview = async (anomalyId) => {
    await markReviewed(anomalyId);
    setAnomalies(prev => prev.map(a =>
      a.anomaly_id === anomalyId ? { ...a, is_reviewed: true } : a
    ));
  };

  const FILTERS = ['', 'critical', 'warning', 'low'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Anomalies" subtitle={`${total.toLocaleString()} DETECTED`} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

        {/* Search */}
        <div style={{ marginBottom: '0.75rem', animation: 'fade-up 0.4s ease both' }}>
          <div style={{ position: 'relative', maxWidth: 360 }}>
            <svg style={{
              position: 'absolute', left: 10, top: '50%',
              transform: 'translateY(-50%)', pointerEvents: 'none',
            }} width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="var(--text-muted)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by patient name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                width:        '100%',
                padding:      '9px 12px 9px 32px',
                borderRadius: 'var(--radius-md)',
                border:       '0.5px solid var(--border)',
                background:   'var(--bg-surface)',
                color:        'var(--text-primary)',
                fontSize:     13,
                fontFamily:   'var(--font-body)',
                outline:      'none',
                transition:   'border-color 0.2s ease',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e  => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{
          display:       'flex',
          gap:           6,
          marginBottom:  '1rem',
          animation:     'fade-up 0.4s ease both',
        }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => { setSeverity(f); setPage(1); }}
              style={{
                padding:      '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border:       '0.5px solid var(--border)',
                background:   severity === f ? 'var(--accent)' : 'var(--bg-surface)',
                color:        severity === f ? '#fff' : 'var(--text-secondary)',
                fontSize:     12,
                fontFamily:   'var(--font-mono)',
                cursor:       'pointer',
                transition:   'all 0.2s ease',
                fontWeight:   severity === f ? 600 : 400,
                textTransform:'capitalize',
              }}
            >
              {f || 'All'}
            </button>
          ))}
        </div>

        {/* Anomaly list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => <SkeletonAnomalyCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {anomalies
              .filter(a => a.affected_metric && a.affected_metric !== 'unknown')
              .map((a, i) => (
              <div
                key={a.anomaly_id}
                className="card"
                style={{
                  animation:   `fade-up 0.4s ease ${i * 0.03}s both`,
                  borderLeft:  a.severity === 'critical' ? '3px solid var(--accent3)'
                             : a.severity === 'warning'  ? '3px solid var(--accent2)'
                             : '3px solid var(--accent)',
                  opacity:     a.is_reviewed ? 0.6 : 1,
                }}
              >
                {/* Header row */}
                <div style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  marginBottom:   10,
                  flexWrap:       'wrap',
                  gap:            8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AnomalyBadge severity={a.severity} />
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize:   13,
                      color:      'var(--text-primary)',
                    }}>
                      {a.first_name} {a.last_name}
                    </span>
                    <span style={{
                      fontSize:   11,
                      fontFamily: 'var(--font-mono)',
                      color:      'var(--text-muted)',
                    }}>
                      {a.affected_metric?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {a.is_reviewed && (
                      <span style={{
                        fontSize:   11,
                        fontFamily: 'var(--font-mono)',
                        color:      'var(--accent)',
                        background: 'var(--accent-dim)',
                        padding:    '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                      }}>Reviewed</span>
                    )}
                    <span style={{
                      fontSize:   11,
                      fontFamily: 'var(--font-mono)',
                      color:      'var(--text-faint)',
                    }}>
                      {a.detected_at?.split('T')[0]}
                    </span>
                  </div>
                </div>

                {/* Metric value */}
                <div style={{
                  display:      'flex',
                  gap:          20,
                  marginBottom: 10,
                  flexWrap:     'wrap',
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                      METRIC VALUE
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize:   16,
                      color:      a.severity === 'critical' ? 'var(--accent3)'
                                : a.severity === 'warning'  ? 'var(--accent2)'
                                : 'var(--accent)',
                    }}>
                      {a.metric_value?.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 2 }}>
                      ANOMALY SCORE
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize:   16,
                      color:      'var(--text-secondary)',
                    }}>
                      {a.anomaly_score?.toFixed(4)}
                    </div>
                  </div>
                </div>

                {/* AI Explanation */}
                {explanations[a.anomaly_id] && (
                  <div style={{
                    background:   'var(--bg-surface2)',
                    borderRadius: 'var(--radius-md)',
                    padding:      '10px 12px',
                    marginBottom: 10,
                    borderLeft:   '2px solid var(--accent)',
                    fontSize:     13,
                    color:        'var(--text-secondary)',
                    lineHeight:   1.7,
                    animation:    'fade-up 0.4s ease both',
                  }}>
                    <div style={{
                      fontSize:     10,
                      fontFamily:   'var(--font-mono)',
                      color:        'var(--accent)',
                      marginBottom: 6,
                      letterSpacing:'0.06em',
                    }}>CLAUDE AI EXPLANATION</div>
                    {explanations[a.anomaly_id]}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleExplain(a.anomaly_id)}
                    disabled={explaining === a.anomaly_id}
                    style={{
                      padding:      '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border:       '0.5px solid var(--accent)',
                      background:   'var(--accent-dim)',
                      color:        'var(--accent)',
                      fontSize:     11,
                      fontFamily:   'var(--font-mono)',
                      cursor:       explaining === a.anomaly_id ? 'wait' : 'pointer',
                      transition:   'all 0.2s ease',
                    }}
                  >
                    {explaining === a.anomaly_id ? 'Generating...' : explanations[a.anomaly_id] ? 'Regenerate' : 'AI Explain'}
                  </button>

                  {!a.is_reviewed && (
                    <button
                      onClick={() => handleReview(a.anomaly_id)}
                      style={{
                        padding:      '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border:       '0.5px solid var(--border)',
                        background:   'var(--bg-surface2)',
                        color:        'var(--text-secondary)',
                        fontSize:     11,
                        fontFamily:   'var(--font-mono)',
                        cursor:       'pointer',
                        transition:   'all 0.2s ease',
                      }}
                    >
                      Mark Reviewed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div style={{
          display:        'flex',
          justifyContent: 'center',
          alignItems:     'center',
          gap:            8,
          marginTop:      '1.5rem',
          paddingBottom:  '1rem',
        }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              padding:      '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border:       '0.5px solid var(--border)',
              background:   'var(--bg-surface)',
              color:        page === 1 ? 'var(--text-faint)' : 'var(--text-secondary)',
              fontSize:     12,
              fontFamily:   'var(--font-mono)',
              cursor:       page === 1 ? 'not-allowed' : 'pointer',
            }}
          >Prev</button>

          <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Page {page} of {Math.ceil(total / 20)}
          </span>

          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
            style={{
              padding:      '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border:       '0.5px solid var(--border)',
              background:   'var(--bg-surface)',
              color:        page >= Math.ceil(total / 20) ? 'var(--text-faint)' : 'var(--text-secondary)',
              fontSize:     12,
              fontFamily:   'var(--font-mono)',
              cursor:       page >= Math.ceil(total / 20) ? 'not-allowed' : 'pointer',
            }}
          >Next</button>
        </div>
      </div>
    </div>
  );
}