import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Role } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { PageLoader } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  Shield,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create User Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('SALES');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/users');
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load employees', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !role) {
      showToast('Please fill out all employee fields', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/users', {
        fullName,
        email,
        password,
        role,
      });

      if (res.data?.success) {
        showToast(`Employee ${fullName} created successfully`, 'success');
        setIsModalOpen(false);
        setFullName('');
        setEmail('');
        setPassword('');
        setRole('SALES');
        fetchUsers();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = !user.isActive;
      const res = await api.patch(`/users/${user.id}/status`, { isActive: newStatus });
      if (res.data?.success) {
        showToast(res.data.message || `User account status updated`, 'info');
        fetchUsers();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const getRoleBadgeVariant = (r: Role) => {
    switch (r) {
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

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
            Internal Employees & Role Access
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Administer system accounts, department permissions (Sales, Warehouse, Accounts), and security
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add Team Member
        </Button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Employee Name</th>
                <th className="px-6 py-3.5">Work Email</th>
                <th className="px-6 py-3.5">Access Role</th>
                <th className="px-6 py-3.5">Account Status</th>
                <th className="px-6 py-3.5">Created Date</th>
                <th className="px-6 py-3.5 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
                      {u.fullName.charAt(0)}
                    </div>
                    <span>{u.fullName}</span>
                  </td>

                  <td className="px-6 py-4 font-mono text-slate-400">{u.email}</td>

                  <td className="px-6 py-4">
                    <Badge variant={getRoleBadgeVariant(u.role)}>{u.role}</Badge>
                  </td>

                  <td className="px-6 py-4">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                        <CheckCircle className="w-4 h-4" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-rose-400 text-xs font-medium">
                        <XCircle className="w-4 h-4" /> Deactivated
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-slate-400 font-mono">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
                        u.isActive
                          ? 'border-rose-900/50 bg-rose-950/30 text-rose-400 hover:bg-rose-900/40'
                          : 'border-emerald-900/50 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Internal Team Member"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <Input
              label="Full Name *"
              required
              placeholder="e.g. Anand Joshi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<UserIcon className="w-4 h-4" />}
              className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
            />
          </div>

          <div>
            <Input
              label="Corporate Email Address *"
              type="email"
              required
              placeholder="e.g. anand@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
            />
          </div>

          <div>
            <Input
              label="Initial Password *"
              type="password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              className="bg-slate-900 border-slate-700 text-white placeholder-slate-500"
            />
          </div>

          <div>
            <Select
              label="Assign System Role & Permissions *"
              options={[
                { value: 'SALES', label: 'SALES (Customers, CRM, Challans)' },
                { value: 'WAREHOUSE', label: 'WAREHOUSE (Stock Movements, Products, Challan View)' },
                { value: 'ACCOUNTS', label: 'ACCOUNTS (Customers, Challans, Financial Billing)' },
                { value: 'ADMIN', label: 'ADMIN (Full System Superuser Access)' },
              ]}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Create Employee Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
