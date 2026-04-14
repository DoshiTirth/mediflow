import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pandas as pd
import numpy as np
import joblib
import time
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler

DB_SERVER = None
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')


# Vital feature columns
VITAL_FEATURES = [
    'heart_rate',
    'systolic_bp',
    'diastolic_bp',
    'temperature_c',
    'oxygen_saturation',
]


def load_vitals_from_db():
    print("[train] Loading vitals from SQL Server...")
    import pyodbc
    from dotenv import load_dotenv
    load_dotenv()

    server = os.getenv('DB_SERVER')
    db     = os.getenv('DB_NAME')
    driver = os.getenv('DB_DRIVER')

    conn = pyodbc.connect(
        f"DRIVER={{{driver}}};SERVER={server};DATABASE={db};Trusted_Connection=yes;"
    )

    df = pd.read_sql("""
        SELECT
            vital_id,
            patient_id,
            recorded_at,
            heart_rate,
            systolic_bp,
            diastolic_bp,
            temperature_c,
            oxygen_saturation
        FROM vitals
    """, conn)
    conn.close()

    print(f"[train] Loaded {len(df):,} rows from vitals table")
    return df


def prepare_features(df):
    print("[train] Preparing features...")
    df = df.copy()

    # drop rows where all vitals are null
    df.dropna(subset=VITAL_FEATURES, how='all', inplace=True)

    # fill missing individual vitals with column median
    for col in VITAL_FEATURES:
        median = df[col].median()
        df[col] = df[col].fillna(median)

    X = df[VITAL_FEATURES].values
    print(f"[train] Feature matrix shape: {X.shape}")
    return df, X


def train_models(X):
    print("\n[train] Training ensemble models...")
    print("-" * 55)

    # Scale features
    print("[train] Scaling features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Model 1: Isolation Forest
    print("[train] Training Isolation Forest...")
    start = time.time()
    iso_forest = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_scaled)
    print(f"[train] Isolation Forest done in {time.time()-start:.1f}s")

    # Model 2: Local Outlier Factor
    print("[train] Training Local Outlier Factor...")
    start = time.time()
    lof = LocalOutlierFactor(
        n_neighbors=20,
        contamination=0.05,
        novelty=True,
        n_jobs=-1
    )
    lof.fit(X_scaled)
    print(f"[train] Local Outlier Factor done in {time.time()-start:.1f}s")

    #Model 3: One-Class SVM
    print("[train] Training One-Class SVM (this takes longest)...")
    start = time.time()

    # SVM is slow on 180k rows — train on a representative sample
    sample_size = min(15000, len(X_scaled))
    np.random.seed(42)
    sample_idx  = np.random.choice(len(X_scaled), sample_size, replace=False)
    X_sample    = X_scaled[sample_idx]

    svm = OneClassSVM(
        kernel='rbf',
        gamma='scale',
        nu=0.05
    )
    svm.fit(X_sample)
    print(f"[train] One-Class SVM done in {time.time()-start:.1f}s")

    return scaler, iso_forest, lof, svm


def save_models(scaler, iso_forest, lof, svm):
    print("\n[train] Saving models...")
    os.makedirs(MODEL_DIR, exist_ok=True)

    joblib.dump(scaler,     os.path.join(MODEL_DIR, 'scaler.pkl'))
    joblib.dump(iso_forest, os.path.join(MODEL_DIR, 'isolation_forest.pkl'))
    joblib.dump(lof,        os.path.join(MODEL_DIR, 'lof.pkl'))
    joblib.dump(svm,        os.path.join(MODEL_DIR, 'ocsvm.pkl'))

    print(f"[train] Models saved to {MODEL_DIR}")


def evaluate_ensemble(X_scaled, iso_forest, lof, svm):
    print("\n[train] Evaluating ensemble on training data...")

    pred_iso = iso_forest.predict(X_scaled)   # -1 = anomaly, 1 = normal
    pred_lof = lof.predict(X_scaled)
    pred_svm = svm.predict(X_scaled)

    # majority vote — anomaly if 2 out of 3 models agree
    votes = (
        (pred_iso == -1).astype(int) +
        (pred_lof == -1).astype(int) +
        (pred_svm == -1).astype(int)
    )
    anomalies = (votes >= 2)

    print(f"[train] Isolation Forest anomalies : {(pred_iso == -1).sum():,}")
    print(f"[train] Local Outlier Factor anomalies: {(pred_lof == -1).sum():,}")
    print(f"[train] One-Class SVM anomalies    : {(pred_svm == -1).sum():,}")
    print(f"[train] Ensemble anomalies (2/3 vote): {anomalies.sum():,}")
    print(f"[train] Anomaly rate               : {anomalies.mean()*100:.2f}%")

    return anomalies


if __name__ == '__main__':
    total_start = time.time()
    print("=" * 55)
    print(" MediFlow — Anomaly Detection Model Training")
    print("=" * 55)

    df         = load_vitals_from_db()
    df, X      = prepare_features(df)
    scaler, iso_forest, lof, svm = train_models(X)

    X_scaled   = scaler.transform(X)
    evaluate_ensemble(X_scaled, iso_forest, lof, svm)
    save_models(scaler, iso_forest, lof, svm)

    print("\n" + "=" * 55)
    print(f" Training completed in {time.time()-total_start:.1f}s")
    print("=" * 55)