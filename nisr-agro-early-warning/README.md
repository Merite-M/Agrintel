# Rwanda Agro-Climatic Intelligence and Food Security Early-Warning Platform

**NISR Big Data Hackathon 2026 submission**

A bilingual (English and Kinyarwanda) decision-support platform that helps government analysts, citizens, retailers and farmers see market conditions and food-security signals earlier, with the source, date and uncertainty of every number shown.

**Live app:** `[add Vercel URL]`
**Demo video (3 minutes):** `demo/demo.webm` or `[add link]`
**Team:** `[name and university of member 1]`, `[name and university of member 2]`

---

## 1. What data the app uses

| Dataset | Owner | Status in this submission | Where it lives |
|---|---|---|---|
| Market price demonstration series (tomatoes and Irish potatoes, monthly, one sample market in Gasabo) | Project team | **Sample data. Not official.** Labelled as sample everywhere it appears | `data/sample/market_prices_sample.csv` |
| District, province and commodity reference lists | Project team | Reference data | `data/reference/*.csv` |
| Metric dictionary (units and geographic level) | Project team | Reference data | `data/reference/metrics.csv` |
| NISR Agriculture Household Survey 2024 (microdata) | NISR | **Planned.** Not yet loaded. Access is requested through the NISR microdata portal | `[add link once access is granted]` |
| Meteo Rwanda weather, MINAGRI production, E-Soko prices | Various | **Not connected.** Shown in the app as unavailable | None |

No official NISR, MINAGRI or Meteo Rwanda data is used in the current build. The app does not claim a live connection to any source it has not been granted access to. Where a value comes from sample data, the page says so.

## 2. What the app communicates

- **Market prices:** monthly average prices for each crop, with a plain-language trend (rising, stable, easing, or insufficient data), an observed history, and a dashed forecast with a shaded range when a validated forecast exists.
- **National outlook:** district market-price signals (low, moderate, high, or unavailable) with the rule that produced each one, the data behind it, and its source and date.
- **Farmer and extension advice:** current conditions for a chosen district and crop, the national price outlook, general guidance marked for expert review, and an SMS preview in English and Kinyarwanda.
- **Retailer supply view:** a district comparison of price evidence, with supply and sourcing clearly marked as unavailable until production data is connected.
- **Alerts and simulator:** a clearly labelled simulated data update that shows each step of the pipeline. Simulated alerts can never be published, and nothing is sent to any phone.
- **Sources and methods:** the source register, the import history with validation results and checksums, real backtest accuracy, metric units, and the limitations.

Every page shows a **data status banner** with the number of verified and sample sources.

## 3. How users interact with it

Open the app and choose a language at the top right (English or Ikinyarwanda). Then use the section bar:

1. **Overview:** start here. It shows the data status and the entry points.
2. **Market prices:** choose a crop. Read the trend and the chart. Open the table below the chart for exact values.
3. **National outlook:** choose a crop. Read the district table. Select **View evidence** on any district to see what drives its signal, from which source, and how recent it is.
4. **Farmer advice:** choose a district and a crop or animal, then select **Show advisory**. Compare the English and Kinyarwanda SMS previews.
5. **Retailer supply:** choose a crop. Compare districts on price evidence. Read the note on what is still unavailable.
6. **Alerts:** select **Simulate data update** to run the simulation. Read each step in the list. Nothing public changes.
7. **Sources and methods:** check where each number comes from, and read the limitations before relying on any figure.

All core flows work without JavaScript. Forms use plain GET requests.

## 4. Data links

- Sample price data: `data/sample/market_prices_sample.csv` (included in this repository)
- Reference lists: `data/reference/` (included)
- NISR microdata portal: https://microdata.statistics.gov.rw/index.php/catalog
- Larger raw files, if any are added later, will be linked here instead of committed, as the webinar rules allow.

---

## Technical overview

