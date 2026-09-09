import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const AccessDenied: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-center text-rose-400 mb-4 shadow-lg">
        <ShieldAlert className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h2 className="text-2xl font-black text-white tracking-tight">Access Denied (403)</h2>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
        Your assigned system role does not have permission to view or manage this department resource. Contact an administrator if you believe this is in error.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
