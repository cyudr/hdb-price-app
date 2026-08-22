import React from "react";
import { RefreshCw } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading HDB parameters from /api/options...",
}) => {
  return (
    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center gap-3">
      <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
      <p className="text-sm font-medium text-slate-700">{message}</p>
    </div>
  );
};
