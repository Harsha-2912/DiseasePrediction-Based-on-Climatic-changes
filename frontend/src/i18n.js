import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    en: {
        translation: {
            "Welcome": "Welcome to Climate Disease Predictor",
            "Predict": "Predict Disease",
            "Login": "Login",
            "Register": "Register",
            "Dashboard": "Dashboard",
            "Admin": "Admin Panel",
            "Logout": "Logout",
            "Temperature": "Temperature (°C)",
            "Humidity": "Humidity (%)",
            "Rainfall": "Rainfall (mm)",
            "AQI": "Air Quality Index",
            "Location": "Location",
            "Submit": "Submit",
            "Result": "Prediction Result",
            "Disease": "Predicted Disease",
            "Accuracy": "Model Accuracy",
            "Precautions": "Precautions",
            "History": "History",
            "Upload Dataset": "Upload Dataset",
            "Language": "Language"
        }
    },
    hi: {
        translation: {
            "Welcome": "जलवायु रोग भविष्यवक्ता में आपका स्वागत है",
            "Predict": "रोग की भविष्यवाणी करें",
            "Login": "लॉग इन करें",
            "Register": "पंजीकरण करें",
            "Dashboard": "डैशबोर्ड",
            "Admin": "एडमिन पैनल",
            "Logout": "लॉग आउट",
            "Temperature": "तापमान (°C)",
            "Humidity": "नमी (%)",
            "Rainfall": "वर्षा (mm)",
            "AQI": "वायु गुणवत्ता सूचकांक",
            "Location": "स्थान",
            "Submit": "जमा करें",
            "Result": "भविष्यवाणी परिणाम",
            "Disease": "अनुमानित रोग",
            "Accuracy": "मॉडल सटीकता",
            "Precautions": "सावधानियां",
            "History": "इतिहास",
            "Upload Dataset": "डेटासेट अपलोड करें",
            "Language": "भाषा"
        }
    },
    te: {
        translation: {
            "Welcome": "క్లైమేట్ డిసీజ్ ప్రిడిక్టర్‌కు స్వాగతం",
            "Predict": "వ్యాధిని అంచనా వేయండి",
            "Login": "లాగిన్",
            "Register": "రిజిస్టర్",
            "Dashboard": "డాష్‌బోర్డ్",
            "Admin": "అడ్మిన్ ప్యానెల్",
            "Logout": "లాగ్ అవుట్",
            "Temperature": "ఉష్ణోగ్రత (°C)",
            "Humidity": "తేమ (%)",
            "Rainfall": "వర్షపాతం (mm)",
            "AQI": "గాలి నాణ్యత సూచిక",
            "Location": "స్థానం",
            "Submit": "సమర్పించండి",
            "Result": "ఫలితం",
            "Disease": "అంచనా వేయబడిన వ్యాధి",
            "Accuracy": "ఖచ్చితత్వం",
            "Precautions": "ముందస్తు జాగ్రత్తలు",
            "History": "చరిత్ర",
            "Upload Dataset": "డేటాసెట్‌ను అప్‌లోడ్ చేయండి",
            "Language": "భాష"
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
