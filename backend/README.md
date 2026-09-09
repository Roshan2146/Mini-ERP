# Mini ERP + CRM Backend API

## Scripts
- `npm run dev`: Run Express development server with live reload via `tsx`
- `npm run build`: Compile TypeScript to `dist/`
- `npm start`: Run compiled production server from `dist/server.js`
- `npm run prisma:generate`: Generate Prisma Client
- `npm run prisma:migrate`: Create and apply database migrations
- `npm run prisma:seed`: Populate database with realistic demo accounts, products, and challans
- `npm test`: Run Jest automated test suites

## Endpoints
- Health: `GET /api/health`
- Auth: `POST /api/auth/login`, `GET /api/auth/me`
- Users (Admin): `GET /api/users`, `POST /api/users`, `PATCH /api/users/:id/status`
- Customers: `GET /api/customers`, `POST /api/customers`, `GET /api/customers/:id`, `PUT /api/customers/:id`, `DELETE /api/customers/:id`, `POST /api/customers/:id/followups`, `GET /api/customers/:id/followups`, `GET /api/customers/crm/all-followups`
- Products: `GET /api/products`, `POST /api/products`, `GET /api/products/:id`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `GET /api/products/categories`
- Inventory: `GET /api/inventory`, `GET /api/inventory/movements`, `POST /api/inventory/stock-in`, `POST /api/inventory/stock-out`
- Sales Challans: `GET /api/challans`, `POST /api/challans`, `GET /api/challans/:id`, `PUT /api/challans/:id`, `POST /api/challans/:id/confirm`, `POST /api/challans/:id/cancel`
- Dashboard: `GET /api/dashboard/stats`
