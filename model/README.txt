Put the artefact here:

  model/hdb_price_bundle.joblib

It is produced by the last cell of the Day-1 notebook (section 6.3):

  joblib.dump(bundle, APP_DIR / "model" / "hdb_price_bundle.joblib", compress = 3)

This starter ships without it—the model is yours to train.

Commit this file. It is a few megabytes, well inside Vercel's limit, and the
deployment cannot work without it. Never commit .venv/ or node_modules/.
