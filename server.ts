import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

const HDB_OPTIONS = {
  town: [
    "ANG MO KIO",
    "BEDOK",
    "BISHAN",
    "BUKIT BATOK",
    "BUKIT MERAH",
    "BUKIT PANJANG",
    "BUKIT TIMAH",
    "CENTRAL AREA",
    "CHOA CHU KANG",
    "CLEMENTI",
    "GEYLANG",
    "HOUGANG",
    "JURONG EAST",
    "JURONG WEST",
    "KALLANG/WHAMPOA",
    "MARINE PARADE",
    "PASIR RIS",
    "PUNGGOL",
    "QUEENSTOWN",
    "SEMBAWANG",
    "SENGKANG",
    "SERANGOON",
    "TAMPINES",
    "TOA PAYOH",
    "WOODLANDS",
    "YISHUN",
  ],
  flat_type: [
    "1 ROOM",
    "2 ROOM",
    "3 ROOM",
    "4 ROOM",
    "5 ROOM",
    "EXECUTIVE",
    "MULTI-GENERATION",
  ],
  flat_model: [
    "Model A",
    "Improved",
    "New Generation",
    "Premium Apartment",
    "Simplified",
    "Standard",
    "Maisonette",
    "Apartment",
    "Model A2",
    "DBSS",
    "Terrace",
    "Adjoined flat",
    "Multi Generation",
    "Premium Maisonette",
    "Type S1",
    "Type S2",
  ],
  storey_range: [
    "01 TO 03",
    "04 TO 06",
    "07 TO 09",
    "10 TO 12",
    "13 TO 15",
    "16 TO 18",
    "19 TO 21",
    "22 TO 24",
    "25 TO 27",
    "28 TO 30",
    "31 TO 33",
    "34 TO 36",
    "37 TO 39",
    "40 TO 42",
    "43 TO 45",
    "46 TO 48",
    "49 TO 51",
  ],
};

// Town Base Price per Sqm benchmarking (SGD / m2)
const TOWN_BASE_PSM: Record<string, number> = {
  "CENTRAL AREA": 10200,
  "BUKIT TIMAH": 9400,
  "QUEENSTOWN": 9100,
  "BUKIT MERAH": 8800,
  "BISHAN": 8400,
  "MARINE PARADE": 8200,
  "KALLANG/WHAMPOA": 7900,
  "TOA PAYOH": 7800,
  "CLEMENTI": 7500,
  "GEYLANG": 7200,
  "SERANGOON": 6900,
  "ANG MO KIO": 6700,
  "BEDOK": 6500,
  "TAMPINES": 6400,
  "PASIR RIS": 6100,
  "PUNGGOL": 6200,
  "SENGKANG": 6100,
  "HOUGANG": 6000,
  "BUKIT BATOK": 5800,
  "BUKIT PANJANG": 5600,
  "JURONG EAST": 5700,
  "JURONG WEST": 5200,
  "YISHUN": 5400,
  "SEMBAWANG": 5100,
  "CHOA CHU KANG": 5200,
  "WOODLANDS": 5100,
};

const MODEL_MULTIPLIER: Record<string, number> = {
  "DBSS": 1.22,
  "Terrace": 1.35,
  "Premium Maisonette": 1.24,
  "Maisonette": 1.18,
  "Type S1": 1.25,
  "Type S2": 1.28,
  "Premium Apartment": 1.08,
  "Adjoined flat": 1.12,
  "Multi Generation": 1.10,
  "Model A": 1.02,
  "Improved": 1.00,
  "Apartment": 1.01,
  "Model A2": 0.98,
  "New Generation": 0.96,
  "Simplified": 0.93,
  "Standard": 0.90,
};

// Storey tier multipliers
const STOREY_MULTIPLIER: Record<string, number> = {
  "01 TO 03": 0.92,
  "04 TO 06": 0.96,
  "07 TO 09": 1.00,
  "10 TO 12": 1.03,
  "13 TO 15": 1.06,
  "16 TO 18": 1.09,
  "19 TO 21": 1.12,
  "22 TO 24": 1.15,
  "25 TO 27": 1.18,
  "28 TO 30": 1.21,
  "31 TO 33": 1.24,
  "34 TO 36": 1.27,
  "37 TO 39": 1.30,
  "40 TO 42": 1.33,
  "43 TO 45": 1.36,
  "46 TO 48": 1.39,
  "49 TO 51": 1.42,
};

