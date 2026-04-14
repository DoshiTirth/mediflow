import pandas as pd
import numpy as np


# Vital sign normal ranges for severity tagging
VITAL_RANGES = {
    'heart_rate':        {'low': 40,  'high': 130},
    'oxygen_saturation': {'low': 90,  'high': 100},
    'temperature_c':     {'low': 35.0,'high': 38.5},
    'systolic_bp':       {'low': 80,  'high': 180},
    'diastolic_bp':      {'low': 50,  'high': 120},
}

# Synthea LOINC codes mapped to our column names
VITAL_CODE_MAP = {
    '8867-4':  'heart_rate',
    '8480-6':  'systolic_bp',
    '8462-4':  'diastolic_bp',
    '8310-5':  'temperature_c',
    '2708-6':  'oxygen_saturation',
}


def transform_patients(df):
    print("[transform] Transforming patients...")
    df = df.copy()
    df.rename(columns={
        'Id':        'patient_id',
        'FIRST':     'first_name',
        'LAST':      'last_name',
        'BIRTHDATE': 'birth_date',
        'GENDER':    'gender',
        'CITY':      'city',
        'STATE':     'state',
    }, inplace=True)

    df['first_name'] = df['first_name'].str.strip().str.title()
    df['last_name']  = df['last_name'].str.strip().str.title()
    df['gender']     = df['gender'].str.strip().str.upper()
    df['birth_date'] = pd.to_datetime(df['birth_date'], errors='coerce')
    df.dropna(subset=['patient_id', 'birth_date'], inplace=True)
    df.drop_duplicates(subset=['patient_id'], inplace=True)

    print(f"[transform] Patients cleaned: {len(df):,} rows")
    return df


def transform_vitals(df):
    print("[transform] Transforming vitals...")
    df = df.copy()

    # keep only rows that map to a known vital
    df = df[df['CODE'].isin(VITAL_CODE_MAP.keys())].copy()
    df['vital_name'] = df['CODE'].map(VITAL_CODE_MAP)

    df.rename(columns={
        'PATIENT': 'patient_id',
        'DATE':    'recorded_at',
    }, inplace=True)

    df['recorded_at'] = pd.to_datetime(df['recorded_at'], errors='coerce')
    df['VALUE']       = pd.to_numeric(df['VALUE'], errors='coerce')
    df.dropna(subset=['patient_id', 'recorded_at', 'VALUE'], inplace=True)

    # convert temperature from Fahrenheit to Celsius if needed
    temp_mask = (df['vital_name'] == 'temperature_c') & (df['VALUE'] > 50)
    df.loc[temp_mask, 'VALUE'] = (df.loc[temp_mask, 'VALUE'] - 32) * 5 / 9

    # pivot to wide format — one row per patient per timestamp
    vitals_wide = df.pivot_table(
        index=['patient_id', 'recorded_at'],
        columns='vital_name',
        values='VALUE',
        aggfunc='mean'
    ).reset_index()

    vitals_wide.columns.name = None

    # ensure all vital columns exist even if missing in data
    for col in VITAL_CODE_MAP.values():
        if col not in vitals_wide.columns:
            vitals_wide[col] = np.nan

    vitals_wide = vitals_wide[[
        'patient_id', 'recorded_at',
        'heart_rate', 'systolic_bp', 'diastolic_bp',
        'temperature_c', 'oxygen_saturation'
    ]]

    print(f"[transform] Vitals cleaned: {len(vitals_wide):,} rows")
    return vitals_wide


def transform_observations(df_raw):
    print("[transform] Transforming observations...")
    df = df_raw.copy()

    # exclude rows already handled as vitals
    df = df[~df['CODE'].isin(VITAL_CODE_MAP.keys())].copy()

    df.rename(columns={
        'PATIENT':     'patient_id',
        'DATE':        'recorded_at',
        'CODE':        'observation_type',
        'DESCRIPTION': 'description',
        'VALUE':       'value',
        'UNITS':       'unit',
    }, inplace=True)

    df['recorded_at'] = pd.to_datetime(df['recorded_at'], errors='coerce')
    df['value']       = pd.to_numeric(df['value'], errors='coerce')
    df.dropna(subset=['patient_id', 'recorded_at'], inplace=True)

    print(f"[transform] Observations cleaned: {len(df):,} rows")
    return df


def tag_severity(value, vital_name):
    if vital_name not in VITAL_RANGES or pd.isna(value):
        return None
    low  = VITAL_RANGES[vital_name]['low']
    high = VITAL_RANGES[vital_name]['high']
    if value < low or value > high:
        deviation = max(
            abs(value - low) / low if value < low else 0,
            abs(value - high) / high if value > high else 0
        )
        return 'critical' if deviation > 0.2 else 'warning'
    return 'normal'


if __name__ == '__main__':
    from extract import (
        extract_patients,
        extract_observations,
    )

    patients_raw     = extract_patients()
    observations_raw = extract_observations()

    patients     = transform_patients(patients_raw)
    vitals       = transform_vitals(observations_raw)
    observations = transform_observations(observations_raw)

    print("\n[transform] Sample vitals:")
    print(vitals.head())
    print("\n[transform] Severity tag test:")
    print(tag_severity(45, 'heart_rate'))
    print(tag_severity(72, 'heart_rate'))
    print(tag_severity(185, 'systolic_bp'))