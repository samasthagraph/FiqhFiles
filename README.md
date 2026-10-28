# Fiqh File (Fatwa Q&A Platform)

A modern, responsive Islamic Fatwa and Q&A management web application with Malayalam typography, multi-madhhab filtering, interactive user questions, and a robust admin dashboard.

## 🚀 Features

- **Ask Mas'ala / Question Submission**: Fast question submission with Madhhab selection and urgency flags.
- **Public Mas'ala Archive**: Searchable and filterable by Madhhab (Shafi'i, Hanafi, Maliki, Hanbali, General).
- **Public Discussion / Comments**: Community members can add respectful comments or reflections on answered rulings.
- **Admin Dashboard**: Secure administrative portal to manage incoming queries, write answers, toggle urgency, and moderate comments.
- **Doc Export**: Download individual rulings or filtered question lists as formatted Microsoft Word (`.docx`) files.
- **Malayalam Font Support**: Integrated typography (`Anek Malayalam`, `Almarai`, `FN Kanaka Semibold` & `Rahna22`).
- **Database**: Cloud MySQL database support with connection pooling, serverless keep-alive, and SSL encryption.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide / React Icons, docx
- **Backend**: Node.js, Express.js, MySQL (`mysql2/promise`), Serverless ready for Vercel
- **Database**: Aiven Cloud MySQL / Local MySQL
- **Hosting**: Vercel (Frontend & Backend Serverless API)

---

## ☁️ Vercel Deployment Guide

### Option A: Deploying Backend as a Separate Vercel Project (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** → **"Project"**.
2. Select the **`FiqhFiles`** GitHub repository.
3. In the project configuration:
   - **Framework Preset**: Other (or Node.js)
   - **Root Directory**: Click "Edit" and choose **`backend`**
4. Under **Environment Variables**, add:
   - `MYSQL_HOST` = `promotorsdb01-sparavoor.k.aivencloud.com`
   - `MYSQL_PORT` = `18515`
   - `MYSQL_USER` = `avnadmin`
   - `MYSQL_PASSWORD` = `your-aiven-password`
   - `MYSQL_DATABASE` = `defaultdb`
   - `MYSQL_SSL` = `REQUIRED`
   - `ADMIN_USERNAME` = `graphadmin`
   - `ADMIN_PASSWORD` = `graph951`
5. Click **Deploy**. Vercel will deploy your backend as serverless functions and give you a URL (e.g., `https://fiqhfiles-backend.vercel.app`).
6. **Update Frontend Project**:
   - Go to your existing Frontend project on Vercel.
   - Go to **Settings** → **Environment Variables**.
   - Set or update `VITE_API_URL` to your new backend URL (e.g., `https://fiqhfiles-backend.vercel.app`).
   - Trigger a redeploy of the frontend (Deployments → Redeploy).

---

### Option B: Deploying as a Unified Monorepo on Vercel

If you deploy the repository with **Root Directory** left as `./` (Root):
- Vercel will automatically build the frontend (`frontend/dist`) and serve all `/api/*` endpoints via the serverless function in `api/index.js`.
- Add the MySQL and Admin environment variables listed above to the project settings.

---

## 📦 Local Development

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
MYSQL_HOST=promotorsdb01-sparavoor.k.aivencloud.com
MYSQL_PORT=18515
MYSQL_USER=avnadmin
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=defaultdb
MYSQL_SSL=REQUIRED
ADMIN_USERNAME=graphadmin
ADMIN_PASSWORD=your-password
```
Start the backend server:
```bash
npm start
# or npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.
