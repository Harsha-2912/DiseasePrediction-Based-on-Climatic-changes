import sys
import json
import joblib
import numpy as np
import os
import warnings
import traceback

warnings.filterwarnings("ignore")

model_dir = os.path.dirname(__file__)
model_path = os.path.join(model_dir, 'model.pkl')
rf_model_path = os.path.join(model_dir, 'RandomForest_model.pkl')
svm_model_path = os.path.join(model_dir, 'SVM_model.pkl')
lr_model_path = os.path.join(model_dir, 'LogisticRegression_model.pkl')

# ==================== DISEASE KNOWLEDGE BASE ====================
DISEASE_PRECAUTIONS = {
    'Malaria': [
        'Use mosquito nets treated with insecticide while sleeping',
        'Apply mosquito repellent (DEET-based) on exposed skin',
        'Wear long-sleeved shirts and long pants, especially during dusk and dawn',
        'Eliminate standing water around your home to reduce mosquito breeding',
        'Consult a doctor immediately if you experience high fever with chills',
        'Take antimalarial prophylaxis if traveling to endemic areas'
    ],
    'Dengue': [
        'Eliminate all sources of stagnant water (flower pots, tires, containers)',
        'Use mosquito coils and electric vapor mats indoors',
        'Wear protective clothing during daytime (Aedes mosquitoes are day-biters)',
        'Stay hydrated with ORS (Oral Rehydration Solution) if symptoms appear',
        'Monitor platelet count if fever persists beyond 2 days',
        'Avoid aspirin and ibuprofen — use only paracetamol for fever'
    ],
    'Typhoid': [
        'Drink only boiled or purified water',
        'Avoid eating raw vegetables and unpeeled fruits from street vendors',
        'Wash hands thoroughly with soap before eating and after using the toilet',
        'Get vaccinated with typhoid vaccine if in endemic area',
        'Avoid eating food from unhygienic places during monsoon season',
        'Complete the full course of prescribed antibiotics if diagnosed'
    ],
    'Asthma': [
        'Wear an N95 mask when AQI exceeds 150',
        'Keep emergency inhaler (bronchodilator) accessible at all times',
        'Avoid outdoor exercise when air quality is poor',
        'Install an air purifier with HEPA filter in your bedroom',
        'Monitor local AQI levels daily and plan outdoor activities accordingly',
        'Avoid known triggers: smoke, dust, pollen, and strong perfumes'
    ],
    'Viral Fever': [
        'Rest adequately and get at least 8 hours of sleep',
        'Stay well-hydrated with warm fluids (soups, herbal teas, warm water)',
        'Take paracetamol for fever — avoid self-medicating with antibiotics',
        'Avoid sudden temperature changes (AC to outdoor heat)',
        'Boost immunity with Vitamin C-rich foods (citrus fruits, amla)',
        'Isolate if symptoms persist to prevent spreading to family members'
    ],
    'Cholera': [
        'Drink only treated or boiled water',
        'Wash hands frequently, especially before eating and after toilet use',
        'Avoid raw or undercooked seafood',
        'Use ORS immediately if diarrhea begins — dehydration is the primary risk',
        'Seek medical attention urgently for severe watery diarrhea',
        'Ensure proper sanitation and waste disposal in your locality'
    ],
    'Heat Stroke': [
        'Stay indoors between 11 AM and 4 PM during extreme heat',
        'Drink at least 3-4 liters of water daily',
        'Wear light-colored, loose-fitting, breathable clothing',
        'Apply cold compresses to neck, armpits, and groin if body temp rises',
        'Avoid intense physical exertion during peak heat hours',
        'Seek emergency medical help if someone collapses or stops sweating'
    ],
    'No Disease': [
        'Continue maintaining good hygiene practices',
        'Stay hydrated and eat a balanced diet',
        'Monitor weather conditions and air quality regularly',
        'Keep your living space clean and pest-free',
        'Get regular health check-ups',
        'Stay physically active with daily exercise'
    ]
}

