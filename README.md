# Mini ERP + CRM Operations Portal

An enterprise-grade, production-ready Full Stack Operations Portal built for wholesale, distribution, and manufacturing enterprises. It manages clients, product master SKUs, real-time inventory ledger movements, sales delivery challans with atomic stock verification, CRM follow-ups, and internal employee access control.

---

## 🏗️ Architecture & Technology Stack

### Backend
- **Runtime & Language:** Node.js, TypeScript (Strict Mode)
- **Framework:** Express.js
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Authentication & Security:** JWT (Access Tokens), bcryptjs password hashing, Helmet, CORS, Rate Limiting
- **Validation:** Zod Schema Validation
- **Logging & Error Handling:** Morgan, Centralized AppError architecture, Custom standard API Response formatter
- **Testing:** Jest, Supertest, ts-jest

### Frontend
- **Framework & Tooling:** React 18, Vite, TypeScript
- **Styling & UI:** Tailwind CSS, Lucide Icons, Custom design system
- **Routing & Forms:** React Router v6, React Hook Form, Zod Resolver
- **Visualizations:** Recharts (Inventory distribution, CRM portfolio, Low stock alerts)
- **API Client:** Axios with JWT auto-injection & centralized interceptors

---

## 👥 Roles & Permissions Matrix (RBAC)

| Role | Customers CRM | CRM Follow-ups | Product Catalog | Stock In/Out | Sales Challans | Employee Access |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ADMIN** | Full (CRUD) | Full (CRUD) | Full (CRUD) | Full (CRUD) | Full (CRUD + Confirm) | Full (CRUD) |
| **SALES** | Full (CRUD) | Full (CRUD) | View Only | View Ledger | Create & Confirm | No Access |
| **WAREHOUSE** | View Only | View Only | Full (CRUD) | Full (Restock/Dispatch) | Confirm & View | No Access |
| **ACCOUNTS** | View / Invoices | View Only | View Only | View Ledger | View & Financials | No Access |

---

## 🔑 Demo Accounts & Test Credentials

All demo accounts share the universal password: `Admin@123`

| Email Address | Role | Description |
| :--- | :--- | :--- |
| `admin@example.com` | **ADMIN** | Superuser with unrestricted access across all portal modules |
| `sales@example.com` | **SALES** | Sales lead managing customer CRM accounts and issuing delivery challans |
| `warehouse@example.com` | **WAREHOUSE** | Inventory manager handling inward restocks and stock dispatches |
| `accounts@example.com` | **ACCOUNTS** | Accountant auditing challan valuations and customer receivables |

---

## 📁 Monorepo Folder Structure

```text
mini-erp-crm/
├── backend/
│   ├── src/
│   │   ├── config/             # Environment & Prisma client instances
│   │   ├── controllers/        # Business logic controllers
│   │   ├── middleware/         # Auth, RBAC, Validation, and Central Error handler
│   │   ├── routes/             # Express API routes
│   │   ├── validators/         # Zod schemas for all request payloads
│   │   ├── utils/              # ApiResponse, AppError, logger
│   │   ├── types/              # Express type extensions & payloads
│   │   ├── __tests__/          # Integration tests & stock transaction suites
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server bootstrap & graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema, Enums, and indexes
│   │   └── seed.ts             # Realistic enterprise seed data script
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI library (Button, Modal, Input, Badge, etc.)
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── layouts/            # Responsive Sidebar & Top Navigation AppLayout
│   │   ├── pages/              # Dashboard, Customers, Products, Inventory, Challans, Users
│   │   ├── services/           # Axios API client with interceptors
│   │   ├── types/              # Shared frontend TypeScript interfaces
│   │   ├── App.tsx             # Route declarations & role guards
│   │   └── main.tsx            # Entry point
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── postman/
│   └── Mini-ERP-CRM.postman_collection.json # Complete Postman API collection
├── docker-compose.yml          # 1-click local PostgreSQL container
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### Step 1: Clone & Configure PostgreSQL
You can either run local PostgreSQL or launch the provided Docker container:

```bash
# Start local PostgreSQL via Docker (optional)
docker compose up -d
```

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma Client & Run Migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed Realistic Demo Data (10+ customers, 20+ products, challans, 4 users)
npm run prisma:seed

# Start Backend Server (Running on http://localhost:5000)
npm run dev
```

### Step 3: Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start Vite Development Server (Running on http://localhost:5173)
npm run dev
```

---

## 🛡️ Critical Business Rules & Transaction Integrity

### 1. Atomic Challan Confirmation & Multi-Item Stock Deduction
When a user confirms a Sales Delivery Challan (`POST /api/challans/:id/confirm`):
1. **Multi-Item Availability Check:** The system queries available stock for *every* item in the challan.
2. **Zero/Negative Stock Violation Guard:** If **even a single product** has insufficient stock, the entire database transaction (`prisma.$transaction`) is aborted and rolled back.
3. **No Partial Updates:** If Product A has 10 units and Product B has 2 units, and the challan requests 5 of A and 10 of B, **neither Product A nor Product B will be deducted**, and the challan remains in `DRAFT`.
4. **Historical Immutability:** Challan line items store immutable snapshots (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`) to safeguard historical records against future catalog edits.

### 2. Challan Cancellation & Inventory Replenishment
- If a `CONFIRMED` challan is cancelled, the system automatically runs an atomic restoration transaction that safely increments physical inventory back into stock and logs corresponding `IN` movement records.

---

## 🧪 Running Automated Tests

Integration tests cover Authentication, Validation, Zero-Stock prevention, and Atomic Multi-Product rollback transactions:

```bash
cd backend
npm test
```

---

## 📬 Postman API Collection

Import [`postman/Mini-ERP-CRM.postman_collection.json`](file:///c:/Users/rosha/Downloads/FULL%20stack%20pune/postman/Mini-ERP-CRM.postman_collection.json) into Postman:
- Pre-configured with automatic `Bearer Token` capture upon successful login.
- Includes full coverage for Authentication, Customers, Products, Inventory, Stock In/Out, Challans, and Dashboard APIs.

---

## 🚀 Cloud Deployment Instructions

### 1. Database (Neon / Supabase / Railway)
- Create a PostgreSQL database instance.
- Copy the connection string to `DATABASE_URL` (e.g. `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`).
- Run `npx prisma migrate deploy` followed by `npm run prisma:seed`.

### 2. Backend (Render / Railway)
- Build command: `npm install && npm run prisma:generate && npm run build`
- Start command: `node dist/server.js`
- Set environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL=https://your-frontend.vercel.app`.

### 3. Frontend (Vercel)
- Framework Preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`.
