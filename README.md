# AccrueMerit – Karma Management System 4.0

**AccrueMerit** is an innovative, web-based platform designed to simulate the accumulation of merit and the recording of karma. By applying **gamification techniques**, the system helps users track, reflect upon, and improve their daily behavior through engaging visual and interactive experiences.

---

## Key Features

### 1. Karma Logbooks
- **Merit Log:** Record positive actions and earn merit points to nurture your virtual soul.
- **Karma Log:** Track negative behaviors and missteps for mindful self-reflection.
- **Classification System:** Organize your activities efficiently using predefined or custom tags.

### 2. 3D Karma Tree (Core Feature)
A real-time, dynamic visual representation of your current karma status:
- **Positive State:** As merit increases, the tree flourishes, growing vibrant green leaves and blooming flowers.
- **Negative State:** As karma accumulates, the tree withers and loses its leaves, serving as a gentle reminder to reflect.

### 3. Spiritual Simulations
- **Wooden Fish (Gõ Mõ) Simulation:** An interactive audio-visual tool designed for deep relaxation and mindfulness.
- **Incense Burning Simulation:** A serene virtual space to send your wishes, prayers, and positive intentions.

---

## System Architecture

### Backend (Node.js & TypeScript)
- **Architecture:** Layered Architecture (Controller – Service – Model) for clean, maintainable code.
- **Authentication:** Secure, stateless authentication using JSON Web Tokens (JWT).
- **API Documentation:** Interactive Swagger UI provided for easy endpoint testing and integration.

### Frontend (React & Vite)
- **State Management:** Efficient global state handling using the React Context API.
- **Styling:** Rapid and responsive UI development with Tailwind CSS.
- **Real-time Sync:** Robust API handling and token management using Axios interceptors.

---

## Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- A Database (MongoDB or MySQL)
- A [Gemini API Key](https://aistudio.google.com/app/apikey) (Required for AI-driven features)

---

## Installation Guide

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/accrue-merit.git](https://github.com/your-username/accrue-merit.git)
cd accrue-merit
```

### 2. Backend Setup

- cd backend

- npm install

- cp .env.example .env

- npm run dev



### 3. Frontend Setup

- cd frontend

- npm install

- npm run dev