// Flat type area normalization & floor factors
const FLAT_TYPE_FACTOR: Record<string, number> = {
  "1 ROOM": 0.92,
  "2 ROOM": 0.95,
  "3 ROOM": 0.98,
  "4 ROOM": 1.00,
  "5 ROOM": 0.97, // slightly lower PSM on average for larger floorplate, standard real estate curve
  "EXECUTIVE": 0.95,
  "MULTI-GENERATION": 0.96,
};

// GET /api/options
app.get("/api/options", (req, res) => {
  res.json(HDB_OPTIONS);
});

// POST /api/predict
app.post("/api/predict", (req, res) => {
  try {
    const {
      town,
      flat_type,
      flat_model,
      storey_range,
      floor_area_sqm,
      lease_commence_date,
    } = req.body;

    // Validation
    if (!town || !flat_type || !flat_model || !storey_range) {
      return res.status(400).json({
        error: "Missing required dropdown fields: town, flat_type, flat_model, and storey_range are all required.",
      });
    }

    const area = parseFloat(floor_area_sqm);
    const leaseYear = parseInt(lease_commence_date, 10);

    if (isNaN(area) || area <= 0) {
      return res.status(400).json({
        error: "Invalid floor_area_sqm: Please provide a valid positive number in square meters (sqm).",
      });
    }

    const currentYear = new Date().getFullYear();
    if (isNaN(leaseYear) || leaseYear < 1960 || leaseYear > currentYear + 5) {
      return res.status(400).json({
        error: `Invalid lease_commence_date: Please enter a valid 4-digit year (1960 - ${currentYear + 5}).`,
      });
    }

    // Remaining Lease calculation (HDB leases are 99 years)
    const flatAge = Math.max(0, currentYear - leaseYear);
    const remainingLease = Math.max(1, 99 - flatAge);

    // Lease decay discount curve (Bala's Table approximation)
    // 99 yrs = 1.0, 70 yrs = ~0.89, 50 yrs = ~0.74, 30 yrs = ~0.55
    const leaseRatio = remainingLease / 99;
    const leaseFactor = Math.pow(leaseRatio, 0.45);

    const basePSM = TOWN_BASE_PSM[town.toUpperCase()] || 6000;
    const modelFactor = MODEL_MULTIPLIER[flat_model] || 1.0;
    const storeyFactor = STOREY_MULTIPLIER[storey_range] || 1.0;
    const typeFactor = FLAT_TYPE_FACTOR[flat_type] || 1.0;

    // Adjusted PSM
    const adjustedPSM = basePSM * modelFactor * storeyFactor * typeFactor * leaseFactor;

    // Raw calculated estimate
    const rawEstimate = adjustedPSM * area;

    // Rounding to nearest $1,000
    const estimate = Math.round(rawEstimate / 1000) * 1000;
    const range_low = Math.round((estimate * 0.94) / 1000) * 1000;
    const range_high = Math.round((estimate * 1.06) / 1000) * 1000;

    const formattedEstimate = `$${estimate.toLocaleString()}`;
    const formattedLow = `$${range_low.toLocaleString()}`;
    const formattedHigh = `$${range_high.toLocaleString()}`;

    const sentence = `The estimated resale price for a ${area} sqm ${flat_type} (${flat_model}) flat in ${town} located on storeys ${storey_range} (Lease commenced ${leaseYear}, ~${remainingLease} years remaining) is approximately ${formattedEstimate}, with an expected valuation range between ${formattedLow} and ${formattedHigh}.`;

    return res.json({
      estimate,
      range_low,
      range_high,
      sentence,
      formatted_estimate: formattedEstimate,
      formatted_range: `${formattedLow} – ${formattedHigh}`,
      details: {
        town,
        flat_type,
        flat_model,
        storey_range,
        floor_area_sqm: area,
        lease_commence_date: leaseYear,
        remaining_lease: remainingLease,
        approx_psm: Math.round(adjustedPSM),
        approx_psf: Math.round(adjustedPSM / 10.7639),
      },
    });
  } catch (err: any) {
    console.error("Prediction error:", err);
    return res.status(500).json({
      error: "Internal server error occurred while calculating the estimate. Please try again.",
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HDB Estimator server running on http://localhost:${PORT}`);
  });
}

startServer();
