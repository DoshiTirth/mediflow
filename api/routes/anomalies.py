from flask import Blueprint, jsonify, request
from api.services.db import fetch_all, fetch_one, execute
from api.services.ai import explain_anomaly, get_patient_summary
from datetime import date

anomalies_bp = Blueprint('anomalies', __name__)


def calculate_age(birth_date):
    if not birth_date:
        return None
    today = date.today()
    return today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )


@anomalies_bp.route('/anomalies', methods=['GET'])
def get_anomalies():
    page     = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    severity = request.args.get('severity', '').strip()
    offset   = (page - 1) * per_page

    severity_filter = "AND a.severity = ?" if severity else ""
    unknown_filter  = "AND a.affected_metric != 'unknown'"

    data_params  = [severity, offset, per_page] if severity else [offset, per_page]
    count_params = [severity] if severity else []

    rows = fetch_all(f"""
        SELECT
            a.anomaly_id,
            a.patient_id,
            p.first_name,
            p.last_name,
            a.detected_at,
            a.anomaly_type,
            a.severity,
            a.affected_metric,
            a.metric_value,
            a.anomaly_score,
            a.is_reviewed
        FROM anomalies a
        JOIN patients p ON a.patient_id = p.patient_id
        WHERE 1=1 {unknown_filter} {severity_filter}
        ORDER BY a.detected_at DESC
        OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
    """, data_params)

    for row in rows:
        if row.get('detected_at'):
            row['detected_at'] = str(row['detected_at'])
        row['is_reviewed'] = bool(row.get('is_reviewed'))

    total = fetch_one(f"""
        SELECT COUNT(*) as total
        FROM anomalies a
        WHERE 1=1 {unknown_filter} {severity_filter}
    """, count_params)['total']

    return jsonify({
        'anomalies': rows,
        'total':     total,
        'page':      page,
        'per_page':  per_page,
        'pages':     -(-total // per_page)
    })


@anomalies_bp.route('/anomalies/summary', methods=['GET'])
def get_anomalies_summary():
    summary = fetch_all("""
        SELECT
            severity,
            COUNT(*) as count
        FROM anomalies
        GROUP BY severity
    """)

    total     = fetch_one("SELECT COUNT(*) as total FROM anomalies")['total']
    reviewed  = fetch_one("SELECT COUNT(*) as total FROM anomalies WHERE is_reviewed = 1")['total']

    return jsonify({
        'by_severity': summary,
        'total':       total,
        'reviewed':    reviewed,
        'unreviewed':  total - reviewed
    })


@anomalies_bp.route('/anomalies/<int:anomaly_id>/explain', methods=['POST'])
def explain(anomaly_id):
    anomaly = fetch_one("""
        SELECT
            a.*,
            p.first_name,
            p.last_name,
            p.birth_date,
            p.gender
        FROM anomalies a
        JOIN patients p ON a.patient_id = p.patient_id
        WHERE a.anomaly_id = ?
    """, [anomaly_id])

    if not anomaly:
        return jsonify({'error': 'Anomaly not found'}), 404

    if anomaly.get('detected_at'):
        anomaly['detected_at'] = str(anomaly['detected_at'])

    patient = {
        'age':    calculate_age(anomaly.get('birth_date')),
        'gender': anomaly.get('gender')
    }

    # check if explanation already exists
    existing = fetch_one("""
        SELECT explanation_text FROM ai_explanations
        WHERE anomaly_id = ?
    """, [anomaly_id])

    if existing:
        return jsonify({'explanation': existing['explanation_text'], 'cached': True})

    explanation = explain_anomaly(anomaly, patient)

    execute("""
        INSERT INTO ai_explanations (anomaly_id, explanation_text)
        VALUES (?, ?)
    """, [anomaly_id, explanation])

    return jsonify({'explanation': explanation, 'cached': False})


@anomalies_bp.route('/anomalies/<int:anomaly_id>/review', methods=['PATCH'])
def mark_reviewed(anomaly_id):
    execute("""
        UPDATE anomalies SET is_reviewed = 1
        WHERE anomaly_id = ?
    """, [anomaly_id])
    return jsonify({'success': True, 'anomaly_id': anomaly_id})


@anomalies_bp.route('/patients/<patient_id>/summary', methods=['POST'])
def patient_summary(patient_id):
    patient = fetch_one("""
        SELECT patient_id, first_name, last_name, birth_date, gender
        FROM patients WHERE patient_id = ?
    """, [patient_id])

    if not patient:
        return jsonify({'error': 'Patient not found'}), 404

    patient['age'] = calculate_age(patient.get('birth_date'))

    anomalies = fetch_all("""
        SELECT TOP (5)
            affected_metric, metric_value, severity, detected_at
        FROM anomalies
        WHERE patient_id = ?
        ORDER BY detected_at DESC
    """, [patient_id])

    vitals = fetch_all("""
        SELECT TOP (10)
            heart_rate, systolic_bp, diastolic_bp,
            temperature_c, oxygen_saturation, recorded_at
        FROM vitals
        WHERE patient_id = ?
        ORDER BY recorded_at DESC
    """, [patient_id])

    summary = get_patient_summary(patient, anomalies, vitals)

    return jsonify({'summary': summary, 'patient_id': patient_id})

@anomalies_bp.route('/anomalies/trends', methods=['GET'])
def get_anomaly_trends():
    rows = fetch_all("""
        SELECT
            FORMAT(v.recorded_at, 'yyyy-MM') as month,
            a.severity,
            COUNT(*) as count
        FROM anomalies a
        JOIN vitals v ON a.vital_id = v.vital_id
        WHERE v.recorded_at >= DATEADD(YEAR, -10, GETDATE())
        GROUP BY FORMAT(v.recorded_at, 'yyyy-MM'), a.severity
        ORDER BY month ASC
    """)
    return jsonify({'trends': rows})