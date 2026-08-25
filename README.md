<div align="center">

# 🧭 MINT Navigator

### Smart Visitor Guidance & Feedback Management System

[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Deployed-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://mintnavigation.netlify.app)

**Developed for the Ministry of Innovation and Technology (MInT), Ethiopia**

[🌐 Live Demo](https://mintnavigation.netlify.app) • [🐛 Report Bug](https://github.com/Ebo1996/mintnavigation/issues) • [✨ Request Feature](https://github.com/Ebo1996/mintnavigation/issues)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [User Roles](#-user-roles--permissions)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [Contact](#-contact)

---

## 🎯 About The Project

**MINT Navigator** is a comprehensive visitor guidance and feedback management system built for the **Ministry of Innovation and Technology (MInT)** in Ethiopia.

The system helps visitors navigate across the Ministry's two buildings, collects real-time visitor feedback, and generates data-driven department performance rankings to support executive decision-making.

> 💡 Visitors can find any department by floor, building, or sector. Executives can see which departments are performing best based on real customer ratings.

---

## ✨ Key Features

### 🚶 Visitor Features
- **Smart Navigation** — Browse departments by sector, building, or floor
- **Step-by-Step Directions** — Detailed directions with landmarks
- **Multilingual Support** — English 🇬🇧, Amharic 🇪🇹, Afaan Oromo
- **Feedback Submission** — Rate and comment on department service quality
- **Department Search** — Real-time search across all departments

### 👨‍💼 Admin Features
- **Department Management** — Full CRUD operations
- **Sector Management** — Organize departments into sectors
- **Announcement System** — Create and schedule visitor announcements
- **System Complaints** — Monitor and resolve technical issues

### 📊 Analyst Features
- **Analytics Dashboard** — Real-time charts and performance metrics
- **Department Rankings** — Data-driven rankings based on customer ratings
- **Feedback Management** — View, respond, and resolve visitor feedback
- **Report Generation** — Export analytics reports for executives

### 🔐 Security
- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting & input sanitization
- Secure HTTP headers (Helmet)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js 5 |
| **Database** | MongoDB Atlas, Mongoose |
| **Auth** | JWT, bcryptjs |
| **Charts** | Recharts, Chart.js |
| **Storage** | Cloudinary |
| **Email** | Nodemailer |
| **Deployment** | Netlify (frontend), Render (backend) |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────┐
│               MINT Navigator                     │
├──────────────┬──────────────┬────────────────────┤
│   Visitors   │    Admins    │      Analysts      │
│  Navigation  │  CRUD Ops    │  Analytics/Ranking │
│  Feedback    │  Announce    │  Feedback Inbox    │
└──────┬───────┴──────┬───────┴────────┬───────────┘
       └──────────────┼────────────────┘
                      │
             ┌────────▼────────┐
             │  React Frontend │  (Netlify)
             └────────┬────────┘
                      │ REST API
             ┌────────▼────────┐
             │ Express Backend │  (Render)
             └────────┬────────┘
              ┌───────┼──────────┐
              ▼       ▼          ▼
          MongoDB  Cloudinary  Nodemailer
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Ebo1996/mintnavigation.git
cd mintnavigation

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the App

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

---

## 👥 User Roles & Permissions

| Role | Access |
|------|--------|
| **Visitor** | Browse departments, search, submit feedback |
| **Admin** | CRUD departments & sectors, manage announcements |
| **Feedback Analyst** | View analytics, manage feedback, generate reports |
| **Sector Manager** | View & respond to sector-specific feedback |
| **Department Head** | View & respond to department-specific feedback |
| **Superadmin** | Full system access + user management |

---

## 📡 API Documentation

**Base URL:**
```
Production:  https://mint-navigation-u0hc.onrender.com/api
Development: http://localhost:5000/api
```

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/departments` | Get all departments | ❌ |
| GET | `/departments/:id` | Get single department | ❌ |
| POST | `/departments` | Create department | ✅ Admin |
| PUT | `/departments/:id` | Update department | ✅ Admin |
| DELETE | `/departments/:id` | Delete department | ✅ Admin |
| POST | `/feedback` | Submit feedback | ❌ |
| GET | `/analytics/overview` | Dashboard stats | ✅ Analyst |
| GET | `/analytics/rankings` | Department rankings | ✅ Analyst |
| POST | `/admin/login` | Admin login | ❌ |

---

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Contact

**Developer:** Firaol Tesfaye Mideksa
**University:** Jimma University Institute of Technology
**Department:** Software Engineering

| Link | URL |
|------|-----|
| 🌐 Live Demo | [mintnavigation.netlify.app](https://mintnavigation.netlify.app) |
| 📁 Repository | [github.com/Ebo1996/mintnavigation](https://github.com/Ebo1996/mintnavigation) |

---

## 🙏 Acknowledgments

- **Ministry of Innovation and Technology (MInT)** — For the opportunity
- **Mr. Dinber Getahun** — Immediate Supervisor
- **Mr. Teferi Kibebew** — Department Advisor
- **Jimma University** — Internship program support

---

<div align="center">

**Made with ❤️ for the Ministry of Innovation and Technology, Ethiopia**

⭐ Star this repo if you found it helpful!

</div>
