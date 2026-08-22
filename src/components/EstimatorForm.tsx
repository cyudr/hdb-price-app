import React from "react";
import {
  Building2,
  Home,
  Layers,
  TrendingUp,
  Maximize2,
  Calendar,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { HdbOptions, PredictionFormData } from "../types.ts";

interface EstimatorFormProps {
  options: HdbOptions;
  formData: PredictionFormData;
  predicting: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export const EstimatorForm: React.FC<EstimatorFormProps> = ({
  options,
  formData,
  predicting,
  onChange,
  onSubmit,
  onReset,
}) => {
  const currentYear = new Date().getFullYear();
  const leaseYearNum = parseInt(formData.lease_commence_date as string, 10);
  const remainingYears = !isNaN(leaseYearNum)
    ? Math.max(0, 99 - (currentYear - leaseYearNum))
    : null;

  const floorAreaNum = parseFloat(formData.floor_area_sqm as string);
  const approxSqft = !isNaN(floorAreaNum)
    ? (floorAreaNum * 10.7639).toFixed(0)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            Property Parameters
          </h3>
        </div>
        <button
          id="btn-reset-form"
          type="button"
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Clear Form
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dropdown 1: Town */}
          <div className="space-y-1.5">
            <label
              htmlFor="select-town"
              className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Town / Location
            </label>
            <select
              id="select-town"
              name="town"
              value={formData.town}
              onChange={onChange}
              required
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium outline-hidden transition-all cursor-pointer"
            >
              <option value="" disabled>
                Select Town
              </option>
              {options.town.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: Flat Type */}
          <div className="space-y-1.5">
            <label
              htmlFor="select-flat-type"
              className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              Flat Type
            </label>
            <select
              id="select-flat-type"
              name="flat_type"
              value={formData.flat_type}
              onChange={onChange}
              required
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium outline-hidden transition-all cursor-pointer"
            >
              <option value="" disabled>
                Select Flat Type
              </option>
              {options.flat_type.map((ft) => (
                <option key={ft} value={ft}>
                  {ft}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dropdown 3: Flat Model */}
          <div className="space-y-1.5">
            <label
              htmlFor="select-flat-model"
              className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Flat Model
            </label>
            <select
              id="select-flat-model"
              name="flat_model"
              value={formData.flat_model}
              onChange={onChange}
              required
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium outline-hidden transition-all cursor-pointer"
            >
              <option value="" disabled>
                Select Flat Model
              </option>
              {options.flat_model.map((fm) => (
                <option key={fm} value={fm}>
                  {fm}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 4: Storey Range */}
          <div className="space-y-1.5">
            <label
              htmlFor="select-storey-range"
              className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              Storey Range
            </label>
            <select
              id="select-storey-range"
              name="storey_range"
              value={formData.storey_range}
              onChange={onChange}
              required
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium outline-hidden transition-all cursor-pointer"
            >
              <option value="" disabled>
                Select Storey Range
              </option>
              {options.storey_range.map((sr) => (
                <option key={sr} value={sr}>
                  Storeys {sr}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Numeric input 1: floor_area_sqm */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="input-floor-area"
                className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                Floor Area (sqm)
              </label>
              <span className="text-[11px] text-slate-400">
                {approxSqft ? `≈ ${approxSqft} sqft` : "e.g. 92"}
              </span>
            </div>
            <input
              type="number"
              id="input-floor-area"
              name="floor_area_sqm"
              value={formData.floor_area_sqm}
              onChange={onChange}
              placeholder="e.g. 92"
              min="20"
              max="350"
              step="0.5"
              required
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium outline-hidden transition-all"
            />
          </div>

          {/* Numeric input 2: lease_commence_date */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="input-lease-commence"
                className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Lease Commence Year
              </label>
              <span className="text-[11px] text-slate-400">
                {remainingYears !== null
                  ? `~${remainingYears} yrs left`
                  : "Year (e.g. 1995)"}
              </span>
            </div>
            <input
              type="number"
              id="input-lease-commence"
              name="lease_commence_date"
              value={formData.lease_commence_date}
              onChange={onChange}
              placeholder="e.g. 1995"
              min="1960"
              max={currentYear + 5}
              required
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-medium outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            id="btn-estimate-price"
            type="submit"
            disabled={predicting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-base"
          >
            {predicting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Estimating Resale Valuation...</span>
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5" />
                <span>Calculate Valuation Estimate</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
