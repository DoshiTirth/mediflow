import pandas as pd

df = pd.read_csv(
    'data_generation/output/csv/observations.csv',
    usecols=['CODE', 'DESCRIPTION'],
    dtype={'CODE': str}
)

keywords = ['heart', 'blood pressure', 'temperature', 'oxygen', 'systolic', 'diastolic']
mask = df['DESCRIPTION'].str.lower().str.contains('|'.join(keywords), na=False)
print(df[mask].drop_duplicates().to_string())