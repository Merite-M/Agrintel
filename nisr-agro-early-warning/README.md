# Rwanda Agro-Climatic Intelligence and Food Security Early-Warning Platform

**NISR Big Data Hackathon 2026 submission**

A bilingual (English and Kinyarwanda) decision-support platform that helps government analysts, farmers, extension workers and traders see market conditions and food-security signals earlier. Every number shows its source, date and uncertainty.

**Live app:** `[add Vercel URL]`
**Demo video (3 minutes):** `demo/demo.webm` `[add file or link]`
**Team:** `[name and university of member 1]`, `[name and university of member 2]`

---

## 1. What data the app uses

| Dataset | Owner | Status | Where it lives in this repository |
|---|---|---|---|
| **Monthly retail prices, Irish potatoes and tomatoes, by market** | World Food Programme (WFP), published on HDX. Underlying sources: FPMA, Face2Face, MINAGRI, RATIN via FAO GIEWS, WFP RWA Market Database, WFP mVAM | **Real data.** Cleaned by `pipeline/prepare_wfp_prices.py`. Coverage: Irish potatoes 2008 to July 2026; tomatoes 2012 to December 2015 | `data/clean/wfp_prices_irish_potato_tomato_rwa.csv` |
| **District, province and commodity reference lists** | Project team | Reference data | `data/reference/*.csv` |
| **Metric dictionary** (units and geographic level) | Project team | Reference data | `data/reference/metrics.csv` |
| **E-Soko farm-gate prices (daily reports via TangaBid, 2025 to October 2026)** | E-Soko Rwanda, with written permission. Collected from E-Soko reports and distributed through TangaBid | **Real data.** 13 food-security crops, 28 districts, monthly district averages. Cleaned by `pipeline/prepare_tangabid_prices.py` | `data/clean/tangabid_farmgate_monthly_district.csv` |
| **Labelled sample data** for Irish potatoes and tomatoes (one demonstration market in Gasabo) | Project team | **Sample. Not official.** Used only where no real data exists for that crop. Shown with a sample label on every page | `data/sample/market_prices_sample.csv` |
| **NISR Agricultural Household Survey 2024** | NISR | Microdata received under the NISR access terms. Not committed to this repository (contains household identifiers). Aggregated results planned | Not in repository |
| **MINAGRI Annual Report FY 2024/25** | MINAGRI | Official national production and area for Irish potatoes by season. Used as benchmark | Cited in the Sources and methods page |
| **Meteo Rwanda rainfall and temperature** | Meteo Rwanda | **Not connected yet** | None |
| **E-Soko official price feed** | E-Soko Rwanda | **Not connected.** The farm-gate data above comes through TangaBid with permission. The official feed is still to be requested | None |

### Attribution (required by the WFP licence)

