# AEVUM — Cybersecurity & Victim Support Web Application

AEVUM is a comprehensive cybersecurity web application designed to protect users from photo misuse, provide tampering detection tools, offer crisis guidance, and streamline secure evidence reporting.

## 🚀 Tech Stack
- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express (REST API)
- **ML/Image Processing:** Python FastAPI microservice (OpenCV, PyTorch)
- **Database & Cache:** PostgreSQL & Redis
- **Security:** bcrypt password hashing, JWT authentication, and secure OTP verification.

## 📂 Project Structure
- `aevum-frontend/` - React Vite client interface
- `aevum-backend/` - Node.js Express REST API & authentication
- `aevum-ml-service/` - Python FastAPI image perturbation & detection service

## 🛠️ Getting Started Locally

### 1. Frontend
```bash
cd aevum-frontend
npm install
npm run dev