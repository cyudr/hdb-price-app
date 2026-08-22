import React from "react";
import { TrendingUp } from "lucide-react";

export const InfoCard: React.FC = () => {
  return (
    <div className="bg-slate-100/70 rounded-2xl p-5 border border-slate-200/60 text-xs text-slate-600 space-y-2">
      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
        <TrendingUp className="w-4 h-4 text-emerald-600" />
        How is this estimate calculated?
      </div>
      <p className="leading-relaxed">
        The model evaluates past HDB resale transaction registries, applying adjustments for location premium (Town), floor elevation tiers, flat model architectural features, and remaining lease decay curve.
      </p>
    </div>
  );
};
