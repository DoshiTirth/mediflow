from flask import Blueprint, jsonify, request
from api.services.db import fetch_all, fetch_one
from datetime import date
from flask_jwt_extended import jwt_required

patients_bp = Blueprint('patients', __name__)


def calculate_age(birth_date):
    if not birth_date:
        return None
    today = date.today()
    return today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )


@patients_bp.route('/patients', methods=['GET'])
@jwt_required()
def get_patients():
    page     = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))
    search   = request.args.get('search', '').strip()
    offset   = (page - 1) * per_page

    if search:
        rows = fetch_all("""
            SELECT
                p.patient_id,
                p.first_name,
                p.last_name,
                p.birth_date,
                p.gender,
                p.city,
                p.state,
                COUNT(DISTINCT a.anomaly_id) as anomaly_count
            FROM patients p
            LEFT JOIN anomalies a ON p.patient_id = a.patient_id
            WHERE p.first_name LIKE ? OR p.last_name LIKE ?
            GROUP BY p.patient_id, p.first_name, p.last_name,
                     p.birth_date, p.gender, p.city, p.state
            ORDER BY anomaly_count DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        """, [f'%{search}%', f'%{search}%', offset, per_page])
    else:
        rows = fetch_all("""
            SELECT
                p.patient_id,
                p.first_name,
                p.last_name,
                p.birth_date,
                p.gender,
                p.city,
                p.state,
                COUNT(DISTINCT a.anomaly_id) as anomaly_count
            FROM patients p
            LEFT JOIN anomalies a ON p.patient_id = a.patient_id
            GROUP BY p.patient_id, p.first_name, p.last_name,
                     p.birth_date, p.gender, p.city, p.state
            ORDER BY anomaly_count DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
        """, [offset, per_page])

    for row in rows:
        row['age'] = calculate_age(row.get('birth_date'))
        if row.get('birth_date'):
            row['birth_date'] = str(row['birth_date'])

    total = fetch_one("SELECT COUNT(*) as total FROM patients")['total']

    return jsonify({
        'patients': rows,
        'total':    total,
        'page':     page,
        'per_page': per_page,
        'pages':    -(-total // per_page)
    })


@patients_bp.route('/patients/<patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    patient = fetch_one("""
        SELECT
            p.patient_id,
            p.first_name,
            p.last_name,
            p.birth_date,
            p.gender,
            p.city,
            p.state
        FROM patients p
        WHERE p.patient_id = ?
    """, [patient_id])

    if not patient:
        return jsonify({'error': 'Patient not found'}), 404

    patient['age'] = calculate_age(patient.get('birth_date'))
    if patient.get('birth_date'):
        patient['birth_date'] = str(patient['birth_date'])

    return jsonify(patient)