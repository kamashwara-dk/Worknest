'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <AlertCircle size={40} className="text-red-400 mb-4" />
      <h2 className="font-display text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-zinc-400 text-sm mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
