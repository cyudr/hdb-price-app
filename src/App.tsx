/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { HdbOptions, PredictionFormData, PredictionResult } from "./types.ts";
import { INITIAL_FORM, PRESETS, PresetItem, DEFAULT_HDB_OPTIONS } from "./constants/presets.ts";
import { Header } from "./components/Header.tsx";
import { Presets } from "./components/Presets.tsx";
import { LoadingState } from "./components/LoadingState.tsx";
import { ErrorAlert } from "./components/ErrorAlert.tsx";
import { EstimatorForm } from "./components/EstimatorForm.tsx";
import { ResultCard } from "./components/ResultCard.tsx";
import { EmptyResult } from "./components/EmptyResult.tsx";
import { InfoCard } from "./components/InfoCard.tsx";
import { Footer } from "./components/Footer.tsx";

export default function App() {
  const [options, setOptions] = useState<HdbOptions | null>(null);
  const [optionsLoading, setOptionsLoading] = useState<boolean>(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PredictionFormData>(INITIAL_FORM);
  const [predicting, setPredicting] = useState<boolean>(false);
  const [predictError, setPredictError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);

  // Fetch /api/options on load
  const fetchOptions = async () => {
    setOptionsLoading(true);
    setOptionsError(null);
    try {
      const res = await fetch("/api/options");
      let data: HdbOptions = DEFAULT_HDB_OPTIONS;
      if (res.ok) {
        const jsonData = await res.json();
        if (jsonData && jsonData.town && jsonData.town.length > 0) {
          data = jsonData;
        }
      } else {
        console.warn(`Could not load dynamic options (Status: ${res.status}). Using fallback options.`);
      }
      setOptions(data);

      // Pre-select first options or defaults if form is empty
      setFormData((prev) => ({
        town: prev.town || data.town?.[0] || "",
        flat_type: prev.flat_type || data.flat_type?.[3] || data.flat_type?.[0] || "",
        flat_model: prev.flat_model || data.flat_model?.[0] || "",
        storey_range: prev.storey_range || data.storey_range?.[2] || data.storey_range?.[0] || "",
        floor_area_sqm: prev.floor_area_sqm || "92",
        lease_commence_date: prev.lease_commence_date || "2000",
      }));
    } catch (err: any) {
      console.error("Error fetching options, using fallback:", err);
      setOptions(DEFAULT_HDB_OPTIONS);
      setFormData((prev) => ({
        town: prev.town || DEFAULT_HDB_OPTIONS.town[0],
        flat_type: prev.flat_type || DEFAULT_HDB_OPTIONS.flat_type[3],
        flat_model: prev.flat_model || DEFAULT_HDB_OPTIONS.flat_model[0],
        storey_range: prev.storey_range || DEFAULT_HDB_OPTIONS.storey_range[2],
        floor_area_sqm: prev.floor_area_sqm || "92",
        lease_commence_date: prev.lease_commence_date || "2000",
      }));
    } finally {
      setOptionsLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPreset = (presetData: PresetItem["data"]) => {
    setFormData({
      town: presetData.town,
      flat_type: presetData.flat_type,
      flat_model: presetData.flat_model,
      storey_range: presetData.storey_range,
      floor_area_sqm: presetData.floor_area_sqm.toString(),
      lease_commence_date: presetData.lease_commence_date.toString(),
    });
    setPredictError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredictError(null);

    // Validate inputs
    const area = parseFloat(formData.floor_area_sqm as string);
    const leaseYear = parseInt(formData.lease_commence_date as string, 10);
    const currentYear = new Date().getFullYear();

    if (!formData.town || !formData.flat_type || !formData.flat_model || !formData.storey_range) {
      setPredictError("Please select all required dropdown options.");
      return;
    }

    if (isNaN(area) || area <= 0) {
      setPredictError("Please enter a valid floor area greater than 0 sqm.");
      return;
    }

    if (isNaN(leaseYear) || leaseYear < 1960 || leaseYear > currentYear + 5) {
      setPredictError(`Please enter a valid lease commencement year between 1960 and ${currentYear + 5}.`);
      return;
    }

    setPredicting(true);

    try {
      const payload = {
        town: formData.town,
        flat_type: formData.flat_type,
        flat_model: formData.flat_model,
        storey_range: formData.storey_range,
        floor_area_sqm: area,
        lease_commence_date: leaseYear,
      };

      const res = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        const errorMsg =
          responseData.detail ||
          responseData.error ||
          responseData.message ||
          `Failed to calculate prediction (Status: ${res.status}).`;
        throw new Error(errorMsg);
      }

      setResult(responseData);

      // Smooth scroll down to result on mobile
      setTimeout(() => {
        const resultEl = document.getElementById("prediction-result-card");
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
    } catch (err: any) {
      console.error("Prediction error:", err);
      setPredictError(err.message || "An unexpected error occurred while predicting price.");
    } finally {
      setPredicting(false);
    }
  };

  const handleReset = () => {
    if (options) {
      setFormData({
        town: options.town?.[0] || "",
        flat_type: options.flat_type?.[0] || "",
        flat_model: options.flat_model?.[0] || "",
        storey_range: options.storey_range?.[0] || "",
        floor_area_sqm: "",
        lease_commence_date: "",
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setResult(null);
    setPredictError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* App Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Intro banner & Presets */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Estimate Your Flat&apos;s Resale Value
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 max-w-3xl">
            Select the town, flat type, model, storey tier, and floor attributes to generate an instant estimate and price range based on current Singapore market benchmarks.
          </p>

          <Presets onSelectPreset={handleApplyPreset} />
        </div>

        {/* Options Loading State */}
        {optionsLoading && <LoadingState />}

        {/* Options Error State */}
        {optionsError && !optionsLoading && (
          <ErrorAlert
            title="Failed to load configuration options"
            message={optionsError}
            onRetry={fetchOptions}
          />
        )}

        {/* Form and Result Grid */}
        {!optionsLoading && options && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Input Form Column */}
            <div className="lg:col-span-7 space-y-4">
              {predictError && (
                <ErrorAlert message={predictError} variant="inline" />
              )}

              <EstimatorForm
                options={options}
                formData={formData}
                predicting={predicting}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onReset={handleReset}
              />
            </div>

            {/* Results Display Column */}
            <div className="lg:col-span-5 space-y-6">
              {result ? <ResultCard result={result} /> : <EmptyResult />}
              <InfoCard />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
