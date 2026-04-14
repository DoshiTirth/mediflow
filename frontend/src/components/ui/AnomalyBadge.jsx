export default function AnomalyBadge({ severity }) {
  const map = {
    critical: { label: 'CRITICAL', cls: 'badge-critical' },
    warning:  { label: 'WARNING',  cls: 'badge-warning'  },
    low:      { label: 'LOW',      cls: 'badge-low'      },
    normal:   { label: 'NORMAL',   cls: 'badge-normal'   },
  };

  const { label, cls } = map[severity] || map['low'];

  return (
    <span className={`badge ${cls}`}>
      <span style={{
        width:        6,
        height:       6,
        borderRadius: '50%',
        background:   'currentColor',
        display:      'inline-block',
        flexShrink:   0,
      }}/>
      {label}
    </span>
  );
}