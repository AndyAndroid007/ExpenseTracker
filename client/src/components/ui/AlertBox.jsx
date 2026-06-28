import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function AlertBox({ description, type, onClose, duration = 3500 }) {
  useEffect(() => {
    if (!description) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [description, duration, onClose]);

  if (!description) return null;

  const isSuccess = type === "success";
  const isWarning = type === "warning";

  const colorClasses = isSuccess
    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10"
    : isWarning
    ? "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-amber-500/10"
    : "bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-rose-500/10";

  return createPortal(
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[9999] w-[90%] sm:w-auto sm:min-w-[320px] max-w-md flex justify-center pointer-events-none animate-fadeIn">
      <div className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 w-full ${colorClasses}`}>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {isSuccess ? (
            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : isWarning ? (
            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <p className="text-xs sm:text-sm font-medium tracking-wide m-0 break-words flex-1 leading-normal">
            {description}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 opacity-70 hover:opacity-100 transition-opacity bg-transparent border-none text-current cursor-pointer text-xs font-bold p-0 ml-2"
            aria-label="Close alert"
          >
            ✕
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}
