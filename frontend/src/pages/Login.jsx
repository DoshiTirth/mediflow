import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ECGLine from '../components/animations/ECGLine';
import PulseRing from '../components/animations/PulseRing';

export default function Login() {
  const navigate           = useNavigate();
  const { login }          = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:      '100vh',
      background:     'var(--bg-primary)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      position:       'relative',
      overflow:       'hidden',
    }}>

      {/* Background decorations */}
      <div style={{ position: 'absolute', top: 40, right: 80, opacity: 0.3, pointerEvents: 'none' }}>
        <PulseRing size={200} color="var(--accent)" rings={3} />
      </div>
      <div style={{ position: 'absolute', bottom: 60, left: 80, opacity: 0.2, pointerEvents: 'none' }}>
        <PulseRing size={150} color="var(--accent2)" rings={2} />
      </div>

      {/* ECG strip top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        opacity: 0.4, pointerEvents: 'none',
      }}>
        <ECGLine color="var(--accent)" height={48} speed={6} />
      </div>

      {/* ECG strip bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        opacity: 0.4, pointerEvents: 'none',
      }}>
        <ECGLine color="var(--accent)" height={48} speed={8} />
      </div>

      {/* Login card */}
      <div style={{
        width:        '100%',
        maxWidth:     400,
        background:   'var(--bg-surface)',
        border:       '0.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding:      '2.5rem',
        boxShadow:    'var(--shadow-elevated)',
        animation:    'fade-up 0.5s ease both',
        position:     'relative',
        zIndex:       1,
      }}>

        {/* Logo */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          gap:            12,
          marginBottom:   '2rem',
          justifyContent: 'center',
        }}>
          <div style={{
            width:          44,
            height:         44,
            borderRadius:   12,
            background:     'var(--accent)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            animation:      'heartbeat 2s ease-in-out infinite',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily:   'var(--font-display)',
              fontWeight:   800,
              fontSize:     22,
              color:        'var(--text-primary)',
              letterSpacing:'-0.03em',
            }}>MediFlow</div>
            <div style={{
              fontSize:     10,
              color:        'var(--accent)',
              fontFamily:   'var(--font-mono)',
              letterSpacing:'0.1em',
            }}>CLINICAL AI PLATFORM</div>
          </div>
        </div>

        <div style={{
          fontSize:     13,
          color:        'var(--text-secondary)',
          textAlign:    'center',
          marginBottom: '1.5rem',
        }}>Sign in to access the clinical dashboard</div>

        {/* Error */}
        {error && (
          <div style={{
            background:   'rgba(226,75,74,0.1)',
            border:       '0.5px solid var(--accent3)',
            borderRadius: 'var(--radius-md)',
            padding:      '10px 14px',
            fontSize:     12,
            color:        'var(--accent3)',
            marginBottom: '1rem',
            fontFamily:   'var(--font-mono)',
            animation:    'fade-up 0.3s ease both',
          }}>
            {error}
          </div>
        )}

        {/* Username */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display:      'block',
            fontSize:     11,
            fontFamily:   'var(--font-mono)',
            color:        'var(--text-muted)',
            marginBottom: 6,
            letterSpacing:'0.06em',
          }}>USERNAME</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter username"
            style={{
              width:        '100%',
              padding:      '10px 14px',
              borderRadius: 'var(--radius-md)',
              border:       '0.5px solid var(--border)',
              background:   'var(--bg-surface2)',
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

        {/* Password */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display:      'block',
            fontSize:     11,
            fontFamily:   'var(--font-mono)',
            color:        'var(--text-muted)',
            marginBottom: 6,
            letterSpacing:'0.06em',
          }}>PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter password"
            style={{
              width:        '100%',
              padding:      '10px 14px',
              borderRadius: 'var(--radius-md)',
              border:       '0.5px solid var(--border)',
              background:   'var(--bg-surface2)',
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

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width:         '100%',
            padding:       '11px',
            borderRadius:  'var(--radius-md)',
            border:        'none',
            background:    loading ? 'var(--accent-dim)' : 'var(--accent)',
            color:         loading ? 'var(--accent)' : '#fff',
            fontSize:      13,
            fontFamily:    'var(--font-display)',
            fontWeight:    700,
            cursor:        loading ? 'wait' : 'pointer',
            transition:    'all 0.2s ease',
            letterSpacing: '0.02em',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Demo credentials hint */}
        <div style={{
          marginTop:    '1.5rem',
          padding:      '10px 14px',
          background:   'var(--bg-surface2)',
          borderRadius: 'var(--radius-md)',
          border:       '0.5px solid var(--border)',
        }}>
          <div style={{
            fontSize:     10,
            fontFamily:   'var(--font-mono)',
            color:        'var(--text-muted)',
            marginBottom: 6,
            letterSpacing:'0.06em',
          }}>DEMO CREDENTIALS</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            <div>admin / MediFlow@2024</div>
            <div>drsmith / Doctor@2024</div>
            <div>nurse01 / Nurse@2024</div>
          </div>
        </div>
      </div>
    </div>
  );
}