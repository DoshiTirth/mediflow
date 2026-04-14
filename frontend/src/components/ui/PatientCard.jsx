import { useNavigate } from 'react-router-dom';
import AnomalyBadge from './AnomalyBadge';

export default function PatientCard({ patient, delay = 0 }) {
  const navigate = useNavigate();

  const initials = `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`.toUpperCase();

  const severity = patient.anomaly_count > 10 ? 'critical'
                 : patient.anomaly_count > 3  ? 'warning'
                 : 'low';

  return (
    <div
      className="card"
      onClick={() => navigate(`/patients/${patient.patient_id}`)}
      style={{
        cursor:     'pointer',
        animation:  `fade-up 0.4s ease ${delay}s both`,
        transition: 'all 0.2s ease',
        display:    'flex',
        alignItems: 'center',
        gap:        12,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = 'translateY(-2px)';
        e.currentTarget.style.boxShadow  = 'var(--shadow-elevated)';
        e.currentTarget.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform  = 'translateY(0)';
        e.currentTarget.style.boxShadow  = 'var(--shadow-card)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Avatar */}
      <div style={{
        width:           40,
        height:          40,
        borderRadius:    '50%',
        background:      'var(--accent-dim)',
        border:          '1.5px solid var(--accent)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        fontFamily:      'var(--font-display)',
        fontWeight:      700,
        fontSize:        13,
        color:           'var(--accent)',
        flexShrink:      0,
        animation:       patient.anomaly_count > 10 ? 'heartbeat 2s ease-in-out infinite' : 'none',
      }}>
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight:   500,
          fontSize:     13,
          color:        'var(--text-primary)',
          whiteSpace:   'nowrap',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
        }}>
          {patient.first_name} {patient.last_name}
        </div>
        <div style={{
          fontSize:   11,
          color:      'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          marginTop:  2,
        }}>
          Age {patient.age} · {patient.gender === 'M' ? 'Male' : 'Female'} · {patient.city}
        </div>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <AnomalyBadge severity={severity} />
        <span style={{
          fontSize:   11,
          fontFamily: 'var(--font-mono)',
          color:      'var(--text-muted)',
        }}>
          {patient.anomaly_count} anomalies
        </span>
      </div>
    </div>
  );
}