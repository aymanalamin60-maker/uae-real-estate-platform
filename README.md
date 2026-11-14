# UAE Real Estate Platform

A bilingual UAE-focused real-estate management platform. The app now supports a working local demo mode when MongoDB is not configured, while also supporting the MongoDB + JWT model for a more production-ready setup.

## Quick start (works immediately)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npm run dev
   ```

3. Open:
   ```bash
   http://localhost:3000
   ```

4. Sign in with:
   - Email: admin@uae-realestate.com
   - Password: Admin123!

This will run in demo mode automatically unless you set a valid MongoDB connection string in `.env`.

## Real database mode

If you want the MongoDB + JWT version, create a `.env` file based on `.env.example` and set:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/uae_real_estate
JWT_SECRET=your-long-random-string-of-at-least-32-characters
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=StrongPassword123!
PORT=3000
```

Then run:

```bash
npm run dev
```

## Features included

- Login and session management
- Arabic/English dashboard interface
- Property management CRUD
- Client, tenant, contract, and commission tables
- Responsive dashboard layout
- Demo data and a real-data-ready backend
- JWT protected API when running with environment configuration

## Project structure

- `server.js` — Express server and API
- `public/index.html` — app entry
- `public/app.js` — client-side UI logic
- `public/styles.css` — styling and responsive layout
- `src/models.js` — MongoDB models
- `src/auth.js` — authorization middleware
- `.env.example` — environment template

## Notes

- The app will run in demo mode without MongoDB so you can test the full UI immediately.
- The MongoDB version is still the correct production direction for multi-user, persistent business data.
- Do not commit `.env` to GitHub.

## Roadmap

- Add database-backed user management and permissions for all roles
- Add role-specific dashboards for landlord / tenant / client
- Add reports, search, filtering, and export features
- Add file uploads and document management
- Prepare deployment for production hosting
