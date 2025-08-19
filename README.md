# Dynamic Airtable-Connected Form Builder

A full‑stack MERN application to build and publish dynamic forms backed by Airtable. Authenticate with Airtable, select a Base/Table/Fields, design your form (labels, required, logic), and collect responses that sync to Airtable.

## Tech Stack
- Frontend: React (Next.js) + TailwindCSS
- Backend: Node.js + Express.js
- Database: MongoDB (Mongoose)
- Integrations: Airtable OAuth 2.0 + Airtable REST API

## Features
- Airtable OAuth Login (PKCE + state, cookie session)
- Form Builder
  - Choose Airtable Base and Table
  - Pick fields and rename labels
  - Supported field types: Short Text, Long Text, Single Select, Multi Select, File Upload
  - Conditional Logic (show/hide based on previous answers)
  - Preview form before saving
- Form Viewer (/form/:id) renders a saved form config
- Save Responses to Airtable (typecast on write)
- Dashboard to view and open saved forms
- Bonus (optional or partial): validation, live preview, export as PDF

## Monorepo Structure
```
Airtable-form-builder/
├── frontend/       # React + Tailwind app
└── backend/        # Express API + MongoDB + Airtable OAuth
```

## Getting Started

```bash
git clone <repo-url>

# Frontend
a cd frontend
npm install
npm run dev
# http://localhost:3000

# Backend
cd ../backend
npm install
npm run dev
# http://localhost:5000
```

## Environment Variables (Backend)
Copy `backend/.env.example` to `backend/.env` and fill in your values:

```
MONGODB_URI=
AIRTABLE_CLIENT_ID=
AIRTABLE_CLIENT_SECRET=
AIRTABLE_REDIRECT_URI=http://localhost:5000/auth/callback
SESSION_SECRET=
```

## Airtable OAuth Setup
- Docs: https://airtable.com/developers/web/guides/oauth
- Steps:
  1. Create an OAuth integration in Airtable developer console.
  2. Note your Client ID and Client Secret.
  3. Add Redirect URI: `http://localhost:5000/auth/callback` (must match exactly).
  4. Select scopes required by your app (e.g., `schema.bases:read schema.tables:read schema.fields:read data.records:write`).
  5. Save.
- In `backend/.env`, set `AIRTABLE_CLIENT_ID`, `AIRTABLE_CLIENT_SECRET`, `AIRTABLE_REDIRECT_URI`, and a strong `SESSION_SECRET`.

## Deployment Guide

### Frontend (Vercel/Netlify)
- Vercel: push `frontend/` with the included `vercel.json` or configure via dashboard.
- Netlify: set build command `npm run build` in `frontend`, publish directory `.next` or `out` depending on your Next.js config.

### Backend (Render/Railway)
- Render:
  - Create a Web Service pointing to `backend/`.
  - Runtime: Node
  - Start command: `npm start`
  - Env Vars: add all variables from `.env.example`.
  - Configure a persistent MongoDB connection (e.g., MongoDB Atlas).
- Railway: similar steps; set start command and environment variables.

## Author & License
- Author: Nikhil Jindal
- License: MIT

---

## Screenshots

> All screenshots are under `pics/` at the project root and embedded here with relative paths so they render on GitHub.

1. Form Builder landing and base selection

![Form Builder - Base Selection](./pics/Screenshot%20(18).png)

- Shows the Form Builder UI with a clean, card-style layout.
- The left panel contains settings and step-by-step configuration.
- The “Select Airtable Base” dropdown allows choosing a base (from Airtable or mock fallback).

2. Table selection and fields loading

![Form Builder - Table Selection](./pics/Screenshot%20(19).png)

- After picking a base, the “Select Table” step becomes active.
- The app loads tables for the base, then prepares to fetch table fields.

3. Field configuration (labels, required)

![Form Builder - Field Configuration](./pics/Screenshot%20(20).png)

- Available fields are listed; each can be added to the form.
- Selected fields appear with controls to rename labels and toggle “required”.

4. Live Preview (right panel)

![Form Builder - Live Preview](./pics/Screenshot%20(21).png)

- The right-side card previews how the form will look to end users.
- As you add or edit fields, the preview updates.

5. Form Viewer page (/form/:id)

![Form Viewer - Rendered Form](./pics/Screenshot%20(22).png)

- Renders a saved form configuration.
- Applies conditional logic (e.g., show/hide fields based on answers).
- Validates required fields and submits to the backend.

6. Success confirmation

![Form Submission Success](./pics/Screenshot%20(23).png)

- Shows a success card when the response is submitted.
- Optionally includes the created Airtable record ID.

---

### Notes
- The app is configured to run locally on:
  - Frontend: http://localhost:3000
  - Backend: http://localhost:5000
- Ensure the frontend origin is allowed by CORS in the backend.
- For production, update allowed origins and secure cookie/session settings accordingly.
