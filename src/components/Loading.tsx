import { Loader2 } from 'lucide-react';

export function Loading({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
    </div>
  );
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
    </div>
  );
}
