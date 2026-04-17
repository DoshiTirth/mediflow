from flask import Blueprint, jsonify, request
from api.services.db import fetch_all, fetch_one
from flask_jwt_extended import jwt_required

vitals_bp = Blueprint('vitals', __name__)


@vitals_bp.route('/patients/<patient_id>/vitals', methods=['GET'])
@jwt_required()
def get_patient_vitals(patient_id):
    limit = int(request.args.get('limit', 50))

    rows = fetch_all("""
        SELECT TOP (?)
            vital_id,
            patient_id,
            recorded_at,
            heart_rate,
            systolic_bp,
            diastolic_bp,
            temperature_c,
            oxygen_saturation
        FROM vitals
        WHERE patient_id = ?
        ORDER BY recorded_at DESC
    """, [limit, patient_id])

    for row in rows:
        if row.get('recorded_at'):
            row['recorded_at'] = str(row['recorded_at'])

    return jsonify({'vitals': rows, 'total': len(rows)})


@vitals_bp.route('/vitals/stats', methods=['GET'])
@jwt_required()
def get_vitals_stats():
    stats = fetch_one("""
        SELECT
            COUNT(*)                        as total_readings,
            AVG(heart_rate)                 as avg_heart_rate,
            AVG(systolic_bp)                as avg_systolic_bp,
            AVG(diastolic_bp)               as avg_diastolic_bp,
            AVG(temperature_c)              as avg_temperature,
            AVG(oxygen_saturation)          as avg_oxygen_saturation
        FROM vitals
    """)
    return jsonify(stats)