# Codexa 🚀

> A **LeetCode-style coding practice platform** with an **AI Code Visualizer** — built as part of OJT 2026.

Codexa lets users practice coding problems, submit solutions, track their progress, follow structured learning tracks, and visualize how their code runs step-by-step using an AI-powered tracer. Authentication is handled by Firebase; data is stored in SQLite via SQLAlchemy ORM; the frontend runs on Next.js 14.

---

## 🤝 Getting Started — For Teammates (Clone & Run)

> Hey teammate! If you've been added as a collaborator on this repo, follow these steps exactly to get the project running on your machine. Read carefully — ek step miss hua toh server nahi chalega 😄

---

### 📋 Prerequisites (Pehle yeh install karo)

Make sure you have these installed before starting:

| Tool | Version | Check Command |
|---|---|---|
| **Node.js** | v18 or above | `node -v` |
| **npm** | v9 or above | `npm -v` |
| **Python** | v3.10 or above | `python3 --version` |
| **Git** | any | `git --version` |

---

### Step 1 — Clone the Repo

```bash
git clone https://github.com/nextgendev2029/ojt-step-by-step.git
cd ojt-step-by-step
```

---

### Step 2 — Backend Setup (FastAPI + SQLite)

```bash
# Go into the backend folder
cd backend

# Create a Python virtual environment
python3 -m venv venv

# Activate it (Mac/Linux)
source venv/bin/activate

# Activate it (Windows)
# venv\Scripts\activate

# Install all Python dependencies
pip install -r requirements.txt
```

#### 2a — Create your `.env` file

The `.env` file has secret keys — it's not in git. You need to create it manually:

```bash
# Copy the example template
cp .env.example .env
```

Now open `backend/.env` and fill in the values. Ask the project owner for:
- `FIREBASE_PROJECT_ID` → Firebase console pe project ID
- `GEMINI_API_KEY` → Google AI Studio se milega

```env
DATABASE_URL=sqlite:///./codexa.db
FIREBASE_PROJECT_ID=codexa-51a75
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=["http://localhost:3000"]
SECRET_KEY=any-random-string-here
```

> ✅ `DATABASE_URL` waise bhi theek hai — SQLite file automatically ban jaati hai first run pe.

#### 2b — Start the Backend Server

```bash
# Make sure you're in the backend/ folder with venv activated
uvicorn app.utils.main:app --reload --port 8000
```

You should see:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

✅ Backend is live at: **http://localhost:8000**
📖 Swagger API docs: **http://localhost:8000/docs**

---

### Step 3 — Frontend Setup (Next.js)

Open a **new terminal tab/window** (backend wala band mat karo):

```bash
# From the project root, go into frontend
cd frontend

# Install all Node dependencies
npm install
```

#### 3a — Create your `.env.local` file

```bash
cp .env.example .env.local
```

