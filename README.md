# NexERP - Mini ERP + CRM Operations Portal

An enterprise-grade, production-ready Full Stack Operations Portal built for wholesale, distribution, and manufacturing enterprises. It manages clients, product master SKUs, real-time inventory ledger movements, sales delivery challans with atomic stock verification, CRM follow-ups, and internal employee access control.

---

## 🌐 Live Production Deployment

- 🚀 **Live Frontend Application:** [https://mini-erp-jet.vercel.app](https://mini-erp-jet.vercel.app/)
- ⚙️ **Live Backend API:** [https://mini-erp-1mi8.onrender.com](https://mini-erp-1mi8.onrender.com/)
- 🏥 **API Health Check:** [https://mini-erp-1mi8.onrender.com/api/health](https://mini-erp-1mi8.onrender.com/api/health)
- 🐙 **GitHub Repository:** [https://github.com/Roshan2146/Mini-ERP](https://github.com/Roshan2146/Mini-ERP)

---

## 🔑 Demo Login Accounts & Credentials

All demo accounts share the universal password: `Admin@123`

| Email Address | Role | Description |
| :--- | :--- | :--- |
| `admin@example.com` | **ADMIN** | Superuser with unrestricted access across all portal modules |
| `sales@example.com` | **SALES** | Sales lead managing customer CRM accounts and issuing delivery challans |
| `warehouse@example.com` | **WAREHOUSE** | Inventory manager handling inward restocks and stock dispatches |
| `accounts@example.com` | **ACCOUNTS** | Accountant auditing challan valuations and customer receivables |

*(The login page features a 1-click Demo Role Switcher for instant login without manual typing)*

---

## 🏗️ Architecture & Technology Stack

### Backend
- **Runtime & Language:** Node.js, TypeScript (Strict Mode)
- **Framework:** Express.js
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Authentication & Security:** JWT (Access Tokens), bcryptjs password hashing, Helmet, CORS, Rate Limiting
- **Validation:** Zod Schema Validation with structured error responses
- **Logging & Error Handling:** Morgan, Centralized AppError architecture, Custom standard API Response formatter
- **Testing:** Jest, Supertest, ts-jest

### Frontend
- **Framework & Tooling:** React 18, Vite, TypeScript
- **Styling & UI:** Tailwind CSS, Lucide Icons, Custom design system
- **Routing & Forms:** React Router v6, React Hook Form, Zod Resolver
- **Visualizations:** Recharts (Inventory distribution by category, CRM portfolio donut chart, Low stock alerts)
- **API Client:** Axios with JWT auto-injection & centralized error interceptors

---

## 👥 Roles & Permissions Matrix (RBAC)

| Module / Resource | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| **Customers Master** | Full CRUD | Full CRUD | Read-Only | Read-Only |
| **CRM Follow-ups** | Full CRUD | Full CRUD | Read-Only | Read-Only |
| **Products Catalog** | Full CRUD | Read-Only | Full CRUD | Read-Only |
| **Inventory Restock (IN) / Dispatch (OUT)** | Allowed | Read-Only | Allowed | Read-Only |
| **Stock Movement Ledger** | Full View | Full View | Full View | Full View |
| **Sales Delivery Challans** | Full CRUD + Confirm | Create, Edit, Cancel | Confirm, View | Read-Only |
| **User & Employee Management** | Full CRUD | Access Denied | Access Denied | Access Denied |

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
│   ├── vercel.json             # SPA routing rewrite configuration
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

## 🛡️ Critical Business Rules & Transaction Integrity

### 1. Atomic Challan Confirmation & Multi-Item Stock Deduction
When a user confirms a Sales Delivery Challan (`POST /api/challans/:id/confirm`):
1. **Multi-Item Availability Check:** The system queries available physical stock for *every* item in the challan.
2. **Zero/Negative Stock Violation Guard:** If **even a single product** has insufficient stock, the entire database transaction (`prisma.$transaction`) is aborted and rolled back.
3. **No Partial Updates:** If Product A has 10 units and Product B has 2 units, and the challan requests 5 of A and 10 of B, **neither Product A nor Product B will be deducted**, and the challan remains in `DRAFT`.
4. **Historical Immutability:** Challan line items store immutable snapshots (`productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot`) to safeguard historical records against future catalog edits.

### 2. Challan Cancellation & Inventory Replenishment
- If a `CONFIRMED` challan is cancelled, the system automatically runs an atomic restoration transaction that safely increments physical inventory back into stock and logs corresponding `IN` movement records.

---

## ⚡ Local Development Setup

### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment variables & update DATABASE_URL
cp .env.example .env

# Push schema and seed demo data
npx prisma db push
npm run prisma:seed

# Start backend development server (http://localhost:5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server (http://localhost:5173)
npm run dev
```

---

## 🧪 Running Automated Tests

```bash
cd backend
npm test
```

---

## 📬 Postman API Collection

Import [`postman/Mini-ERP-CRM.postman_collection.json`](file:///c:/Users/rosha/Downloads/FULL%20stack%20pune/postman/Mini-ERP-CRM.postman_collection.json) into Postman:
- Pre-configured with automatic `Bearer Token` capture upon successful login.
- Covers Authentication, Customers, Products, Inventory, Stock In/Out, Challans, and Dashboard APIs.
