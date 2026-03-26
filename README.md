# AccrueMerit – Karma Management System 4.0

**AccureMerit** is a web-based platform that simulates the accumulation of merit and the recording of karma.  
The system applies **gamification techniques** to help users track, reflect, and improve their behavior through visual and interactive experiences.

---

## Key Features

### 1. Karma Logbooks
- **Merit Log**: Record positive actions and earn merit points  
- **Karma Log**: Track negative behaviors for self-reflection  
- **Classification System**: Organize activities using predefined or custom tags  

---

### 2. 3D Karma Tree (Core Feature)
A real-time visual representation of the user’s karma status:

- **Positive State**: Tree grows with green leaves and flowers as merit increases  
- **Negative State**: Tree withers and loses leaves as karma accumulates  

---

### 3. Spiritual Simulations
- **Wooden Fish (Gõ Mõ) Simulation**: Interactive audio-visual tool for relaxation  
- **Incense Burning Simulation**: Virtual space to send wishes and prayers  

---

## System Architecture

### Backend (Node.js & TypeScript)
- **Architecture**: Layered Architecture (Controller – Service – Model)  
- **Authentication**: JWT-based stateless authentication  
- **API Documentation**: Swagger UI for testing endpoints  

---

### Frontend (React & Vite)
- **State Management**: React Context API  
- **Styling**: Tailwind CSS  
- **Real-time Sync**: Axios interceptors for API handling and token management  

---


## Getting Started

### Prerequisites
- Node.js (v18 or higher)  
- MongoDB or MySQL  
- Gemini API Key (for AI features)  

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/accure-merrit.git
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
