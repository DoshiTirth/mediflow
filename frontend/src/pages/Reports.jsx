import { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import {
  exportAnomaliesCSV, exportPatientsCSV, exportPDF,
  previewAnomalies, previewPatients
} from '../api';

function downloadBlob(blob, filename) {
  const url  = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function CSVPreview({ data, onClose, onDownload, downloading }) {
  if (!data) return null;
  const { rows, total, preview_limit } = data;
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div style={{
      position:   'fixed',
      inset:      0,
      background: 'rgba(0,0,0,0.6)',
      zIndex:     999,
      display:    'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)',
      padding:    '1.5rem',
    }}>
      <div style={{
        background:   'var(--bg-surface)',
        border:       '0.5px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        width:        '100%',
        maxWidth:     900,
        maxHeight:    '85vh',
        display:      'flex',
        flexDirection:'column',
        boxShadow:    'var(--shadow-elevated)',
        animation:    'fade-up 0.3s ease both',
      }}>

        {/* Modal header */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          padding:        '1.25rem 1.5rem',
          borderBottom:   '0.5px solid var(--border)',
          flexShrink:     0,
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize:   15,
              color:      'var(--text-primary)',
            }}>CSV Preview</div>
            <div style={{
              fontSize:   11,
              fontFamily: 'var(--font-mono)',
              color:      'var(--text-muted)',
              marginTop:  3,
            }}>
              Showing first {preview_limit} of {total.toLocaleString()} rows
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={onDownload}
              disabled={downloading}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                padding:      '8px 16px',
                borderRadius: 'var(--radius-md)',
                border:       'none',
                background:   'var(--accent)',
                color:        '#fff',
                fontSize:     12,
                fontFamily:   'var(--font-mono)',
                fontWeight:   600,
                cursor:       downloading ? 'wait' : 'pointer',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              {downloading ? 'Downloading...' : 'Download Full CSV'}
            </button>
            <button onClick={onClose} style={{
              width:        32,
              height:       32,
              borderRadius: '50%',
              border:       '0.5px solid var(--border)',
              background:   'var(--bg-surface2)',
              color:        'var(--text-secondary)',
              cursor:       'pointer',
              display:      'flex',
              alignItems:   'center',
              justifyContent:'center',
              fontSize:     16,
            }}>×</button>
          </div>
        </div>

        {/* Table */}
        <div style={{
          flex:              1,
          overflowY:         'auto',
          overflowX:         'auto',
          padding:           '1rem 1.5rem',
          willChange:        'transform',
          WebkitOverflowScrolling: 'touch',
          transform:         'translateZ(0)',
        }}>
          <table style={{
            width:          '100%',
            borderCollapse: 'collapse',
            fontSize:       11,
            fontFamily:     'var(--font-mono)',
          }}>
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col} style={{
                    padding:     '8px 12px',
                    background:  'var(--bg-surface2)',
                    borderBottom:'0.5px solid var(--border)',
                    textAlign:   'left',
                    color:       'var(--text-muted)',
                    fontWeight:  600,
                    fontSize:    10,
                    letterSpacing:'0.05em',
                    textTransform:'uppercase',
                    whiteSpace:  'nowrap',
                    position:    'sticky',
                    top:         0,
                    maxWidth:    160,
                    overflow:    'hidden',
                    textOverflow:'ellipsis',
                  }}>{col.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg-surface2)',
                }}>
                  {columns.map(col => (
                    <td key={col} style={{
                      padding:     '7px 12px',
                      borderBottom:'0.5px solid var(--border-light)',
                      color:       col === 'severity' ? (
                        row[col] === 'critical' ? 'var(--accent3)' :
                        row[col] === 'warning'  ? 'var(--accent2)' : 'var(--accent)'
                      ) : 'var(--text-secondary)',
                      fontWeight:  col === 'severity' ? 600 : 400,
                      whiteSpace:  'nowrap',
                      maxWidth:    160,
                      overflow:    'hidden',
                      textOverflow:'ellipsis',
                    }}>
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PDFPreview({ pdfUrl, onClose, onDownload, downloading }) {
  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      background:     'rgba(0,0,0,0.6)',
      zIndex:         999,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      backdropFilter: 'blur(4px)',
      padding:        '1.5rem',
    }}>
      <div style={{
        background:    'var(--bg-surface)',
        border:        '0.5px solid var(--border)',
        borderRadius:  'var(--radius-xl)',
        width:         '100%',
        maxWidth:      860,
        height:        '88vh',
        display:       'flex',
        flexDirection: 'column',
        boxShadow:     'var(--shadow-elevated)',
        animation:     'fade-up 0.3s ease both',
      }}>

        {/* Modal header */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          padding:        '1.25rem 1.5rem',
          borderBottom:   '0.5px solid var(--border)',
          flexShrink:     0,
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize:   15,
              color:      'var(--text-primary)',
            }}>PDF Preview</div>
            <div style={{
              fontSize:   11,
              fontFamily: 'var(--font-mono)',
              color:      'var(--text-muted)',
              marginTop:  3,
            }}>Clinical Anomaly Detection Report</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={onDownload}
              disabled={downloading}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                padding:      '8px 16px',
                borderRadius: 'var(--radius-md)',
                border:       'none',
                background:   'var(--accent)',
                color:        '#fff',
                fontSize:     12,
                fontFamily:   'var(--font-mono)',
                fontWeight:   600,
                cursor:       downloading ? 'wait' : 'pointer',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
            <button onClick={onClose} style={{
              width:         32,
              height:        32,
              borderRadius:  '50%',
              border:        '0.5px solid var(--border)',
              background:    'var(--bg-surface2)',
              color:         'var(--text-secondary)',
              cursor:        'pointer',
              display:       'flex',
              alignItems:    'center',
              justifyContent:'center',
              fontSize:      16,
            }}>×</button>
          </div>
        </div>

        {/* PDF embed */}
        <div style={{ flex: 1, overflow: 'hidden', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)' }}>
          <iframe
            src={pdfUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="PDF Preview"
          />
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [generating,   setGenerating]   = useState({});
  const [downloading,  setDownloading]  = useState({});
  const [csvPreview,   setCsvPreview]   = useState(null);
  const [csvDownloadFn,setCsvDownloadFn]= useState(null);
  const [csvFilename,  setCsvFilename]  = useState('');
  const [pdfUrl,       setPdfUrl]       = useState(null);

  const handleGenerateCSV = async (key, previewFn, downloadFn, filename) => {
    setGenerating(prev => ({ ...prev, [key]: true }));
    try {
      const res = await previewFn();
      setCsvPreview(res.data);
      setCsvDownloadFn(() => () => handleDownloadCSV(key, downloadFn, filename));
      setCsvFilename(filename);
    } finally {
      setGenerating(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleDownloadCSV = async (key, downloadFn, filename) => {
    setDownloading(prev => ({ ...prev, [key]: true }));
    try {
      const res = await downloadFn();
      downloadBlob(res.data, filename);
    } finally {
      setDownloading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleGeneratePDF = async () => {
    setGenerating(prev => ({ ...prev, pdf: true }));
    try {
      const res    = await exportPDF();
      const blob   = new Blob([res.data], { type: 'application/pdf' });
      const url    = window.URL.createObjectURL(blob);
      setPdfUrl(url);
    } finally {
      setGenerating(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleDownloadPDF = () => {
    setDownloading(prev => ({ ...prev, pdf: true }));
    const link = document.createElement('a');
    link.href  = pdfUrl;
    link.setAttribute('download', `mediflow_report_${new Date().toISOString().split('T')[0]}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDownloading(prev => ({ ...prev, pdf: false }));
  };

  const EXPORTS = [
    {
      key:         'anomalies_all',
      title:       'All Anomalies',
      desc:        'Complete anomaly dataset with patient info, severity, metric values and scores',
      format:      'CSV',
      color:       'var(--accent)',
      icon:        'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      onGenerate:  () => handleGenerateCSV(
        'anomalies_all',
        () => previewAnomalies(),
        () => exportAnomaliesCSV(),
        `mediflow_anomalies_${new Date().toISOString().split('T')[0]}.csv`
      ),
    },
    {
      key:         'anomalies_critical',
      title:       'Critical Anomalies',
      desc:        'Filtered to critical severity only — for immediate clinical review',
      format:      'CSV',
      color:       'var(--accent3)',
      icon:        'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
      onGenerate:  () => handleGenerateCSV(
        'anomalies_critical',
        () => previewAnomalies('critical'),
        () => exportAnomaliesCSV('critical'),
        `mediflow_critical_${new Date().toISOString().split('T')[0]}.csv`
      ),
    },
    {
      key:         'patients',
      title:       'Patient Summary',
      desc:        'All patients with anomaly counts, critical counts and demographic info',
      format:      'CSV',
      color:       'var(--accent2)',
      icon:        'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      onGenerate:  () => handleGenerateCSV(
        'patients',
        () => previewPatients(),
        () => exportPatientsCSV(),
        `mediflow_patients_${new Date().toISOString().split('T')[0]}.csv`
      ),
    },
    {
      key:         'pdf',
      title:       'Full Clinical Report',
      desc:        'Complete PDF report with executive summary, vital statistics and top 10 high risk patients',
      format:      'PDF',
      color:       'var(--accent)',
      icon:        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      onGenerate:  handleGeneratePDF,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <TopBar title="Reports" subtitle="EXPORT & DOWNLOAD" />

      {/* CSV Preview Modal */}
      {csvPreview && (
        <CSVPreview
          data={csvPreview}
          onClose={() => setCsvPreview(null)}
          onDownload={csvDownloadFn}
          downloading={!!downloading['anomalies_all'] || !!downloading['anomalies_critical'] || !!downloading['patients']}
        />
      )}

      {/* PDF Preview Modal */}
      {pdfUrl && (
        <PDFPreview
          pdfUrl={pdfUrl}
          onClose={() => { window.URL.revokeObjectURL(pdfUrl); setPdfUrl(null); }}
          onDownload={handleDownloadPDF}
          downloading={!!downloading['pdf']}
        />
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap:                 12,
        }}>
          {EXPORTS.map((exp, i) => (
            <div key={exp.key} className="card" style={{
              animation:    `fade-up 0.4s ease ${i * 0.1}s both`,
              borderLeft:   `3px solid ${exp.color}`,
              display:      'flex',
              flexDirection:'column',
              gap:          12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width:          36,
                  height:         36,
                  borderRadius:   'var(--radius-md)',
                  background:     `${exp.color}18`,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke={exp.color} strokeWidth="1.8" strokeLinecap="round">
                    <path d={exp.icon}/>
                  </svg>
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize:   14,
                    color:      'var(--text-primary)',
                  }}>{exp.title}</div>
                  <span style={{
                    fontSize:     10,
                    fontFamily:   'var(--font-mono)',
                    color:        exp.color,
                    background:   `${exp.color}18`,
                    padding:      '1px 7px',
                    borderRadius: 'var(--radius-sm)',
                  }}>{exp.format}</span>
                </div>
              </div>

              <div style={{
                fontSize:   12,
                color:      'var(--text-muted)',
                lineHeight: 1.6,
              }}>{exp.desc}</div>

              <button
                onClick={exp.onGenerate}
                disabled={generating[exp.key]}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            7,
                  padding:        '9px 16px',
                  borderRadius:   'var(--radius-md)',
                  border:         `0.5px solid ${exp.color}`,
                  background:     generating[exp.key] ? `${exp.color}10` : `${exp.color}18`,
                  color:          exp.color,
                  fontSize:       12,
                  fontFamily:     'var(--font-mono)',
                  fontWeight:     600,
                  cursor:         generating[exp.key] ? 'wait' : 'pointer',
                  transition:     'all 0.2s ease',
                  marginTop:      'auto',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                {generating[exp.key] ? 'Generating...' : `Preview & Generate ${exp.format}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}