# Flash Growth — Backend Server

> Node.js · Express · TypeScript · PostgreSQL · Prisma · Google OAuth · Razorpay · Stripe · Cloudinary · Resend

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Language | TypeScript 5 |
| ORM | Prisma 6 + PostgreSQL |
| Auth | Google OAuth 2.0 + JWT |
| Payments | Stripe (USD) · Razorpay (INR) |
| Images | Cloudinary |
| Email | Resend |
| Rate Limiting | express-rate-limit |

---

## 🚀 Getting Started

### 1 — Prerequisites

- Node.js ≥ 18
- PostgreSQL database (local or [Supabase](https://supabase.com))
- Accounts for: Google Cloud Console, Stripe, Razorpay, Cloudinary, Resend

### 2 — Install dependencies

```bash
cd server
npm install
```

### 3 — Configure environment variables

Copy `.env.example` to `.env` and fill in every value:

```bash
cp .env.example .env
```

| Variable | Where to find it |
|----------|-----------------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection String |
| `JWT_SECRET` | Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API keys |
| `STRIPE_PUBLISHABLE_KEY` | Same as above |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI: `stripe listen --print-secret` |
| `RAZORPAY_KEY_ID` | [Razorpay Dashboard](https://dashboard.razorpay.com) → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Same as above |
| `CLOUDINARY_CLOUD_NAME` | [Cloudinary Console](https://console.cloudinary.com) → Dashboard |
| `CLOUDINARY_API_KEY` | Same as above |
| `CLOUDINARY_API_SECRET` | Same as above |
| `RESEND_API_KEY` | [Resend Dashboard](https://resend.com/api-keys) |
| `SYSTEM_ALERT_EMAIL` | Your business email (lead notifications are sent here) |
| `FRONTEND_URL` | `http://localhost:5173` (dev) or your Vercel URL (prod) |

### 4 — Database setup

```bash
# Generate the Prisma client
npm run prisma:generate

# Create and run the initial migration
npm run prisma:migrate
```

### 5 — Run the development server

```bash
npm run dev
```

The API will be available at **http://localhost:5000**

Health check: `GET http://localhost:5000/health`

---

## 📡 API Reference

### Authentication

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/google` | — | Exchange Google ID token for JWT |

**Body:**
```json
{ "credential": "<Google ID Token>" }
```

**Response:**
```json
{
  "token": "eyJ...",
  "user": { "id": "...", "email": "...", "fullName": "...", "role": "USER" }
}
```

---

### Inquiries (Leads)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/inquiries` | — | Submit service inquiry form |
| `GET` | `/api/inquiries` | Admin JWT | List all inquiries |
| `GET` | `/api/inquiries/:id` | Admin JWT | Single inquiry detail |
| `PATCH` | `/api/inquiries/:id/status` | Admin JWT | Update CRM status |

**POST /api/inquiries body:**
```json
{
  "fullName": "Arjun Mehta",
  "mobileNumber": "+91 98765 43210",
  "email": "arjun@acmecorp.in",
  "businessType": "B2B",
  "companyName": "Acme Corp",
  "projectDescription": "We need a full digital rebrand.",
  "services": [
    { "id": "biz-1", "name": "Brand Identity", "price": 2500 },
    { "id": "mkt-3", "name": "Social Media Campaigns", "price": 1800 }
  ]
}
```

**PATCH /api/inquiries/:id/status body:**
```json
{ "status": "CONTACTED" }
```
Valid statuses: `PENDING` | `CONTACTED` | `IN_PROGRESS` | `CLOSED`

---

### Payments

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/payments/stripe/create-intent` | — | Create Stripe PaymentIntent |
| `POST` | `/api/payments/razorpay/create-order` | — | Create Razorpay order |
| `POST` | `/api/payments/razorpay/verify` | — | Verify Razorpay signature |
| `POST` | `/api/payments/stripe-webhook` | Stripe sig | Stripe webhook handler |

**Stripe flow:**
1. Client POSTs `{ inquiryId }` → receives `{ clientSecret, publishableKey }`
2. Client uses Stripe.js to confirm payment with `clientSecret`
3. Stripe sends `payment_intent.succeeded` event to `/api/payments/stripe-webhook`

**Razorpay flow:**
1. Client POSTs `{ inquiryId }` → receives `{ orderId, amount, currency, keyId }`
2. Client opens Razorpay checkout with `orderId` + `keyId`
3. On success, client POSTs `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` to `/api/payments/razorpay/verify`

---

### Portfolio Projects

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/projects` | — | List all portfolio projects |
| `GET` | `/api/projects/:id` | — | Single project |
| `POST` | `/api/projects` | Admin JWT | Add new project (with image) |
| `PATCH` | `/api/projects/:id` | Admin JWT | Update project metadata |
| `DELETE` | `/api/projects/:id` | Admin JWT | Delete project + Cloudinary asset |

**POST /api/projects body:**
```json
{
  "clientName": "Nexis Marketing",
  "category": "Branding",
  "services": ["Brand Identity", "Logo Design"],
  "result": "340% increase in brand recall within 3 months",
  "imageBase64": "data:image/png;base64,iVBORw0KGgo...",
  "color": "#0057FF"
}
```

---

### Admin Stats

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/admin/stats` | Admin JWT | KPI dashboard metrics |
| `GET` | `/api/admin/inquiries/by-status` | Admin JWT | Kanban grouping |

**GET /api/admin/stats response:**
```json
{
  "inquiries": { "total": 42, "pending": 8, "inProgress": 12, "closed": 22, "conversionRate": 52 },
  "revenue":   { "totalCollected": 187500 },
  "projects":  { "total": 14 },
  "recentInquiries": [ ... ]
}
```

---

## 🔐 Authentication Guide

All protected routes require an `Authorization` header:
```
Authorization: Bearer <JWT token>
```

To make a user ADMIN, update their record directly in the database:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## 🌐 Deployment

### Frontend → Vercel

```bash
# In project root
npm run build
# Deploy the dist/ folder to Vercel
```

### Backend → Railway

1. Create a new Railway project
2. Link this `server/` directory
3. Set all environment variables in Railway's settings panel
4. Railway will auto-detect the `npm start` script

### Database → Supabase

1. Create a new Supabase project
2. Copy the "Direct connection" string to `DATABASE_URL`
3. Run `npm run prisma:migrate` to push the schema

---

## 📁 Project Structure

```
server/
├── prisma/
│   └── schema.prisma          # Database models
├── src/
│   ├── index.ts               # Express app + server bootstrap
│   ├── lib/
│   │   ├── email.ts           # Resend email templates
│   │   └── cloudinary.ts      # Cloudinary upload/delete helpers
│   ├── middlewares/
│   │   └── authMiddleware.ts  # JWT verification + role guard
│   └── routes/
│       ├── auth.ts            # Google OAuth
│       ├── inquiry.ts         # Lead management
│       ├── payment.ts         # Stripe + Razorpay
│       ├── project.ts         # Portfolio CRUD
│       └── admin.ts           # Admin KPI stats
├── .env.example               # Environment variable template
├── package.json
└── tsconfig.json
```
