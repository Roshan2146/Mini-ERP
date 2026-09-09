import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Warehouse, Lock, Mail, ShieldAlert, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success && res.data?.data) {
        const { token, user } = res.data.data;
        login(token, user);
        showToast(`Welcome back, ${user.fullName}! Logged in as ${user.role}.`, 'success');
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
      showToast(err.message || 'Authentication error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword('Admin@123');
    showToast(`Loaded ${demoRole} credentials`, 'info', 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-glow">
            <Warehouse className="w-8 h-8 text-slate-950 stroke-[2.5]" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-2xl font-extrabold tracking-tight text-white">
          NexERP Operations Portal
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-400">
          Wholesale, Distribution, Inventory & CRM Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 backdrop-blur-xl sm:px-10">
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Work Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-brand-500"
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                required
                showPasswordToggle={true}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                className="bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-brand-500"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white shadow-glow"
              >
                Sign In to Portal
              </Button>
            </div>
          </form>

          {/* Quick 1-Click Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Demo Role Switcher (1-Click Fill)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@example.com', 'ADMIN')}
                className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/20 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-purple-400">ADMIN</span>
                  <span className="text-[10px] text-slate-500 font-mono">Full</span>
                </div>
                <div className="text-[10px] text-slate-400 group-hover:text-slate-300 truncate mt-0.5">
                  admin@example.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sales@example.com', 'SALES')}
                className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/20 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-400">SALES</span>
                  <span className="text-[10px] text-slate-500 font-mono">CRM</span>
                </div>
                <div className="text-[10px] text-slate-400 group-hover:text-slate-300 truncate mt-0.5">
                  sales@example.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('warehouse@example.com', 'WAREHOUSE')}
                className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-950/20 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400">WAREHOUSE</span>
                  <span className="text-[10px] text-slate-500 font-mono">Stock</span>
                </div>
                <div className="text-[10px] text-slate-400 group-hover:text-slate-300 truncate mt-0.5">
                  warehouse@example.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('accounts@example.com', 'ACCOUNTS')}
                className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400">ACCOUNTS</span>
                  <span className="text-[10px] text-slate-500 font-mono">Billing</span>
                </div>
                <div className="text-[10px] text-slate-400 group-hover:text-slate-300 truncate mt-0.5">
                  accounts@example.com
                </div>
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              Universal Demo Password: Admin@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
