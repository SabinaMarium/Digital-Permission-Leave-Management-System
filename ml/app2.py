from flask import Flask, jsonify, request
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model
model = joblib.load('models/fraud_model.pkl')
scaler = joblib.load('models/scaler.pkl')
feature_columns = joblib.load('models/feature_columns.pkl')

print("✅ Fraud Detection API Ready!")
print("🌐 Running on http://127.0.0.1:5000")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        features = [
            float(data.get('reason', 0)),
            float(data.get('month', 1)),
            float(data.get('day', 1)),
            float(data.get('seasons', 1)),
            float(data.get('distance', 20)),
            float(data.get('service_time', 5)),
            float(data.get('age', 25)),
            float(data.get('work_load', 100)),
            float(data.get('hit_target', 0))
        ]
        
        features_scaled = scaler.transform([features])
        prediction = model.predict(features_scaled)[0]
        probability = model.predict_proba(features_scaled)[0]
        
        return jsonify({
            'success': True,
            'prediction': int(prediction),
            'risk_level': 'High' if prediction == 1 else 'Low',
            'fraud_probability': float(probability[1])
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'API is running!'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)