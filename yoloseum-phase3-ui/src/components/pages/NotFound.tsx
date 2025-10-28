import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <AlertCircle className="h-20 w-20 text-amber-500 mx-auto mb-6 opacity-80" />

        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-2xl font-semibold text-slate-100 mb-4">Page Not Found</p>

        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <Button
          onClick={() => navigate('/')}
          className="bg-amber-600 hover:bg-amber-700 inline-flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Go to Home
        </Button>
      </div>
    </div>
  );
}
