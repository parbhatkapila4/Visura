'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-orange-500/20 rounded-2xl p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            Dashboard Error
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            We couldn't load your dashboard. Please try refreshing.
          </p>
          
          <Button
            onClick={reset}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl px-6 h-11"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

