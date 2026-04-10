import { useNavigate } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mb-5">
          <ShieldExclamationIcon className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">
          Access Denied
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          You don't have permission to view this page. Contact your HSE Manager if you believe this is a mistake.
        </p>
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
