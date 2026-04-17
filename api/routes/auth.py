from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from api.services.db import fetch_one
from datetime import timedelta
import bcrypt

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data     = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    user = fetch_one("""
        SELECT user_id, username, password, full_name, role, is_active
        FROM users
        WHERE username = ?
    """, [username])

    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user['is_active']:
        return jsonify({'error': 'Account is deactivated'}), 401

    password_match = bcrypt.checkpw(
        password.encode('utf-8'),
        user['password'].encode('utf-8')
    )

    if not password_match:
        return jsonify({'error': 'Invalid credentials'}), 401

    token = create_access_token(
        identity=username,
        additional_claims={
            'role':     user['role'],
            'name':     user['full_name'],
            'user_id':  user['user_id'],
        },
        expires_delta=timedelta(hours=8)
    )

    return jsonify({
        'token':    token,
        'username': username,
        'name':     user['full_name'],
        'role':     user['role'],
    })


@auth_bp.route('/auth/me', methods=['GET'])
@jwt_required()
def me():
    identity = get_jwt_identity()
    user = fetch_one("""
        SELECT username, full_name, role
        FROM users WHERE username = ?
    """, [identity])

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'username': user['username'],
        'name':     user['full_name'],
        'role':     user['role'],
    })


@auth_bp.route('/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out successfully'})