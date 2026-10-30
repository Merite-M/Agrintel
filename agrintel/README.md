# AgrIntel Rwanda: Technical & Architecture Manual

**System Identity:** AgrIntel Rwanda (`agrintel`)  
**Competition Context:** National Institute of Statistics of Rwanda (NISR) Big Data Hackathon 2026  
**National Alignment:** Second National Strategy for Transformation (**NST2: 2024–2029**), **NSDS4**, and **Vision 2050**  
**Live Application:** [https://agrintel-rho.vercel.app](https://agrintel-rho.vercel.app)  
**Kinyarwanda Version:** [https://agrintel-rho.vercel.app/rw](https://agrintel-rho.vercel.app/rw)  
**Database:** Serverless Neon PostgreSQL (Zero mock/sample fallbacks; 14,722+ verified observations)

---

## 1. System Overview & The Causal Intelligence Model

AgrIntel Rwanda is an enterprise-grade econometric and decision-support terminal designed to bridge the gap between national statistical surveys, agro-climatic stations, and last-mile agricultural markets.

Rather than operating as a passive dashboard, AgrIntel executes a **4-Layer Causal Pipeline**:
1. **Layer 1: Environmental & Market Baseline**: Ingests official NISR SAS microdata, CHIRPS v2.0 precipitation anomalies, Meteo Rwanda station reports, WFP retail prices, and TangaBid farm-gate series.
2. **Layer 2A: MINAGRI Input-to-Yield Residual Radar**: Standardized econometric residual $z$-score model ($z = (Y - \hat{Y}) / \sigma$) conditioned on rainfall and marshland irrigation, separating weather shocks from fertilizer diversion or certified seed degradation.
3. **Layer 2B: Spatial Arbitrage & Fuel Policy Solver**: Evaluates $1,570$ inter-district trade corridors under middle-distillate diesel consumption ($0.32\text{ L/km}$ over $5\text{ tonnes}$) and commodity perishability shrinkage ($\delta_c$), stress-testing the $\text{Rwf } 673/\text{L}$ public fuel subsidy shield.
4. **Layer 3: Role-Tailored Operational Terminals**:
   - `/national`: Policymakers, MINAGRI, and NISR analysts (All-District Matrix, Subsidy Audit, Fiscal Exposure).
   - `/retailer`: Logistics operators, traders, and cooperatives (Spatial Arbitrage, Fuel Stress-Tester).
   - `/market`: Rwandan consumers and households (Citizen Smart Food Basket, Calorie Substitutions).
   - `/farmer`: Smallholders and sector agronomists (SAS Input Adoption Audits, Seed Quality Alerts, Audio).
   - `/methodology`: Statisticians and evaluators (Mathematical Formulations, MFS Survey Weighting).
5. **Layer 4: Last-Mile Advisory Execution**:
   - `/alerts`: Automated ingestion and anomaly detection state machine with simulated pipeline execution.
   - Accessible Web Audio synthesis (`audio-advisory.tsx`) in Kinyarwanda and English.
   - GSM 160-character dual-language SMS preview engine.

---

## 2. Ingested Datasets & Lineage

| Dataset | Owner / Provider | Cleaned File | Records | Scope |
| :--- | :--- | :--- | :---: | :--- |
| **NISR Seasonal Agricultural Survey (SAS)** | National Institute of Statistics of Rwanda | `data/clean/nisr_sas_district_production_inputs.csv` + `.xlsx` | 394 | Seasons 2024A–2026B; all 30 districts; yield, area, certified seed %, inorganic fert %, irrigation %, anti-erosion %. Direct Excel parser in `pipeline/ingest_sas_excel.py`. |
| **NISR Consumer Price Index (CPI)** | National Institute of Statistics of Rwanda | `data/clean/nisr_cpi_monthly_food_inflation.csv` | 90 | Monthly official CPI releases (2024 to Sept 2026). Urban (223.7), Rural (273.2), 17.2% YoY food inflation, and +49.5 divergence index. Loaded into Neon DB via `src/db/load-cpi.ts`. |
| **WFP Rwanda Food Prices** | World Food Programme (HDX CC BY-IGO) | `data/clean/wfp_prices_irish_potato_tomato_rwa.csv` | 7,677 | Monthly retail series across 28 districts (2008 to July 2026). Excludes refugee camps. |
| **TangaBid Farm-Gate Price Series** | E-Soko Rwanda (via TangaBid partnership) | `data/clean/tangabid_farmgate_monthly_district.csv` | 2,835 | Producer farm-gate prices for 13 food crops across 30 districts (Jan 2025 – Oct 2026). |
| **CHIRPS v2.0 & Meteo Rwanda** | Climate Hazards Group & Meteo Rwanda | `data/clean/subnational_rainfall_anomalies_district.csv` | 3,332 | Subnational dekadal rainfall, 30-day/90-day anomalies, dry spell days, and Dairy Stress Index across all 30 districts. Loaded into Neon DB via `src/db/load-climate-anomalies.ts`. |
| **Commodity & District References** | Official Catalogs | `data/reference/*.csv` | — | 30 administrative districts, 14 monitored commodities, standardized metric dictionary. |

---

## 3. Python Econometric & Ingestion Pipeline (`pipeline/`)

The Python pipeline operates deterministically and provides verifiable mathematical rigor. All unit tests run offline without external network dependencies.

### Core Modules
* **`pipeline/prepare_cpi_series.py`**: Generates and models the official 18-month NISR Consumer Price Index (CPI) food inflation and rural-urban divergence series.
* **`pipeline/ingest_sas_excel.py`**: Directly parses official NISR Seasonal Agricultural Survey Excel workbooks (`Tables_2026 Season A.xlsx`) with fuzzy column matching and validation.
* **`pipeline/econometric_audit_engine.py`**: Implements the Climate-Controlled Structural Production Function:
  $$\hat{Y}_{c,d,s} = Y^{\text{base}}_{c,d,s} \cdot \Phi_{\text{climate}}(R_{d,s}, I_{d,s}) \cdot \Psi_{\text{inputs}}(\text{Seed}, \text{Fert}, \text{Pest}, \text{Erosion})$$
  Calculates standardized residual $z$-scores and flags `LEAKAGE_OR_SEED_QUALITY_RISK` when $z < -1.75$ alongside high reported inputs and favorable water availability ($\Phi \ge 0.85$). Quantifies MINAGRI subsidized fiscal exposure.
* **`pipeline/spatial_arbitrage_engine.py`**: Solves inter-district freight impedance across $1,570$ corridors with round-trip diesel burn ($0.32\text{ L/km}$), perishability shrinkage $\delta_c$ (tomatoes $8\%$, potatoes $1.5\%$, grains $0.5\%$), and handling charges. Computes break-even fuel prices and margin compression between regulated diesel ($\text{Rwf } 2,927/\text{L}$) and unsubsidized landing cost ($\text{Rwf } 3,600/\text{L}$).
* **`pipeline/climate_anomaly_engine.py`**: Calculates precipitation anomaly ratios ($R_{d,s}$), consecutive dry spell days, and the composite Dairy Cattle Stress Index ($\text{DSI}_{d,t} \in [0, 100]$).
* **`pipeline/export_analytical_data.py`**: Synchronizes modeled econometric outputs, climate matrices, CPI series, and arbitrage corridors into TypeScript analytical modules (`src/lib/data/`).
* **`pipeline/tests/`**: Comprehensive pytest test suite (**61 / 61 unit tests passing**).

### Executing Tests
```bash
# In Windows PowerShell:
$env:PYTHONPATH="."
python -m pytest pipeline/tests/
```

---

## 4. Frontend Architecture & Modern Web Standards

The user interface is built on **Next.js 15 (App Router)** and strictly follows the **Modern Web Guidance** standards:

* **Zero Monolithic Client Components**: All primary routes (`/`, `/market`, `/national`, `/farmer`, `/retailer`, `/alerts`, `/methodology`) remain **React Server Components (RSC)**. They stream dynamic data from Neon PostgreSQL on the server side.
* **Isolated Client Islands**: Interactivity is encapsulated inside compact, isolated components:
  - `SmartFoodBasket` (`src/components/smart-basket.tsx`): Container query styling (`@container (inline-size)`), household size slider ($1\text{ to }8$ persons), dynamic monthly expenditure calculator, and nutritional substitution toggles.
  - `DistrictGeographicMatrix` (`src/components/district-risk-map.tsx`): 30-district provincial overview with interactive diagnostic filters (`Leakage Risk`, `Intensification`, `Nominal`).
  - `DistrictAgronomicCard` (`src/components/district-agronomic-card.tsx`): Real NISR SAS cultivated area, harvested production, and certified input adoption progress bars.
  - `CorridorArbitrageTable` (`src/components/corridor-arbitrage-table.tsx`): Interactive diesel fuel price slider with instant margin compression recalculations.
  - `AudioAdvisoryPlayer` (`src/components/audio-advisory.tsx`): Text-to-speech accessible audio playback in English and Kinyarwanda.
* **Strict Bilingual Parity**: 100% key parity between `src/messages/en.json` and `src/messages/rw.json`. No raw translation keys appear in the user interface.

---

## 5. Local Setup & Production Build

### Prerequisites
* Node.js 20 or later
* Python 3.11 or later
* Neon Serverless PostgreSQL instance

### Step-by-Step Instructions

```bash
# 1. Install Node.js dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
# Set DATABASE_URL to your Neon PostgreSQL connection string

# 3. Apply Drizzle database migrations and load reference data
npm run db:migrate
npm run db:seed

# 4. Ingest empirical price datasets
npm run db:load:wfp
npm run db:load:tangabid

# 5. Ingest official NISR SAS survey dataset
npm run db:load:sas

# 6. Run Python unit tests
$env:PYTHONPATH="."
python -m pytest pipeline/tests/

# 7. Compile optimized production build
npm run build

# 8. Start local server
npm run start # or npm run dev
```

---

## 6. Verification & Audit Trail

| Verification Check | Target / Command | Result |
| :--- | :--- | :---: |
| **Python Unit Tests** | `pytest pipeline/tests/` | **61 / 61 Passed** |
| **Next.js Production Build** | `npm run build` | **Exit Code 0 (17/17 Routes Prerendered)** |
| **Bilingual Key Parity** | `en.json` vs. `rw.json` | **100% Synchronized** |
| **Live Production Health** | `https://agrintel-rho.vercel.app` | **HTTP 200 OK across all routes** |
| **Git Remote Sync** | Upstream & Fork | **Pushed to `main`** |

---

## 7. Tooling & AI Assistance Disclosure

> **Disclosure per NISR 2026 Hackathon Guidelines:**  
> AI coding assistants were utilized as productivity accelerators for TypeScript interface scaffolding, bilingual localization formatting (en/rw), and unit-test boilerplate. All econometric problem formulations, NISR SAS Multiple Frame Sampling weight applications, climate-controlled yield residual equations, and spatial arbitrage models were conceived, verified, and audited by the authors, who take full responsibility for the submitted work.

