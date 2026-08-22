import React, { useState } from "react";
import { CheckCircle2, Copy, Check, Info } from "lucide-react";
import { PredictionResult } from "../types.ts";

interface ResultCardProps {
  result: PredictionResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopySentence = () => {
    if (!result.sentence) return;
    navigator.clipboard.writeText(result.sentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="prediction-result-card"
      className="bg-white rounded-2xl border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/5 p-6 sm:p-7 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -z-0"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Estimated Valuation
          </span>
          <button
            id="btn-copy-result"
            type="button"
            onClick={handleCopySentence}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            title="Copy summary sentence"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Prominent Large Estimate Display */}
        <div className="mt-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Estimated Resale Price
          </span>
          <div
            id="text-estimate-large"
            className="text-4xl sm:text-5xl font-black text-emerald-700 tracking-tight mt-1"
          >
            ${result.estimate.toLocaleString()}
          </div>
        </div>

        {/* Prominent Large Valuation Range Display */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Expected Price Range (Low – High)
          </span>
          <div
            id="text-range-large"
            className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mt-1 flex items-baseline gap-2"
          >
            <span>${result.range_low.toLocaleString()}</span>
            <span className="text-slate-400 font-normal text-xl">—</span>
            <span>${result.range_high.toLocaleString()}</span>
          </div>
        </div>

        {/* Returned Sentence Display */}
        <div className="mt-5 p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p
              id="text-returned-sentence"
              className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal"
            >
              {result.sentence}
            </p>
          </div>
        </div>

        {/* Detailed Metadata Breakdown */}
        {result.details && (
          <div className="mt-5 grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-100 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Unit Price (PSM)
              </span>
              <span className="font-bold text-slate-800">
                ${result.details.approx_psm?.toLocaleString()}/sqm
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Unit Price (PSF)
              </span>
              <span className="font-bold text-slate-800">
                ${result.details.approx_psf?.toLocaleString()}/sqft
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Remaining Lease
              </span>
              <span className="font-bold text-slate-800">
                {result.details.remaining_lease} years
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Storey Tier
              </span>
              <span className="font-bold text-slate-800">
                Storeys {result.details.storey_range}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
