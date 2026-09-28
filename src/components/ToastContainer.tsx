import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4"
      id="toast-container"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-xl border text-sm font-medium ${
                isSuccess
                  ? 'bg-emerald-900/95 text-emerald-50 border-emerald-700'
                  : isWarning
                  ? 'bg-amber-900/95 text-amber-50 border-amber-700'
                  : isError
                  ? 'bg-rose-900/95 text-rose-50 border-rose-700'
                  : 'bg-slate-900/95 text-slate-50 border-slate-700'
              }`}
              id={`toast-${toast.id}`}
            >
              <div className="flex items-center gap-2.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {isWarning && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-sky-400 shrink-0" />}
                <span>{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="text-white/70 hover:text-white p-1 transition-colors rounded-md"
                aria-label="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
