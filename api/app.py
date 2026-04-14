from flask import Flask, jsonify
from flask_cors import CORS
from api.routes.patients import patients_bp
from api.routes.vitals import vitals_bp
from api.routes.anomalies import anomalies_bp
import os
from dotenv import load_dotenv

load_dotenv()


def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(patients_bp,  url_prefix='/api')
    app.register_blueprint(vitals_bp,    url_prefix='/api')
    app.register_blueprint(anomalies_bp, url_prefix='/api')

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok', 'service': 'MediFlow API'})

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    return app


if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    app  = create_app()
    app.run(debug=True, port=port)