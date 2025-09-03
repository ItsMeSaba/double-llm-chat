# 🚀 Project Setup & Run Guide

This project is organized as a **monorepo** with two applications:

- **Frontend (React + Vite)** → `apps/web`
- **Backend (Express + SQLite + Drizzle)** → `apps/server`

---

## 📦 Installation

Clone the repo and install dependencies:

```bash
git clone <your-repo-url>
cd <your-repo-name>
yarn install
```

> All dependencies for both frontend and backend are installed from the root using Yarn workspaces.

---

## ▶️ Running the Apps

You can run **each app separately** from its own folder, or run them via **root-level scripts**.

### 1. From app folders

**Frontend (Vite dev server at http://localhost:5173):**

```bash
cd apps/web
yarn dev
```

**Backend (Express API at http://localhost:3000):**

```bash
cd apps/server
yarn dev
```

### 2. From the root

**Frontend only:**

```bash
yarn dev:web
```

**Backend only:**

```bash
yarn dev:server
```

**Run both in two terminals** (one for web, one for server).

---

## ⚙️ Environment Variables

Each app has its own `.env` file. Example setup:

### `apps/server/.env`

```bash
OPENAI_API_KEY=XXX
GOOGLE_GEMINI_API_KEY=XXX
JWT_SECRET=XXX
```

### `apps/web/.env`

```bash
VITE_SERVER_URL=http://localhost:3000/api
```

From inside each app:

```bash
yarn dev       # start the app
yarn build     # production build
yarn lint      # linting
```

---

## ✅ Notes

- Make sure you have **Node.js (>=18)** and **Yarn (Berry/modern)** installed.
- The backend uses **SQLite** — no external DB server setup is required.
- Frontend and backend communicate via **JWT + refresh tokens** for authentication.
- WebSockets (`socket.io`) are used for live chat messages.