| Layer | Technology |
|---|---|
| Web app | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS v4, custom agriculture palette and fonts (Fraunces, Source Sans 3) |
| Charts | Recharts |
| Database | Neon Postgres, with Drizzle ORM and the Neon serverless driver |
| Forecasting and risk pipeline | Python (pandas, numpy, psycopg) |
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
├── pipeline/                  Python: forecast baseline, backtest, risk signals, tests
├── data/
│   ├── reference/             Districts, commodities, metrics
│   └── sample/                Labelled sample price data
├── drizzle.config.ts          Migration configuration
└── next.config.ts             Routing configuration
```

## Setup (runs on any machine)

**Requirements:** Node.js 20 or later, Python 3.11 or later, and a Neon Postgres database (the free plan is enough).

```bash
# 1. Install JavaScript dependencies
npm install

# 2. Create your environment file and add your Neon pooled connection string
cp .env.example .env.local

# 3. Create the database tables and load reference data
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Load the labelled sample price data
npm run db:seed:sample

# 5. Build the forecasts and district signals (optional but recommended)
pip install -r pipeline/requirements.txt
python pipeline/run_price_forecast.py
python pipeline/risk_signals.py

# 6. Start the app
npm run dev
```

Then open http://localhost:3000 and choose a language.

### Running the tests

```bash
python -m pytest pipeline/tests
```

The pipeline tests check the forecasting method, the backtest (which never trains on future values), the interval rules, and the market-price signal thresholds.

### Dry runs

The pipeline can show its results without writing to the database:

```bash
python pipeline/run_price_forecast.py --dry-run
python pipeline/risk_signals.py --dry-run
```

## Methods in brief

- **Price outlook (`drift_last6` v1.0.0):** a straight line fitted to the last 6 months of the national average price, extended up to 6 months. The range comes from the method's own errors on past data (a rolling backtest), at roughly 80% confidence. It is a transparent baseline, not a claim of predictive skill.
- **District market signal (`market_price_pressure` v1.0.0):** compares the average of the last 3 months with the 3 months before. A rise of 10% or more is moderate, 20% or more is high, and anything else is low. A district needs at least 6 months of approved prices. The signal covers market prices only.
- **Data handling:** only approved imports reach public pages. Every observation and forecast records its source and import, and each import records its checksum and validation results.

## Limitations

- The current data is sample data. No figure in this build should be read as official.
- The outlook is a national average, not a district forecast.
- Market signals do not measure weather, soil, production or livestock conditions.
- Forecast ranges are wide because the history is short.
- Advisory guidance is general. Fertilizer doses and veterinary treatments are out of scope and need expert review.
- Kinyarwanda text is a draft until a fluent speaker has reviewed it, especially agricultural terms.
- The simulator demonstrates the process. It does not send messages.

## Alignment with national priorities

The platform supports the agricultural productivity, food security and climate-resilience goals in Rwanda's Second National Strategy for Transformation (NST2) and Vision 2050. It gives planners, traders and farmers earlier, clearer information about food prices and supply, with honest limits on what the data can show.

## Next steps

- Connect verified datasets as access is granted, starting with NISR microdata and market prices.
- Add weather and production indicators, validated against the documented methods.
- Have a fluent Kinyarwanda speaker review all translated text.
- Add a district map alongside the table.

---

## Declarations

- **Authorship:** We declare that this submission is our own work. All external sources, libraries and tools are listed below.
- **Intellectual property:** We understand that by entering the competition we assign the intellectual property rights in this submitted work to NISR, as set out in the competition rules.
- **Eligibility:** Team members are undergraduate or master's students, and at least one member is a Rwandan citizen. Student cards are provided separately.

### External sources, libraries and tools

- Next.js, React, TypeScript, Tailwind CSS, Recharts, Drizzle ORM, Neon serverless driver, Papa Parse, Zod
- pandas, numpy, psycopg, python-dotenv, pytest
- Google Fonts: Fraunces and Source Sans 3 (open licences)
- Rwanda administrative district names (public reference list)
- AI assistance: `[state any AI tools used and how]`
