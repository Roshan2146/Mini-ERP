import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/guards/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CustomerList } from './pages/customers/CustomerList';
import { CustomerForm } from './pages/customers/CustomerForm';
import { CustomerDetail } from './pages/customers/CustomerDetail';
import { ProductList } from './pages/products/ProductList';
import { ProductForm } from './pages/products/ProductForm';
import { ProductDetail } from './pages/products/ProductDetail';
import { InventoryOverview } from './pages/inventory/InventoryOverview';
import { StockMovementsList } from './pages/inventory/StockMovementsList';
import { ChallanList } from './pages/challans/ChallanList';
import { ChallanForm } from './pages/challans/ChallanForm';
import { ChallanDetail } from './pages/challans/ChallanDetail';
import { FollowUpsPage } from './pages/crm/FollowUpsPage';
import { UserManagement } from './pages/users/UserManagement';
import { AccessDenied } from './pages/AccessDenied';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Operations Portal Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Customer CRM Routes */}
        <Route
          path="customers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}>
              <CustomerList />
            </ProtectedRoute>
          }
        />
        <Route
          path="customers/new"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
              <CustomerForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="customers/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}>
              <CustomerDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="customers/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
              <CustomerForm />
            </ProtectedRoute>
          }
        />

        {/* CRM Followups Pipeline */}
        <Route
          path="crm/followups"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}>
              <FollowUpsPage />
            </ProtectedRoute>
          }
        />

        {/* Products & Catalog Routes */}
        <Route path="products" element={<ProductList />} />
        <Route
          path="products/new"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route
          path="products/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']}>
              <ProductForm />
            </ProtectedRoute>
          }
        />

        {/* Inventory Control & Movements */}
        <Route
          path="inventory"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS']}>
              <InventoryOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="inventory/movements"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS']}>
              <StockMovementsList />
            </ProtectedRoute>
          }
        />

        {/* Sales Challans */}
        <Route path="challans" element={<ChallanList />} />
        <Route
          path="challans/new"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
              <ChallanForm />
            </ProtectedRoute>
          }
        />
        <Route path="challans/:id" element={<ChallanDetail />} />

        {/* Internal Employees (Admin Only) */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        {/* Error Pages */}
        <Route path="access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