Open `frontend/.env.local` and fill in the Firebase credentials. Ask the project owner for these values (Firebase Console → Project Settings → Your Apps → Web App config):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=codexa-51a75.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=codexa-51a75
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=codexa-51a75.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# This points to your local backend — don't change this
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### 3b — Start the Frontend Dev Server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
✓ Ready in Xs
```

✅ Frontend is live at: **http://localhost:3000**

---

### Step 4 — Verify Everything is Working

1. Open **http://localhost:3000** in your browser
2. You should see a **loading spinner** → then redirect to `/login`
3. Try signing in with **Google** or **email/password**
4. After login → you land on the **Dashboard** with your name and avatar
5. Check **http://localhost:8000/docs** → you'll see the Swagger API docs

---

### ⚠️ Common Issues & Fixes

| Problem | Fix |
|---|---|
| `ModuleNotFoundError` in backend | Virtual environment activate karo: `source venv/bin/activate` |
| `pip: command not found` | `pip3 install -r requirements.txt` try karo |
| `npm install` fails | Node version check karo: `node -v` → must be 18+ |
| Firebase auth not working | `.env.local` mein Firebase credentials check karo |
| Backend CORS error | `.env` mein `CORS_ORIGINS=["http://localhost:3000"]` confirm karo |
| Port 8000 already in use | `lsof -ti:8000 \| xargs kill` (Mac/Linux) |
| Port 3000 already in use | `npm run dev -- -p 3001` to use port 3001 instead |

---

### 📁 Both Servers Running — Quick Reference

| Server | Command | URL |
|---|---|---|
| **Backend** | `uvicorn app.utils.main:app --reload --port 8000` (from `backend/`) | http://localhost:8000 |
| **Frontend** | `npm run dev` (from `frontend/`) | http://localhost:3000 |

> 💡 **Tip:** Use two separate terminal tabs — one for backend, one for frontend. Both need to be running at the same time.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript | File-based routing, SSR/CSR flexibility, TypeScript safety |
| **Styling** | Tailwind CSS | Utility-first, fast UI development |
| **Authentication** | Firebase Auth | Google OAuth + email/password, free tier, easy token verification |
| **Backend** | FastAPI (Python) | Fast, async-ready, automatic Swagger docs |
| **Database** | SQLite + SQLAlchemy ORM | Lightweight, file-based, no setup needed for development |
| **AI / Visualizer** | Gemini API + `sys.settrace` | Step-by-step code tracing + AI feedback |

---

## 📁 Full Project Structure

```
OJT 2026/
├── .gitignore                  → Tells git what NOT to track (node_modules, .env, .db, etc.)
├── README.md                   → This file — full project documentation
│
├── backend/                    → FastAPI Python server
│   ├── .env                    → Secret keys and config (NOT committed to git)
│   ├── .env.example            → Template showing which env vars are needed (safe to commit)
│   ├── requirements.txt        → All Python package dependencies
│   ├── codexa.db               → SQLite database file (auto-created on first run)
│   ├── tracer_worker.py        → Sandboxed code execution worker (for visualizer)
│   │
│   ├── scripts/
│   │   └── seed_curriculum.py  → Script to populate learning tracks/modules into DB
│   │
│   └── app/
│       ├── models/
│       │   ├── __init__.py
│       │   └── models.py       → All database table definitions (ORM models)
│       │
│       ├── schemas/
│       │   ├── __init__.py
│       │   └── schemas.py      → Pydantic schemas for request/response validation (WIP)
│       │
│       ├── routes/
│       │   ├── __init__.py
│       │   ├── users.py        → ✅ User auth sync, fetch by ID/Firebase UID
│       │   ├── problems.py     → 🔴 Problems CRUD (empty stub — to be built)
│       │   ├── submissions.py  → 🔴 Code submission & judging (empty stub)
│       │   ├── learning.py     → 🔴 Learning tracks & modules (empty stub)
│       │   ├── bookmarks.py    → 🔴 Bookmark management (empty stub)
│       │   └── visualize.py    → 🔴 AI Code Visualizer API (empty stub)
│       │
│       └── utils/
│           ├── __init__.py
│           ├── config.py       → App settings loaded from .env
│           ├── database.py     → DB engine, session factory, get_db() dependency
│           └── main.py         → FastAPI app entry point, CORS, router registration
│
└── frontend/                   → Next.js 14 frontend
    ├── .env.local              → Firebase credentials (NOT committed to git)
    ├── .env.example            → Template for env vars (safe to commit)
    ├── package.json            → Node dependencies and npm scripts
    ├── next.config.js          → Next.js config (image domains, env, etc.)
    ├── tsconfig.json           → TypeScript config
    ├── tailwind.config.js      → Tailwind theme config
    ├── postcss.config.js       → PostCSS (required by Tailwind)
    │
    ├── app/                    → Next.js App Router — each folder = a route
    │   ├── layout.tsx          → Root layout — wraps every page with AuthProvider
    │   ├── page.tsx            → Root page (/) — smart redirect to /dashboard or /login
    │   ├── globals.css         → Global styles, Tailwind imports
    │   ├── login/
    │   │   └── page.tsx        → ✅ Sign In / Sign Up page with Google + email auth
    │   ├── dashboard/
    │   │   └── page.tsx        → ✅ Protected dashboard with user stats and welcome card
    │   ├── problems/
    │   │   ├── page.tsx        → 🔴 Problems list page (placeholder)
    │   │   └── [id]/page.tsx   → 🔴 Individual problem + Monaco editor (placeholder)
    │   ├── learning/
    │   │   ├── page.tsx        → 🔴 Learning tracks listing (placeholder)
    │   │   ├── [id]/page.tsx   → 🔴 Single track detail (placeholder)
    │   │   └── [id]/[moduleId]/page.tsx → 🔴 Module content/lessons (placeholder)
    │   ├── bookmarks/
    │   │   └── page.tsx        → 🔴 Bookmarked problems (placeholder)
    │   ├── profile/
    │   │   └── page.tsx        → 🔴 User profile page (placeholder)
    │   └── visualizer/
    │       └── page.tsx        → 🔴 AI Code Visualizer (placeholder)
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Header.tsx          → Top navbar component
    │   │   └── ProtectedRoute.tsx  → ✅ Auth guard — blocks unauthenticated access
    │   ├── editor/
    │   │   └── CodeEditor.tsx      → Monaco-based code editor component
    │   └── ui/
    │       └── Badge.tsx           → Reusable badge/tag component (difficulty, topic)
    │
    ├── contexts/
    │   └── AuthContext.tsx     → ✅ Firebase Auth state + backend sync for whole app
    │
    └── lib/
        ├── firebase.ts         → ✅ Firebase app initialization
        └── api.ts              → Centralized API call helper functions (WIP)
