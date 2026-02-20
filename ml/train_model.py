import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Feature: Temperature, Humidity, Rainfall, AQI
# Target: Disease (Malaria, Dengue, Typhoid, Asthma, Viral Fever, Cholera, Heat Stroke, No Disease)

def create_probabilistic_data(n_samples=5000):
    np.random.seed(42)
    data = []

    for _ in range(n_samples):
        temp = np.random.uniform(10, 50)
        humidity = np.random.uniform(15, 98)
        rainfall = np.random.uniform(0, 500)
        aqi = np.random.uniform(10, 450)

        probs = {
            'No Disease': 1.2,
            'Malaria': 0.0,
            'Dengue': 0.0,
            'Typhoid': 0.0,
            'Asthma': 0.0,
            'Viral Fever': 0.0,
            'Cholera': 0.0,
            'Heat Stroke': 0.0
        }

        # ===== MALARIA: High temp + High humidity + Rain =====
        if temp > 25 and humidity > 60:
            probs['Malaria'] += 0.2
        if temp > 30 and humidity > 80:
            probs['Malaria'] += 0.4
            probs['No Disease'] -= 0.3
        if rainfall > 100 and temp > 25:
            probs['Malaria'] += 0.25
        if temp > 28 and humidity > 70 and rainfall > 50:
            probs['Malaria'] += 0.3

        # ===== DENGUE: Moderate-high temp + Humid + Some rain (breeding) =====
        if 25 < temp < 35 and humidity > 60:
            probs['Dengue'] += 0.25
        if rainfall > 50 and rainfall < 300 and humidity > 70:
            probs['Dengue'] += 0.3
        if temp > 28 and humidity > 75:
            probs['Dengue'] += 0.2
            probs['No Disease'] -= 0.2

        # ===== TYPHOID: Heavy rain + Contamination risk =====
        if rainfall > 150:
            probs['Typhoid'] += 0.3
        if rainfall > 250 and humidity > 70:
            probs['Typhoid'] += 0.35
            probs['No Disease'] -= 0.2
        if temp > 25 and rainfall > 100:
            probs['Typhoid'] += 0.15

        # ===== CHOLERA: Very heavy rain + Warm =====
        if rainfall > 200 and temp > 25:
            probs['Cholera'] += 0.35
        if rainfall > 300:
            probs['Cholera'] += 0.3
            probs['No Disease'] -= 0.3
        if humidity > 80 and rainfall > 150:
            probs['Cholera'] += 0.2

        # ===== ASTHMA: Poor AQI =====
        if aqi > 100:
            probs['Asthma'] += 0.2
        if aqi > 150:
            probs['Asthma'] += 0.35
            probs['No Disease'] -= 0.25
        if aqi > 200:
            probs['Asthma'] += 0.3
        if aqi > 300:
            probs['Asthma'] += 0.25
            probs['No Disease'] -= 0.2

        # ===== VIRAL FEVER: Extreme temps =====
        if temp > 35:
            probs['Viral Fever'] += 0.25
        if temp < 18:
            probs['Viral Fever'] += 0.3
            probs['No Disease'] -= 0.2
        if abs(temp - 25) > 12:
            probs['Viral Fever'] += 0.2

        # ===== HEAT STROKE: Very high temp, low humidity =====
        if temp > 38:
            probs['Heat Stroke'] += 0.4
            probs['No Disease'] -= 0.3
        if temp > 42:
            probs['Heat Stroke'] += 0.4
        if temp > 35 and humidity < 30:
            probs['Heat Stroke'] += 0.25

        # Clamp no disease
        probs['No Disease'] = max(probs['No Disease'], 0.05)

        # Normalize
        total_prob = sum(max(0, p) for p in probs.values())
        normalized_probs = [max(0, p) / total_prob for p in probs.values()]
        diseases = list(probs.keys())

        choice = np.random.choice(diseases, p=normalized_probs)
        data.append([temp, humidity, rainfall, aqi, choice])

    return pd.DataFrame(data, columns=['temperature', 'humidity', 'rainfall', 'aqi', 'disease'])

def train_models():
    print("=" * 60)
    print("CLIMATE DISEASE PREDICTOR - MODEL TRAINING")
    print("=" * 60)

    print("\n[1/4] Generating training data (5000 samples)...")
    df = create_probabilistic_data(5000)

    print("\nDataset distribution:")
    print(df['disease'].value_counts())
    print(f"\nTotal samples: {len(df)}")

    X = df[['temperature', 'humidity', 'rainfall', 'aqi']]
    y = df['disease']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"\nTraining set: {len(X_train)}, Test set: {len(X_test)}")

    models = {
        'RandomForest': RandomForestClassifier(n_estimators=200, max_depth=15, min_samples_split=5, random_state=42),
        'LogisticRegression': LogisticRegression(max_iter=2000, multi_class='multinomial', C=1.0),
        'SVM': SVC(probability=True, kernel='rbf', C=10.0, gamma='scale')
    }

    results = {}

    print("\n[2/4] Training models...")
    for name, model in models.items():
        print(f"\n  Training {name}...")
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        acc = accuracy_score(y_test, y_pred)
        results[name] = acc

        # Cross-validation
        cv_scores = cross_val_score(model, X, y, cv=5, scoring='accuracy')
        print(f"  {name} Test Accuracy: {acc:.4f}")
        print(f"  {name} CV Accuracy:   {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

        # Save model
        model_filename = os.path.join(os.path.dirname(__file__), f'{name}_model.pkl')
        joblib.dump(model, model_filename)
        print(f"  Saved: {model_filename}")

    # Save best model as main model.pkl
    best_model_name = max(results, key=results.get)
    best_model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    joblib.dump(models[best_model_name], best_model_path)

    print("\n[3/4] Classification Report (Best Model):")
    print(f"Best Model: {best_model_name} ({results[best_model_name]:.4f})")
    y_pred_best = models[best_model_name].predict(X_test)
    print(classification_report(y_test, y_pred_best))

    print("\n[4/4] Summary:")
    print("-" * 40)
    for name, acc in sorted(results.items(), key=lambda x: x[1], reverse=True):
        bar = "█" * int(acc * 30)
        print(f"  {name:25s} {acc:.4f} {bar}")
    print("-" * 40)
    print(f"\n✅ Best model ({best_model_name}) saved as model.pkl")
    print("All models saved successfully!")

if __name__ == '__main__':
    train_models()
