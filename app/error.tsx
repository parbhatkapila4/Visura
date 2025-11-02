'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-red-500/20 rounded-2xl p-8 shadow-2xl">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
          </div>
          
          {/* Error Message */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-3">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-400 text-sm mb-2">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-red-400 hover:text-red-300">
                  Error Details (Dev Only)
                </summary>
                <div className="mt-2 p-3 bg-black/50 rounded-lg border border-red-500/20">
                  <p className="text-xs text-red-300 font-mono break-words">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-gray-500 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              </details>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl h-12 transition-all shadow-lg shadow-orange-500/30"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Link href="/" className="w-full">
              <Button
                variant="outline"
                className="w-full border-gray-700 hover:border-orange-500/50 hover:bg-orange-500/10 text-white rounded-xl h-12 transition-all"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </Link>
            
            <Link href="/dashboard" className="w-full">
              <Button
                variant="ghost"
                className="w-full hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl h-10 transition-all text-sm"
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>
          
          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              If this problem persists,{' '}
              <a 
                href="mailto:help@productsolution.net" 
                className="text-orange-400 hover:text-orange-300 underline"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

