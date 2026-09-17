# Fiqh File (Fatwa Q&A Platform)

A modern, responsive Islamic Fatwa and Q&A management web application with Malayalam typography, multi-madhhab filtering, interactive user questions, and a robust admin dashboard.

## 🚀 Features

- **Ask Fatwa / Question Submission**: Fast question submission with Madhhab selection and urgency flags.
- **Public Fatwa Archive**: Searchable and filterable by Madhhab (Shafi'i, Hanafi, Maliki, Hanbali, General).
- **Public Discussion / Comments**: Community members can add respectful comments or reflections on answered fatwas.
- **Admin Dashboard**: Secure administrative portal to manage incoming queries, write answers, toggle urgency, and moderate comments.
- **Malayalam Font Support**: Integrated TypeScope typography (`FN Kanaka Semibold` & `Rahna22`).
- **Database**: Cloud MySQL database support with connection pooling and SSL encryption.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, TypeScope Fonts
- **Backend**: Node.js, Express.js, MySQL (`mysql2/promise`)
- **Database**: Aiven Cloud MySQL / Local MySQL

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18 or newer)
- MySQL database (local or cloud instance like Aiven)

### 2. Backend Setup
```bash
cd backend
npm install
```
Create `.env` file in the `backend/` directory:
```env
PORT=5001
MYSQL_HOST=your-mysql-host
MYSQL_PORT=18515
MYSQL_USER=your-user
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=defaultdb
MYSQL_SSL=true
```
Start the backend server:
```bash
npm start
# or node server.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.
