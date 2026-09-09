import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mb-4 border border-slate-700">
        <FileQuestion className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h2 className="text-2xl font-black text-white tracking-tight">404 - Page Not Found</h2>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
        The operations resource or route you requested does not exist on this portal.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
