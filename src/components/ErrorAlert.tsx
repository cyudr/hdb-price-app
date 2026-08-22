import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  variant?: "banner" | "inline";
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title,
  message,
  onRetry,
  variant = "banner",
}) => {
  if (variant === "inline") {
    return (
      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
        <div>
          {title && <h3 className="text-sm font-bold">{title}</h3>}
          <p className="text-xs text-rose-700 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          id="btn-retry-options"
          type="button"
          onClick={onRetry}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};
