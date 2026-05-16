'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: string; message: string; type: ToastType };
type ToastContextType = { toast: (message: string, type?: ToastType) => void };

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons = {
    success: <CheckCircle size={16} className="text-[#00e887] shrink-0" />,
    error: <XCircle size={16} className="text-[#ff4455] shrink-0" />,
    info: <AlertCircle size={16} className="text-[#c8ff00] shrink-0" />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9998] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{ animation: 'fade-up 0.3s ease forwards' }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[#1e1e2e] bg-[#0d0d12] shadow-2xl min-w-[280px] max-w-[360px]"
          >
            {icons[t.type]}
            <span className="text-sm text-[#eeeef5] flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-[#5a5a72] hover:text-[#eeeef5] transition-colors ml-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
