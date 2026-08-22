import React from "react";
import { DollarSign } from "lucide-react";

export const EmptyResult: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center flex flex-col items-center justify-center min-h-[300px] text-slate-400">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <DollarSign className="w-7 h-7" />
      </div>
      <h4 className="font-bold text-slate-700 text-base">
        No Estimate Generated Yet
      </h4>
      <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
        Fill in the 4 dropdowns and 2 numeric parameters on the left, then click &ldquo;Calculate Valuation Estimate&rdquo;.
      </p>
    </div>
  );
};
