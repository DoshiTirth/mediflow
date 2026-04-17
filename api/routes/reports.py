from flask import Blueprint, jsonify, request, make_response
from flask_jwt_extended import jwt_required
from api.services.db import fetch_all, fetch_one
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import csv
import io
from reportlab.graphics.shapes import Drawing, Rect, Circle, String
from reportlab.graphics import renderPDF

reports_bp = Blueprint('reports', __name__)

TEAL  = colors.HexColor('#1D9E75')
AMBER = colors.HexColor('#EF9F27')
RED   = colors.HexColor('#E24B4A')
DARK  = colors.HexColor('#1a202c')
GRAY  = colors.HexColor('#718096')
LIGHT = colors.HexColor('#f0f4f8')


@reports_bp.route('/reports/export/pdf', methods=['GET'])
@jwt_required()
def export_pdf():

    # fetch all stats
    summary   = fetch_one("SELECT COUNT(*) as total FROM anomalies WHERE affected_metric != 'unknown'")
    patients  = fetch_one("SELECT COUNT(*) as total FROM patients")
    vitals    = fetch_one("SELECT COUNT(*) as total FROM vitals")
    reviewed  = fetch_one("SELECT COUNT(*) as total FROM anomalies WHERE is_reviewed = 1")
    critical  = fetch_one("SELECT COUNT(*) as total FROM anomalies WHERE severity = 'critical'")
    warning   = fetch_one("SELECT COUNT(*) as total FROM anomalies WHERE severity = 'warning'")
    low       = fetch_one("SELECT COUNT(*) as total FROM anomalies WHERE severity = 'low'")

    avg_vitals = fetch_one("""
        SELECT
            AVG(heart_rate)          as avg_hr,
            AVG(systolic_bp)         as avg_sbp,
            AVG(diastolic_bp)        as avg_dbp,
            AVG(temperature_c)       as avg_temp,
            AVG(oxygen_saturation)   as avg_o2
        FROM vitals
    """)

    top_patients = fetch_all("""
        SELECT TOP 10
            p.first_name + ' ' + p.last_name as name,
            DATEDIFF(YEAR, p.birth_date, GETDATE()) as age,
            p.gender,
            COUNT(a.anomaly_id) as anomaly_count,
            SUM(CASE WHEN a.severity = 'critical' THEN 1 ELSE 0 END) as critical_count
        FROM patients p
        JOIN anomalies a ON p.patient_id = a.patient_id
        WHERE a.affected_metric != 'unknown'
        GROUP BY p.patient_id, p.first_name, p.last_name, p.birth_date, p.gender
        ORDER BY anomaly_count DESC
    """)

    buffer = io.BytesIO()

    # ─── Watermark + Header on every page ─────────────────
    def on_page(canvas, doc):
        canvas.saveState()
        page_w, page_h = A4

        # faded watermark ECG + text in center
        canvas.setFillColor(colors.HexColor('#1D9E75'))
        canvas.setFillAlpha(0.04)
        canvas.setFont('Helvetica-Bold', 72)
        canvas.drawCentredString(page_w/2, page_h/2, 'MediFlow')

        # faded ECG line watermark
        canvas.setStrokeColor(colors.HexColor('#1D9E75'))
        canvas.setStrokeAlpha(0.04)
        canvas.setLineWidth(3)
        ecg_points = [
            50,  page_h/2 - 30,
            100, page_h/2 - 30,
            130, page_h/2 - 30,
            145, page_h/2 - 60,
            155, page_h/2 + 10,
            165, page_h/2 - 45,
            175, page_h/2 - 30,
            220, page_h/2 - 30,
            250, page_h/2 - 30,
            265, page_h/2 - 60,
            275, page_h/2 + 10,
            285, page_h/2 - 45,
            295, page_h/2 - 30,
            340, page_h/2 - 30,
            370, page_h/2 - 30,
            385, page_h/2 - 60,
            395, page_h/2 + 10,
            405, page_h/2 - 45,
            415, page_h/2 - 30,
            460, page_h/2 - 30,
            490, page_h/2 - 30,
            505, page_h/2 - 60,
            515, page_h/2 + 10,
            525, page_h/2 - 45,
            535, page_h/2 - 30,
            page_w - 50, page_h/2 - 30,
        ]
        canvas.lines(list(zip(ecg_points[0::2], ecg_points[1::2],
                              ecg_points[2::2], ecg_points[3::2])))

        canvas.restoreState()
        canvas.saveState()

        # ─── Header bar on every page ──────────────────
        canvas.setFillColor(TEAL)
        canvas.setFillAlpha(1)
        canvas.rect(0, page_h - 0.55*inch, page_w, 0.55*inch, fill=1, stroke=0)

        # logo icon (rounded rect + ECG)
        canvas.setFillColor(colors.white)
        canvas.setFillAlpha(0.25)
        canvas.roundRect(0.3*inch, page_h - 0.45*inch, 0.3*inch, 0.3*inch, 4, fill=1, stroke=0)

        # ECG icon in logo
        canvas.setStrokeColor(colors.white)
        canvas.setStrokeAlpha(1)
        canvas.setLineWidth(1.2)
        lx = 0.32*inch
        ly = page_h - 0.3*inch
        pts = [lx, ly, lx+0.04*inch, ly, lx+0.07*inch, ly-0.08*inch,
               lx+0.1*inch, ly+0.06*inch, lx+0.13*inch, ly-0.04*inch,
               lx+0.16*inch, ly, lx+0.26*inch, ly]
        for i in range(0, len(pts)-2, 2):
            canvas.line(pts[i], pts[i+1], pts[i+2], pts[i+3])

        # MediFlow text in header
        canvas.setFillColor(colors.white)
        canvas.setFillAlpha(1)
        canvas.setFont('Helvetica-Bold', 13)
        canvas.drawString(0.7*inch, page_h - 0.33*inch, 'MediFlow')
        canvas.setFont('Helvetica', 8)
        canvas.setFillAlpha(0.8)
        canvas.drawString(0.7*inch, page_h - 0.46*inch, 'CLINICAL AI PLATFORM')

        # page number right side
        canvas.setFont('Helvetica', 8)
        canvas.setFillAlpha(0.8)
        canvas.drawRightString(page_w - 0.3*inch, page_h - 0.38*inch,
                               f'Page {doc.page}')

        # ─── Footer bar ────────────────────────────────
        canvas.setFillColor(colors.HexColor('#f0f4f8'))
        canvas.setFillAlpha(1)
        canvas.rect(0, 0, page_w, 0.4*inch, fill=1, stroke=0)
        canvas.setFillColor(GRAY)
        canvas.setFont('Helvetica', 7)
        canvas.drawString(0.3*inch, 0.15*inch,
            f'Generated {datetime.now().strftime("%B %d, %Y at %H:%M")} · '
            'MediFlow Clinical AI · Ensemble Anomaly Detection (Isolation Forest + LOF + One-Class SVM)')

        canvas.restoreState()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.85*inch,
        bottomMargin=0.65*inch,
    )

    styles = getSampleStyleSheet()
    story  = []

    title_style = ParagraphStyle(
        'Title',
        parent=styles['Normal'],
        fontSize=20,
        textColor=DARK,
        fontName='Helvetica-Bold',
        spaceAfter=6,
    )
    sub_style = ParagraphStyle(
        'Sub',
        parent=styles['Normal'],
        fontSize=10,
        textColor=GRAY,
        fontName='Helvetica',
        spaceAfter=4,
    )
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Normal'],
        fontSize=13,
        textColor=DARK,
        fontName='Helvetica-Bold',
        spaceBefore=16,
        spaceAfter=8,
    )

    # title block
    story.append(Spacer(1, 10))
    story.append(Paragraph('Clinical Anomaly Detection Report', title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f'Generated: {datetime.now().strftime("%B %d, %Y at %H:%M")}', sub_style))
    story.append(HRFlowable(width='100%', thickness=1, color=TEAL, spaceAfter=16))

    # ─── Summary Stats ────────────────────────────────────
    story.append(Paragraph('Executive Summary', section_style))

    stats_data = [
        ['Metric', 'Value'],
        ['Total Patients',           f"{patients['total']:,}"],
        ['Total Vitals Readings',    f"{vitals['total']:,}"],
        ['Total Anomalies Detected', f"{summary['total']:,}"],
        ['Critical Anomalies',       f"{critical['total']:,}"],
        ['Warning Anomalies',        f"{warning['total']:,}"],
        ['Low Anomalies',            f"{low['total']:,}"],
        ['Reviewed Anomalies',       f"{reviewed['total']:,}"],
        ['Anomaly Review Rate',      f"{(reviewed['total']/summary['total']*100):.1f}%" if summary['total'] else '0%'],
    ]

    stats_table = Table(stats_data, colWidths=[3.5*inch, 2.5*inch])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  TEAL),
        ('TEXTCOLOR',     (0,0), (-1,0),  colors.white),
        ('FONTNAME',      (0,0), (-1,0),  'Helvetica-Bold'),
        ('FONTSIZE',      (0,0), (-1,0),  10),
        ('ALIGN',         (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME',      (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE',      (0,1), (-1,-1), 10),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [colors.white, colors.HexColor('#f7fafc')]),
        ('GRID',          (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING',    (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
    ]))
    story.append(stats_table)

    # ─── Average Vitals ───────────────────────────────────
    story.append(Paragraph('Average Vital Signs', section_style))

    vitals_data = [
        ['Vital Sign',     'Average Value', 'Unit'],
        ['Heart Rate',     f"{avg_vitals['avg_hr']:.1f}"   if avg_vitals['avg_hr']   else 'N/A', 'bpm'],
        ['Systolic BP',    f"{avg_vitals['avg_sbp']:.1f}"  if avg_vitals['avg_sbp']  else 'N/A', 'mmHg'],
        ['Diastolic BP',   f"{avg_vitals['avg_dbp']:.1f}"  if avg_vitals['avg_dbp']  else 'N/A', 'mmHg'],
        ['Temperature',    f"{avg_vitals['avg_temp']:.1f}" if avg_vitals['avg_temp'] else 'N/A', 'deg C'],
        ['O2 Saturation',  f"{avg_vitals['avg_o2']:.1f}"   if avg_vitals['avg_o2']   else 'N/A', '%'],
    ]

    vitals_table = Table(vitals_data, colWidths=[2.5*inch, 2*inch, 1.5*inch])
    vitals_table.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  TEAL),
        ('TEXTCOLOR',     (0,0), (-1,0),  colors.white),
        ('FONTNAME',      (0,0), (-1,0),  'Helvetica-Bold'),
        ('FONTSIZE',      (0,0), (-1,0),  10),
        ('ALIGN',         (0,0), (-1,-1), 'LEFT'),
        ('FONTNAME',      (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE',      (0,1), (-1,-1), 10),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [colors.white, colors.HexColor('#f7fafc')]),
        ('GRID',          (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING',    (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
    ]))
    story.append(vitals_table)

    # ─── Top 10 High Risk Patients ────────────────────────
    story.append(Paragraph('Top 10 High Risk Patients', section_style))

    patients_data = [['Patient Name', 'Age', 'Gender', 'Total Anomalies', 'Critical']]
    for p in top_patients:
        patients_data.append([
            p['name'],
            str(p['age']),
            'Male' if p['gender'] == 'M' else 'Female',
            str(p['anomaly_count']),
            str(p['critical_count']),
        ])

    patients_table = Table(patients_data, colWidths=[2.2*inch, 0.6*inch, 0.8*inch, 1.4*inch, 0.9*inch])
    patients_table.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  TEAL),
        ('TEXTCOLOR',     (0,0), (-1,0),  colors.white),
        ('FONTNAME',      (0,0), (-1,0),  'Helvetica-Bold'),
        ('FONTSIZE',      (0,0), (-1,0),  10),
        ('ALIGN',         (0,0), (-1,-1), 'LEFT'),
        ('ALIGN',         (1,0), (-1,-1), 'CENTER'),
        ('FONTNAME',      (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE',      (0,1), (-1,-1), 9),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [colors.white, colors.HexColor('#f7fafc')]),
        ('GRID',          (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING',    (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING',   (0,0), (-1,-1), 10),
    ]))
    story.append(patients_table)

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    buffer.seek(0)

    response = make_response(buffer.getvalue())
    response.headers['Content-Type']        = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename=mediflow_report_{datetime.now().strftime("%Y%m%d")}.pdf'
    return response

