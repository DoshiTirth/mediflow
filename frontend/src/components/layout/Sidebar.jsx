import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { path: '/',          label: 'Dashboard',  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/patients',  label: 'Patients',   icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { path: '/anomalies', label: 'Anomalies',  icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
];

export default function Sidebar({ theme, onThemeToggle, user, onLogout }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <aside style={{
      width:      'var(--sidebar-width)',
      height:     '100vh',
      background: 'var(--bg-surface)',
      borderRight:'0.5px solid var(--border)',
      display:    'flex',
      flexDirection: 'column',
      position:   'fixed',
      left:       0,
      top:        0,
      zIndex:     100,
      flexShrink: 0,
    }}>

      {/* Logo */}
      <div style={{
        padding:      '1.5rem 1.25rem 1rem',
        borderBottom: '0.5px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width:        36,
            height:       36,
            borderRadius: 10,
            background:   'var(--accent)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily:  'var(--font-display)',
              fontWeight:  700,
              fontSize:    16,
              color:       'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>MediFlow</div>
            <div style={{
              fontSize:  10,
              color:     'var(--accent)',
              fontFamily:'var(--font-mono)',
              letterSpacing: '0.08em',
            }}>CLINICAL AI</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map((item, i) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={() => setActiveIndex(i)}
            style={({ isActive }) => ({
              display:       'flex',
              alignItems:    'center',
              gap:           10,
              padding:       '9px 12px',
              borderRadius:  'var(--radius-md)',
              textDecoration:'none',
              fontWeight:    isActive ? 600 : 400,
              fontSize:      13,
              color:         isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background:    isActive ? 'var(--accent-dim)' : 'transparent',
              transition:    'all 0.2s ease',
              animation:     `slide-in-left 0.3s ease ${i * 0.08}s both`,
            })}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d={item.icon}/>
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div style={{
        padding:    '0.75rem',
        borderTop:  '0.5px solid var(--border)',
      }}>
        <div style={{
          display:       'flex',
          alignItems:    'center',
          gap:           8,
          padding:       '8px 10px',
          borderRadius:  'var(--radius-md)',
          background:    'var(--bg-surface2)',
          border:        '0.5px solid var(--border)',
          marginBottom:  6,
        }}>
          <div style={{
            width:          28,
            height:         28,
            borderRadius:   '50%',
            background:     'var(--accent-dim)',
            border:         '1.5px solid var(--accent)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       11,
            fontWeight:     700,
            color:          'var(--accent)',
            fontFamily:     'var(--font-display)',
            flexShrink:     0,
          }}>
            {user?.name?.[0] || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize:     12,
              fontWeight:   500,
              color:        'var(--text-primary)',
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
            }}>{user?.name}</div>
            <div style={{
              fontSize:   10,
              color:      'var(--accent)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
            }}>{user?.role}</div>
          </div>
        </div>
        
        {/* Theme toggle */}
        <button
          onClick={onThemeToggle}
          style={{
            width:         '100%',
            display:       'flex',
            alignItems:    'center',
            gap:           8,
            padding:       '7px 10px',
            borderRadius:  'var(--radius-md)',
            border:        '0.5px solid var(--border)',
            background:    'transparent',
            color:         'var(--text-secondary)',
            fontSize:      12,
            cursor:        'pointer',
            fontFamily:    'var(--font-body)',
            marginBottom:  4,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {theme === 'dark'
              ? <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              : <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            }
          </svg>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        
        {/* Logout */}
        <button
          onClick={onLogout}
          style={{
            width:      '100%',
            display:    'flex',
            alignItems: 'center',
            gap:        8,
            padding:    '7px 10px',
            borderRadius:'var(--radius-md)',
            border:     '0.5px solid var(--border)',
            background: 'transparent',
            color:      'var(--accent3)',
            fontSize:   12,
            cursor:     'pointer',
            fontFamily: 'var(--font-body)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}