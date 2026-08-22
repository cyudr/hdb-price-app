import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4">
        HDB Resale Price Estimator • Built with React &amp; Express • Valuation benchmarks for informational purposes
      </div>
    </footer>
  );
};
