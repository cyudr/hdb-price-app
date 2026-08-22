import React from "react";
import { Sparkles } from "lucide-react";
import { PRESETS, PresetItem } from "../constants/presets.ts";

interface PresetsProps {
  onSelectPreset: (presetData: PresetItem["data"]) => void;
}

export const Presets: React.FC<PresetsProps> = ({ onSelectPreset }) => {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        Quick examples:
      </span>
      {PRESETS.map((preset, idx) => (
        <button
          key={idx}
          id={`btn-preset-${idx}`}
          type="button"
          onClick={() => onSelectPreset(preset.data)}
          className="text-xs px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700 text-slate-700 font-medium transition-colors shadow-2xs cursor-pointer"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
};
