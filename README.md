<div align="center">

# WedTale Video 🎬💍
### Pixar 3D Animated Indian Wedding Story & Save-The-Date Video Studio

Transform bride and groom photos into 3D Pixar animated caricatures and cinematic wedding story invitation videos with rich regional Indian cultural themes, traditional blessings, authentic celebration music, and instant downloads.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## ✨ Features

- **4-Scene Storyboard Flow**:
  - **Scene 1**: *"Finally"* — Emotional proposal in traditional attire.
  - **Scene 2**: *"Wait is Over"* — Festive dance celebration (Bhangra, Garba, Nadaswaram, etc.).
  - **Scene 3**: *"We are making it official"* — Couple in traditional wedding attire.
  - **Scene 4**: *"We are getting married"* — Sacred ritual backdrop (Hastamelap, Sindoor, Aarsi mirror, Kalire).
- **Persistent In-App Photo Storage (IndexedDB)**:
  - All uploaded bride & groom photos and custom background sceneries automatically save to the browser's persistent database.
  - Re-access uploads anytime with 1-click scene assignment (`S1`, `S2`, `S3`, `S4`).
- **10+ Regional Indian Wedding Cultural Themes**:
  - Bollywood Glam, Punjabi Royal Anand Karaj, Gujarati Garba & Lagan, South Indian Muhurtham, Bengali Shubho Bibaho, Rajasthani Rajwada, Maharashtrian Lagna, Beach Destination, Awadhi Nawabi, Assamese, and Kashmiri.
  - Automatically loads authentic attire, sacred rituals, blessings, and traditional venues.
- **Audio Synthesizer & Traditional Melodies**:
  - Real-time Web Audio API synthesizer playing romantic chord progressions and celebratory chimes.
- **Real-Time Video Studio Canvas & Exporter**:
  - 9:16 (Reels/Stories/Shorts) and 16:9 (Landscape HD) aspect ratios.
  - Download high-res animated video (`.webm`), Save-The-Date invitation cards (`.png`), and calendar events (`.ics`).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, or bun

### 1. Installation
```bash
git clone https://github.com/soapysmilescom-byte/wedtale-video.git
cd wedtale-video
npm install
```

### 2. Environment Setup (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add `GEMINI_API_KEY` for AI-powered caricature prompt analysis.)*

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons
- **Backend**: Node.js, Express, tsx, esbuild
- **Persistence**: IndexedDB for seamless client-side image storage
- **Audio**: Web Audio API Synthesizer
- **Video & Graphics**: HTML5 Canvas Rendering Engine & MediaRecorder API

---

## 📄 License
MIT
