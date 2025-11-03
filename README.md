# 🚗 Car Service Appointment Management System

An AI-assisted appointment and service center management platform for car maintenance and servicing.  
It allows customers to **book, cancel, and manage car service appointments**, while admins can view **analytics, bookings, and cancellations** via a dashboard.

Built using **FastAPI**, **React (Vite + TypeScript)**, and **MySQL**, this system also integrates **Vapi Voice Agent** for intelligent voice-based booking.

---

## 🧠 Project Overview

This project enables:
- Customers to **book car servicing slots** using web or voice interface  
- **Automatic service center availability** lookup  
- **Customer registration** and vehicle management  
- **Admin Dashboard** for monitoring bookings, cancellations, and performance  
- **Secure admin login system**

---

## ⚙️ Tech Stack

| Layer | Technology Used |
|-------|------------------|
| Voice Agent | Vapi Voice AI |
| Backend API | FastAPI |
| Database | MySQL |
| Frontend | React + Vite + TailwindCSS + TypeScript |
| Environment Management | Python Dotenv |
| Authentication | bcrypt (Password Hashing) |

---

## 🏗️ Architecture Overview

```
                  (Customer Voice / Web Request)
                  ┌───────────────────────┐
                  │     Vapi Voice Bot    │
                  │   (Collects details)  │
                  └──────────┬────────────┘
                             │ JSON Payloads
                  ┌──────────▼────────────┐
                  │   FastAPI Backend     │
                  │  (Auth + DB Logic)    │
                  └──────────┬────────────┘
                             │ SQL Queries
                       ┌─────▼───────┐
                       │  MySQL DB   │
                       │ customers,  │
                       │ vehicles,   │
                       │ appointments│
                       └─────────────┘

        ┌────────────────────────────┐
        │  React Admin Dashboard     │
        │  (Charts / Stats / Login)  │
        └─────────────┬──────────────┘
                      │ REST API
```

---

## 🧩 Folder Structure

```
CAR_SERVICES/
│
├── backend/
│   ├── main.py               # FastAPI backend with booking APIs
│   ├── requirements.txt
│   ├── .env                  # Database credentials
│   └── venv/                 # Python virtual environment
│
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── Admin.tsx
    │   │   ├── AdminLogin.tsx
    │   │   ├── BookingChart.tsx
    │   │   ├── DailyLineChart.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── Home.tsx
    │   │   └── VoiceAgent.tsx
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── .env                  # Vapi Voice API keys
    ├── eslint.config.js
    └── vite-env.d.ts
```

---

## 🔑 Environment Variables

### Backend `.env`
```
DB_HOST=sales-advisor.ckbouw8iick1.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=Vapi_009
DB_NAME=car_service
```

### Frontend `.env`
```
VITE_VAPI_CLIENT_KEY=cdd27103-fa81-4e2a-b624-637c3ca9937c
VITE_VAPI_AGENT_ID=f58631d2-d9ef-457b-b780-c125df8a8f3f
```

---

## ⚙️ Backend Setup

```bash
cd backend
python -m venv venv
venv/Scripts/activate  # On Windows
pip install -r requirements.txt
python main.py
```

Server will start at **http://localhost:8000**

---

## 💻 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at **http://localhost:5173**

---

## 🧠 API Endpoints Overview

| Endpoint | Method | Description |
|-----------|--------|-------------|
| `/` | GET | Welcome message |
| `/check-customer` | POST | Verify existing customer by phone number |
| `/create-customer` | POST | Register new customer & vehicle |
| `/availability` | POST | Check available slots for a date |
| `/book-appointment` | POST | Book a new appointment |
| `/cancel-appointment` | POST | Cancel an existing booking |
| `/dashboard-stats` | GET | Admin dashboard analytics (bookings/cancellations) |
| `/admin-login` | POST | Admin login authentication |

---

## 🛠️ Admin Dashboard Features

- Daily, Weekly, and Monthly Booking Statistics  
- Total Cancellations Overview  
- Line & Bar Charts (Monthly and Yearly Trends)  
- Today’s Bookings Table  
- Secure Admin Login System  

---

## 🧩 System Workflow

| Step | Action | Description |
|------|---------|-------------|
| 1 | Customer provides phone number | `/check-customer` verifies registration |
| 2 | If not registered | `/create-customer` adds new record |
| 3 | System checks availability | `/availability` returns open service slots |
| 4 | Appointment is confirmed | `/book-appointment` reserves slot |
| 5 | Cancellations handled | `/cancel-appointment` updates slot count |
| 6 | Admin reviews stats | `/dashboard-stats` provides analytics |

---

## 🚀 Deployment Notes

| Component | Recommended Platform |
|------------|----------------------|
| Backend | AWS EC2 / Render / Railway |
| Frontend | Vercel / Netlify |
| Database | AWS RDS (MySQL) |
| Voice Agent | Vapi Cloud |

---

## ✅ Project Status

**Status:** Production-ready prototype  
**Version:** 1.0.0  
**Maintainer:** Vaishnavi Pawar  
