import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data_generation', 'output', 'csv')
CHUNK_SIZE = 10000


def get_csv_path(filename):
    return os.path.join(DATA_PATH, filename)


def extract_patients():
    print("[extract] Reading patients.csv...")
    df = pd.read_csv(
        get_csv_path('patients.csv'),
        usecols=['Id', 'FIRST', 'LAST', 'BIRTHDATE', 'GENDER', 'CITY', 'STATE'],
        dtype={'Id': str}
    )
    print(f"[extract] Patients loaded: {len(df):,} rows")
    return df


def extract_observations():
    print("[extract] Reading observations.csv in chunks...")
    chunks = []
    vitals_codes = {
        '8867-4',   # heart rate
        '8480-6',   # systolic BP
        '8462-4',   # diastolic BP
        '8310-5',   # body temperature
        '2708-6',   # oxygen saturation
    }
    for chunk in pd.read_csv(
        get_csv_path('observations.csv'),
        usecols=['PATIENT', 'DATE', 'CODE', 'DESCRIPTION', 'VALUE', 'UNITS'],
        dtype={'PATIENT': str, 'CODE': str},
        chunksize=CHUNK_SIZE
    ):
        filtered = chunk[chunk['CODE'].isin(vitals_codes)]
        if not filtered.empty:
            chunks.append(filtered)

    df = pd.concat(chunks, ignore_index=True)
    print(f"[extract] Observations (vitals only) loaded: {len(df):,} rows")
    return df


def extract_conditions():
    print("[extract] Reading conditions.csv...")
    df = pd.read_csv(
        get_csv_path('conditions.csv'),
        usecols=['PATIENT', 'START', 'STOP', 'CODE', 'DESCRIPTION'],
        dtype={'PATIENT': str, 'CODE': str}
    )
    print(f"[extract] Conditions loaded: {len(df):,} rows")
    return df


def extract_encounters():
    print("[extract] Reading encounters.csv...")
    df = pd.read_csv(
        get_csv_path('encounters.csv'),
        usecols=['PATIENT', 'START', 'STOP', 'ENCOUNTERCLASS', 'DESCRIPTION'],
        dtype={'PATIENT': str}
    )
    print(f"[extract] Encounters loaded: {len(df):,} rows")
    return df


if __name__ == '__main__':
    extract_patients()
    extract_observations()
    extract_conditions()
    extract_encounters()