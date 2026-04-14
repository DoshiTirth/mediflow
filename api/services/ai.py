import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))


def explain_anomaly(anomaly, patient):
    prompt = f"""You are a clinical decision support assistant. 
A vital sign anomaly has been detected for a patient. 
Provide a brief, clear clinical explanation in 2-3 sentences.
Be professional but easy to understand for medical staff.

Patient Information:
- Age: {patient.get('age', 'unknown')}
- Gender: {patient.get('gender', 'unknown')}

Anomaly Details:
- Affected Metric: {anomaly.get('affected_metric', 'unknown').replace('_', ' ').title()}
- Recorded Value: {anomaly.get('metric_value', 'unknown')}
- Severity: {anomaly.get('severity', 'unknown').upper()}
- Anomaly Score: {anomaly.get('anomaly_score', 'unknown')}
- Detected At: {anomaly.get('detected_at', 'unknown')}

Explain what this anomaly means clinically and what actions medical staff should consider."""

    message = client.messages.create(
        model='claude-sonnet-4-20250514',
        max_tokens=300,
        messages=[
            {'role': 'user', 'content': prompt}
        ]
    )

    return message.content[0].text


def get_patient_summary(patient, anomalies, vitals):
    anomaly_list = '\n'.join([
        f"- {a.get('affected_metric','').replace('_',' ').title()}: "
        f"{a.get('metric_value')} ({a.get('severity','').upper()})"
        for a in anomalies[:5]
    ])

    prompt = f"""You are a clinical decision support assistant.
Provide a brief patient health summary in 3-4 sentences based on their recent vitals and anomalies.
Be professional and concise.

Patient: {patient.get('first_name')} {patient.get('last_name')}
Age: {patient.get('age', 'unknown')} | Gender: {patient.get('gender', 'unknown')}

Recent Anomalies Detected:
{anomaly_list if anomaly_list else 'No recent anomalies'}

Total anomalies on record: {len(anomalies)}

Summarize the patient's current health status and flag any concerns."""

    message = client.messages.create(
        model='claude-sonnet-4-20250514',
        max_tokens=300,
        messages=[
            {'role': 'user', 'content': prompt}
        ]
    )

    return message.content[0].text