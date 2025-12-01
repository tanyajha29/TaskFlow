# TaskFlow — Full Project (MERN-style demo)

## Overview
Single repo implementing progressive internship tasks:
- Express + EJS server-side rendering
- Material UI styling (Materialize)
- REST API for tasks (CRUD)
- JWT authentication (register/login)
- MongoDB via Docker

## Requirements
- Node.js (v18+)
- Docker & Docker Compose

## Setup (local)
1. Copy `.env.example` → `.env` and update if needed.
2. Start MongoDB:
docker compose up -d

3. Install node deps:
npm install

4. Start dev server:
npm run dev

5. Open `http://localhost:3000`

## Notes
- JWT returned on login; frontend stores token in localStorage and sends Authorization header for API calls.
- Replace `JWT_SECRET` in `.env` with a strong secret for production.


