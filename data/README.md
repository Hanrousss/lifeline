# Birthplace distribution

The game samples one newborn's country/area from the **2023** live-birth counts of the United Nations, Department of Economic and Social Affairs, Population Division (2024), *World Population Prospects 2024*, with the January 2026 interim replacement for Togo. License: CC BY 3.0 IGO.

Official source: https://population.un.org/wpp/

Downloaded 2026-10-27:

- https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/WPP2024_Demographic_Indicators_Medium.csv.gz
- https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/WPP2024_CSV_files_update.zip
- https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/CSV_FILES/WPP2024_Demographic_Indicators_notes.csv

The first two original archives are ignored by Git because of size. Their SHA-256 hashes are in `births-2023-provenance.json`. To reproduce, download them to the paths named by `tools/extract-births.py`, then run `python tools/extract-births.py` and `node tools/build-birth-data.mjs` from the repository root. The filtered country rows are tracked for review.

Rules: `Time == 2023`, `LocTypeID == 4` (Country/Area), `Births * 1000` because the original unit is thousands, rounded to the nearest integer birth. Replace Togo by matching LocID. There are 237 positive-weight countries/areas. All aggregates (world, region, income groups) are excluded. Normalize by the sum of the updated country/area weights (132,088,957), rather than the older unmodified World row. The aggregate mismatch is due to the Togo replacement plus source rounding.

Probability = country/area births / sum of included country/area births. This samples **births**, not existing population or equally likely flags. Cities are absent because this dataset does not support that resolution. Country labels use Node's Russian `Intl.DisplayNames`; boundaries and labels follow the statistical source, without an independent territorial classification.

The source supports only the birthplace draw in this build. Fictional names, occupations, family wealth, warmth, safety, personality, health effects, and life outcomes are not empirically calibrated to those countries. No forecast of an individual's life is claimed. Existing saves retain their original birthplace and are explicitly labelled as legacy demonstration draws.
