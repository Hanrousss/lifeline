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

## Global same-day cohort estimate (2026-10-28)

`world-life-table-2023.json` retains 101 original rows (ages 0 through 100) from the official UN WPP 2024 complete period life table, world (`LocID=900`), 2023, both sexes (`SexID=3`). The exact official download URL and retrieval date are in that file. The table's `lx` radix is 100,000; these are numbers surviving to exact age x, not a population count. Build the checked-in compact browser data with `node tools/build-survival-data.mjs`. No third-party life table or guessed mortality rate is used.

The starting other-children count is round(sum of the game's 2023 birth weights / 365) - 1. This is an average hypothetical birth day, excluding the protagonist, not a count for a known date. At age x it is multiplied by lx/l0, linearly interpolating between integer ages for game months. Monthly interpolation, especially in infancy, is approximate and is disclosed in the UI.

This is a synthetic period cohort under constant 2023 world mortality. It is NOT the actual future survival of the 2023 birth cohort, NOT a forecast, NOT country-specific and NOT affected by game choices. Calendar-day birth seasonality, future mortality changes and individual death are not modeled. The indicator stays separate from game health. UN data: CC BY 3.0 IGO.
