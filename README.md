# UAE Real Estate Platform

Bilingual (Arabic/English) UAE real-estate management MVP. The current implementation now uses MongoDB for persistent records and JWT authentication for the API. It is a foundation, not yet a production-ready tenancy, payments, or compliance system.

## Run locally

1. Install Node.js 20+ and MongoDB (local or hosted).
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and set `MONGODB_URI`, a random `JWT_SECRET` of at least 32 characters, and a strong `ADMIN_PASSWORD` of at least 12 characters.
4. Run `npm run dev` (or `npm start`) and open `http://localhost:3000`.
5. Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from your `.env`. The initial admin is created on first startup if the email does not exist.

Never commit `.env`; keep secrets in your hosting provider's secret/environment settings. The old hard-coded demo login is removed.

## API foundation

- `POST /api/login` — email/password login; returns a short-lived JWT.
- `GET /api/health` — service/database status.
- Authenticated staff routes for `/api/dashboard`, `/api/properties`, `/api/clients`, `/api/tenants`, `/api/contracts`, and `/api/commissions`.
- CRUD operations on the collection endpoints; deletion is limited to admin/manager.
- `GET/POST /api/users` — admin-only user listing and creation. New passwords are hashed with bcrypt.
- Roles: `admin`, `manager`, `agent`, `landlord`, `tenant`, and `client`. Currently, the management endpoints are intentionally staff-only; role-specific portals and row-level ownership access remain planned work.

## Implementation plan

### Phase 1 — Secure platform foundation (implemented)
- MongoDB connection and persistent schemas for users, properties, clients, tenants, lease contracts, and commissions.
- Password hashing, JWT verification, role checks, login rate limiting, security headers, input validation via Mongoose, and environment-based configuration.
- Staff CRUD API foundation and admin-only user provisioning.

### Phase 2 — Complete management workflows
- Full create/edit/archive screens for clients, tenants, contracts, and commissions.
- Connect tenant and contract records to property/user IDs; implement renewal, due-date, and payment schedules.
- Add filters, pagination, audit history, file/document uploads, and notification preferences.

### Phase 3 — Role-specific access and localization
- Landlord, tenant, and client portals with record-level authorization and access tests.
- Complete Arabic/English localization of all fields, statuses, validation, dates, currency, and navigation; RTL/LTR QA.
- User invitation, password reset, session revocation, and account lifecycle.

### Phase 4 — UAE business readiness
- Confirm requirements with UAE legal/accounting specialists; configure relevant emirate-specific workflows (for example, tenancy registration processes) rather than assuming one universal rule.
- Payment provider integration, receipts, VAT/accounting reports where applicable, privacy/data retention policies, backups, and monitoring.
- Automated API/UI tests, deployment pipeline, staging environment, and production deployment.

## Important limitations

- No production credentials are included in source code; set secrets in `.env` or the deployment environment.
- Financial dashboard revenue is shown as zero until a payment/ledger model is implemented. No payment processing or legally binding contract generation is included.
- Image upload, PDF contract generation, notifications, and native iOS/Android apps are not implemented yet; the current UI is a responsive web app.
