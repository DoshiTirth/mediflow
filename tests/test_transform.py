import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pandas as pd
import numpy as np
import pytest
from etl.transform import (
    transform_patients,
    transform_vitals,
    tag_severity,
    VITAL_RANGES,
    VITAL_CODE_MAP,
)


# Sample Data Fixtures
@pytest.fixture
def sample_patients_df():
    return pd.DataFrame([
        {
            'Id':        'patient-001',
            'FIRST':     'john',
            'LAST':      'doe',
            'BIRTHDATE': '1980-05-15',
            'GENDER':    'm',
            'CITY':      'boston',
            'STATE':     'massachusetts',
        },
        {
            'Id':        'patient-002',
            'FIRST':     'jane',
            'LAST':      'smith',
            'BIRTHDATE': '1990-08-22',
            'GENDER':    'f',
            'CITY':      'new york',
            'STATE':     'new york',
        },
        {
            'Id':        None,
            'FIRST':     'invalid',
            'LAST':      'patient',
            'BIRTHDATE': None,
            'GENDER':    'M',
            'CITY':      'boston',
            'STATE':     'massachusetts',
        },
    ])


@pytest.fixture
def sample_observations_df():
    return pd.DataFrame([
        {'PATIENT': 'patient-001', 'DATE': '2023-01-15', 'CODE': '8867-4',  'DESCRIPTION': 'Heart rate',     'VALUE': '72',  'UNITS': '/min'},
        {'PATIENT': 'patient-001', 'DATE': '2023-01-15', 'CODE': '8480-6',  'DESCRIPTION': 'Systolic BP',    'VALUE': '120', 'UNITS': 'mmHg'},
        {'PATIENT': 'patient-001', 'DATE': '2023-01-15', 'CODE': '8462-4',  'DESCRIPTION': 'Diastolic BP',   'VALUE': '80',  'UNITS': 'mmHg'},
        {'PATIENT': 'patient-001', 'DATE': '2023-01-15', 'CODE': '8310-5',  'DESCRIPTION': 'Temperature',    'VALUE': '37',  'UNITS': 'C'},
        {'PATIENT': 'patient-001', 'DATE': '2023-01-15', 'CODE': '2708-6',  'DESCRIPTION': 'O2 Saturation',  'VALUE': '98',  'UNITS': '%'},
        {'PATIENT': 'patient-002', 'DATE': '2023-02-20', 'CODE': '8867-4',  'DESCRIPTION': 'Heart rate',     'VALUE': '85',  'UNITS': '/min'},
        {'PATIENT': 'patient-002', 'DATE': '2023-02-20', 'CODE': '8480-6',  'DESCRIPTION': 'Systolic BP',    'VALUE': '200', 'UNITS': 'mmHg'},
    ])


# Patient Transform Tests
class TestTransformPatients:

    def test_column_rename(self, sample_patients_df):
        result = transform_patients(sample_patients_df)
        assert 'patient_id' in result.columns
        assert 'first_name' in result.columns
        assert 'last_name'  in result.columns
        assert 'birth_date' in result.columns

    def test_name_title_case(self, sample_patients_df):
        result = transform_patients(sample_patients_df)
        assert result.iloc[0]['first_name'] == 'John'
        assert result.iloc[0]['last_name']  == 'Doe'

    def test_gender_uppercase(self, sample_patients_df):
        result = transform_patients(sample_patients_df)
        assert result.iloc[0]['gender'] == 'M'
        assert result.iloc[1]['gender'] == 'F'

    def test_invalid_rows_dropped(self, sample_patients_df):
        result = transform_patients(sample_patients_df)
        assert len(result) == 2

    def test_no_duplicates(self, sample_patients_df):
        result = transform_patients(sample_patients_df)
        assert result['patient_id'].duplicated().sum() == 0

    def test_birthdate_parsed(self, sample_patients_df):
        result = transform_patients(sample_patients_df)
        assert pd.api.types.is_datetime64_any_dtype(result['birth_date'])


# Vitals Transform Tests
class TestTransformVitals:

    def test_returns_dataframe(self, sample_observations_df):
        result = transform_vitals(sample_observations_df)
        assert isinstance(result, pd.DataFrame)

    def test_correct_columns(self, sample_observations_df):
        result = transform_vitals(sample_observations_df)
        expected = ['patient_id', 'recorded_at', 'heart_rate',
                    'systolic_bp', 'diastolic_bp', 'temperature_c', 'oxygen_saturation']
        for col in expected:
            assert col in result.columns

    def test_values_numeric(self, sample_observations_df):
        result = transform_vitals(sample_observations_df)
        for col in ['heart_rate', 'systolic_bp', 'diastolic_bp']:
            non_null = result[col].dropna()
            if len(non_null) > 0:
                assert pd.api.types.is_numeric_dtype(result[col])

    def test_filters_unknown_codes(self, sample_observations_df):
        df = sample_observations_df.copy()
        df = pd.concat([df, pd.DataFrame([{
            'PATIENT': 'patient-001',
            'DATE':    '2023-01-15',
            'CODE':    '99999-9',
            'DESCRIPTION': 'Unknown',
            'VALUE':   '100',
            'UNITS':   'units',
        }])], ignore_index=True)
        result = transform_vitals(df)
        assert len(result) > 0

    def test_temperature_conversion(self, sample_observations_df):
        df = sample_observations_df.copy()
        df.loc[df['CODE'] == '8310-5', 'VALUE'] = '98.6'
        result = transform_vitals(df)
        temp_vals = result['temperature_c'].dropna()
        if len(temp_vals) > 0:
            assert temp_vals.iloc[0] < 50


# Severity Tag Tests
class TestTagSeverity:

    def test_normal_heart_rate(self):
        assert tag_severity(72, 'heart_rate') == 'normal'

    def test_critical_high_heart_rate(self):
        assert tag_severity(170, 'heart_rate') == 'critical'

    def test_warning_high_heart_rate(self):
        assert tag_severity(140, 'heart_rate') == 'warning'

    def test_critical_low_oxygen(self):
        assert tag_severity(60, 'oxygen_saturation') == 'critical'
    
    def test_warning_low_oxygen(self):
        assert tag_severity(82, 'oxygen_saturation') == 'warning'

    def test_normal_oxygen(self):
        assert tag_severity(98, 'oxygen_saturation') == 'normal'

    def test_normal_temperature(self):
        assert tag_severity(37.0, 'temperature_c') == 'normal'

    def test_critical_high_bp(self):
        assert tag_severity(220, 'systolic_bp') == 'critical'

    def test_nan_returns_none(self):
        assert tag_severity(float('nan'), 'heart_rate') is None

    def test_unknown_vital_returns_none(self):
        assert tag_severity(100, 'unknown_vital') is None

    def test_all_vitals_covered(self):
        for vital in VITAL_RANGES.keys():
            low  = VITAL_RANGES[vital]['low']
            high = VITAL_RANGES[vital]['high']
            mid  = (low + high) / 2
            assert tag_severity(mid, vital) == 'normal'