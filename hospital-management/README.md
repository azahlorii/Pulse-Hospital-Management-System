# Pulse — Hospital Management System

Full-stack app: React + Vite frontend, Express backend, MySQL database, JWT auth.
All modules are implemented: Dashboard, Patients, Doctors, Appointments, Billing.

## Project structure
```
hospital-management/
├── frontend/          React + Vite + Tailwind + Framer Motion
├── backend/           Express + MySQL + JWT
├── database/schema.sql
└── docker-compose.yml Runs the whole stack with one command
```

## Option A — Run locally without Docker

### 1. Database
```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env       # fill in your MySQL password and a JWT secret
node seed.js                # creates the first admin login (prints the password)
npm run dev                 # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Log in with the credentials `seed.js` printed (default `admin@pulse.com` / `Admin@123` — change it after first login; there's no "change password" screen yet, so update it directly in the database or add that feature next).

## Option B — Run locally with Docker (closest to how you'd host it)

Requires Docker + Docker Compose installed.

```bash
cp .env.example .env         # set DB_PASSWORD and JWT_SECRET
docker compose up --build
```

This starts MySQL (with the schema auto-loaded on first boot), the backend on port 5000, and the frontend (served by nginx, which also proxies `/api` to the backend) on port 80.

Then seed the first admin:
```bash
docker compose exec backend node seed.js
```

Visit `http://localhost` and log in.

## Deploying it for real

You have two straightforward paths — pick one.

### Path 1: One host, Docker Compose (DigitalOcean, a VPS, EC2, etc.)
1. Provision a small server (2GB RAM is plenty to start), install Docker.
2. Copy this repo to the server, set real values in `.env` (a strong `DB_PASSWORD` and `JWT_SECRET`).
3. `docker compose up -d --build`
4. Point your domain's DNS at the server, and put a reverse proxy with TLS in front (Caddy or an nginx + Let's Encrypt/Certbot setup) forwarding port 80/443 to the `frontend` container.
5. Run `docker compose exec backend node seed.js` once to create the first admin.

### Path 2: Managed platforms, no server to maintain
- **Database:** create a MySQL instance on PlanetScale, Railway, or Aiven. Run `database/schema.sql` against it.
- **Backend:** deploy `backend/` to Render (`render.yaml` is already included — "New Web Service" → point at this repo/folder) or Railway. Set the `DB_*`, `JWT_SECRET`, and `CORS_ORIGIN` (your frontend's URL) environment variables. Run `node seed.js` once via the platform's shell/console.
- **Frontend:** deploy `frontend/` to Vercel or Netlify (`vercel.json` is included for SPA routing). Set `VITE_API_URL` to your backend's URL (e.g. `https://your-backend.onrender.com/api`) as a build-time environment variable, since frontend and backend now live on different domains.

Either path works — Path 1 is cheaper and keeps everything together; Path 2 has more moving pieces but scales each part independently and has generous free tiers.

## Before you make this public
- Change the seeded admin password immediately (no "change password" UI yet — update `password_hash` in the `users` table with a fresh bcrypt hash, or extend `seed.js`/add a settings screen).
- Set a real, random `JWT_SECRET` (don't reuse the example value).
- Remove or protect the `/api/auth/register` route in production — right now anyone who finds it can create an account. Lock it behind `requireRole('admin')` once you have a way to manage staff accounts through the UI, or delete the route entirely and create accounts via `seed.js`/direct DB inserts.
- Consider rate-limiting `/api/auth/login` (e.g. `express-rate-limit`) against brute-force attempts.
- The MySQL port (3306) is exposed in `docker-compose.yml` for local convenience — remove that port mapping before deploying to a public server, so the database isn't reachable from the internet.

## What each role can do
- **admin** — everything, including adding/editing/removing doctors
- **doctor** / **receptionist** — patients, appointments, billing (doctor management is read-only for these roles; enforced server-side in `doctorRoutes.js`)

## Design notes
Palette: deep teal (`primary`) on a cool clinical white (`surface`), with a vital-sign red (`pulse`) reserved for alerts and the heartbeat/EKG motif on the login page. Display type is Fraunces, body text is Inter.
