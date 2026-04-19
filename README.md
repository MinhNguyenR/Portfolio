# 🌊 Ocean Blue Hachiware Portfolio — Nguyễn Đặng Tường Minh

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-AI-blue?style=for-the-badge)](https://openrouter.ai/)

A premium, high-performance **Full-Stack Portfolio** designed for **Nguyễn Đặng Tường Minh (15 tuổi)** — AI Researcher & Full-Stack Developer. Built with a signature **Ocean Blue Liquid Design**, the project combines state-of-the-art web aesthetics with advanced analytics and AI-driven interactions.

---

## 📖 Overview

The **Ocean Blue Hachiware** project is more than just a portfolio; it's a highly instrumented digital lab. It features:
- **Liquid Glassmorphism:** A custom-layered CSS design system with animated ocean bubbles and neon accents.
- **Agentic AI:** A persistent, context-aware assistant (Hachiware) powered by the latest LLMs.
- **Industrial Tracking:** A deep analytics engine that fingerprints devices and monitors user journey in real-time.
- **Secure CMS:** A hidden administrative backend to manage projects, research, and certificates.

---

## 🛠️ Technology Stack

### ✨ Frontend Architecture
- **Framework:** React 18+ with Vite (Lightning-fast SPA)
- **Styling:** Liquid CSS methodology (Variables-first, strictly vanilla for performance)
- **Animations:** Framer Motion (Orchestrated page transitions and micro-interactions)
- **Networking:** Axios with standardized API interceptors
- **Icons:** Lucide-React

### ⚙️ Backend Core
- **Environment:** Node.js (Express.js)
- **Persistence:** MongoDB with Mongoose ODM
- **Integrations:**
    - **OpenRouter AI:** Dynamic model routing (Primary: `xiaomi/mimo-v2-flash`)
    - **IP-API:** Geo-enrichment service for visitor analytics
- **Middleware:** Helmet (Security), Morgan (Logging), Multer (File storage), Tracker (Custom)

---

## 📂 Project Structure

```text
/portfolio-app
├── /client                 # Frontend Application
│   ├── /src
│   │   ├── /components     # UI Atoms, Molecules & Organisms
│   │   │   ├── /Chat       # Hachiware AI Chat UI & Logic
│   │   │   ├── /Hero       # Dynamic Hero with DB stats
│   │   │   ├── /Vault      # Project/Research Grid System
│   │   │   └── /common     # Modals, Spinners, Layouts
│   │   ├── /pages          # Full-page Views (Admin, School, Detail, Home)
│   │   ├── /hooks          # Custom stateful logic (useContent, useAnalytics)
│   │   ├── /utils          # Global helpers (api.js, fingerprint.js)
│   │   ├── App.jsx         # Routing & Tracking Entry
│   │   └── index.css       # Core Design System (2000+ lines of custom CSS)
│   └── vite.config.js
│
├── /server                 # Backend REST API
│   ├── /config             # Database & global configs
│   ├── /controllers        # Logic handlers (Chat, Analytics, Admin, Content)
│   ├── /middleware         # Security & Tracking interceptors
│   ├── /models             # Mongoose Schemas (Visitor, Profile, Content, etc.)
│   ├── /routes             # API Endpoint definitions
│   ├── /uploads            # Secure Certificate storage
│   ├── seed.js             # Intelligent data seeding script
│   └── server.js           # Server Entry Point
```

---

## 🚀 Key Features & Highlights

### 🐱 Hachiware AI Assistant
- **Personality-Driven:** Friendly cat mascot character with persistent context.
- **Technical Specs:** 20x retry logic, model fallback, 600-token limit; **chat HTTP timeout 120s** so OpenRouter retries do not abort the client.
- **Research mode:** When the user asks about research (keywords), the server attaches trimmed README snippets from MongoDB before calling the model (lightweight retrieval, no separate vector DB).
- **Rate Limiting:** Managed via IP-based daily quotas (6 msgs/day).

### 👥 Advanced Analytics System
- **Deep Fingerprinting:** Collects Hardware (Cores/RAM), Screen info, and specialized Canvas/Audio fingerprints to prevent spoofing; extra client hints (`navigator.connection`, `pdfViewerEnabled`, etc.) stored as `clientExtra`.
- **Geo-Mapping:** Real-time IP resolution to City/ISP level.
- **Route-aware tracking:** Fingerprint POST runs on **initial load** and again when the **SPA route changes** (throttled), so journeys are not limited to a single hit.
- **Interaction Heatmap:** Tracks clicks, scrolls, and project interest in total anonymity.

### 🔐 Multi-Tier Security
- **Secret Admin Portal:** Hidden trigger (5x mascot clicks) with unique key access.
- **Certificate Vault:** Certificate images are served at **`GET /api/content/certificate-image/:slug`** (public, only for visible `certificate` content) with inline disposition and `X-Frame-Options: SAMEORIGIN`. Image bytes can be stored in MongoDB (`certificateImage`, excluded from JSON APIs) and are Cloudinary-ready via provider config.
- **CMS Control:** Full dashboard with analytics charts and profile management.

### 🏛️ Education & Schooling
- **School detail pages:** THCS Châu Thành (lớp 6–8, **TP. Vũng Tàu**), Sion North Wake Academy (online US middle school), plus training centers MindX, Brightchamps, Cole.
- **Schools modal:** Hero “School” stat opens a picker (same UX pattern as Courses).
- **Timeline:** Each school entry can carry `schoolSlug` for correct deep links.

---

## 🔧 Installation & Setup

### 1. Prerequisites
- **Node.js:** v20 or higher
- **MongoDB:** v6+ (Local or Cloud Atlas)

### 2. Environment Configuration
Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/portfolio_analytics
OPENROUTER_API_KEY=your_key_here
ADMIN_SECRET_KEY=your_admin_secret_key
CERT_IMAGE_PROVIDER=db
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Installation
```bash
# Clone the repository
git clone https://github.com/MinhNguyenR/Portfolio-Ocean-Blue.git

# Setup Backend
cd server
npm install
node seed.js  # Optional: Seed initial data (copy PDFs into `server/uploads/certificates` with names matching `certificateFilename` in seed)

# Setup Frontend
cd ../client
npm install
```

### 4. Running the Dashboard
```bash
# Terminal 1: Launch Server
cd server
npm run dev

# Terminal 2: Launch Client
cd client
npm run dev
```

---

## 👤 Author
**Nguyễn Đặng Tường Minh** — *Gen Z AI Researcher & Developer*
- 📧 [nguyendangtuongminh555@gmail.com](mailto:nguyendangtuongminh555@gmail.com)
- 🐙 [GitHub: MinhNguyenR](https://github.com/MinhNguyenR)
- 🏢 Lab: **RTX 5080 | 64GB RAM | NVMe Gen4**
