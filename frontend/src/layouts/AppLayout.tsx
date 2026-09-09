import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  FileSpreadsheet,
  PhoneCall,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Warehouse,
  History,
  UserCheck,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const AppLayout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build breadcrumbs from location
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbNameMap: Record<string, string> = {
    dashboard: 'Dashboard',
    customers: 'Customers CRM',
    products: 'Products',
    inventory: 'Inventory & Stock',
    movements: 'Stock Movements',
    challans: 'Sales Challans',
    crm: 'CRM',
    followups: 'Follow-ups',
    users: 'User Management',
    new: 'Create New',
    edit: 'Edit Record',
  };

  // Navigation Items with RBAC awareness
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      show: true,
    },
    {
      label: 'Customers CRM',
      path: '/customers',
      icon: <Users className="w-5 h-5" />,
      show: hasRole('ADMIN', 'SALES', 'ACCOUNTS'),
    },
    {
      label: 'CRM Follow-ups',
      path: '/crm/followups',
      icon: <PhoneCall className="w-5 h-5" />,
      show: hasRole('ADMIN', 'SALES', 'ACCOUNTS'),
    },
    {
      label: 'Products Catalog',
      path: '/products',
      icon: <Package className="w-5 h-5" />,
      show: true,
    },
    {
      label: 'Inventory Control',
      path: '/inventory',
      icon: <Boxes className="w-5 h-5" />,
      show: hasRole('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'),
    },
    {
      label: 'Stock Movements',
      path: '/inventory/movements',
      icon: <History className="w-5 h-5" />,
      show: hasRole('ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'),
    },
    {
      label: 'Sales Challans',
      path: '/challans',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      show: true,
    },
    {
      label: 'Internal Employees',
      path: '/users',
      icon: <ShieldCheck className="w-5 h-5" />,
      show: hasRole('ADMIN'),
    },
  ].filter((item) => item.show);

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'purple';
      case 'SALES':
        return 'info';
      case 'WAREHOUSE':
        return 'warning';
      case 'ACCOUNTS':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col lg:flex-row antialiased">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-white z-40 sticky top-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-glow">
            <Warehouse className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-none text-white">NexERP Operations</h1>
            <span className="text-[10px] text-brand-400 font-medium tracking-wide">ENTERPRISE CRM</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-glow">
              <Warehouse className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                NexERP <span className="text-xs bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded font-mono">v1.0</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Wholesale & Distribution Portal</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
              Operations Menu
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-900/50 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Card & Logout footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 mb-3">
            <div className="w-9 h-9 rounded-full bg-brand-950 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
              <UserCheck className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant={getRoleBadgeVariant(user?.role)} size="sm">
                  {user?.role}
                </Badge>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg border border-rose-900/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-hidden">
        {/* Top Navbar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-slate-950/70 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-30">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <NavLink to="/dashboard" className="hover:text-slate-200 transition-colors">
              Home
            </NavLink>
            {pathSegments.map((segment, idx) => {
              const isLast = idx === pathSegments.length - 1;
              const title = breadcrumbNameMap[segment] || segment;
              return (
                <React.Fragment key={segment}>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  <span className={isLast ? 'text-brand-400 font-semibold' : 'text-slate-400'}>
                    {title}
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Quick Info */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-200">{user?.fullName}</p>
              <p className="text-[11px] text-slate-400">{user?.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-900 text-slate-100">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};
