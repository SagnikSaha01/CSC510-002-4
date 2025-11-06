# Developer Quick Start Guide

Welcome! This guide will walk you through setting up the project on your local machine.

## 1. Frontend Setup

This will install all the necessary frontend dependencies and start the development server.

### Install Dependencies

This command installs all the Node.js packages required for the frontend.
The `--legacy-peer-deps` flag is used to bypass potential peer dependency conflicts.

```bash
npm install --legacy-peer-deps
```
### Create Environment File

Create a file named .env.local in the Fackend directory.

Add the following:

```bash
NEXT_PUBLIC_SUPABASE_URL= [Insert URL here]
NEXT_PUBLIC_SUPABASE_ANON_KEY= [Insert Key here]
```
### Run the Development Server

This starts the frontend application in development mode, usually on http://localhost:3000.
```bash
npm run dev
```
## 2. Backend Setup

This will set up the Python backend, including its virtual environment and dependencies.

### Create Environment File

Create a file named .env in the Backend directory.

Add the following:

```bash
SUPABASE_URL= [Insert URL here]
SUPABASE_KEY= [Insert Key here]
OPENAI_API_KEY= [Insert Key here]
```
### Create Virtual Environment (One-Time Setup)

This command creates a self-contained Python virtual environment named venv.
You only need to do this once.
```bash
python -m venv venv
```
### Activate the Virtual Environment

You must run this command every time you open a new terminal to work on the backend.
It activates the virtual environment.

### On Windows (Command Prompt / PowerShell):
```bash
.\venv\Scripts\activate
```

### On macOS / Linux (Bash):
```bash
source venv/bin/activate
```
### Install Python Dependencies

With your virtual environment active, this command installs all the required Python packages from the requirements.txt file.
```bash
pip install -r requirements.txt
```
### Run the Backend Server

This command starts the backend (API) server.
```bash
python run.py
```
## 3. Running Tests

This project includes **backend tests** (Python) and **frontend tests** (JavaScript/TypeScript).

### 3.1 Backend Testing (pytest)

#### Ensure Virtual Environment is Active
Make sure your backend virtual environment is activated before running tests (see step 2.3).

#### Run Backend Tests
This command will automatically discover and run all backend tests:
```bash
pytest
```

### 3.2 Frontend Testing (Jest)

The frontend uses **Jest** for unit and component testing.

### Install pnpm

From the frontend project directory

```bash
npm install -g pnpm
```

#### Install Dependencies

From the frontend project directory:

```bash
pnpm install
```

### Run Frontend Tests

To execute all Jest tests, run:

```bash
pnpm test
```
