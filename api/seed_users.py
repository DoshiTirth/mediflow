import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import bcrypt
from api.services.db import get_connection

USERS = [
    {
        'username':  'admin',
        'password':  'MediFlow@2024',
        'full_name': 'Dr. Admin',
        'role':      'admin',
    },
    {
        'username':  'drsmith',
        'password':  'Doctor@2024',
        'full_name': 'Dr. Sarah Smith',
        'role':      'doctor',
    },
    {
        'username':  'nurse01',
        'password':  'Nurse@2024',
        'full_name': 'Nurse James',
        'role':      'nurse',
    },
]


def seed():
    print("[seed] Seeding users table...")
    conn   = get_connection()
    cursor = conn.cursor()

    for user in USERS:
        hashed = bcrypt.hashpw(
            user['password'].encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

        cursor.execute("""
            IF NOT EXISTS (SELECT 1 FROM users WHERE username = ?)
            INSERT INTO users (username, password, full_name, role)
            VALUES (?, ?, ?, ?)
        """,
            user['username'],
            user['username'], hashed, user['full_name'], user['role']
        )
        print(f"[seed] Created user: {user['username']} ({user['role']})")

    conn.commit()
    conn.close()
    print("[seed] Done.")


if __name__ == '__main__':
    seed()