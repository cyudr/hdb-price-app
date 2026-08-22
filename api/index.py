# api/index.py · the whole server for the HDB Resale Price Estimator
#
# Loads the Day-1 bundle ONCE per warm start, then answers:
#   GET  /api/health   -> {"status": "ok", ...}      the door you knock on first
#   GET  /api/options  -> the dropdown lists for the form
#   POST /api/predict  -> estimate, range, comparables, and the sentence
#
# Run locally:  uvicorn api.index:app --reload --port 8000
from pathlib import Path

import joblib
import pandas as pd
from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
BUNDLE_PATH = ROOT / "model" / "hdb_price_bundle.joblib"

# Load ONCE per warm start. If the artefact is missing, do not crash at import:
# a server that dies on startup gives the caller a blank 500 and no clue. Start
# anyway, and let /api/health say exactly what is wrong.
bundle = joblib.load(BUNDLE_PATH) if BUNDLE_PATH.exists() else None

DEFAULT_OPTIONS = {
    "town": [
        "ANG MO KIO", "BEDOK", "BISHAN", "BUKIT BATOK", "BUKIT MERAH",
        "BUKIT PANJANG", "BUKIT TIMAH", "CENTRAL AREA", "CHOA CHU KANG",
        "CLEMENTI", "GEYLANG", "HOUGANG", "JURONG EAST", "JURONG WEST",
        "KALLANG/WHAMPOA", "MARINE PARADE", "PASIR RIS", "PUNGGOL",
        "QUEENSTOWN", "SEMBAWANG", "SENGKANG", "SERANGOON", "TAMPINES",
        "TOA PAYOH", "WOODLANDS", "YISHUN"
    ],
    "flat_type": [
        "1 ROOM", "2 ROOM", "3 ROOM", "4 ROOM", "5 ROOM", "EXECUTIVE", "MULTI-GENERATION"
    ],
    "flat_model": [
        "Model A", "Improved", "New Generation", "Premium Apartment",
        "Simplified", "Standard", "Maisonette", "Apartment", "Model A2",
        "DBSS", "Terrace", "Adjoined flat", "Multi Generation",
        "Premium Maisonette", "Type S1", "Type S2"
    ],
    "storey_range": [
        "01 TO 03", "04 TO 06", "07 TO 09", "10 TO 12", "13 TO 15",
        "16 TO 18", "19 TO 21", "22 TO 24", "25 TO 27", "28 TO 30",
        "31 TO 33", "34 TO 36", "37 TO 39", "40 TO 42", "43 TO 45",
        "46 TO 48", "49 TO 51"
    ]
}

workflow = bundle["workflow"] if bundle else None
comparables = bundle["comparables"] if bundle else None
OPTIONS = (bundle.get("options") if bundle and "options" in bundle else None) or DEFAULT_OPTIONS
LATEST = bundle["latest_month"] if bundle else "2024-12"
WINDOW_START = bundle["comparable_window_start"] if bundle else "2023-01"

app = FastAPI(title = "HDB Resale Price Estimator", version = "1.0")
router = APIRouter()


class Payload(BaseModel):                  # exactly what the form can send
    town: str
    flat_type: str
    storey_range: str                      # e.g. "10 TO 12"
    floor_area_sqm: float = Field(gt = 20, lt = 300)
    lease_commence_date: int = Field(ge = 1960, le = 2030)
    flat_model: str


def fmt_sgd(x):
    return f"S${round(x, -3):,.0f}"        # nearest thousand: an estimate, not a quote


def require_model():
    if bundle is None:
        raise HTTPException(
            status_code = 503,
            detail = "No model on the server. Put hdb_price_bundle.joblib in model/ (Day-1 notebook, section 6.3) and redeploy.",
        )


def validate(p):
    """Refuse a town or flat type the model never saw, with a sentence the caller can act on."""
    for field in ["town", "flat_type", "storey_range", "flat_model"]:
        if p[field] not in OPTIONS[field]:
            raise HTTPException(status_code = 422, detail = f"Unknown {field}: {p[field]!r}. Use GET /api/options.")


def predict_price(p):                      # section 6.2 of the Day-1 notebook
    lo, hi = [int(s) for s in p["storey_range"].split(" TO ")]
    latest = pd.to_datetime(LATEST + "-01")
    row =\
    (
        pd.DataFrame([{
            "floor_area_sqm": float(p["floor_area_sqm"]),
            "storey_mid": (lo + hi) / 2,
            "remaining_lease_years": 99 - (latest.year - int(p["lease_commence_date"])),   # HDB leases run 99 years
            "flat_age": latest.year - int(p["lease_commence_date"]),
            "txn_year": latest.year,
            "txn_month": latest.month,
            "town": p["town"],
            "flat_type": p["flat_type"],
            "flat_model": p["flat_model"],
        }])
    )
    estimate = float(workflow.predict(row)[0])
    low, high = estimate * bundle["ratio_q10"], estimate * bundle["ratio_q90"]
    comp =\
    (
        comparables
        .loc[lambda d: (d["town"] == p["town"]) & (d["flat_type"] == p["flat_type"])]
    )
    comp_dict =\
    (
        {"n": int(comp["n"].iloc[0]), "median": float(comp["median"].iloc[0]),
         "p25": float(comp["p25"].iloc[0]), "p75": float(comp["p75"].iloc[0])}
        if len(comp)
        else None
    )
    sentence =\
    (
        f"Estimated resale price: {fmt_sgd(estimate)} (typical range {fmt_sgd(low)}–{fmt_sgd(high)}). "
        + (f"Since {WINDOW_START}, {comp_dict['n']:,} {p['flat_type'].title()} flats sold in {p['town'].title()} "
           f"at a median of {fmt_sgd(comp_dict['median'])} (middle half {fmt_sgd(comp_dict['p25'])}–{fmt_sgd(comp_dict['p75'])})."
           if comp_dict else f"No {p['flat_type'].title()} transactions in {p['town'].title()} since {WINDOW_START}.")
    )
    return {
        "estimate": round(estimate, -3),
        "range_low": round(low, -3),
        "range_high": round(high, -3),
        "as_of": LATEST,
        "comparables": comp_dict,
        "sentence": sentence,
    }


@router.get("/health")
def health():
    if bundle is None:                     # the server is up, but it cannot do real work yet
        return {"status": "no model", "detail": f"expected {BUNDLE_PATH.name} in model/"}
    return {
        "status": "ok",                    # the advisory deck's status chip tests this exact field
        "as_of": LATEST,
        "trained_rows": bundle["trained_rows"],
        "versions": bundle["versions"],
    }


@router.get("/options")
def options():
    return OPTIONS                         # dropdown lists (from bundle or default benchmark)


@router.post("/predict")
def predict(p: Payload):
    require_model()
    payload = p.model_dump()
    validate(payload)
    return predict_price(payload)


# Belt and braces: the same three routes answer whether Vercel hands this function
# the path WITH the /api prefix (/api/health) or WITHOUT it (/health). One file,
# both routings, nothing to change when you move between local and deployed.
app.include_router(router, prefix = "/api")
app.include_router(router)
