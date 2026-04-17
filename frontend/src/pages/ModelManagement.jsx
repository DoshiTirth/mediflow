import { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import { retrainModel } from '../api';
import { useAuth } from '../context/AuthContext';

export default function ModelManagement() {
  const { user }            = useAuth();
  const [status,   setStatus]   = useState(null);
  const [output,   setOutput]   = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleRetrain = async () => {
    setLoading(true);
    setStatus(null);
    setOutput('');
    try {
      const res = await retrainModel();
      setStatus('success');
      setOutput(res.data.output);
    } catch (err) {
      setStatus('error');
      setOutput(err.response?.data?.message || 'Retraining failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
  
      {/* Full screen loading overlay */}
      {loading && (
        <div style={{
          position:       'fixed',
          inset:          0,
          background:     'rgba(10, 20, 15, 0.85)',
          zIndex:         999,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            24,
          backdropFilter: 'blur(6px)',
        }}>
      
          {/* Pulse rings behind ECG */}
          <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position:     'absolute',
                width:        80 + i * 40,
                height:       80 + i * 40,
                borderRadius: '50%',
                border:       '1px solid #1D9E75',
                opacity:      0,
                animation:    `pulse-ring 3s ease-out ${i * 1}s infinite`,
              }}/>
            ))}
      
            {/* Center heart icon */}
            <div style={{
              width:          64,
              height:         64,
              borderRadius:   '50%',
              background:     'rgba(29,158,117,0.15)',
              border:         '1.5px solid #1D9E75',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              animation:      'heartbeat 1.5s ease-in-out infinite',
              zIndex:         1,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
          </div>
        
          {/* ECG line */}
          <div style={{
            width:        320,
            overflow:     'hidden',
            borderRadius: 4,
            background:   'rgba(29,158,117,0.06)',
            border:       '0.5px solid rgba(29,158,117,0.2)',
            padding:      '8px 0',
          }}>
            <svg viewBox="0 0 320 40" style={{ width: 320, height: 40, display: 'block' }}>
              <polyline
                points="0,20 30,20 45,20 55,4 60,36 65,12 72,20 100,20 115,20 125,4 130,36 135,12 142,20 170,20 185,20 195,4 200,36 205,12 212,20 240,20 255,20 265,4 270,36 275,12 282,20 320,20"
                fill="none"
                stroke="#1D9E75"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 800,
                  strokeDashoffset: 800,
                  animation: 'draw-line 2s linear infinite',
                }}
              />
            </svg>
          </div>
            
          {/* Title */}
          <div style={{
            fontFamily:   'var(--font-display)',
            fontWeight:   700,
            fontSize:     20,
            color:        '#ffffff',
            letterSpacing:'-0.02em',
            textAlign:    'center',
          }}>Retraining Ensemble Models</div>
      
          {/* Animated status messages */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize:   12,
            color:      'rgba(255,255,255,0.5)',
            textAlign:  'center',
            lineHeight: 1.8,
          }}>
            Training Isolation Forest · LOF · One-Class SVM
            <br/>
            <span style={{ color: 'rgba(29,158,117,0.8)' }}>Please do not close this window</span>
          </div>
      
          {/* Progress bar */}
          <div style={{
            width:        300,
            height:       3,
            borderRadius: 2,
            background:   'rgba(255,255,255,0.08)',
            overflow:     'hidden',
          }}>
            <div style={{
              height:       '100%',
              background:   'linear-gradient(90deg, transparent, #1D9E75, transparent)',
              borderRadius: 2,
              animation:    'progress-indeterminate 2s ease-in-out infinite',
            }}/>
          </div>
        
          {/* Step indicators */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            {[
              'Loading Data',
              'Scaling Features',
              'Training Models',
              'Saving',
            ].map((step, i) => (
              <div key={step} style={{
                display:    'flex',
                alignItems: 'center',
                gap:        6,
                animation:  `fade-up 0.5s ease ${i * 0.3}s both`,
              }}>
                <div style={{
                  width:        6,
                  height:       6,
                  borderRadius: '50%',
                  background:   '#1D9E75',
                  animation:    `heartbeat 1.5s ease-in-out ${i * 0.4}s infinite`,
                }}/>
                <span style={{
                  fontSize:   10,
                  fontFamily: 'var(--font-mono)',
                  color:      'rgba(255,255,255,0.4)',
                }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
  
      <TopBar title="Model Management" subtitle="ML OPERATIONS" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

        {/* Model info cards */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap:                 12,
          marginBottom:        '1.5rem',
        }}>
          {[
            { label: 'Isolation Forest',   detail: 'n_estimators=200, contamination=0.05', color: 'var(--accent)'  },
            { label: 'Local Outlier Factor',detail: 'n_neighbors=20, contamination=0.05',   color: 'var(--accent2)' },
            { label: 'One-Class SVM',       detail: 'kernel=rbf, nu=0.05',                  color: 'var(--accent3)' },
          ].map((model, i) => (
            <div key={model.label} className="card" style={{
              borderLeft:  `3px solid ${model.color}`,
              animation:   `fade-up 0.4s ease ${i * 0.1}s both`,
            }}>
              <div style={{
                fontFamily:   'var(--font-display)',
                fontWeight:   700,
                fontSize:     13,
                color:        'var(--text-primary)',
                marginBottom: 6,
              }}>{model.label}</div>
              <div style={{
                fontSize:   11,
                fontFamily: 'var(--font-mono)',
                color:      'var(--text-muted)',
              }}>{model.detail}</div>
              <div style={{
                marginTop:    8,
                fontSize:     11,
                fontFamily:   'var(--font-mono)',
                color:        model.color,
                background:   `${model.color}18`,
                padding:      '2px 8px',
                borderRadius: 'var(--radius-sm)',
                display:      'inline-block',
              }}>ACTIVE</div>
            </div>
          ))}
        </div>

        {/* Voting system info */}
        <div className="card" style={{
          marginBottom: '1.5rem',
          animation:    'fade-up 0.4s ease 0.3s both',
          borderLeft:   '3px solid var(--accent)',
        }}>
          <div style={{
            fontFamily:   'var(--font-display)',
            fontWeight:   700,
            fontSize:     14,
            color:        'var(--text-primary)',
            marginBottom: 8,
          }}>Ensemble Voting System</div>
          <div style={{
            fontSize:   13,
            color:      'var(--text-secondary)',
            lineHeight: 1.7,
          }}>
            An anomaly is flagged when <span style={{ color: 'var(--accent)', fontWeight: 600 }}>2 out of 3 models</span> agree.
            This majority voting approach reduces false positives while maintaining high sensitivity
            for genuine clinical anomalies. Each model specializes in different anomaly patterns —
            global outliers, local density deviations, and boundary cases respectively.
          </div>
        </div>

        {/* Retrain section */}
        <div className="card" style={{ animation: 'fade-up 0.4s ease 0.4s both' }}>
          <div style={{
            fontFamily:   'var(--font-display)',
            fontWeight:   700,
            fontSize:     14,
            color:        'var(--text-primary)',
            marginBottom: 6,
          }}>Retrain Models</div>
          <div style={{
            fontSize:     12,
            color:        'var(--text-muted)',
            marginBottom: '1rem',
            fontFamily:   'var(--font-mono)',
          }}>
            Retrains all three models on the latest vitals data from SQL Server.
            This process takes approximately 60-90 seconds.
            {user?.role !== 'admin' && (
              <span style={{ color: 'var(--accent3)', display: 'block', marginTop: 4 }}>
                Admin access required to retrain models.
              </span>
            )}
          </div>

          {user?.role === 'admin' && (
            <button
              onClick={handleRetrain}
              disabled={loading}
              style={{
                padding:      '10px 20px',
                borderRadius: 'var(--radius-md)',
                border:       'none',
                background:   loading ? 'var(--accent-dim)' : 'var(--accent)',
                color:        loading ? 'var(--accent)' : '#fff',
                fontSize:     13,
                fontFamily:   'var(--font-display)',
                fontWeight:   700,
                cursor:       loading ? 'wait' : 'pointer',
                transition:   'all 0.2s ease',
                marginBottom: '1rem',
              }}
            >
              {loading ? 'Retraining — please wait...' : 'Retrain Ensemble Models'}
            </button>
          )}

          {/* Status output */}
          {status && (
            <div style={{
              padding:      '12px 14px',
              borderRadius: 'var(--radius-md)',
              background:   status === 'success' ? 'rgba(29,158,117,0.08)' : 'rgba(226,75,74,0.08)',
              border:       `0.5px solid ${status === 'success' ? 'var(--accent)' : 'var(--accent3)'}`,
              animation:    'fade-up 0.4s ease both',
            }}>
              <div style={{
                fontSize:     11,
                fontFamily:   'var(--font-mono)',
                color:        status === 'success' ? 'var(--accent)' : 'var(--accent3)',
                marginBottom: 8,
                letterSpacing:'0.06em',
              }}>
                {status === 'success' ? 'RETRAIN COMPLETE' : 'RETRAIN FAILED'}
              </div>
              <pre style={{
                fontSize:   11,
                fontFamily: 'var(--font-mono)',
                color:      'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                margin:     0,
                lineHeight: 1.6,
              }}>{output}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}