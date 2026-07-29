<div align="center">
  <h1>🎯 AI B2B Sales Training Simulator</h1>
  <p><strong>An Adaptive Conversational Roleplay & Sales Candidate Evaluation Platform Powered by Google Gemini</strong></p>

  <p>
    <a href="https://sales-simulator-6q8c.onrender.com" target="_blank"><strong>🌐 View Live Demo</strong></a> •
    <a href="./SYSTEM_ARCHITECTURE.md"><strong>🏛️ Read System Architecture</strong></a>
  </p>
</div>

---

## 📖 Overview

The **AI B2B Sales Training Simulator** is a full-stack interactive web application designed to train, test, and evaluate sales professionals in hyper-realistic cold and warm calling environments. 

Instead of relying on scripted chatbots, this simulator uses Google's **Gemini AI** configured with dynamic personas, randomized behavioral archetypes, and an adaptive difficulty engine that responds realistically to a salesperson's pitch.

---

## ✨ Key Features

* **🎭 Dynamic Personas & Triggers:** Automatically adopts specific business owner personas (**Mike** for Solar; **Rick** for Trades/HVAC/Roofing/Remodeling) based on the user's opening line.
* **🧠 Randomized Archetypes:** The AI secretly selects an archetype (*The Skeptical Veteran*, *The Overwhelmed Operator*, or *The Analytical Buyer*) to test different communication strategies.
* **📈 Adaptive Difficulty Engine:** Starts at baseline skepticism (Level 2-3) and dynamically scales up to Level 4-5 expert pushback if the rep demonstrates masterful objection handling.
* **⚡ Real-Time SSE Streaming:** Utilizes Server-Sent Events (`text/event-stream`) to deliver token-by-token conversational responses with minimal latency.
* **📊 Automated Report Card Evaluation:** Drops character upon call completion to generate a graded candidate assessment (`A-F` rating, `HIRE / DO NOT HIRE` verdict, and tactical coaching feedback).

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express.js (`4.21.2`), ESBuild |
| **AI SDK** | Google Gen AI SDK (`@google/genai` v2.4.0) |
| **Transport** | Server-Sent Events (SSE) for streaming text |
| **Deployment** | Render.com (Unified Full-Stack Node.js container) |

For a full technical deep-dive into the data flow, sequence diagrams, and architecture, read the **[🏛️ SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)** document.

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js** (v18 or higher)
* A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install
```bash
git clone https://github.com/rmtaiautomation-ai/sales_simulator.git
cd sales_simulator
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or copy `.env.example`):
```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
APP_URL="http://localhost:3000"
```

### 3. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`**.

---

## 📦 Production Build

To test the production build locally:
```bash
npm run build
npm start
```

---

## 📄 License
This project is open-source and available for educational and portfolio demonstration purposes.
