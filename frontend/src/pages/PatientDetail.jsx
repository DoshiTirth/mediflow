import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import VitalsChart from '../components/charts/VitalsChart';
import AnomalyBadge from '../components/ui/AnomalyBadge';
import { getPatient, getPatientVitals, getAnomalies, explainAnomaly, getPatientSummary, markReviewed } from '../api';

export default function PatientDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [patient,      setPatient]      = useState(null);
  const [vitals,       setVitals]       = useState([]);
  const [anomalies,    setAnomalies]    = useState([]);
  const [summary,      setSummary]      = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [explanations, setExplanations] = useState({});
  const [explaining,   setExplaining]   = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      getPatient(id),
      getPatientVitals(id, { limit: 100 }),
      getAnomalies({ patient_id: id, per_page: 50 }),
    ]).then(([p, v, a]) => {
      setPatient(p.data);
      setVitals(v.data.vitals);
      setAnomalies(a.data.anomalies);
      setLoading(false);
    });
  }, [id]);

  const handleSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await getPatientSummary(id);
      setSummary(res.data.summary);
    } finally {
      setLoadingSummary(false);
    }
  };

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

  if (loading) return (
    <div style={{ padding: '2rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 }}>
      Loading patient data...
    </div>
  );

  const initials = `${patient?.first_name?.[0] || ''}${patient?.last_name?.[0] || ''}`.toUpperCase();
  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
  const overallSeverity = criticalCount > 0 ? 'critical'
    : anomalies.filter(a => a.severity === 'warning').length > 0 ? 'warning' : 'low';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar
        title={`${patient?.first_name} ${patient?.last_name}`}
        subtitle="PATIENT DETAIL"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

        {/* Back button */}
        <button
          onClick={() => navigate('/patients')}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          6,
            marginBottom: '1rem',
            background:   'none',
            border:       'none',
            color:        'var(--text-muted)',
            fontSize:     12,
            fontFamily:   'var(--font-mono)',
            cursor:       'pointer',
            padding:      0,
            animation:    'fade-up 0.3s ease both',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to patients
        </button>

        {/* Patient header card */}
        <div className="card" style={{
          marginBottom: '1rem',
          animation:    'fade-up 0.4s ease 0.1s both',
          display:      'flex',
          alignItems:   'center',
          gap:          16,
          flexWrap:     'wrap',
        }}>
          {/* Avatar */}
          <div style={{
            width:          64,
            height:         64,
            borderRadius:   '50%',
            background:     'var(--accent-dim)',
            border:         `2px solid ${overallSeverity === 'critical' ? 'var(--accent3)' : 'var(--accent)'}`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontFamily:     'var(--font-display)',
            fontWeight:     800,
            fontSize:       22,
            color:          overallSeverity === 'critical' ? 'var(--accent3)' : 'var(--accent)',
            flexShrink:     0,
            animation:      overallSeverity === 'critical' ? 'heartbeat 2s ease-in-out infinite' : 'none',
          }}>{initials}</div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily:   'var(--font-display)',
              fontWeight:   700,
              fontSize:     20,
              color:        'var(--text-primary)',
              letterSpacing:'-0.02em',
              marginBottom: 4,
            }}>
              {patient?.first_name} {patient?.last_name}
            </div>
            <div style={{
              display:    'flex',
              gap:        16,
              flexWrap:   'wrap',
              fontSize:   12,
              fontFamily: 'var(--font-mono)',
              color:      'var(--text-muted)',
            }}>
              <span>Age {patient?.age}</span>
              <span>{patient?.gender === 'M' ? 'Male' : 'Female'}</span>
              <span>{patient?.city}, {patient?.state}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)' }}>
                ID: {patient?.patient_id?.slice(0, 8)}...
              </span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Anomalies', value: anomalies.length, color: 'var(--accent2)' },
              { label: 'Critical',        value: criticalCount,    color: 'var(--accent3)' },
              { label: 'Vitals Records',  value: vitals.length,    color: 'var(--accent)'  },
            ].map(stat => (
              <div key={stat.label} style={{
                textAlign: 'center',
                padding:   '8px 14px',
                borderRadius: 'var(--radius-md)',
                background:   'var(--bg-surface2)',
                border:       '0.5px solid var(--border)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize:   20,
                  color:      stat.color,
                }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* AI Summary button */}
          <button
            onClick={handleSummary}
            disabled={loadingSummary}
            style={{
              padding:      '10px 16px',
              borderRadius: 'var(--radius-md)',
              border:       '0.5px solid var(--accent)',
              background:   'var(--accent-dim)',
              color:        'var(--accent)',
              fontSize:     12,
              fontFamily:   'var(--font-mono)',
              cursor:       loadingSummary ? 'wait' : 'pointer',
              fontWeight:   600,
              letterSpacing:'0.04em',
              transition:   'all 0.2s ease',
              flexShrink:   0,
            }}
          >
            {loadingSummary ? 'Generating...' : 'AI Patient Summary'}
          </button>
        </div>

        {/* AI Summary output */}
        {summary && (
          <div className="card" style={{
            marginBottom: '1rem',
            borderLeft:   '3px solid var(--accent)',
            animation:    'fade-up 0.4s ease both',
          }}>
            <div style={{
              fontSize:     10,
              fontFamily:   'var(--font-mono)',
              color:        'var(--accent)',
              marginBottom: 8,
              letterSpacing:'0.08em',
            }}>CLAUDE AI — PATIENT HEALTH SUMMARY</div>
            <p style={{
              fontSize:   13,
              color:      'var(--text-secondary)',
              lineHeight: 1.8,
            }}>
              {summary.replace(/\*\*/g, '')}
            </p>
          </div>
        )}

        {/* Vitals chart */}
        {vitals.length > 0 && (
          <div className="card" style={{
            marginBottom: '1rem',
            animation:    'fade-up 0.4s ease 0.2s both',
          }}>
            <div style={{
              fontFamily:   'var(--font-display)',
              fontWeight:   700,
              fontSize:     14,
              color:        'var(--text-primary)',
              marginBottom: '1rem',
            }}>Vitals History</div>
            <VitalsChart data={vitals} />
          </div>
        )}

        {/* Anomalies list */}
        <div className="card" style={{ animation: 'fade-up 0.4s ease 0.3s both' }}>
          <div style={{
            fontFamily:   'var(--font-display)',
            fontWeight:   700,
            fontSize:     14,
            color:        'var(--text-primary)',
            marginBottom: '1rem',
          }}>Detected Anomalies ({anomalies.length})</div>
          

          {anomalies.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No anomalies detected.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {anomalies
              .filter(a => a.affected_metric && a.affected_metric !== 'unknown')
              .map((a, i) => (
                <div
                  key={a.anomaly_id}
                  style={{
                    padding:      '12px',
                    borderRadius: 'var(--radius-md)',
                    background:   'var(--bg-surface2)',
                    border:       '0.5px solid var(--border)',
                    borderLeft:   a.severity === 'critical' ? '3px solid var(--accent3)'
                                : a.severity === 'warning'  ? '3px solid var(--accent2)'
                                : '3px solid var(--accent)',
                    animation:    `fade-up 0.4s ease ${i * 0.04}s both`,
                    opacity:      a.is_reviewed ? 0.6 : 1,
                  }}
                >
                  <div style={{
                    display:        'flex',
                    justifyContent: 'space-between',
                    alignItems:     'center',
                    marginBottom:   8,
                    flexWrap:       'wrap',
                    gap:            6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AnomalyBadge severity={a.severity} />
                      <span style={{
                        fontSize:   12,
                        fontFamily: 'var(--font-mono)',
                        color:      'var(--text-secondary)',
                      }}>
                        {a.affected_metric?.replace(/_/g, ' ').toUpperCase()}
                        {' — '}
                        <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                          {a.metric_value?.toFixed(1)}
                        </span>
                      </span>
                    </div>
                    <span style={{
                      fontSize:   11,
                      fontFamily: 'var(--font-mono)',
                      color:      'var(--text-faint)',
                    }}>
                      {a.detected_at?.split('T')[0]}
                    </span>
                  </div>

                  {/* AI explanation output */}
                  {explanations[a.anomaly_id] && (
                    <div style={{
                      background:   'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      padding:      '8px 10px',
                      marginBottom: 8,
                      fontSize:     12,
                      color:        'var(--text-secondary)',
                      lineHeight:   1.7,
                      borderLeft:   '2px solid var(--accent)',
                      animation:    'fade-up 0.3s ease both',
                    }}>
                      {explanations[a.anomaly_id]}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleExplain(a.anomaly_id)}
                      disabled={explaining === a.anomaly_id}
                      style={{
                        padding:      '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border:       '0.5px solid var(--accent)',
                        background:   'var(--accent-dim)',
                        color:        'var(--accent)',
                        fontSize:     10,
                        fontFamily:   'var(--font-mono)',
                        cursor:       explaining === a.anomaly_id ? 'wait' : 'pointer',
                      }}
                    >
                      {explaining === a.anomaly_id ? 'Generating...' : explanations[a.anomaly_id] ? 'Regenerate' : 'AI Explain'}
                    </button>
                    {!a.is_reviewed && (
                      <button
                        onClick={() => handleReview(a.anomaly_id)}
                        style={{
                          padding:      '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border:       '0.5px solid var(--border)',
                          background:   'transparent',
                          color:        'var(--text-muted)',
                          fontSize:     10,
                          fontFamily:   'var(--font-mono)',
                          cursor:       'pointer',
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
        </div>
      </div>
    </div>
  );
}