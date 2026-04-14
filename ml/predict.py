import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pandas as pd
import numpy as np
import joblib
import time
import pyodbc
from dotenv import load_dotenv

load_dotenv()

MODEL_DIR     = os.path.join(os.path.dirname(__file__), 'model')
VITAL_FEATURES = [
    'heart_rate',
    'systolic_bp',
    'diastolic_bp',
    'temperature_c',
    'oxygen_saturation',
]

VITAL_RANGES = {
    'heart_rate':        {'low': 40,   'high': 130},
    'oxygen_saturation': {'low': 90,   'high': 100},
    'temperature_c':     {'low': 35.0, 'high': 38.5},
    'systolic_bp':       {'low': 80,   'high': 180},
    'diastolic_bp':      {'low': 50,   'high': 120},
}


def get_connection():
    server = os.getenv('DB_SERVER')
    db     = os.getenv('DB_NAME')
    driver = os.getenv('DB_DRIVER')
    return pyodbc.connect(
        f"DRIVER={{{driver}}};SERVER={server};DATABASE={db};Trusted_Connection=yes;"
    )


def load_models():
    print("[predict] Loading trained models...")
    scaler     = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
    iso_forest = joblib.load(os.path.join(MODEL_DIR, 'isolation_forest.pkl'))
    lof        = joblib.load(os.path.join(MODEL_DIR, 'lof.pkl'))
    svm        = joblib.load(os.path.join(MODEL_DIR, 'ocsvm.pkl'))
    print("[predict] Models loaded successfully")
    return scaler, iso_forest, lof, svm


def load_vitals():
    print("[predict] Loading vitals from SQL Server...")
    conn = get_connection()
    df = pd.read_sql("""
        SELECT
            v.vital_id,
            v.patient_id,
            v.recorded_at,
            v.heart_rate,
            v.systolic_bp,
            v.diastolic_bp,
            v.temperature_c,
            v.oxygen_saturation
        FROM vitals v
        LEFT JOIN anomalies a ON v.vital_id = a.vital_id
        WHERE a.vital_id IS NULL
    """, conn)
    conn.close()
    print(f"[predict] Loaded {len(df):,} unscanned vital rows")
    return df


def prepare_features(df):
    df = df.copy()
    df.dropna(subset=VITAL_FEATURES, how='all', inplace=True)
    for col in VITAL_FEATURES:
        median = df[col].median()
        df[col] = df[col].fillna(median)
    return df


def detect_affected_metric(row):
    worst_metric  = None
    worst_dev     = 0

    for metric, bounds in VITAL_RANGES.items():
        val = row.get(metric)
        if val is None or pd.isna(val):
            continue
        low  = bounds['low']
        high = bounds['high']
        if val < low:
            dev = (low - val) / low
        elif val > high:
            dev = (val - high) / high
        else:
            dev = 0

        if dev > worst_dev:
            worst_dev    = dev
            worst_metric = metric

    return worst_metric, worst_dev


def determine_severity(deviation):
    if deviation > 0.3:
        return 'critical'
    elif deviation > 0.1:
        return 'warning'
    return 'low'


def run_ensemble(df, scaler, iso_forest, lof, svm):
    print("[predict] Running ensemble prediction...")
    X        = df[VITAL_FEATURES].values
    X_scaled = scaler.transform(X)

    pred_iso = iso_forest.predict(X_scaled)
    pred_lof = lof.predict(X_scaled)
    pred_svm = svm.predict(X_scaled)

    votes = (
        (pred_iso == -1).astype(int) +
        (pred_lof == -1).astype(int) +
        (pred_svm == -1).astype(int)
    )

    # anomaly score from isolation forest (lower = more anomalous)
    scores   = iso_forest.decision_function(X_scaled)
    is_anomaly = votes >= 2

    print(f"[predict] Anomalies detected: {is_anomaly.sum():,} out of {len(df):,} rows")
    return is_anomaly, scores


def save_anomalies(df, is_anomaly, scores):
    print("[predict] Saving anomalies to SQL Server...")
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.fast_executemany = True

    anomaly_df = df[is_anomaly].copy()
    anomaly_df['anomaly_score'] = scores[is_anomaly]

    rows = []
    for _, row in anomaly_df.iterrows():
        affected_metric, deviation = detect_affected_metric(row)
        if affected_metric is None:
            affected_metric = 'unknown'
            deviation       = 0.0

        severity    = determine_severity(deviation)
        metric_val  = row.get(affected_metric, 0.0)
        if pd.isna(metric_val):
            metric_val = 0.0

        rows.append((
            str(row['patient_id']),
            int(row['vital_id']),
            'vital_sign_anomaly',
            severity,
            affected_metric,
            float(metric_val),
            float(row['anomaly_score']),
        ))

    cursor.executemany("""
        INSERT INTO anomalies (
            patient_id, vital_id, anomaly_type,
            severity, affected_metric, metric_value, anomaly_score
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, rows)

    conn.commit()
    conn.close()
    print(f"[predict] Saved {len(rows):,} anomalies to database")
    return len(rows)


if __name__ == '__main__':
    start = time.time()
    print("=" * 55)
    print(" MediFlow — Anomaly Detection Prediction")
    print("=" * 55)

    scaler, iso_forest, lof, svm = load_models()
    df           = load_vitals()
    df           = prepare_features(df)
    is_anomaly, scores = run_ensemble(df, scaler, iso_forest, lof, svm)
    total        = save_anomalies(df, is_anomaly, scores)

    print("\n" + "=" * 55)
    print(f" Prediction completed in {time.time()-start:.1f}s")
    print(f" Anomalies saved : {total:,}")
    print("=" * 55)