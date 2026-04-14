import time
from extract import extract_patients, extract_observations, extract_conditions, extract_encounters
from transform import transform_patients, transform_vitals, transform_observations
from load import load_patients, load_vitals_fast


def run_pipeline():
    start = time.time()
    print("=" * 55)
    print(" MediFlow ETL Pipeline")
    print("=" * 55)

    print("\n[pipeline] Step 1/3 — Extract")
    print("-" * 55)
    patients_raw     = extract_patients()
    observations_raw = extract_observations()
    extract_conditions()
    extract_encounters()

    print("\n[pipeline] Step 2/3 — Transform")
    print("-" * 55)
    patients = transform_patients(patients_raw)
    vitals   = transform_vitals(observations_raw)
    transform_observations(observations_raw)

    print("\n[pipeline] Step 3/3 — Load")
    print("-" * 55)
    load_patients(patients)
    load_vitals_fast(vitals)

    elapsed = time.time() - start
    print("\n" + "=" * 55)
    print(f" Pipeline completed in {elapsed:.1f}s")
    print(f" Patients : {len(patients):,}")
    print(f" Vitals   : {len(vitals):,}")
    print("=" * 55)


if __name__ == '__main__':
    run_pipeline()