> Source: World Food Programme (WFP) via the Humanitarian Data Exchange (HDX), "Rwanda – Food Prices". Underlying data from FPMA, Face2Face, MINAGRI, RATIN via FAO GIEWS, WFP RWA Market Database and WFP mVAM. Licensed under CC BY-IGO 3.0 (https://creativecommons.org/licenses/by/3.0/igo/). Changes: selected Irish potato and tomato prices, reformatted to the platform schema, and flagged refugee camp markets.

## 2. How the WFP price data was prepared

The raw file is not stored in this repository, because it is a large third-party download. To reproduce the cleaned file, download it from the HDX link in `data/raw/README.txt` and run the script below. The script applies these rules, in order:

1. Keep only **Irish potatoes** and **tomatoes**.
2. Match WFP's district name (`admin2`) to the 30 district codes in `data/reference/districts.csv`. Rows marked "Administrative unit not available" cannot be placed in a district, so they are dropped and counted.
3. Keep **one price per market per month**. WFP dates are all the 15th of the month, so each row becomes a calendar month.
4. **Flag refugee camp markets** (for example Kiziba (Camp), Mahama (Camp), Nyabiheke (Camp)). They are kept but marked with `is_camp = True`, so they can be filtered out with one condition.
5. Reject missing or non-positive prices.
6. Check for duplicate market-month-commodity rows.

**Result of the last run:**

| Step | Count |
|---|---|
| Raw rows read | 153,204 |
| Irish potato and tomato rows | 8,323 |
| Dropped: district not in our list | 132 |
| Dropped: missing or non-positive price | 0 |
| Duplicates | 0 |
| **Rows written** | **8,191** |
| of which refugee camp markets | 514 |

Coverage after cleaning:

- **Irish potatoes:** 6,099 rows, January 2008 to July 2026, across 28 districts. Since 2024, prices come from only six districts: Gatsibo, Gisagara, Karongi, Kirehe, Nyamagabe and Nyarugenge.
- **Tomatoes:** 2,092 rows, January 2012 to December 2015, across 28 districts. There are no tomato prices after 2015.

### Loading into the database

`npm run db:load:wfp` loads the cleaned file into Neon:

- Registers **WFP, via HDX** as its own source, with status **verified**, the CC BY-IGO licence, and the coverage dates.
- Validates the file against the district, commodity and metric reference lists, and stores each check's result.
- Stores every row as **observed** data, not sample.
- **Excludes refugee camp markets** by default (514 rows). Add `-- --include-camps` to load them.
- Writes an audit entry, and skips the load if the same file was already loaded.

Run `npm run db:load:wfp -- --dry-run` first to see the validation results without writing anything.

### E-Soko farm-gate prices

`pipeline/prepare_tangabid_prices.py` turns the daily export into monthly district averages. Its rules:

1. Keep only products priced per **kilogram**. Eggs (per piece), milk (per litre) and other units are left out of this version.
2. Map product names to 13 crops. Flours, feeds, meat, fish and fresh vegetables that share a crop word are excluded by name. Example: "Soya-Bean" maps to soya, not beans.
3. Map each region to one of our 30 districts.
4. Remove exact repeats from repeated scrapes (9,485 rows).
5. For the same date and product at the same market with different prices, keep the latest scrape (53 rows).
6. Exclude daily prices outside one third to three times the crop's monthly median across districts (104 rows).
7. Average the remaining daily prices per crop, district and month. Publish a month only if it has at least 5 daily prices. 2,006 crop-district-months fall below this and are not published.

Result: 2,835 district-months across 13 crops and 28 districts, from January 2025 to October 2026. Varieties (for example Kinigi Grade 1 and Grade 2) are averaged together within a crop.

Loading: `npm run db:load:tangabid` registers the source as verified, with the written permission from E-Soko, and stores each row as **observed farm-gate** data. Use `-- --dry-run` first. The farm-gate price is the price producers receive, and the app labels it that way. It is not a selling recommendation.

Scope: the farm-gate series is stored, but the public pages still show only the WFP retail series. Showing the farm-gate series needs a further change, to the market page and to the district signals, which is the next step.

### How real and sample data are kept apart

Sample rows are never mixed with real data. For any crop that has observed rows, the market page, the district signals, the forecast and the district evidence all ignore that crop's sample rows. Sample data is used only for crops and districts with no real data. Re-run the forecast and the district signals after loading, so the public figures reflect the real data.

## 3. What the app communicates

- **Market prices:** monthly average prices for each crop, with a plain-language trend (rising, stable, easing, or insufficient data), observed history, and a dashed forecast with a shaded range when a validated forecast exists.
- **National outlook:** district market-price signals (low, moderate, high, or unavailable), with the rule behind each one, the data used, and its source and date.
- **Farmer and extension advice:** conditions for a chosen district and crop, the national price outlook, general guidance marked for expert review, and an SMS preview in English and Kinyarwanda.
- **Retailer supply view:** a district comparison of price evidence. Supply and sourcing stay marked unavailable until production data is connected.
- **Alerts and simulator:** a clearly labelled simulated data update that shows each step. Simulated alerts cannot be published, and nothing is sent to any phone.
- **Sources and methods:** the source register, import history with validation results and checksums, real backtest accuracy, metric units, and limitations.

Every page shows a **data status banner** with the number of verified and sample sources.

## 4. How users interact with it

Choose a language at the top right (English or Ikinyarwanda), then use the section bar:

1. **Overview:** the data status and entry points.
2. **Market prices:** choose a crop, read the trend and chart, and open the table for exact values.
3. **National outlook:** choose a crop, read the district table, and select **View evidence** to see what drives a signal, its source and how recent it is.
4. **Farmer advice:** choose a district and a crop or animal, then select **Show advisory**. Compare the English and Kinyarwanda SMS previews.
5. **Retailer supply:** choose a crop and compare districts on price evidence.
6. **Alerts:** select **Simulate data update** and read each step. Nothing public changes.
7. **Sources and methods:** check where each number comes from and read the limitations before relying on any figure.

Core flows work without JavaScript. Forms use plain GET requests.

## 5. Data links

- WFP Rwanda food prices (raw, licence CC BY-IGO): https://data.humdata.org/dataset/a4a84c1c-81d1-491b-9fbe-1955ae736508
- Cleaned WFP prices: `data/clean/wfp_prices_irish_potato_tomato_rwa.csv` (included)
- Sample price data: `data/sample/market_prices_sample.csv` (included)
- Reference lists: `data/reference/` (included)
- MINAGRI Annual Report FY 2024/25: cited in the Sources and methods page, with table numbers
- NISR Agricultural Household Survey 2024 microdata: https://microdata.statistics.gov.rw/index.php/catalog (access granted under the NISR terms; not redistributed here)

---

## Technical overview

| Layer | Technology |
|---|---|
| Web app | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS v4, custom agriculture palette and fonts (Fraunces, Source Sans 3) |
| Charts | Recharts |
| Database | Neon Postgres, with Drizzle ORM and the Neon serverless driver |
| Data preparation and analysis | Python (pandas, numpy, psycopg) |
| Translations | Resource files in `src/messages/` (English, Kinyarwanda draft) |
| Hosting | Vercel (app), Neon (database) |

### Repository structure

```
├── src/
│   ├── app/[locale]/          Pages: welcome, market, national, farmer, retailer, alerts, methodology
│   ├── components/            Shared UI: data status banner, price chart, risk badge
│   ├── db/                    Schema, connection, reference seed, sample loader
│   ├── lib/                   Trend rule, risk rule, advisory helpers, data access, i18n
│   └── messages/              English and Kinyarwanda interface text
├── pipeline/
│   ├── prepare_wfp_prices.py  Cleans the WFP/HDX price file (this section 2)
│   ├── run_price_forecast.py  Forecast baseline, backtest and writes to Neon
│   ├── risk_signals.py        District market-price signals
│   ├── forecast_core.py       Forecast method and interval rules (no database code)
│   └── tests/                 Offline tests for the rules
├── data/
│   ├── clean/                 Cleaned WFP prices (committed)
│   ├── reference/             Districts, commodities, metrics
│   ├── sample/                Labelled sample price data
│   └── raw/                   Raw downloads (not committed; see data/raw/README.txt)
├── drizzle/                   Database migration
├── drizzle.config.ts          Migration configuration
└── next.config.ts             Routing configuration
```

## Setup (runs on any machine)

**Requirements:** Node.js 20 or later, Python 3.11 or later, and a Neon Postgres database.

```bash
# 1. Install JavaScript dependencies
npm install

# 2. Create your environment file and add your Neon pooled connection string
cp .env.example .env.local

# 3. Create the database tables and load reference data
npm run db:migrate
npm run db:seed

# 4. Prepare the WFP price data (download the raw file from the HDX link first)
pip install -r pipeline/requirements.txt
python pipeline/prepare_wfp_prices.py --input data/raw/wfp_food_prices_rwa.csv
npm run db:load:wfp

# Farm-gate prices from E-Soko (raw export kept locally, see data/raw/README.txt)
python pipeline/prepare_tangabid_prices.py --input data/raw/tangabid_market_prices.csv
npm run db:load:tangabid

# 5. Load the labelled sample data (used only where no real data exists)
npm run db:seed:sample

# 6. Build the forecasts and district signals
python pipeline/run_price_forecast.py
python pipeline/risk_signals.py

# 7. Start the app
npm run dev
```

Then open http://localhost:3000 and choose a language.

### Running the tests

```bash
python -m pytest pipeline/tests
```

### Dry runs

```bash
python pipeline/run_price_forecast.py --dry-run
python pipeline/risk_signals.py --dry-run
```

## Methods in brief

- **Price outlook (`drift_last6` v1.0.0):** a straight line fitted to the last 6 months of the national average price, extended up to 6 months. The range comes from the method's own errors on past data (a rolling backtest), at roughly 80% confidence. It is a transparent baseline, not a claim of predictive skill.
- **District market signal (`market_price_pressure` v1.0.0):** takes the last 9 calendar months of approved retail prices for a district and crop. It needs at least 6 observed months in that window, and the latest observation must be no more than 4 months old, so stale data never produces a signal. It compares the latest 3 observed months with the 3 observed months before: a rise of 10% or more is moderate, 20% or more is high, anything else is low. Gaps in reporting are allowed, because the rule works on observed months. The signal covers market prices only.
- **Data handling:** only approved imports reach public pages. Every observation records its source and import, and each import records its checksum and validation results.

## Limitations

- **Irish potato prices are real but recent coverage is narrow.** Since 2024 they come from six districts only. Other districts show as unavailable.
- **Tomato prices end in December 2015.** They are shown as historical reference only and are not used for current signals.
- **Refugee camp markets** are included but flagged. Their prices may not reflect general retail markets.
- **The national average can shift when the set of reporting markets changes.** A fixed set of markets is needed before the national series can be read as a true price trend.
- **Sample data is used for crops and districts with no real data.** It is labelled on every page, and it is excluded wherever real data exists.
- **Farm-gate prices are not retail prices.** They are what producers receive, so they are usually lower than market prices. The app labels them as farm-gate and does not recommend when to sell.
- **Many district-months are not published.** 2,006 crop-district-months had too few daily reports and are excluded, so some districts show gaps.
- **Farm-gate data is not yet shown on the public pages.** It is stored, and the next step is to add it to the market page and the district signals.
- **Survey production estimates are not yet published.** The microdata harvest totals are about 37 to 44% of the official MINAGRI figures for Irish potato production, so they are not used for public outputs until corrected.
- **Forecast ranges are wide** because the history is short.
- **Advisory guidance is general.** Fertilizer doses and veterinary treatment are out of scope and need expert review.
- **Kinyarwanda text is a draft** until a fluent speaker has reviewed it.
- **The simulator demonstrates the process.** It does not send messages.

## Alignment with national priorities

The platform supports the agricultural productivity, food security and climate-resilience goals in Rwanda's Second National Strategy for Transformation (NST2) and Vision 2050. It gives planners, traders and farmers earlier, clearer information about food prices and supply, with honest limits on what the data can show.

## Next steps

- Add a fixed-market national price series, so the national trend is not distorted by changes in the market set.
- Show the farm-gate series on the market page and the district signals (this needs a metric column on the signal table).
- Add the E-Soko egg and milk prices as their own metrics, using their units.
- Connect the official MINAGRI production benchmark and the NISR survey aggregates.
- Request rainfall and temperature data from Meteo Rwanda.
- Have a fluent Kinyarwanda speaker review all translated text.

---

## Declarations

- **Authorship:** We declare that this submission is our own work. All external sources, libraries and tools are listed below.
- **Intellectual property:** We understand that by entering the competition we assign the intellectual property rights in this submitted work to NISR, as set out in the competition rules.
- **Eligibility:** Team members are undergraduate or master's students, and at least one member is a Rwandan citizen. Student cards are provided separately.

### External sources, libraries and tools

- WFP Rwanda Food Prices via HDX (CC BY-IGO)
- MINAGRI Annual Report FY 2024/25
- NISR Agricultural Household Survey 2024 microdata (under NISR access terms)
- Next.js, React, TypeScript, Tailwind CSS, Recharts, Drizzle ORM, Neon serverless driver, Papa Parse, Zod
- pandas, numpy, psycopg, python-dotenv, pytest
- Google Fonts: Fraunces and Source Sans 3 (open licences)
- Rwanda administrative district names (public reference list)
- AI assistance: `[state any AI tools used and how]`
