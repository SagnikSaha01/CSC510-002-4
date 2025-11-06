# CSC510-002-4
Repo for CSC 510 at NCSU

<p align="center">
  <a href="https://github.com/psf/black"><img src="https://img.shields.io/badge/code%20style-black-000000.svg" alt="Code style: black"></a>
  <a href="https://flake8.pycqa.org/en/latest/"><img src="https://img.shields.io/badge/linting-flake8-brightgreen.svg" alt="Linting: Flake8"></a>
  <a href="https://github.com/SagnikSaha01/CSC510-002-4/actions/workflows/ci.yml"><img src="https://github.com/SagnikSaha01/CSC510-002-4/actions/workflows/ci.yml/badge.svg" alt="Python CI"></a>
  <a href="https://codecov.io/github/SagnikSaha01/CSC510-002-4"><img src="https://codecov.io/github/SagnikSaha01/CSC510-002-4/branch/development/graph/badge.svg?token=GBU37PKCWF" alt="codecov"></a>
  <a href="https://doi.org/10.5281/zenodo.17539273"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.17539273.svg" alt="DOI"></a>
</p>

# Vibe Eats — Find Food That Matches Your Mood

Welcome to **Vibe Eats**, a mood-based restaurant recommendation and ordering platform.  
Our goal is to help users discover dishes and restaurants that match how they’re feeling — whether it’s *stressed*, *adventurous*, or *in need of comfort food*.

# Vibe Eats Demo
https://youtu.be/QWazXbEpnXs

By: Sagnik Saha, Jackson Mock, Aadhir Sandeep, Frank Lin

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Setup Guides](#setup-guides)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Running Tests](#running-tests)
- [Project Management](#project-management)
  - [Team Roles & Schedule](#team-roles--schedule)
  - [Risks & Mitigation](#risks--mitigation)
- [Requirements Checklist](#requirements-checklist)
- [Third-Party Dependencies](#third-party-dependencies)
- [Quickstart Guide for Users](#quickstart-guide-for-users)
- [Contributing](#contributing)
- [License](#license)
- [Wiki Links](#wiki-links)

---

## Overview
Vibe Eats is a full-stack web application that personalizes restaurant discovery based on mood input.  
Users describe their *vibe* (e.g., “tired and need comfort”), and the system suggests restaurants and dishes aligned with their emotional state.

---

## Key Features
- Swipe-based restaurant discovery  
- AI-powered mood analysis using OpenAI GPT-4o-mini  
- Dynamic menu browsing and ordering  
- Google Sign-In authentication via Supabase Auth  
- Real-time cart updates and preference learning  

---

## System Architecture
**Frontend:** Next.js 16 (TypeScript + Tailwind CSS)  
**Backend:** Flask 3 (Python 3.11 + Supabase SDK + OpenAI API)  
**Database:** Supabase (PostgreSQL + Storage)    

---

## Setup Guides

### Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Create `.env.local` in the `frontend/` directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS/Linux
.\venv\Scripts\activate         # Windows
pip install -r requirements.txt
python run.py
```

Create `.env` in the `backend/` directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
```

### Running Tests
```bash
pytest
```

For more detail, see the [Developer Guide →](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Developer-Guide)

---

## Project Management

### Team Roles & Schedule
| Role | Responsibilities |
|------|------------------|
| Developer 1 (Team Lead) | Manage API integration & timeline |
| Developer 2 (Frontend Lead) | Build UI & Google Auth |
| Developer 3 (Backend Lead) | REST API & database schema |
| Developer 4 (Recommendation & QA) | AI logic & testing |

**Timeline:** 1-week sprint covering planning, backend, frontend, AI, testing, and demo.  
See the detailed [Tasks page →](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Tasks)

---

### Risks & Mitigation
| Risk | Impact | Mitigation |
|------|---------|------------|
| Short timeline | Limited MVP features | Focus on core swipe + AI |
| Auth issues | Login failures | Use Google Auth SDKs |
| DB/API delays | Data flow breaks | Mock data for frontend testing |
| Poor recommendations | User frustration | Start with rule-based filtering |

For complete details, view the [Project Management Plan →](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Project-Management-Plan)

---

## Requirements Checklist
The team follows best practices for **collaboration**, **documentation**, and **quality**:
- Multiple contributors & frequent commits
- Clean auto-generated documentation
- CI-based pytest coverage ≥ 30%
- `.gitignore`, [`LICENSE.md`](https://github.com/SagnikSaha01/CSC510-002-4/blob/main/LICENSE.md), [`INSTALL.md`](https://github.com/SagnikSaha01/CSC510-002-4/blob/main/INSTALL.md), [`CODE_OF_CONDUCT.md`](https://github.com/SagnikSaha01/CSC510-002-4/blob/main/CODE_OF_CONDUCT.md), and [`CONTRIBUTING.md`](https://github.com/SagnikSaha01/CSC510-002-4/blob/main/CONTRIBUTING.md)
- Demo video & badges (Style / Formatter / Coverage / DOI)

Read the full [Project Requirements Checklist →](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Project-requirements-checklist)

---

## Third-Party Dependencies
### Backend (Python)
Flask 3.1.2 • pytest 8.4 • supabase 2.23 • openai 2.6 • Flake8 7.3 • black 25.9 • pydantic 2.12

### Frontend (TypeScript / npm)
Next 16 • React 19 • Tailwind CSS 4 • Supabase JS 2.78 • Lucide React • Radix UI • Zod • Jest 30

Full version table: [Third-Party Dependencies →](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Third-party-dependencies)

---

## Quickstart Guide for Users
1. Visit the app and describe your current mood.  
2. Tap **“Get My Vibe”** to receive AI-driven restaurant suggestions.  
3. Swipe through meal cards, apply filters, and view details.  
4. (Coming Soon) Add meals to cart and place orders.  

See full [Quickstart Guide →](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Quickstart-Guide)

---

## Contributing
Contributions are welcome.
Please review [`CONTRIBUTING.md`](https://github.com/SagnikSaha01/CSC510-002-4/blob/main/CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](https://github.com/SagnikSaha01/CSC510-002-4/blob/main/CODE_OF_CONDUCT.md), then open a pull request for improvements.

---

## License
This project is licensed under the **MIT License**.
See [`LICENSE.md`](https://github.com/SagnikSaha01/CSC510-002-4/blob/main/LICENSE.md) for details.

---

## Wiki Links
| Wiki Page | Description |
|------------|-------------|
| [Home](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Home) | Overview & introduction |
| [Developer Guide](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Developer-Guide) | Local setup and development instructions |
| [Project Management Plan](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Project-Management-Plan) | System design & timeline |
| [Project Requirements Checklist](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Project-requirements-checklist) | Evaluation criteria & documentation standards |
| [Quickstart Guide](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Quickstart-Guide) | End-user walkthrough |
| [Tasks](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Tasks) | Developer task breakdown |
| [Third-Party Dependencies](https://github.com/SagnikSaha01/CSC510-002-4/wiki/Third-party-dependencies) | Dependency list with versions |
