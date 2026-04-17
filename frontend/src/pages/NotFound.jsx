import { useNavigate } from 'react-router-dom';
import ECGLine from '../components/animations/ECGLine';
import PulseRing from '../components/animations/PulseRing';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      height:         '100%',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      position:       'relative',
      overflow:       'hidden',
      background:     'var(--bg-primary)',
    }}>

      {/* Background decorations */}
      <div style={{ position: 'absolute', top: 40, right: 60, opacity: 0.2, pointerEvents: 'none' }}>
        <PulseRing size={160} color="var(--accent)" rings={3} />
      </div>
      <div style={{ position: 'absolute', bottom: 60, left: 60, opacity: 0.15, pointerEvents: 'none' }}>
        <PulseRing size={120} color="var(--accent3)" rings={2} />
      </div>

      {/* ECG flatline at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        opacity: 0.3, pointerEvents: 'none',
      }}>
        <ECGLine color="var(--accent3)" height={40} speed={10} />
      </div>

      {/* Content */}
      <div style={{
        textAlign:  'center',
        animation:  'fade-up 0.5s ease both',
        position:   'relative',
        zIndex:     1,
      }}>
        {/* 404 number */}
        <div style={{
          fontFamily:   'var(--font-display)',
          fontSize:     120,
          fontWeight:   800,
          color:        'var(--accent)',
          letterSpacing:'-0.05em',
          lineHeight:   1,
          marginBottom: 8,
          opacity:      0.15,
        }}>404</div>

        {/* Icon */}
        <div style={{
          width:          64,
          height:         64,
          borderRadius:   '50%',
          background:     'var(--accent3)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          margin:         '0 auto 1.5rem',
          animation:      'heartbeat 2s ease-in-out infinite',
          marginTop:      -60,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>

        <div style={{
          fontFamily:   'var(--font-display)',
          fontWeight:   700,
          fontSize:     22,
          color:        'var(--text-primary)',
          marginBottom: 8,
          letterSpacing:'-0.02em',
        }}>Page Not Found</div>

        <div style={{
          fontSize:     13,
          color:        'var(--text-muted)',
          fontFamily:   'var(--font-mono)',
          marginBottom: '2rem',
          maxWidth:     320,
          lineHeight:   1.7,
        }}>
          The page you're looking for doesn't exist or has been moved.
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding:      '10px 20px',
              borderRadius: 'var(--radius-md)',
              border:       'none',
              background:   'var(--accent)',
              color:        '#fff',
              fontSize:     13,
              fontFamily:   'var(--font-display)',
              fontWeight:   700,
              cursor:       'pointer',
              transition:   'all 0.2s ease',
            }}
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding:      '10px 20px',
              borderRadius: 'var(--radius-md)',
              border:       '0.5px solid var(--border)',
              background:   'var(--bg-surface)',
              color:        'var(--text-secondary)',
              fontSize:     13,
              fontFamily:   'var(--font-display)',
              fontWeight:   600,
              cursor:       'pointer',
              transition:   'all 0.2s ease',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}