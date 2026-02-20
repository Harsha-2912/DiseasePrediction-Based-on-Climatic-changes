# Climate Disease Predictor

Full-stack web application to predict diseases based on environmental factors using Machine Learning.

## Features
- **Disease Prediction**: Predicts diseases like Malaria, Dengue, etc., based on Temperature, Humidity, Rainfall, and AQI.
- **Multilingual Support**: English, Hindi, Telugu.
- **Admin Dashboard**: Upload new datasets (CSV) to retrain the model.
- **Prediction History**: View past predictions.
- **Secure Authentication**: JWT-based login and registration.

## Tech Stack
- **Frontend**: React.js, Vite, i18next
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **ML**: Python, Scikit-learn, Pandas

## Setup Instructions

### 1. Database Setup
Ensure you have MySQL installed and running.
Create the database and tables using the provided schema:
```sql
SOURCE database/schema.sql;
```
Or run the SQL commands in `database/schema.sql` manually in your MySQL client.

### 2. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
npm install
```
Create a `.env` file (if not exists) with your database credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=climate_disease_predictor
JWT_SECRET=your_jwt_secret_key
```
Start the server:
```bash
npm run dev
```
(Ensure you install `nodemon` or use `node server.js` if `dev` script is not set up, but `package.json` should have it).

### 3. Frontend Setup
Navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```

### 4. ML Setup
Navigate to the `ml` directory and install dependencies:
```bash
cd ml
pip install -r requirements.txt
```
To train the initial model (optional, as one is created on first prediction attempt if missing):
```bash
python train_model.py
```

## Usage
1. Ensure both Backend (`http://localhost:5000`) and Frontend (`http://localhost:5173`) servers are running.
   - Run `npm run dev` in `backend` folder.
   - Run `npm run dev` in `frontend` folder.
2. Open `http://localhost:5173`.
3. Register a new account.
4. Login and navigate to the Dashboard.
5. Enter environmental details and click "Submit".
6. View the result and precautions.