```

> **Legend:** ✅ = Fully implemented | 🔴 = Planned / empty stub

---

## 🗄️ Database Models (backend/app/models/models.py)

This file defines **all 10 database tables** using SQLAlchemy ORM. Every class = one table in `codexa.db`.

### Tables

| Model | Table | Description |
|---|---|---|
| `User` | `users` | Registered users — Firebase UID, email, username, stats, streak |
| `UserProgress` | `user_progress` | Tracks which problems each user has attempted/solved |
| `Problem` | `problems` | All coding problems — title, description, difficulty, test cases, starter code |
| `Submission` | `submissions` | Each time a user submits code — status, score, execution time, test results |
| `LearningTrack` | `learning_tracks` | A curriculum track (e.g. "Python Fundamentals") |
| `LearningModule` | `learning_modules` | A module inside a track (e.g. "Module 1: Intro to Python") |
| `LearningSubmodule` | `learning_submodules` | A lesson inside a module (e.g. "1.1 What is Python?") |
| `Bookmark` | `bookmarks` | Problems a user has bookmarked |
| `AIFeedback` | `ai_feedback` | AI-generated feedback linked to a submission |
| `UserLearningProgress` | `user_learning_progress` | Tracks which submodules a user has completed |

### Enums

```python
UserRole:         STUDENT | ADMIN
DifficultyLevel:  EASY | MEDIUM | HARD
SubmissionStatus: PENDING | RUNNING | ACCEPTED | WRONG_ANSWER |
                  TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILE_ERROR
```

### Relationships (how tables connect)
```
User ──< Submission ──< AIFeedback (1 feedback per submission)
User ──< UserProgress
User ──< Bookmark ──> Problem
User ──< ... (via user_learning_progress)

Problem ──< Submission
Problem ──< Bookmark

