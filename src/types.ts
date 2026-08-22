export interface HdbOptions {
  town: string[];
  flat_type: string[];
  flat_model: string[];
  storey_range: string[];
}

export interface PredictionFormData {
  town: string;
  flat_type: string;
  flat_model: string;
  storey_range: string;
  floor_area_sqm: string | number;
  lease_commence_date: string | number;
}

export interface PredictionResult {
  estimate: number;
  range_low: number;
  range_high: number;
  sentence: string;
  as_of?: string;
  comparables?: {
    n: number;
    median: number;
    p25: number;
    p75: number;
  } | null;
  formatted_estimate?: string;
  formatted_range?: string;
  details?: {
    town: string;
    flat_type: string;
    flat_model: string;
    storey_range: string;
    floor_area_sqm: number;
    lease_commence_date: number;
    remaining_lease: number;
    approx_psm: number;
    approx_psf: number;
  };
}
