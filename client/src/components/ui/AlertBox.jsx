import { useEffect } from 'react';

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

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-[90vw] sm:max-w-md w-full px-4 pointer-events-none animate-fadeIn">
      <div className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 ${colorClasses}`}>
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : isWarning ? (
            <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <p className="text-sm font-medium tracking-wide m-0">
            {description}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 transition-opacity bg-transparent border-none text-current cursor-pointer text-xs font-bold p-0 ml-2"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