@reports_bp.route('/reports/preview/anomalies', methods=['GET'])
@jwt_required()
def preview_anomalies():
    severity = request.args.get('severity', '').strip()
    severity_filter = "AND a.severity = ?" if severity else ""
    params          = [severity] if severity else []

    rows = fetch_all(f"""
        SELECT TOP 20
            a.anomaly_id,
            p.first_name + ' ' + p.last_name as patient_name,
            a.severity,
            a.affected_metric,
            a.metric_value,
            a.anomaly_score,
            CASE WHEN a.is_reviewed = 1 THEN 'Yes' ELSE 'No' END as reviewed,
            CONVERT(VARCHAR, a.detected_at, 23) as detected_at
        FROM anomalies a
        JOIN patients p ON a.patient_id = p.patient_id
        WHERE a.affected_metric != 'unknown' {severity_filter}
        ORDER BY a.detected_at DESC
    """, params)

    total = fetch_one(f"""
        SELECT COUNT(*) as total FROM anomalies a
        JOIN patients p ON a.patient_id = p.patient_id
        WHERE a.affected_metric != 'unknown' {severity_filter}
    """, params)['total']

    return jsonify({'rows': rows, 'total': total, 'preview_limit': 20})


@reports_bp.route('/reports/preview/patients', methods=['GET'])
@jwt_required()
def preview_patients():
    rows = fetch_all("""
        SELECT TOP 20
            p.first_name + ' ' + p.last_name as patient_name,
            DATEDIFF(YEAR, p.birth_date, GETDATE()) as age,
            p.gender,
            p.city,
            p.state,
            COUNT(DISTINCT a.anomaly_id) as total_anomalies,
            SUM(CASE WHEN a.severity = 'critical' THEN 1 ELSE 0 END) as critical_count,
            SUM(CASE WHEN a.severity = 'warning'  THEN 1 ELSE 0 END) as warning_count
        FROM patients p
        LEFT JOIN anomalies a ON p.patient_id = a.patient_id
        GROUP BY p.patient_id, p.first_name, p.last_name,
                 p.birth_date, p.gender, p.city, p.state
        ORDER BY total_anomalies DESC
    """)

    total = fetch_one("SELECT COUNT(*) as total FROM patients")['total']
    return jsonify({'rows': rows, 'total': total, 'preview_limit': 20})