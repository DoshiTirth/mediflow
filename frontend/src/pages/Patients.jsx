import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/layout/TopBar';
import PatientCard from '../components/ui/PatientCard';
import { getPatients } from '../api';
import { SkeletonPatientCard } from '../components/ui/Skeleton';

export default function Patients() {
  const navigate          = useNavigate();
  const [patients,  setPatients]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    getPatients({ page, per_page: 20, search })
      .then(res => {
        setPatients(res.data.patients);
        setTotal(res.data.total);
        setLoading(false);
      });
  }, [page, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Patients" subtitle={`${total.toLocaleString()} RECORDS`} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

        {/* Search */}
        <div style={{ marginBottom: '1rem', animation: 'fade-up 0.4s ease both' }}>
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
              placeholder="Search patients..."
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
              onFocus={e  => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e   => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Patient list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1,2,3,4,5,6,7,8].map(i => <SkeletonPatientCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {patients.map((p, i) => (
              <PatientCard key={p.patient_id} patient={p} delay={i * 0.03} />
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