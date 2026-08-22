from fastapi import FastAPI
from pydantic import BaseModel
from pathlib import Path
import joblib
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
bundle = joblib.load(ROOT / "model" / "hdb_price_bundle.joblib")   # once per warm start
workflow = bundle["workflow"]
comparables = bundle["comparables"]
LATEST = bundle["latest_month"]
WINDOW_START = bundle["comparable_window_start"]

app = FastAPI()

class Payload(BaseModel):                  # exactly what the form can send
    town: str
    flat_type: str
    storey_range: str                      # e.g. "10 TO 12"
    floor_area_sqm: float
    lease_commence_date: int
    flat_model: str

def fmt_sgd(x):
    return f"S${round(x, -3):,.0f}"        # nearest thousand: an estimate, not a quote

def predict_price(p):                      # section 6.2 of the Day-1 notebook
    lo, hi = [int(s) for s in p["storey_range"].split(" TO ")]
    latest = pd.to_datetime(LATEST + "-01")
    row = pd.DataFrame([{
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
    estimate = float(workflow.predict(row)[0])
    low, high = estimate * bundle["ratio_q10"], estimate * bundle["ratio_q90"]
    comp = comparables.loc[
        lambda d: (d["town"] == p["town"]) & (d["flat_type"] == p["flat_type"])
    ]
    comp_dict = (
        {"n": int(comp["n"].iloc[0]), "median": float(comp["median"].iloc[0]),
         "p25": float(comp["p25"].iloc[0]), "p75": float(comp["p75"].iloc[0])}
        if len(comp)
        else None
    )
    sentence = (
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

@app.get("/api/options")
def options():
    return bundle["options"]               # dropdown lists, straight from Day 1

@app.get("/api/health")
def health():
    return {"ok": True, "as_of": LATEST, "trained_rows": bundle["trained_rows"]}

@app.post("/api/predict")
def predict(p: Payload):
    return predict_price(p.model_dump())
