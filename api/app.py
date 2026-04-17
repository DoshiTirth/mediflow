from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from api.routes.patients import patients_bp
from api.routes.vitals import vitals_bp
from api.routes.anomalies import anomalies_bp
from api.routes.auth import auth_bp
from api.routes.reports import reports_bp
from api.services.logger import get_logger
import os
import time
from dotenv import load_dotenv

load_dotenv()

logger = get_logger('mediflow.app')


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['JWT_SECRET_KEY']           = os.getenv('SECRET_KEY', 'mediflow-secret-key-2024')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = False

    jwt = JWTManager(app)

    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        return jsonify({'error': 'Authorization required', 'reason': reason}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({'error': 'Invalid token', 'reason': reason}), 401

    app.register_blueprint(auth_bp,      url_prefix='/api')
    app.register_blueprint(patients_bp,  url_prefix='/api')
    app.register_blueprint(vitals_bp,    url_prefix='/api')
    app.register_blueprint(anomalies_bp, url_prefix='/api')
    app.register_blueprint(reports_bp,   url_prefix='/api')

    # Request Logging
    @app.before_request
    def before_request():
        request.start_time = time.time()

    @app.after_request
    def after_request(response):
        duration = round((time.time() - request.start_time) * 1000, 2)
        logger.info(
            f'{request.method} {request.path} '
            f'— {response.status_code} '
            f'— {duration}ms'
        )
        return response

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'service': 'MediFlow API'})

    @app.errorhandler(404)
    def not_found(e):
        logger.warning(f'404 — {request.path}')
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        logger.error(f'500 — {request.path} — {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

    logger.info('MediFlow API started')
    return app


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    app  = create_app()
    app.run(debug=True, port=port)