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

// GET /api/health
app.get("/api/health", async (req, res) => {
  try {
    const pythonRes = await fetch("http://127.0.0.1:8000/api/health");
    const pythonData = await pythonRes.json();
    return res.status(pythonRes.status).json(pythonData);
  } catch {
    return res.json({
      status: "ok",
      detail: "HDB Price Estimator backend active.",
    });
  }
});

// GET /api/options
app.get("/api/options", (req, res) => {
  res.json(HDB_OPTIONS);
});

// POST /api/predict
app.post("/api/predict", async (req, res) => {
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
        detail: "Missing required dropdown fields: town, flat_type, flat_model, and storey_range are all required.",
      });
    }

    const area = parseFloat(floor_area_sqm);
    const leaseYear = parseInt(lease_commence_date, 10);

    if (isNaN(area) || area <= 20 || area >= 300) {
      return res.status(422).json({
        detail: "Invalid floor_area_sqm: Please provide an area between 20 and 300 sqm.",
      });
    }

    if (isNaN(leaseYear) || leaseYear < 1960 || leaseYear > 2030) {
      return res.status(422).json({
        detail: "Invalid lease_commence_date: Please enter a valid 4-digit year between 1960 and 2030.",
      });
    }

    // Attempt to proxy to Python FastAPI server if running (e.g. uvicorn on port 8000)
    try {
      const pythonRes = await fetch("http://127.0.0.1:8000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          town,
          flat_type,
          flat_model,
          storey_range,
          floor_area_sqm: area,
          lease_commence_date: leaseYear,
        }),
      });
      const pythonData = await pythonRes.json();
      return res.status(pythonRes.status).json(pythonData);
    } catch {
      // If Python backend is not running or model bundle is not found, return 503 strictly (no fake calculations)
      return res.status(503).json({
        detail: "No model on the server. Put hdb_price_bundle.joblib in model/ (Day-1 notebook, section 6.3) and redeploy.",
      });
    }
  } catch (err: any) {
    console.error("Prediction error:", err);
    return res.status(500).json({
      detail: "Internal server error occurred while processing the model prediction.",
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
