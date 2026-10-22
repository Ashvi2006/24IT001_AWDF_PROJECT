# 🌟 Full-Stack Student Portfolio & Task Management Platform
### Advanced Web Development Frameworks (ITUE301) — DEPSTAR
**Student:** Ashvi Antala | **Roll / ID:** 24IT001

---

## 📖 Overview
This repository contains a full-stack, enterprise-grade web application integrating modern frontend frameworks, RESTful APIs, asynchronous event-driven background processing, containerized microservices, automated CI/CD pipelines, and responsible AI copilot capabilities.

---

## 📑 Syllabus Practicals Breakdown (Weeks 10 – 13)

### ⚡ Week 10: Asynchronous Processing with Event-Driven Architecture
- **Objective:** Implement asynchronous background processing using Node.js native `EventEmitter` without external dependencies.
- **Problem Statement:** Add a background notification system to the Task Management application using Node.js built-in `EventEmitter`. When a new task is created via the API, emit a `task:created` event handled asynchronously to log notifications (task title, timestamp, assigned user). The main API response returns immediately without waiting for the event handler to complete.
- **Implementation:**
  - **Emitter Module:** [`server/events/taskEmitter.js`](file:///c:/Users/ashvi/awf/server/events/taskEmitter.js)
  - **API Route:** `POST /api/tasks` in [`server/routes/taskRoutes.js`](file:///c:/Users/ashvi/awf/server/routes/taskRoutes.js)
  - **Audit Logs API:** `GET /api/tasks/notifications`
  - **UI Visualizer:** Real-time event log & execution delta comparer in `TaskManager.jsx` (Async Events tab).
- **Execution Proof:**
  - `API Response Returned At`: Synchronous HTTP 201 sent immediately (`T+0ms`)
  - `Background Handler Completed At`: Asynchronously finalized (`T+400ms` to `T+600ms`)

---

### 🐳 Week 11: Containerization with Docker and Docker Compose
- **Objective:** Containerize the full-stack application using Docker and orchestrate services using Docker Compose.
- **Problem Statement:** Write Dockerfiles for both the React frontend and Node/Express backend. Create a Docker Compose file that orchestrates frontend, backend, and MongoDB containers together. The entire application runs with a single `docker-compose up` command.
- **Implementation:**
  - **Frontend Dockerfile:** [`client/Dockerfile`](file:///c:/Users/ashvi/awf/client/Dockerfile) (Multi-stage build: Node 20 builder + Nginx Alpine)
  - **Nginx Reverse Proxy:** [`client/nginx.conf`](file:///c:/Users/ashvi/awf/client/nginx.conf) (SPA routing + `/api/` proxy pass)
  - **Backend Dockerfile:** [`server/Dockerfile`](file:///c:/Users/ashvi/awf/server/Dockerfile) (Node 20 Alpine production image with healthcheck)
  - **Orchestration:** [`docker-compose.yml`](file:///c:/Users/ashvi/awf/docker-compose.yml)
- **Run the Stack:**
  ```bash
  docker-compose up --build
  ```
  - **Frontend:** http://localhost:3000 (or http://localhost:80)
  - **Backend API:** http://localhost:5000/api
  - **MongoDB Database:** localhost:27017

---

### 🚀 Week 12: CI/CD Pipeline with GitHub Actions
- **Objective:** Automate testing and deployment of the application using a CI/CD pipeline.
- **Problem Statement:** Set up a GitHub Actions workflow that automatically runs on every push to `main`. The pipeline must install dependencies, run at least one automated test, and report pass/fail status. Demonstrate a failed pipeline caused by a broken test and a successful pipeline after the fix.
- **Implementation:**
  - **Workflow File:** [`.github/workflows/ci.yml`](file:///c:/Users/ashvi/awf/.github/workflows/ci.yml)
  - **Automated Test Suite:** [`server/tests/task.test.js`](file:///c:/Users/ashvi/awf/server/tests/task.test.js) (Node.js native test runner with 5 comprehensive test cases)
- **Demonstration Commands:**
  - **1. Demonstrate Failed Pipeline (Broken Test):**
    ```bash
    cd server
    npm run test:fail-demo
    ```
    *Result: Exits with code 1, triggers intentional assertion failure, failing the CI pipeline.*
  - **2. Demonstrate Successful Pipeline (Fixed Test):**
    ```bash
    cd server
    npm test
    ```
    *Result: All tests pass with code 0, reporting clean green checkmarks.*

---

### ✨ Week 13: AI API Integration into a Web Application
- **Objective:** Integrate an external AI service into the application and implement responsible AI usage.
- **Problem Statement:** Add an AI-powered feature to the Task Management application using Gemini API (or OpenAI API). The feature must auto-generate task descriptions, prioritize tasks, and suggest deadlines based on task title. Handle API errors gracefully and ensure the feature degrades without breaking the core application.
- **Implementation:**
  - **AI Route:** [`server/routes/aiRoutes.js`](file:///c:/Users/ashvi/awf/server/routes/aiRoutes.js) (`POST /api/ai/suggest`, `GET /api/ai/status`)
  - **Frontend Copilot:** [`client/src/components/AITaskAssistant.jsx`](file:///c:/Users/ashvi/awf/client/src/components/AITaskAssistant.jsx) & [`AITaskAssistant.css`](file:///c:/Users/ashvi/awf/client/src/components/AITaskAssistant.css)
- **Responsible AI Fallback:**
  - If `GEMINI_API_KEY` or `OPENAI_API_KEY` is present, uses Google Gemini 1.5 Flash / GPT-4o-mini.
  - If keys are missing, network is offline, or rate-limited, the system **never fails or crashes**; it gracefully degrades to a contextual NLP heuristic engine providing smart descriptions, priority reasoning, and deadlines with 100% uptime.

---

## 🛠️ Quick Start Guide

### Option 1: Running with Docker Compose (Recommended)
```bash
docker-compose up --build
```

### Option 2: Running Locally
#### 1. Backend Server
```bash
cd server
npm install
npm run test    # Run automated tests
node server.js  # Starts on port 5000
```

#### 2. Frontend Client
```bash
cd client
npm install
npm run dev     # Starts on port 5173
```
