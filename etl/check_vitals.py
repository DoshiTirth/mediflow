import sys
sys.path.insert(0, '.')
from etl.extract import extract_observations
from etl.transform import transform_vitals

obs = extract_observations()
vitals = transform_vitals(obs)

print("\n[check] Vitals shape:", vitals.shape)
print("\n[check] Non-null counts per column:")
print(vitals.notna().sum())
print("\n[check] Sample rows with oxygen_saturation:")
print(vitals[vitals['oxygen_saturation'].notna()].head())
print("\n[check] Sample rows with temperature_c:")
print(vitals[vitals['temperature_c'].notna()].head())