def get_severity(risk_score):
    """Determine severity level based on risk score."""
    if risk_score >= 80:
        return 'Critical'
    elif risk_score >= 60:
        return 'High'
    elif risk_score >= 35:
        return 'Moderate'
    else:
        return 'Low'

def predict(temperature, humidity, rainfall, aqi, location, risk_level='Low', batch_mode=False):
    if batch_mode:
        try:
            inputs = json.loads(temperature)
            results = []
            for item in inputs:
                res = calculate_risk(item['temp'], item['humidity'], item['rainfall'], item['aqi'], risk_level)
                res['date'] = item.get('date', '')
                results.append(res)
            print(json.dumps(results))
        except Exception as e:
            print(json.dumps({"error": str(e), "trace": traceback.format_exc()}))
        return

    calculate_risk(temperature, humidity, rainfall, aqi, risk_level, print_output=True)

def calculate_risk(temperature, humidity, rainfall, aqi, risk_level='Low', print_output=False):
    try:
        temp = float(temperature)
        hum = float(humidity)
        rain = float(rainfall)
        air_quality = float(aqi)

        # Initialize disease risks
        disease_risks = {
            'Malaria': 0.0, 'Dengue': 0.0, 'Typhoid': 0.0,
            'Asthma': 0.0, 'Viral Fever': 0.0, 'Cholera': 0.0,
            'Heat Stroke': 0.0, 'No Disease': 0.0
        }

        # ==================== ENSEMBLE MODEL PREDICTIONS ====================
        ensemble_results = {}
        models_to_load = {
            'Random Forest': rf_model_path,
            'SVM': svm_model_path,
            'Logistic Regression': lr_model_path,
            'Primary Model': model_path
        }

        features = np.array([[temp, hum, rain, air_quality]])
        model_votes = {}

        for model_name, mpath in models_to_load.items():
            if os.path.exists(mpath):
                try:
                    model = joblib.load(mpath)
                    if hasattr(model, 'predict_proba'):
                        probas = model.predict_proba(features)[0]
                        classes = model.classes_
                        best_idx = np.argmax(probas)
                        pred = classes[best_idx]
                        conf = float(probas[best_idx])

                        # Accumulate probabilities
                        for i, disease in enumerate(classes):
                            if disease in disease_risks:
                                disease_risks[disease] += float(probas[i])

                        model_votes[model_name] = pred
                        ensemble_results[model_name] = {
                            'prediction': pred,
                            'confidence': round(conf * 100, 1)
                        }
                    else:
                        pred = model.predict(features)[0]
                        model_votes[model_name] = pred
                        ensemble_results[model_name] = {
                            'prediction': pred,
                            'confidence': 85.0
                        }
                except Exception:
                    pass

        # Average model probabilities
        num_models = len(ensemble_results)
        if num_models > 0:
            for k in disease_risks:
                disease_risks[k] /= num_models

        # ==================== EXPERT SYSTEM (RULE-BASED) ====================
        rule_scores = {k: 0.0 for k in disease_risks}
        rule_scores['No Disease'] = 0.15

        # --- Malaria Rules ---
        if temp > 25 and hum > 60:
            rule_scores['Malaria'] += 0.2
        if temp > 30 and hum > 80:
            rule_scores['Malaria'] += 0.35
        if rain > 100 and temp > 25:
            rule_scores['Malaria'] += 0.25

        # --- Dengue Rules ---
        if temp > 25 and temp < 35 and hum > 60:
            rule_scores['Dengue'] += 0.25
        if rain > 50 and rain < 300 and hum > 70:
            rule_scores['Dengue'] += 0.3
        if temp > 28 and hum > 75:
            rule_scores['Dengue'] += 0.2

        # --- Typhoid Rules ---
        if rain > 150:
            rule_scores['Typhoid'] += 0.3
        if rain > 250 and hum > 70:
            rule_scores['Typhoid'] += 0.35
        if temp > 25 and rain > 100:
            rule_scores['Typhoid'] += 0.15

        # --- Cholera Rules ---
        if rain > 200 and temp > 25:
            rule_scores['Cholera'] += 0.35
        if rain > 300:
            rule_scores['Cholera'] += 0.3
        if hum > 80 and rain > 150:
            rule_scores['Cholera'] += 0.2

        # --- Asthma Rules ---
        if air_quality > 100:
            rule_scores['Asthma'] += 0.2
        if air_quality > 150:
            rule_scores['Asthma'] += 0.35
        if air_quality > 200:
            rule_scores['Asthma'] += 0.3
        if air_quality > 300:
            rule_scores['Asthma'] += 0.2

        # --- Viral Fever Rules ---
        if temp > 35:
            rule_scores['Viral Fever'] += 0.25
        if temp < 18:
            rule_scores['Viral Fever'] += 0.3
        if abs(temp - 25) > 10:
            rule_scores['Viral Fever'] += 0.15

        # --- Heat Stroke Rules ---
        if temp > 38:
            rule_scores['Heat Stroke'] += 0.4
        if temp > 42:
            rule_scores['Heat Stroke'] += 0.4
        if temp > 35 and hum < 30:
            rule_scores['Heat Stroke'] += 0.25

        # --- Regional Risk Boost ---
        if risk_level == 'High':
            rule_scores['Malaria'] += 0.25
            rule_scores['Dengue'] += 0.25
            rule_scores['Viral Fever'] += 0.15
        elif risk_level == 'Moderate':
            rule_scores['Malaria'] += 0.1
            rule_scores['Dengue'] += 0.1

        # ==================== FUSION ====================
        for k, rule_score in rule_scores.items():
            if k in disease_risks:
                if num_models > 0:
                    disease_risks[k] = (disease_risks[k] * 0.6) + (rule_score * 0.4)
                else:
                    disease_risks[k] = rule_score

        # Normalize
        total_risk = sum(disease_risks.values())
        if total_risk > 0:
            for k in disease_risks:
                disease_risks[k] /= total_risk

        # Pick best
        best_disease = max(disease_risks, key=disease_risks.get)
        prediction = best_disease
        accuracy = disease_risks[best_disease]
        risk_score = round(accuracy * 100, 0)

        # If "No Disease" wins but with low confidence, and something else is close, flag it
        if prediction == 'No Disease' and accuracy < 0.3:
            sorted_risks = sorted(disease_risks.items(), key=lambda x: x[1], reverse=True)
            if len(sorted_risks) > 1 and sorted_risks[1][1] > 0.15:
                prediction = sorted_risks[1][0]
                accuracy = sorted_risks[1][1]
                risk_score = round(accuracy * 100, 0)

        severity = get_severity(risk_score)

        # Get precautions
        precautions = DISEASE_PRECAUTIONS.get(prediction, DISEASE_PRECAUTIONS['No Disease'])

        # ==================== EXPLAINABLE AI ====================
        feature_names = ['Temperature', 'Humidity', 'Rainfall', 'AQI']
        feature_values = [temp, hum, rain, air_quality]
        feature_units = ['°C', '%', 'mm', 'Index']

        # 1) Model-based feature importance (from Random Forest)
        model_importance = [0.25, 0.25, 0.25, 0.25]  # default equal
        if os.path.exists(rf_model_path):
            try:
                rf = joblib.load(rf_model_path)
                if hasattr(rf, 'feature_importances_'):
                    imp = rf.feature_importances_
                    model_importance = [round(float(x), 4) for x in imp]
            except Exception:
                pass

        # 2) Rule-based contribution analysis
        # Measure how each feature's value triggered rule conditions
        rule_contributions = {'Temperature': 0.0, 'Humidity': 0.0, 'Rainfall': 0.0, 'AQI': 0.0}

        # Temperature contributions
        if temp > 25: rule_contributions['Temperature'] += 0.15
        if temp > 30: rule_contributions['Temperature'] += 0.2
        if temp > 35: rule_contributions['Temperature'] += 0.25
        if temp > 38: rule_contributions['Temperature'] += 0.3
        if temp > 42: rule_contributions['Temperature'] += 0.3
        if temp < 18: rule_contributions['Temperature'] += 0.25

        # Humidity contributions
        if hum > 60: rule_contributions['Humidity'] += 0.15
        if hum > 70: rule_contributions['Humidity'] += 0.2
        if hum > 75: rule_contributions['Humidity'] += 0.15
        if hum > 80: rule_contributions['Humidity'] += 0.2
        if hum < 30: rule_contributions['Humidity'] += 0.15

        # Rainfall contributions
        if rain > 50: rule_contributions['Rainfall'] += 0.1
        if rain > 100: rule_contributions['Rainfall'] += 0.15
        if rain > 150: rule_contributions['Rainfall'] += 0.2
        if rain > 200: rule_contributions['Rainfall'] += 0.25
        if rain > 250: rule_contributions['Rainfall'] += 0.2
        if rain > 300: rule_contributions['Rainfall'] += 0.2

        # AQI contributions
        if air_quality > 100: rule_contributions['AQI'] += 0.15
        if air_quality > 150: rule_contributions['AQI'] += 0.25
        if air_quality > 200: rule_contributions['AQI'] += 0.25
        if air_quality > 300: rule_contributions['AQI'] += 0.2

        # Normalize rule contributions
        total_rc = sum(rule_contributions.values())
        if total_rc > 0:
            rule_contributions = {k: round(v / total_rc, 4) for k, v in rule_contributions.items()}
        else:
            rule_contributions = {k: 0.25 for k in rule_contributions}

        # 3) Combined importance (fused model + rule)
        combined_importance = []
        for i, name in enumerate(feature_names):
            mi = model_importance[i] if i < len(model_importance) else 0.25
            ri = rule_contributions.get(name, 0.25)
            combined = round((mi * 0.5 + ri * 0.5) * 100, 1)
            combined_importance.append(combined)

        # Normalize combined to sum to 100
        total_combined = sum(combined_importance)
        if total_combined > 0:
            combined_importance = [round(x / total_combined * 100, 1) for x in combined_importance]

        # 4) Generate natural language reasoning
        reasoning = []
        thresholds = {
            'Temperature': [(42, 'EXTREME heat (>{val}°C) — very strong trigger for heat stroke and disease'),
                           (38, 'Very high temperature ({val}°C) — significant risk factor'),
                           (35, 'High temperature ({val}°C) — triggers multiple disease pathways'),
                           (30, 'Elevated temperature ({val}°C) — warm conditions favor vector-borne diseases'),
                           (25, 'Moderate warmth ({val}°C) — above tropical disease activation threshold'),
                           (18, None),  # handled separately
                           (0, 'Low temperature ({val}°C) — cold stress may trigger viral infections')],
            'Humidity': [(80, 'Very high humidity ({val}%) — ideal for mosquito breeding and pathogen survival'),
                        (70, 'High humidity ({val}%) — favorable for disease vector proliferation'),
                        (60, 'Moderate-high humidity ({val}%) — approaching disease-conducive levels'),
                        (30, None),
                        (0, 'Low humidity ({val}%) — dry conditions may aggravate respiratory issues')],
            'Rainfall': [(300, 'Extreme rainfall ({val}mm) — high flood risk, water contamination likely'),
                         (200, 'Heavy rainfall ({val}mm) — standing water creates vector breeding grounds'),
                         (150, 'Significant rainfall ({val}mm) — water-borne disease risk elevated'),
                         (100, 'Moderate rainfall ({val}mm) — conditions support mosquito life cycle'),
                         (50, 'Light rainfall ({val}mm) — minor contribution to disease risk'),
                         (0, 'Minimal or no rainfall ({val}mm) — dry conditions')],
            'AQI': [(300, 'HAZARDOUS air quality (AQI {val}) — severe respiratory risk for all groups'),
                    (200, 'Very unhealthy air quality (AQI {val}) — serious asthma and respiratory risk'),
                    (150, 'Unhealthy air quality (AQI {val}) — significant respiratory disease trigger'),
                    (100, 'Moderate air quality (AQI {val}) — sensitive groups may experience effects'),
                    (50, 'Acceptable air quality (AQI {val}) — low respiratory risk'),
                    (0, 'Good air quality (AQI {val}) — minimal respiratory risk')]
        }

        for i, (name, val) in enumerate(zip(feature_names, feature_values)):
            thresh_list = thresholds.get(name, [])
            reason_text = f'{name}: {val} — within normal range'
            for thresh_val, desc in thresh_list:
                if desc is None:
                    continue
                if val >= thresh_val:
                    reason_text = desc.format(val=round(val, 1))
                    break
            reasoning.append({
                'feature': name,
                'value': round(val, 1),
                'unit': feature_units[i],
                'importance': combined_importance[i],
                'reasoning': reason_text,
                'direction': 'high_risk' if combined_importance[i] > 25 else ('moderate' if combined_importance[i] > 15 else 'low_risk')
            })

        # Sort by importance descending
        reasoning.sort(key=lambda x: x['importance'], reverse=True)

        # 5) SHAP-like waterfall data
        base_risk = 12.5  # base rate with 8 diseases = 1/8 = 12.5%
        waterfall = [{'label': 'Base Rate', 'value': base_risk, 'cumulative': base_risk, 'type': 'base'}]
        cumulative = base_risk
        for r in reasoning:
            delta = (r['importance'] / 100) * (risk_score - base_risk)
            cumulative += delta
            waterfall.append({
                'label': r['feature'],
                'value': round(delta, 1),
                'cumulative': round(cumulative, 1),
                'type': 'increase' if delta > 0 else 'decrease'
            })
        waterfall.append({'label': 'Final Risk', 'value': round(risk_score, 1), 'cumulative': round(risk_score, 1), 'type': 'total'})

        explainability = {
            'model_importance': {feature_names[i]: model_importance[i] for i in range(len(feature_names))},
            'rule_importance': rule_contributions,
            'combined_importance': {feature_names[i]: combined_importance[i] for i in range(len(feature_names))},
            'reasoning': reasoning,
            'waterfall': waterfall,
            'dominant_feature': reasoning[0]['feature'] if reasoning else 'Unknown',
            'explanation_summary': f"The predicted disease '{prediction}' is primarily driven by {reasoning[0]['feature']} ({reasoning[0]['value']}{reasoning[0]['unit']}), contributing {reasoning[0]['importance']}% to the overall risk assessment."
        }

        result = {
            "disease": prediction,
            "accuracy": round(accuracy * 100, 2),
            "risk_context": risk_level,
            "risk_score": risk_score,
            "severity": severity,
            "precautions": precautions,
            "disease_risks": {k: round(v * 100, 1) for k, v in disease_risks.items()},
            "ensemble": ensemble_results if ensemble_results else None,
            "explainability": explainability
        }

        if print_output:
            print(json.dumps(result))
        return result

    except Exception as e:
        error_result = {"error": str(e), "trace": traceback.format_exc()}
        if print_output:
            print(json.dumps(error_result), file=sys.stderr)
            sys.exit(1)
        return error_result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Insufficient arguments"}), file=sys.stderr)
        sys.exit(1)

    if sys.argv[1] == '--batch':
        json_input = sys.argv[2]
        risk = sys.argv[3] if len(sys.argv) > 3 else 'Low'
        predict(json_input, None, None, None, None, risk, batch_mode=True)
    else:
        if len(sys.argv) < 6:
            print(json.dumps({"error": "Insufficient arguments"}), file=sys.stderr)
            sys.exit(1)
        risk = sys.argv[6] if len(sys.argv) > 6 else 'Low'
        predict(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], risk)
