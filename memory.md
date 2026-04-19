# Project Memory - Ocean Blue Hachiware Portfolio

## 🔗 Overview
A professional, high-performance portfolio for **Nguyễn Đặng Tường Minh (15 tuổi)**, an AI Researcher & Full-Stack Developer. The project is built as a complete Full-Stack web application with a focus on premium aesthetics (Ocean Blue/Glassmorphism), advanced analytics, and AI integration.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework:** React + Vite (SPA)
- **Styling:** Vanilla CSS (Liquid layout, Glassmorphism, Neon accents)
- **Animations:** Framer Motion (Page transitions, micro-interactions)
- **Icons:** Lucide-React
- **State Management:** React Hooks (Context for Theme/Auth)
- **Networking:** Axios (interceptor with `x-admin-key`)

### Backend (Server)
- **Framework:** Node.js + Express
- **Database:** MongoDB (Local + Mongoose ODM)
- **Authentication:** Secret Key-based (Admin Portal)
- **Integrations:** 
  - **OpenRouter API:** Powers "Hachiware" chatbot (Model: `xiaomi/mimo-v2-flash`)
  - **IP-API:** Geo-enrichment for visitor tracking
- **File Handling:** Multer (Secure certificate uploads)

---

## ✨ Key Features

### 🎨 User Interface (UI/UX)
- **Ocean Blue Theme:** Deep blue gradient background with animated "bubbles" and glass cards.
- **Dynamic Stats:** Counter for Projects, Research, Certificates, Schools, and Courses (from DB / profile timeline).
- **Courses modal:** MindX, Brightchamps, Cole.
- **Schools modal:** THCS Châu Thành, Sion North Wake Academy.
- **Smooth Navigation:** SPA routing with framer-motion entry/exit animations.

### 👥 Hachiware AI Assistant
- **Personality:** Cute cat mascot (Hachiware) (=^.^=).
- **Capabilities:** Context-aware responses about Minh's projects, research, and skills.
- **Rate Limiting:** 6 messages per day (IP-based) to manage costs/traffic.
- **Robustness:** Retry logic with exponential backoff for free-model reliability; **client timeout 120s** on `/api/chat`.
- **Research retrieval:** Keyword-triggered README snippets from MongoDB appended to the user message server-side.

### 📊 Advanced Analytics & Tracking
- **Fingerprinting:** Collects Canvas, WebGL, Browser, Audio, and Hardware fingerprints.
- **Hardware Info:** Detects CPU cores, RAM size, Screen resolution, and GPU renderer.
- **Geo-Location:** Maps IP addresses to Country, City, Zip, and ISP.
- **Route changes:** Tracking POST fires again when `pathname` changes (debounced).
- **clientExtra:** Connection API / `pdfViewerEnabled` / vendor hints stored on `Visitor`.
- **Privacy Awareness:** Certificates inline via `/api/content/certificate-file/:slug`; PDF bytes optional in DB (`certificatePdf`, stripped from JSON via `select: false` + transforms); never returned on list/detail/chat/admin CMS responses.

### 🔐 Admin Dashboard
- **Access:** Secret portal hidden behind mascot (5x rapid clicks).
- **CMS:** Full CRUD for Projects, Research, Certificates, and Profile.
- **Analytics View:** Statistical charts for visitors, browser types, and daily visits; visitor detail shows nested `screen`, `browser`, `timezone`, `network`, `fingerprints`, `clientExtra`.
- **Certificate Manager:** Upload PDF/Images to `uploads/certificates`; `node seed.js` can embed PDFs from `Certificates/` or uploads into `certificatePdf` for zero-disk production reads.

---

## 📁 File Structure

```text
/portfolio-app
├── /client
│   ├── /src
│   │   ├── /components  (Common, Layout, Hero, Timeline, Vault, Chat)
│   │   ├── /pages       (HomePage, AdminPage, SchoolPage, DetailPage, VaultPage)
│   │   ├── /utils       (api.js, fingerprint.js)
│   │   ├── App.jsx      (Routing & Tracking)
│   │   └── main.jsx
├── /server
│   ├── /models          (Visitor, PageView, Content, Profile, Contact, Interaction)
│   ├── /controllers     (adminController, chatController, trackController)
│   ├── /routes          (adminRoutes, contentRoutes, chatRoutes)
│   ├── /uploads         (Certificates storage)
│   ├── server.js        (Express entry)
│   └── seed.js          (Initial DB setup)
```

---

## 👤 Author Note
**Nguyễn Đặng Tường Minh** (Gen Z Researcher)
- Focus: Inference Optimization for LLMs.
- Lab: 64GB RAM, RTX 5080.
- Vision: Making AI accessible on limited hardware.
- Education (canonical): THCS Châu Thành tại **TP. Vũng Tàu** (lớp 6–8) → sau năm lớp 9 tại VN rút học bạ, học online **Sion North Wake Academy**; **Top 50 học sinh giỏi** tại Sion. MindX (Fullstack), Brightchamps & Cole (AI Engineer).
