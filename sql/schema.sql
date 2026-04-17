--MediFlow Database Schema 

CREATE DATABASE mediflow;
GO

USE mediflow;
GO

-- Patients
CREATE TABLE patients (
    patient_id      VARCHAR(50)     PRIMARY KEY,
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    birth_date      DATE            NOT NULL,
    gender          VARCHAR(10)     NOT NULL,
    city            VARCHAR(100),
    state           VARCHAR(50),
    created_at      DATETIME        DEFAULT GETDATE()
);

-- Vitals
CREATE TABLE vitals (
    vital_id            INT             PRIMARY KEY IDENTITY(1,1),
    patient_id          VARCHAR(50)     NOT NULL,
    recorded_at         DATETIME        NOT NULL,
    heart_rate          FLOAT,
    systolic_bp         FLOAT,
    diastolic_bp        FLOAT,
    temperature_c       FLOAT,
    oxygen_saturation   FLOAT,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- Observations
CREATE TABLE observations (
    observation_id      INT             PRIMARY KEY IDENTITY(1,1),
    patient_id          VARCHAR(50)     NOT NULL,
    recorded_at         DATETIME        NOT NULL,
    observation_type    VARCHAR(100)    NOT NULL,
    value               FLOAT,
    unit                VARCHAR(50),
    description         VARCHAR(500),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

-- Anomalies
CREATE TABLE anomalies (
    anomaly_id          INT             PRIMARY KEY IDENTITY(1,1),
    patient_id          VARCHAR(50)     NOT NULL,
    vital_id            INT,
    detected_at         DATETIME        DEFAULT GETDATE(),
    anomaly_type        VARCHAR(100)    NOT NULL,
    severity            VARCHAR(20)     NOT NULL CHECK (severity IN ('low', 'warning', 'critical')),
    affected_metric     VARCHAR(100)    NOT NULL,
    metric_value        FLOAT           NOT NULL,
    anomaly_score       FLOAT,
    is_reviewed         BIT             DEFAULT 0,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (vital_id) REFERENCES vitals(vital_id)
);

-- AI Explanations
CREATE TABLE ai_explanations (
    explanation_id      INT             PRIMARY KEY IDENTITY(1,1),
    anomaly_id          INT             NOT NULL,
    generated_at        DATETIME        DEFAULT GETDATE(),
    explanation_text    TEXT            NOT NULL,
    model_used          VARCHAR(100)    DEFAULT 'claude-sonnet-4-20250514',
    FOREIGN KEY (anomaly_id) REFERENCES anomalies(anomaly_id)
);

CREATE TABLE users (
    user_id     INT             PRIMARY KEY IDENTITY(1,1),
    username    VARCHAR(50)     NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    full_name   VARCHAR(100)    NOT NULL,
    role        VARCHAR(20)     NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse')),
    is_active   BIT             DEFAULT 1,
    created_at  DATETIME        DEFAULT GETDATE()
);

-- Indexes 
CREATE INDEX idx_vitals_patient     ON vitals(patient_id);
CREATE INDEX idx_vitals_recorded    ON vitals(recorded_at);
CREATE INDEX idx_anomalies_patient  ON anomalies(patient_id);
CREATE INDEX idx_anomalies_severity ON anomalies(severity);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role     ON users(role);
GO