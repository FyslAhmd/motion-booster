'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-100 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-lg shadow-lg animate-slide-in-right ${
              toast.type === 'success'
                ? 'bg-green-50 border border-green-200'
                : toast.type === 'error'
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            {toast.type === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            )}
            {toast.type === 'error' && (
              <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            )}
            
            <p
              className={`flex-1 text-sm font-medium ${
                toast.type === 'success'
                  ? 'text-green-800'
                  : toast.type === 'error'
                  ? 'text-red-800'
                  : 'text-blue-800'
              }`}
            >
              {toast.message}
            </p>
            
            <button
              onClick={() => removeToast(toast.id)}
              className={`shrink-0 hover:opacity-70 transition-opacity ${
                toast.type === 'success'
                  ? 'text-green-500'
                  : toast.type === 'error'
                  ? 'text-red-500'
                  : 'text-blue-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
