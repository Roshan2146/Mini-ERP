import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card } from '../components/common/Card';
import { Badge, StatusBadge } from '../components/common/Badge';
import { PageLoader } from '../components/common/LoadingSpinner';
import {
  Users,
  Package,
  Boxes,
  FileSpreadsheet,
  AlertTriangle,
  PhoneCall,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return <PageLoader />;
  }

  const { summary, charts, recent } = stats;

  const PIE_COLORS = ['#10B981', '#3B82F6', '#94A3B8', '#F59E0B', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
              Active Session
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Welcome, {user?.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Operating as <span className="text-brand-300 font-semibold">{user?.role}</span> with full role-scoped distribution tools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'ADMIN' || user?.role === 'SALES' ? (
            <Link
              to="/challans/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              + Create Challan
            </Link>
          ) : null}
          {user?.role === 'ADMIN' || user?.role === 'WAREHOUSE' ? (
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <Boxes className="w-4 h-4" />
              Stock Operations
            </Link>
          ) : null}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Customers
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{summary.totalCustomers}</span>
            <span className="text-xs text-emerald-400 font-medium">({summary.activeCustomers} active)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{summary.leadCustomers} prospective leads in CRM</p>
        </div>

        {/* Total Inventory */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Inventory Units
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{summary.totalInventoryQuantity.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-medium">across {summary.totalProducts} SKUs</span>
          </div>
          <p className="text-[11px] text-brand-400/90 mt-1">₹{Number(summary.inventoryValuation).toLocaleString('en-IN')} Stock Valuation</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${summary.lowStockCount > 0 ? 'bg-amber-500/10 text-amber-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{summary.lowStockCount}</span>
            <span className="text-xs text-slate-400 font-medium">SKUs below safety limit</span>
          </div>
          <Link to="/products?lowStockOnly=true" className="text-[11px] text-amber-400/90 hover:underline inline-flex items-center gap-1 mt-1">
            Review reorder items <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Sales Challans */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Confirmed Challans
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{summary.confirmedChallansCount}</span>
            <span className="text-xs text-amber-400 font-medium">({summary.draftChallansCount} draft)</span>
          </div>
          <Link to="/challans" className="text-[11px] text-purple-400 hover:underline inline-flex items-center gap-1 mt-1">
            View dispatch history <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Inventory by Category */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                Inventory Distribution by Category
              </h3>
              <p className="text-xs text-slate-400">Total physical stock volume per business category</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.inventoryByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="category" stroke="#64748B" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="totalStock" name="Total Units" fill="#22C55E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Customer Status Distribution */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              CRM Client Portfolio
            </h3>
            <p className="text-xs text-slate-400">Active accounts vs leads</p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.customerStatusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.customerStatusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-800 text-center">
            <Link to="/customers" className="text-xs text-brand-400 hover:underline">
              Open CRM Pipeline &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Ledger Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Challans */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-purple-400" />
              Recent Sales Challans
            </h3>
            <Link to="/challans" className="text-xs text-brand-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {recent.challans.map((ch: any) => (
              <div key={ch.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{ch.challanNumber}</span>
                    <StatusBadge status={ch.status} />
                  </div>
                  <p className="text-slate-400 mt-0.5 truncate max-w-xs">
                    {ch.customer?.customerName} ({ch.customer?.businessName})
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400">₹{Number(ch.totalAmount).toLocaleString('en-IN')}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(ch.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Boxes className="w-4 h-4 text-emerald-400" />
              Recent Inventory Ledger
            </h3>
            <Link to="/inventory/movements" className="text-xs text-brand-400 hover:underline">
              Full Ledger
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {recent.movements.map((m: any) => (
              <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.movementType === 'IN' ? 'success' : 'danger'}>
                      {m.movementType} ({m.quantity} units)
                    </Badge>
                    <span className="font-semibold text-slate-200">{m.product?.productName}</span>
                  </div>
                  <p className="text-slate-500 font-mono text-[10px] mt-0.5">
                    SKU: {m.product?.sku} • Reason: {m.reason}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <span>{m.createdBy?.fullName || 'System'}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
