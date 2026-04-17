import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
import json
from api.app import create_app


@pytest.fixture
def app():
    app = create_app()
    app.config['TESTING'] = True
    return app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_token(client):
    response = client.post('/api/auth/login',
        data=json.dumps({'username': 'admin', 'password': 'MediFlow@2024'}),
        content_type='application/json'
    )
    data = json.loads(response.data)
    return data.get('token')


@pytest.fixture
def auth_headers(auth_token):
    return {'Authorization': f'Bearer {auth_token}'}


# Health Check
class TestHealth:

    def test_health_returns_200(self, client):
        response = client.get('/api/health')
        assert response.status_code == 200

    def test_health_returns_ok(self, client):
        data = json.loads(response.data
            if (response := client.get('/api/health')) else b'{}')
        assert data.get('status') == 'ok'

    def test_health_returns_service_name(self, client):
        response = client.get('/api/health')
        data     = json.loads(response.data)
        assert data.get('service') == 'MediFlow API'


# Auth Tests
class TestAuth:

    def test_login_valid_credentials(self, client):
        response = client.post('/api/auth/login',
            data=json.dumps({'username': 'admin', 'password': 'MediFlow@2024'}),
            content_type='application/json'
        )
        assert response.status_code == 200

    def test_login_returns_token(self, client):
        response = client.post('/api/auth/login',
            data=json.dumps({'username': 'admin', 'password': 'MediFlow@2024'}),
            content_type='application/json'
        )
        data = json.loads(response.data)
        assert 'token' in data

    def test_login_invalid_password(self, client):
        response = client.post('/api/auth/login',
            data=json.dumps({'username': 'admin', 'password': 'wrongpassword'}),
            content_type='application/json'
        )
        assert response.status_code == 401

    def test_login_invalid_username(self, client):
        response = client.post('/api/auth/login',
            data=json.dumps({'username': 'nonexistent', 'password': 'password'}),
            content_type='application/json'
        )
        assert response.status_code == 401

    def test_login_missing_fields(self, client):
        response = client.post('/api/auth/login',
            data=json.dumps({}),
            content_type='application/json'
        )
        assert response.status_code == 400

    def test_me_requires_auth(self, client):
        response = client.get('/api/auth/me')
        assert response.status_code == 401

    def test_me_with_valid_token(self, client, auth_headers):
        response = client.get('/api/auth/me', headers=auth_headers)
        assert response.status_code == 200

    def test_me_returns_user_info(self, client, auth_headers):
        response = client.get('/api/auth/me', headers=auth_headers)
        data     = json.loads(response.data)
        assert 'username' in data
        assert 'role'     in data


# Patients Tests
class TestPatients:

    def test_patients_requires_auth(self, client):
        response = client.get('/api/patients')
        assert response.status_code == 401

    def test_patients_returns_200(self, client, auth_headers):
        response = client.get('/api/patients', headers=auth_headers)
        assert response.status_code == 200

    def test_patients_returns_list(self, client, auth_headers):
        response = client.get('/api/patients', headers=auth_headers)
        data     = json.loads(response.data)
        assert 'patients' in data
        assert isinstance(data['patients'], list)

    def test_patients_pagination(self, client, auth_headers):
        response = client.get('/api/patients?page=1&per_page=5', headers=auth_headers)
        data     = json.loads(response.data)
        assert len(data['patients']) <= 5

    def test_patients_search(self, client, auth_headers):
        response = client.get('/api/patients?search=john', headers=auth_headers)
        assert response.status_code == 200

    def test_patient_not_found(self, client, auth_headers):
        response = client.get('/api/patients/nonexistent-id', headers=auth_headers)
        assert response.status_code == 404


# Anomalies Tests
class TestAnomalies:

    def test_anomalies_requires_auth(self, client):
        response = client.get('/api/anomalies')
        assert response.status_code == 401

    def test_anomalies_returns_200(self, client, auth_headers):
        response = client.get('/api/anomalies', headers=auth_headers)
        assert response.status_code == 200

    def test_anomalies_returns_list(self, client, auth_headers):
        response = client.get('/api/anomalies', headers=auth_headers)
        data     = json.loads(response.data)
        assert 'anomalies' in data
        assert isinstance(data['anomalies'], list)

    def test_anomalies_severity_filter(self, client, auth_headers):
        for severity in ['critical', 'warning', 'low']:
            response = client.get(f'/api/anomalies?severity={severity}',
                                  headers=auth_headers)
            assert response.status_code == 200

    def test_anomaly_summary_returns_200(self, client, auth_headers):
        response = client.get('/api/anomalies/summary', headers=auth_headers)
        assert response.status_code == 200

    def test_anomaly_summary_structure(self, client, auth_headers):
        response = client.get('/api/anomalies/summary', headers=auth_headers)
        data     = json.loads(response.data)
        assert 'total'       in data
        assert 'by_severity' in data
        assert 'reviewed'    in data

    def test_anomaly_trends_returns_200(self, client, auth_headers):
        for period in ['daily', 'weekly', 'monthly', 'sixmonths', 'yearly']:
            response = client.get(f'/api/anomalies/trends?period={period}',
                                  headers=auth_headers)
            assert response.status_code == 200


# Vitals Tests
class TestVitals:

    def test_vitals_stats_requires_auth(self, client):
        response = client.get('/api/vitals/stats')
        assert response.status_code == 401

    def test_vitals_stats_returns_200(self, client, auth_headers):
        response = client.get('/api/vitals/stats', headers=auth_headers)
        assert response.status_code == 200

    def test_vitals_stats_structure(self, client, auth_headers):
        response = client.get('/api/vitals/stats', headers=auth_headers)
        data     = json.loads(response.data)
        assert 'total_readings'    in data
        assert 'avg_heart_rate'    in data
        assert 'avg_systolic_bp'   in data
        assert 'avg_oxygen_saturation' in data