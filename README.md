<div align="center">

# 🧭 MINT Navigator

### Smart Visitor Guidance & Feedback Management System

[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Developed for the Ministry of Innovation and Technology, Ethiopia**

[Live Demo](https://mintnavigation.netlify.app) • [Report Bug](https://github.com/Ebo1996/mintnavigation/issues) • [Request Feature](https://github.com/Ebo1996/mintnavigation/issues)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Screenshots](#-screenshots)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About The Project

**MINT Navigator** is a comprehensive visitor guidance and feedback management system built for the **Ministry of Innovation and Technology (MInT)** in Ethiopia. The system provides intelligent navigation across the Ministry's two buildings, collects real-time visitor feedback, and generates data-driven performance analytics to support executive decision-making.

### The Problem
Visitors to the Ministry often struggle to locate specific departments and offices across two large buildings with multiple floors. Additionally, the Ministry needed a systematic way to collect and analyze visitor feedback to improve service quality.

### The Solution
MINT Navigator provides:
- 🗺️ **Smart Navigation**: Multilingual department directory with step-by-step directions
- ⭐ **Feedback Collection**: Real-time visitor rating and comment system
- 📊 **Performance Analytics**: Data-driven department rankings based on customer satisfaction
- 🔐 **Role-Based Access**: Secure admin portal with multiple permission levels
- 🌍 **Multilingual Support**: English, Amharic, and Afaan Oromo

---

## ✨ Key Features

### 🚶 Visitor Features
- **Department Search & Discovery**: Browse departments by sector, building, or floor
- **Step-by-Step Navigation**: Detailed directions with landmarks and walking time estimates
- **Service Information**: Comprehensive details on services, contact info, and office hours
- **Feedback Submission**: Rate and comment on department service quality
- **Multilingual Interface**: Seamless language switching (English/Amharic/Afaan Oromo)

### 👨‍💼 Admin Features
- **Department Management**: Full CRUD operations for departments and sectors
- **Announcement System**: Create and schedule visitor announcements
- **System Complaints**: Monitor and respond to technical issues
- **Role Management**: Assign and manage sector managers and department heads

### 📈 Analyst Features
- **Real-Time Analytics Dashboard**: Track feedback volume, ratings, and trends
- **Department Rankings**: Identify top and bottom-performing departments
- **Trend Analysis**: Visualize performance changes over time
- **Response Rate Tracking**: Monitor feedback response efficiency
- **Report Generation**: Export analytics reports for executive review

### 🔐 Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting and input sanitization
- Secure HTTP headers
- CORS policy enforcement

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.4 with Vite
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM 7.13.1
- **State Management**: React Context API
- **Animations**: Framer Motion 12.38.0
- **Charts**: Recharts 3.8.0 & Chart.js 4.5.1
- **HTTP Client**: Axios 1.13.6
- **Icons**: React Icons 5.6.0

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB Atlas with Mongoose 9.3.1
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Security**: Helmet, express-rate-limit, bcryptjs
- **File Upload**: Multer 2.1.1 + Cloudinary 1.41.3
- **Email**: Nodemailer 8.0.7

### DevOps & Deployment
- **Frontend Hosting**: Netlify
- **Backend Hosting**: Render
- **Database**: MongoDB Atlas
- **Version Control**: Git & GitHub
- **Image Storage**: Cloudinary

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MINT Navigator System                     │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Visitors   │      │    Admins    │      │   Analysts   │
│              │      │              │      │              │
│ - Browse     │      │ - CRUD Ops   │      │ - Analytics  │
│ - Navigate   │      │ - Announce   │      │ - Rankings   │
│ - Feedback   │      │ - Manage     │      │ - Reports    │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  React Frontend │
                    │  (Netlify)      │
                    └────────┬────────┘
                             │ REST API
                    ┌────────▼────────┐
                    │ Express Backend │
                    │  (Render)       │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
       │  MongoDB    │ │Cloudinary│ │ Nodemailer  │
       │   Atlas     │ │  CDN     │ │   SMTP      │
       └─────────────┘ └──────────┘ └─────────────┘
```

---

## Installation Guide

Follow these steps to set up the project locally on your machine.

### Prerequisites

- _Node.js:_ (LTS version recommended, e.g., 18.x or 20.x) - Download from [nodejs.org](https://nodejs.org/).
- _npm:_ (Comes with Node.js) or Yarn.
- _MongoDB:_
  - _Local Installation:_ Install MongoDB Community Server - Follow instructions on [mongodb.com](https://www.mongodb.com/try/download/community).
  - _MongoDB Atlas:_ Alternatively, you can use a cloud-hosted MongoDB Atlas cluster.

### Steps

1.  _Clone the repository:_

    ```bash
    git clone https://github.com/your-username/mint-navigator.git
    cd mint-navigator
    ```

    (Replace `your-username` with your actual GitHub username)

2.  _Set up Environment Variables:_
    This project requires environment variables for configuration (e.g., database connection strings, API keys).
    - You will find an `.env.example` file in the root of the project (and potentially in `client/` and `server/` sub-folders if your project is structured that way).
    - Create a new file named `.env` in the same directory as `.env.example`.
    - Copy the contents from `.env.example` into your new `.env` file.
    - Fill in the actual values for each variable. **Do not commit your `.env` file to Git!**

    Example `.env` content (adjust variable names and values as per your actual backend and frontend needs):

    ```
    # Backend Configuration
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/mint_navigator_db # Or your MongoDB Atlas connection string
    JWT_SECRET=your_super_secret_jwt_key

    # Frontend Configuration (if needed, e.g., for API URL)
    VITE_API_URL=http://localhost:5000/api
    ```

3.  **Install Dependencies:**

    **If your project has separate `client/` and `server/` folders, each with its own `package.json`:**

    ```bash
    # Install backend dependencies
    cd server
    npm install
    cd ../

    # Install frontend dependencies
    cd client
    npm install
    cd ../
    ```

    _(Adjust `client` and `server` folder names if yours are different. If you have a single `package.json` at the root, simply run `npm install` in the root directory.)_

4.  _Run the Project:_

    **If you need to start frontend and backend separately (common for MERN):**

    ```bash
    # In your first terminal, start the backend server
    cd server
    npm start # or npm run dev, check your server/package.json for the correct script
    cd ../

    # In a new terminal, start the frontend development server
    cd client
    npm run dev # or npm start, check your client/package.json for the correct script
    cd ../
    ```

    The frontend will typically run on `http://localhost:5173` (Vite default) and the backend on `http://localhost:5000` (or whatever `PORT` you configured).

## Contributing

We welcome contributions to the Mint Navigator project! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3.  Make your changes and ensure tests pass (if applicable).
4.  Commit your changes (`git commit -m 'feat: Add new feature X'`).
5.  Push to your branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request to the `main` branch of this repository.

---
#   B u i l d   t r i g g e r 
 
 

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **MongoDB Atlas Account** (or local MongoDB installation) - [Sign Up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ebo1996/mintnavigation.git
   cd mintnavigation
   ```

2. **Set up the Backend**

   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the backend directory:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   
   # Email (Nodemailer SMTP)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

3. **Set up the Frontend**

   ```bash
   cd ../frontend
   npm install
   ```

   Create a `.env` file in the frontend directory:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run the Application**

   **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the Application**

   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5000/api
   - **API Health Check**: http://localhost:5000/api/health

### 🎭 Default Admin Credentials

After setting up, you can create admin users using the utility scripts:

```bash
cd backend
node src/utils/createAdmin.js
```

---

## 📸 Screenshots

### Visitor Interface
<div align="center">

| Home Page | Department Directory | Department Details |
|:---------:|:-------------------:|:-----------------:|
| *Smart navigation with multilingual support* | *Filter by building, sector, and floor* | *Comprehensive department information* |

</div>

### Admin Dashboard
<div align="center">

| Admin Dashboard | Department Management | Announcements |
|:---------------:|:--------------------:|:-------------:|
| *CRUD operations for departments* | *Multilingual content management* | *Scheduled visitor announcements* |

</div>

### Analytics Dashboard
<div align="center">

| Analytics Overview | Department Rankings | Feedback Inbox |
|:------------------:|:------------------:|:--------------:|
| *Real-time performance metrics* | *Data-driven department rankings* | *Feedback management interface* |

</div>

---

## 📡 API Documentation

### Base URL
```
Production: https://mint-navigation-u0hc.onrender.com/api
Development: http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/admin/login` | Admin login | ❌ |
| GET | `/admin/me` | Get current user | ✅ |
| POST | `/admin/logout` | Logout | ✅ |

### Department Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/departments` | Get all departments | ❌ |
| GET | `/departments/:id` | Get single department | ❌ |
| POST | `/departments` | Create department | ✅ Admin |
| PUT | `/departments/:id` | Update department | ✅ Admin |
| DELETE | `/departments/:id` | Delete department | ✅ Admin |

### Feedback Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/feedback` | Get all feedback | ✅ Analyst |
| POST | `/feedback` | Submit feedback | ❌ |
| PUT | `/feedback/:id` | Update feedback | ✅ Analyst |
| DELETE | `/feedback/:id` | Delete feedback | ✅ Admin |

### Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/analytics/overview` | Dashboard stats | ✅ Analyst |
| GET | `/analytics/rankings` | Department rankings | ✅ Analyst |
| GET | `/analytics/department/:id` | Dept analytics | ✅ Analyst |
| POST | `/analytics/report` | Generate report | ✅ Analyst |

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Visitor** | • View departments<br>• Search & navigate<br>• Submit feedback |
| **Admin** | • All visitor permissions<br>• CRUD departments & sectors<br>• Manage announcements<br>• View system complaints |
| **Feedback Analyst** | • All visitor permissions<br>• View all feedback<br>• Respond to feedback<br>• Access analytics dashboard<br>• Generate reports |
| **Sector Manager** | • View sector-specific feedback<br>• Respond to feedback in assigned sector |
| **Department Head** | • View department-specific feedback<br>• Respond to feedback in assigned department |
| **Superadmin** | • All permissions<br>• User management<br>• System configuration |

---

## 📊 Database Schema

### Department Model
```javascript
{
  id: Number (unique),
  sectorId: Number,
  name: { en: String, am: String, om: String },
  description: { en: String, am: String, om: String },
  building: "A" | "B",
  floor: Number (0-8),
  room: String,
  directions: { en: String, am: String, om: String },
  services: { en: [String], am: [String], om: [String] },
  contact: String,
  email: String,
  head: String,
  headImage: String,
  rating: Number,
  reviewCount: Number
}
```

### Feedback Model
```javascript
{
  department: Number (ref: Department),
  sectorId: Number,
  building: "A" | "B",
  rating: Number (1-5),
  comment: String,
  visitor: String,
  visitorEmail: String,
  status: "pending" | "published" | "resolved",
  response: String,
  respondedBy: ObjectId (ref: Admin),
  replies: [{ text, role, name, createdAt }]
}
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is developed for the **Ministry of Innovation and Technology, Ethiopia**. All rights reserved.

---

## 📞 Contact

**Developer**: Firaol Tesfaye Mideksa  
**Institution**: Jimma University Institute of Technology  
**Department**: Software Engineering  

**Project Links**:
- Live Demo: [https://mintnavigation.netlify.app](https://mintnavigation.netlify.app)
- Repository: [https://github.com/Ebo1996/mintnavigation](https://github.com/Ebo1996/mintnavigation)

---

## 🙏 Acknowledgments

- **Ministry of Innovation and Technology (MInT)** - For providing the opportunity and requirements
- **Mr. Dinber Getahun** - Immediate Supervisor
- **Mr. Teferi Kibebew** - Department Advisor
- **Jimma University** - For the internship program support

---

<div align="center">

**Made with ❤️ for the Ministry of Innovation and Technology**

⭐ Star this repository if you found it helpful!

</div>
< ! - -   R e b u i l d   t r i g g e r   - - >  
 