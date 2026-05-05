import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

os.makedirs('models', exist_ok=True)

print("=" * 50)
print("🤖 FRAUD DETECTION MODEL TRAINING")
print("=" * 50)

# Load dataset
df = pd.read_csv('dataset/absenteeism.csv')

print(f"✅ Dataset loaded: {df.shape[0]} rows")

# Feature columns (আপনার সিস্টেমের সাথে মানানসই)
feature_columns = ['reason', 'month', 'day', 'seasons', 'age', 'leave_duration']

X = df[feature_columns]
y = df['is_fraudulent']

print(f"\n📊 Target distribution:")
print(f"   Fraudulent (High Risk): {sum(y)} ({sum(y)/len(y)*100:.1f}%)")
print(f"   Normal (Low Risk): {len(y)-sum(y)} ({(len(y)-sum(y))/len(y)*100:.1f}%)")

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train model
print("\n🤖 Training Random Forest model...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# Evaluate
y_pred = model.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n✅ Model accuracy: {accuracy:.2%}")

print("\n📋 Classification Report:")
print(classification_report(y_test, y_pred, target_names=['Normal', 'High Risk']))

# Save model and scaler
joblib.dump(model, 'models/fraud_model.pkl')
joblib.dump(scaler, 'models/scaler.pkl')
joblib.dump(feature_columns, 'models/feature_columns.pkl')

print("\n💾 Model saved to 'models/' directory")

print("\n🔍 Feature importance:")
for col, imp in zip(feature_columns, model.feature_importances_):
    print(f"   {col}: {imp:.3f}")

print("\n✅ Training complete!")