LearningTrack ──< LearningModule ──< LearningSubmodule ──< UserLearningProgress
```

Tables are **auto-created** on backend startup via:
```python
Base.metadata.create_all(bind=engine)  # in main.py
```

---

## ⚙️ Backend Config (backend/app/utils/)

### `config.py` — App Settings
Uses **Pydantic Settings** to read environment variables from `.env` file:

```python
DATABASE_URL          → SQLite file path (e.g. sqlite:///./codexa.db)
FIREBASE_PROJECT_ID   → Used to verify Firebase ID tokens
GEMINI_API_KEY        → For AI feedback and visualizer features
CORS_ORIGINS          → Which frontend URLs are allowed (default: localhost:3000)
MAX_EXECUTION_TIME    → Code runner time limit in seconds
MAX_MEMORY_MB         → Code runner memory limit
```

### `database.py` — DB Connection
Sets up the SQLAlchemy engine and provides a **`get_db()` dependency** used in all API routes:
```python
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(...)     # Creates DB sessions
Base = declarative_base()           # All models inherit from this

def get_db():                        # FastAPI dependency injection
    db = SessionLocal()
    try:
        yield db                     # Each request gets its own session
    finally:
        db.close()                   # Session closed after request ends
```

### `main.py` — FastAPI Entry Point
- Creates the `FastAPI` app instance
- Adds **CORS middleware** so frontend (`localhost:3000`) can call the backend
- Imports all models so SQLAlchemy knows about them before creating tables
- Registers all route groups with their URL prefixes:
  ```
  /api/users    → users.py router
  ```
- On startup, runs `Base.metadata.create_all(bind=engine)` → creates all tables automatically

---

## 🔐 Authentication Flow (How Login Works)

```
User visits /login
    ↓
Types email/password OR clicks "Continue with Google"
    ↓
Firebase Auth (in browser) authenticates the user
    ↓
Firebase gives back a signed JWT ID Token
    ↓
AuthContext (frontend) sends this token to:
POST /api/users/sync  with  Authorization: Bearer <token>
    ↓
Backend verifies the token using Google's public JWKS endpoint
(no service account key needed — completely secure)
    ↓
If user exists in DB → updates last_login
If new user → creates a new row in users table with auto-generated username
    ↓
Backend returns full user profile (id, email, username, stats, etc.)
    ↓
Frontend stores this in AuthContext as `dbUser`
    ↓
User is redirected to /dashboard
```

### Token Verification (backend/app/routes/users.py)
```python
def verify_firebase_token(authorization: str = Header(...)):
    # Extracts "Bearer <token>" from the Authorization header
    # Calls Google's public JWKS to verify the token signature
    # Returns decoded payload (uid, email, name, picture)
```

### Auth State Persistence
When the app loads, `onAuthStateChanged` (Firebase) fires automatically:
- If user was previously logged in → Firebase restores session silently
- AuthContext calls `/api/users/sync` again to re-fetch the latest DB profile
- User lands directly on `/dashboard` without needing to log in again

---

## 🛡️ Protected Routes (frontend/components/layout/ProtectedRoute.tsx)

Any page wrapped with `<ProtectedRoute>` will:
1. Show a **loading spinner** while auth state is being determined
2. **Redirect to `/login`** if no authenticated user is found
3. **Render the page** normally if the user is logged in

```tsx
// Usage in any page:
export default function DashboardPage() {
    return (
        <ProtectedRoute>
            {/* Your page content here */}
        </ProtectedRoute>
    );
}
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL=sqlite:///./codexa.db
FIREBASE_PROJECT_ID=codexa-51a75
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=["http://localhost:3000"]
SECRET_KEY=your-secret-key
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> ⚠️ Never commit `.env` or `.env.local` — they are listed in `.gitignore`. Use `.env.example` as the reference template.

---

## 🚀 Running the Project Locally

### 1. Backend
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate    # Mac/Linux
# OR
venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Copy env template and fill in values
cp .env.example .env

# Start the server (auto-reloads on file changes)
uvicorn app.utils.main:app --reload --port 8000
```

Backend will be live at: **http://localhost:8000**
Swagger API docs at: **http://localhost:8000/docs**

---

### 2. Frontend
```bash
cd frontend

# Install dependencies
npm install

# Copy env template and fill in Firebase credentials
cp .env.example .env.local

# Start dev server
npm run dev
```

Frontend will be live at: **http://localhost:3000**

---

## ✅ Current Progress

| Feature | Status |
|---|---|
| Project folder structure | ✅ Done |
| SQLite DB + SQLAlchemy setup | ✅ Done |
| All 10 ORM models defined | ✅ Done |
| Firebase Auth (email + Google) | ✅ Done |
| User sync API (`POST /api/users/sync`) | ✅ Done |
| Fetch user APIs (`GET /me/:uid`, `GET /:id`) | ✅ Done |
| Login / Signup page (combined UI) | ✅ Done |
| Dashboard page (protected) | ✅ Done |
| Auth state persistence (auto-login) | ✅ Done |
| Protected routes | ✅ Done |
| `.gitignore` + `.env.example` files | ✅ Done |
| Problems API + listing page | 🔴 Not started |
| Code submission + judging | 🔴 Not started |
| Learning tracks + modules | 🔴 Not started |
| Bookmarks | 🔴 Not started |
| AI Code Visualizer | 🔴 Not started |
| User profile page | 🔴 Not started |

---

## 👨‍💻 Developer

**Name:** nextgendev2029
**Email:** tuhinrock121@gmail.com
**Project:** OJT 2026 — Codexa
**Firebase Project:** `codexa-51a75`
