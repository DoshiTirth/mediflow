import pyodbc
import pandas as pd
from dotenv import load_dotenv
import os

load_dotenv()

DB_SERVER = os.getenv('DB_SERVER')
DB_NAME   = os.getenv('DB_NAME')
DB_DRIVER = os.getenv('DB_DRIVER')


def get_connection():
    conn_str = (
        f"DRIVER={{{DB_DRIVER}}};"
        f"SERVER={DB_SERVER};"
        f"DATABASE={DB_NAME};"
        f"Trusted_Connection=yes;"
    )
    return pyodbc.connect(conn_str)


def load_patients(df):
    print("[load] Loading patients...")
    conn   = get_connection()
    cursor = conn.cursor()
    loaded = 0
    skipped = 0

    for _, row in df.iterrows():
        try:
            cursor.execute("""
                IF NOT EXISTS (SELECT 1 FROM patients WHERE patient_id = ?)
                INSERT INTO patients (patient_id, first_name, last_name, birth_date, gender, city, state)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
                row['patient_id'],
                row['patient_id'], row['first_name'], row['last_name'],
                row['birth_date'], row['gender'], row['city'], row['state']
            )
            loaded += 1
        except Exception as e:
            skipped += 1
            if skipped <= 3:
                print(f"  [warn] Skipped patient {row['patient_id']}: {e}")

    conn.commit()
    conn.close()
    print(f"[load] Patients loaded: {loaded:,} | skipped: {skipped:,}")


def load_vitals(df):
    print("[load] Loading vitals...")
    conn   = get_connection()
    cursor = conn.cursor()
    loaded = 0
    skipped = 0

    for _, row in df.iterrows():
        try:
            cursor.execute("""
                INSERT INTO vitals (
                    patient_id, recorded_at,
                    heart_rate, systolic_bp, diastolic_bp,
                    temperature_c, oxygen_saturation
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
                row['patient_id'],
                row['recorded_at'],
                None if pd.isna(row['heart_rate'])        else row['heart_rate'],
                None if pd.isna(row['systolic_bp'])       else row['systolic_bp'],
                None if pd.isna(row['diastolic_bp'])      else row['diastolic_bp'],
                None if pd.isna(row['temperature_c'])     else row['temperature_c'],
                None if pd.isna(row['oxygen_saturation']) else row['oxygen_saturation'],
            )
            loaded += 1
        except Exception as e:
            skipped += 1
            if skipped <= 3:
                print(f"  [warn] Skipped vital row: {e}")

    conn.commit()
    conn.close()
    print(f"[load] Vitals loaded: {loaded:,} | skipped: {skipped:,}")


def load_vitals_fast(df):
    print("[load] Loading vitals (fast batch mode)...")
    conn   = get_connection()
    cursor = conn.cursor()

    cursor.fast_executemany = True

    rows = []
    for _, row in df.iterrows():
        rows.append((
            row['patient_id'],
            row['recorded_at'],
            None if pd.isna(row['heart_rate'])        else row['heart_rate'],
            None if pd.isna(row['systolic_bp'])        else row['systolic_bp'],
            None if pd.isna(row['diastolic_bp'])       else row['diastolic_bp'],
            None if pd.isna(row['temperature_c'])      else row['temperature_c'],
            None if pd.isna(row['oxygen_saturation'])  else row['oxygen_saturation'],
        ))

    cursor.executemany("""
        INSERT INTO vitals (
            patient_id, recorded_at,
            heart_rate, systolic_bp, diastolic_bp,
            temperature_c, oxygen_saturation
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, rows)

    conn.commit()
    conn.close()
    print(f"[load] Vitals loaded: {len(rows):,} rows")


if __name__ == '__main__':
    from extract import extract_patients, extract_observations
    from transform import transform_patients, transform_vitals

    patients_raw     = extract_patients()
    observations_raw = extract_observations()

    patients = transform_patients(patients_raw)
    vitals   = transform_vitals(observations_raw)

    load_patients(patients)
    load_vitals_fast(vitals)