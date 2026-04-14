import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    server = os.getenv('DB_SERVER')
    db     = os.getenv('DB_NAME')
    driver = os.getenv('DB_DRIVER')
    return pyodbc.connect(
        f"DRIVER={{{driver}}};SERVER={server};DATABASE={db};Trusted_Connection=yes;"
    )


def fetch_all(query, params=None):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params or [])
    columns = [col[0] for col in cursor.description]
    rows    = cursor.fetchall()
    conn.close()
    return [dict(zip(columns, row)) for row in rows]


def fetch_one(query, params=None):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params or [])
    columns = [col[0] for col in cursor.description]
    row     = cursor.fetchone()
    conn.close()
    return dict(zip(columns, row)) if row else None


def execute(query, params=None):
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(query, params or [])
    conn.commit()
    conn.close()