# AGRINTEL RWANDA: LIVING ARCHITECTURE, ECONOMETRIC & PRODUCT CHARTER

**System Identity:** AgrIntel Rwanda (`nisr-agro-early-warning`)  
**Competition Context:** NISR Big Data Hackathon 2026 (National Institute of Statistics of Rwanda)  
**National Strategic Alignment:** Second National Strategy for Transformation (NST2: 2024–2029), Fourth National Strategy for the Development of Statistics (NSDS4), and Vision 2050  
**Document Paradigm:** Living Intent & Causal Architecture Charter (Anti-Waterfall / High-Agency AI & Human Co-Pilot Specification)

---

## 1. STRATEGIC MANDATE & THE "BITS VS. ATOMS" PHILOSOPHY

### 1.1 Why Most Hackathon Projects Lose
Ninety-five percent of hackathon submissions fail for one of two reasons:
1. **Passive Descriptive Dashboards:** They plot historical CSVs on a map without solving a decision bottleneck, leaving policymakers and farmers to guess what action to take.
2. **Confusing "Atoms" Problems with "Bits" Problems:** They propose software for problems that actually require $\text{US\$}300\text{ million}$ in physical terracing, cold-storage construction, or fleet purchases. When the bottleneck is concrete and steel, software is merely a thermometer.

### 1.2 The AgrIntel Disruption Thesis
AgrIntel Rwanda attacks problems where **the bottleneck is information asymmetry, statistical verification, risk pricing, and capital allocation**. When a market or policy failure is driven by delayed survey reconciliation, unverified input distribution, or opaque transport margins, **the algorithm is the solution**.

Rather than choosing between a citizen/farmer early-warning platform and an institutional econometric audit terminal, AgrIntel unifies both into a **Four-Layer Causal Intelligence Engine** where environmental baselines, production audits, spatial logistics, and last-mile bilingual advisories reinforce one another mathematically.

### 1.3 NISR 2026 Rubric Optimization Matrix (100 Points)
Every architectural and modeling decision in this repository is calibrated to maximize scoring across the five official 20-point evaluation criteria:

| Rubric Criterion (20 Pts Each) | Common Competitor Mistake | AgrIntel 1st-Place Execution Strategy |
| :--- | :--- | :--- |
| **1. Relevance to Problem & NST2 Alignment** | Vague "helping farmers check weather" pitch with no fiscal or macro anchor. | Directly targets NST2 priorities: doubling food productivity, safeguarding $\text{Rwf } 75\text{B}$ in input subsidies, buffering $17.2\%$ YoY inflation, protecting dairy/crop resilience, and reducing malnutrition. |
| **2. Use of Datasets & Methodology** | Training a naive model on a single non-NISR CSV while ignoring survey sampling design. | Fuses **NISR Seasonal Agricultural Survey (SAS)** (respecting Multiple Frame Sampling weights), **NISR CPI/PPI**, **WFP**, **Tangabid**, and **CHIRPS/Meteo** agro-climatic series with transparent lineage badges. |
| **3. Technical Innovation** | Black-box ML claims with invented accuracy scores or hardcoded rules. | Combines **multi-horizon price/stress forecasting**, **climate-controlled econometric residual auditing ($z$-scores)**, **diesel-adjusted spatial arbitrage optimization**, and an **automated bilingual SMS/Audio state machine**. |
| **4. Usability & Design** | Cluttered single-view Streamlit page in English only. | Role-aware Next.js App Router terminal with 100% **English & Kinyarwanda (`en`/`rw`) parity**, mobile-ready tables/maps, audio advisories (`audio-advisory.tsx`), and explicit uncertainty/freshness indicators. |
| **5. Tangible Impact** | Theoretical future benefits requiring years of physical infrastructure rollout. | Immediate operational ROI: pinpoints input leakage for MINAGRI, calculates net per-kg transport margins under fuel stress for traders, guides livestock/crop stress mitigation for farmers, and protects household food baskets. |

---

## 2. EMPIRICAL DOMAIN CONTEXT (RWANDA MACRO & AGRO-ECONOMIC REALITY)

To prevent **Ambiguity and Context Loss** when AI agents or engineers write modeling logic, UI explanations, or Kinyarwanda translations, the system must remain grounded in these verified empirical realities:

### 2.1 Macroeconomic Inflation & Energy Pass-Through (October 2026 Baseline)
* **Acute Price Pressure:** NISR's September 2026 Consumer Price Index (CPI) recorded **$17.2\%$ year-on-year national inflation** (up from $15.7\%$ in August 2026), with the **Rural CPI reaching $273.2$** and **Urban CPI at $223.7$**, alongside a **$21.1\%$ surge in the Producer Price Index (PPI)**.
* **The Diesel Freight Lifeline:** Domestic agricultural collection and food distribution depend heavily on middle-distillate fuel (diesel). In Q2 2026 alone, the Government of Rwanda absorbed nearly **$\text{Rwf } 48\text{ billion}$ in fiscal fuel subsidies** to hold retail pump prices at **$\text{Rwf } 2,927/\text{L}$** against an unsubsidized landing cost of **$\text{Rwf } 3,600/\text{L}$** (a subsidy of $\text{Rwf } 673/\text{L}$).
* **Implication for AgrIntel:** Any supply-chain routing or market outlook tool that treats transport cost as zero or static is economically invalid. AgrIntel models transport impedance dynamically as a function of road distance, vehicle payload efficiency, spoilage decay, and fuel price regimes.

### 2.2 The $\text{Rwf } 75\text{ Billion}$ Input Subsidy & Seed Quality Paradox
* **Fiscal Scale:** Public agricultural expenditure allocates roughly **$\text{Rwf } 75\text{ billion}$** toward subsidized improved seeds and blended inorganic fertilizers, backed domestically by the $100,000\text{-tonne-per-year}$ Bugesera fertilizer blending plant.
* **Seasonal Input Adoption Drop (NISR SAS Evidence):** While large-scale commercial farms maintain certified seed adoption above $80\%$, smallholder adoption fluctuates dramatically across seasons:
  * **Improved Seeds:** $\approx 37.0\%\text{--}39.7\%$ in Season A, dropping sharply to **$18.0\%\text{--}20.9\%$ in Season B** and **$18.8\%\text{--}18.9\%$ in Season C**.
  * **Inorganic Fertilizers:** Ranges between **$52.0\%$ and $67.2\%$** across seasons.
  * **Pesticides & Fungicides:** Ranges between **$30.2\%$ and $67.0\%$**.
  * **Anti-Erosion Structures:** Practiced by **$89.2\%\text{--}94.7\%$** of farmers nationally.
* **The Seed Price & Pathogen Feedback Loop:** When certified seed prices spike—such as certified *Kirundo* potato seed jumping $25\%$ from $\text{Rwf } 800/\text{kg}$ to $\text{Rwf } 1,000/\text{kg}$ within a single planting cycle—cash-constrained smallholders abandon formal seed multipliers for informal farm-gate exchanges. This accelerates the spread of seed-borne pathogens (e.g., bacterial wilt, viral degeneration) and creates opportunities for counterfeit or low-germination seed packets and fertilizer diversion in rural agro-dealer networks.

### 2.3 Seasonal Stratification & Marshland Irrigation (Seasons A, B, and C)
* **Rainfed Hillslopes (Seasons A & B):** Season A (September–February) and Season B (March–June) dominate rainfed production of maize, dry beans, sorghum, tubers, and bananas across hillslopes. Irrigation usage is low ($7.5\%\text{--}14.4\%$ in Season A). NISR SAS samples roughly **$1,200$ area-frame segments** plus a list frame of large-scale holdings ($554+$ commercial farms).
* **Wetland & Marshland Concentration (Season C):** Season C (July–September) is the critical dry-season food and vegetable buffer (Irish potatoes, tomatoes, cabbages, sweet potatoes, horticultural crops) concentrated across **$38$ major classified marshland networks spanning $56,120\text{ hectares}$**, where **$58.2\%\text{--}58.9\%$ of farmers rely on irrigation** (motorized pumps, gravity-fed channels, watering cans).

### 2.4 Livestock, Dairy Stress & Nutritional Resilience
* **Why Livestock Matters:** Under NST2, reducing childhood stunting (which affects roughly a third of under-five children in vulnerable quintiles) and boosting rural incomes requires both crop calories and animal-source proteins—specifically **dairy cattle and milk production** across Rwanda's major milk sheds (e.g., Nyagatare, Gicumbi, Musanze, Nyanza, Rwamagana, Kayonza, Bugesera, Gatsibo).
* **The Agro-Climatic Link:** Prolonged dry spells, high temperature anomalies, and soil moisture deficits directly degrade pasture/forage biomass and livestock water access before crop harvest failures even appear in market statistics. Integrating **dairy cattle water/feed stress and milk yield vulnerability indicators** alongside crop and market models provides early warning for both rural income shocks and child-nutrition interventions.

---

## 3. THE UNIFIED 4-LAYER CAUSAL ARCHITECTURE

AgrIntel does **not** treat agro-climatic early warning, subsidy auditing, spatial arbitrage, and farmer/citizen advisories as separate apps. They form a single mathematical pipeline:

```
========================================================================================
LAYER 1: AGRO-CLIMATIC, CROP, LIVESTOCK & PRICE BASELINE (Environmental & Market Core)
========================================================================================
• Inputs: NISR SAS multi-season series, CHIRPS/Meteo rainfall & temperature anomalies,
  soil/marshland indicators, WFP retail prices, Tangabid farm-gate prices, CPI/PPI.
• Scope: Dynamically scales across ALL districts, crops (tubers, vegetables, cereals,
  legumes), and livestock/dairy indicators where verified or labeled sample data exists.
• Outputs:
  1. Expected Agro-Climatic Yield Frontier & Soil/Water Stress Indices.
  2. Livestock / Dairy Cattle Forage & Water Stress Outlook.
  3. Multi-Horizon Farm-Gate (P_O) and Retail Market (P_D) Price Trajectories + Uncertainty.
                                           │
                   ┌───────────────────────┴───────────────────────┐
                   ▼                                               ▼
=========================================       =========================================
LAYER 2A: INPUT-TO-YIELD & SUBSIDY RADAR        LAYER 2B: SPATIAL ARBITRAGE & FUEL SOLVER
(Econometric B2G Audit Engine)                  (Logistics & Policy Stress-Test Engine)
=========================================       =========================================
• Uses Layer 1 weather/irrigation as the        • Uses Layer 1 observed & forecasted
  mandatory exogenous statistical control.        origin (P_O) and destination (P_D) prices.
• Compares actual SAS district yield Y_{c,d,s}  • Evaluates N x M district-to-market
  against climate- & input-adjusted expected      corridors across Rwanda's road network.
  yield \hat{Y}_{c,d,s}.                        • Subtracts spoilage decay (\delta_c) and
• Computes standardized residual z-score:         round-trip diesel freight cost per kg.
  - Normal weather + high reported inputs       • Simulates fuel policy regimes:
    + severe negative residual (z < -1.75)        Regulated (Rwf 2,927/L) vs. Unsubsidized
    ==> Flags INPUT_LEAKAGE_OR_SEED_PATHOGEN.     Counterfactual (Rwf 3,600/L) or custom.
  - Low rainfall/irrigation + negative residual • Ranks corridors: DISPATCH_SURPLUS,
    ==> Flags CLIMATIC_OR_WATER_STRESS.           MODERATE_MARGIN, or HOLD_LOCAL.
                   │                                               │
                   └───────────────────────┬───────────────────────┘
                                           ▼
========================================================================================
LAYER 3: ROLE-TAILORED DECISION SURFACES (5 User Personas)
========================================================================================
1. /national    -> Government, NISR & MINAGRI Analysts (Risk Map, Subsidy Audit, Scenarios)
2. /retailer    -> Traders, Cooperatives & Aggregators (Arbitrage Solver & Fuel Stress-Test)
3. /market      -> Citizens & Households (Smart Basket, Inflation Alternatives & Drivers)
4. /farmer      -> Farmers, Herders & Extension Officers (Local Crop/Dairy Advisory)
5. /methodology -> Judges, Statisticians & Data Stewards (Lineage, MFS Weights, Validation)
                                           │
                                           ▼
========================================================================================
LAYER 4: BILINGUAL LAST-MILE EXECUTION & SIMULATION (Action & Alert State Machine)
========================================================================================
• /alerts -> Bilingual (English + Kinyarwanda) SMS Simulator & Web Audio Advisory.
• State Machine: update received -> validated -> outlook refreshed -> draft alert -> published.
```

---

## 4. MATHEMATICAL & ECONOMETRIC FORMULATIONS

AI agents and developers must implement transparent, auditable mathematical formulations rather than opaque heuristics or unverified black boxes.

### 4.1 Survey Weighting & Aggregation (NISR SAS Compliance)
When aggregating respondent- or segment-level NISR SAS microdata to district-level estimates for district $d$, crop $c$, and season $s$, never use unweighted simple averages if sampling weights $w_{i,d,s}$ are present:

$$\bar{Y}_{c,d,s} = \frac{\sum_{i \in S_{d,s}} w_{i,d,s} \cdot y_{i,c,d,s}}{\sum_{i \in S_{d,s}} w_{i,d,s}}$$

Where $S_{d,s}$ represents both the area-frame segments (e.g., $1,200$ segments in Seasons A/B; marshland-stratified segments in Season C) and the list-frame commercial holdings.

### 4.2 Layer 2A: Climate-Controlled Input-to-Yield Residual Model
To avoid **omitted variable bias** (mistaking a localized drought for fertilizer leakage), expected district yield $\hat{Y}_{c,d,s}$ is modeled as a structural production function conditioned on both agro-climatic water availability and reported input intensity:

$$\hat{Y}_{c,d,s} = Y^{\text{base}}_{c,d,s} \cdot \Phi_{\text{climate}}(R_{d,s}, I_{d,s}) \cdot \Psi_{\text{inputs}}(\text{Seed}_{c,d,s}, \text{Fert}_{c,d,s}, \text{Pest}_{c,d,s}, \text{Erosion}_{d,s})$$

Where:
* $R_{d,s} = \frac{\text{Rainfall}_{d,s}}{\text{Historical Avg Rainfall}_{d,s}}$ is the subnational precipitation anomaly ratio (from CHIRPS/Meteo).
* $I_{d,s} \in [0, 1]$ is the seasonal irrigation penetration rate (which cushions rainfall deficits in Season C marshlands: $\Phi_{\text{climate}} = \text{clip}\left( (1 - I_{d,s}) R_{d,s} + I_{d,s}, \, 0.55, \, 1.25 \right)$).
* $\Psi_{\text{inputs}}$ captures the elasticity-weighted response to certified seed adoption ($\beta_{\text{seed}}$), inorganic fertilizer rate ($\beta_{\text{fert}}$), pest control ($\beta_{\text{pest}}$), and anti-erosion protection ($\beta_{\text{erosion}}$) relative to district baselines.

The **Standardized Structural Residual ($z$-score)** is:

$$z_{c,d,s} = \frac{Y^{\text{observed}}_{c,d,s} - \hat{Y}_{c,d,s}}{\sigma_{c,d}}$$

**Diagnostic Attribution Rules:**
1. **`LEAKAGE_OR_SEED_QUALITY_RISK`:** $z_{c,d,s} < -1.75$ AND $\Phi_{\text{climate}}(R_{d,s}, I_{d,s}) \ge 0.85$ AND reported input usage is near or above baseline. *Interpretation:* Water supply was adequate and subsidized inputs were reported as applied, yet yields collapsed. Points to sub-potent/counterfeit seeds, pathogen-infected informal seed stock (e.g., post-price-shock substitution), or fertilizer diversion.
2. **`CLIMATIC_OR_WATER_STRESS`:** $Y^{\text{observed}}_{c,d,s} < 0.85 \cdot Y^{\text{base}}_{c,d,s}$ AND $\Phi_{\text{climate}}(R_{d,s}, I_{d,s}) < 0.85$. *Interpretation:* Yield drop is explained by precipitation deficit and insufficient irrigation coverage.
3. **`HIGH_PERFORMING_INTENSIFICATION`:** $z_{c,d,s} > +1.25$. *Interpretation:* Positive synergy between certified inputs, marshland irrigation, and agronomic management.
4. **`NOMINAL_EXPECTED_RANGE`:** $-1.75 \le z_{c,d,s} \le +1.25$.

### 4.3 Layer 2B: Multi-Corridor Spatial Arbitrage & Fuel Stress-Test Equation
For any origin production district $O$, destination market $D$, and commodity $c$ with transit distance $d_{O,D}$ (km), round-trip truck fuel consumption rate $\gamma$ ($\text{L/km}$), effective payload $Q_{\text{truck}}$ ($\text{kg}$), transit spoilage/shrinkage factor $\delta_c \in [0, 1]$, and diesel pump price $P_{\text{diesel}}$ ($\text{Rwf/L}$):

$$\text{Freight Cost}_{O \to D}(P_{\text{diesel}}) = \frac{2 \cdot d_{O,D} \cdot \gamma \cdot P_{\text{diesel}}}{Q_{\text{truck}}} + C_{\text{handling}}$$

$$\text{Net Arbitrage Margin}_{O \to D, c}(P_{\text{diesel}}) = P_{D,c} \cdot \left(1 - \delta_c \cdot \frac{d_{O,D}}{100}\right) - P_{O,c} - \text{Freight Cost}_{O \to D}(P_{\text{diesel}})$$

**Counterfactual Stress-Testing:**
* **Regulated Regime:** $P_{\text{diesel}}^{\text{reg}} = 2,927\text{ Rwf/L}$
* **Unsubsidized Counterfactual:** $P_{\text{diesel}}^{\text{unsub}} = 3,600\text{ Rwf/L}$
* **Margin Compression Ratio:**
  $$\Delta \text{Margin}_{\%} = \frac{\text{Margin}(P_{\text{diesel}}^{\text{reg}}) - \text{Margin}(P_{\text{diesel}}^{\text{unsub}})}{\left|\text{Margin}(P_{\text{diesel}}^{\text{reg}})\right|} \times 100$$

### 4.4 Layer 1C: Livestock & Dairy Cattle Stress Index (Where Data Exists)
For districts with dairy cattle production, the **Dairy Stress & Milk Yield Vulnerability Score** $\text{DSI}_{d,t} \in [0, 100]$ combines:
* Rolling 30-day & 90-day rainfall anomaly ($r1q, r3q$) as a proxy for natural pasture/napier grass regeneration and surface water availability.
* Temperature-Humidity / dry-spell duration proxy.
* Feed/forage price pressure in adjacent crop markets.
* *Strict Honesty Rule:* Display observed milk volume or cattle health metrics only where backed by NISR/MINAGRI/RAB datasets; otherwise clearly label the output as an **Agro-Climatic Pasture & Water Stress Indicator** (`verified` climate input $\to$ `estimated` forage/water stress risk).

---

## 5. BROWNFIELD REPOSITORY MAP (`nisr-agro-early-warning`)

To prevent **Brownfield Mismatch** and **AI Collateral Damage**, every agent must understand the existing repository structure before editing files:

```
Agritech-main/nisr-agro-early-warning/
├── data/
│   ├── clean/
│   │   ├── tangabid_farmgate_monthly_district.csv   # Verified district farm-gate price series (P_O)
│   │   └── wfp_prices_irish_potato_tomato_rwa.csv   # Verified WFP market price series (P_D)
│   └── reference/
│       ├── commodities.csv                          # Reference commodity catalog
│       ├── districts.csv                            # Reference Rwanda districts catalog
│       └── metrics.csv                              # Monitored indicator definitions
├── pipeline/
│   ├── forecast_core.py                             # Statistical price forecasting baseline
│   ├── prepare_tangabid_prices.py                   # Tangabid ETL & normalization script
│   ├── prepare_wfp_prices.py                        # WFP ETL & normalization script
│   ├── risk_signals.py                              # Risk signal classification logic
│   ├── run_price_forecast.py                        # Forecast runner orchestrator
│   └── tests/                                       # Pytest suite (test_forecast_core, test_risk_signals, etc.)
├── drizzle/                                         # Drizzle SQL migrations & metadata snapshots
├── src/
│   ├── db/
│   │   ├── index.ts                                 # Neon Serverless Postgres connection client
│   │   ├── schema.ts                                # Drizzle ORM table definitions
│   │   ├── seed-reference.ts                        # Reference table seeder
│   │   ├── load-tangabid-prices.ts                  # Tangabid -> Neon DB loader
│   │   └── load-wfp-prices.ts                       # WFP -> Neon DB loader
│   ├── lib/
│   │   ├── advisory.ts & risk-rule.ts & trend.ts    # Core business logic & trend evaluators
│   │   ├── i18n.ts                                  # Localization routing & dictionary helpers
│   │   └── data/                                    # Data access layer (prices.ts, risk.ts, advisory.ts, methodology-constants.ts)
│   ├── components/
│   │   ├── action-badge.tsx & risk-badge.tsx        # Semantic status & risk UI badges
│   │   ├── audio-advisory.tsx                       # Accessible spoken advisory component
│   │   ├── crop-cards.tsx & price-chart.tsx         # Interactive commodity cards & historical/forecast charts
│   │   └── data-status-banner.tsx                   # Provenance banner (verified vs. sample vs. simulated)
│   ├── app/[locale]/
│   │   ├── page.tsx                                 # Welcome / Role-Aware Overview Hub
│   │   ├── national/page.tsx                        # Government, NISR & MINAGRI Analyst Terminal
│   │   ├── retailer/page.tsx                        # Trader Supply & Spatial Arbitrage Terminal
│   │   ├── market/page.tsx                          # Citizen Market Outlook & Smart Basket
│   │   ├── farmer/page.tsx                          # Farmer, Livestock & Extension Advisory
│   │   ├── alerts/page.tsx & actions.ts             # Bilingual SMS Simulator & Data-Update Trigger
│   │   └── methodology/page.tsx                     # Data Register, MFS Methodology & Lineage Proof
│   └── messages/
│       ├── en.json                                  # Complete English translation dictionary
│       └── rw.json                                  # Complete Kinyarwanda translation dictionary
```

---

## 6. DATA ECOSYSTEM & CONTINUOUS INGESTION LIFECYCLE

### 6.1 Authoritative Data Sources
1. **NISR Seasonal Agricultural Survey (SAS — Seasons A, B, C):**
   * *2026 Season A & B Official District Tables:* Cultivated area, yield ($\text{kg/ha}$), total production ($\text{MT}$), improved seed %, inorganic/organic fertilizer %, pesticide %, irrigation %, and anti-erosion % across all $30$ districts.
   * *NISR Microdata Catalog (`RWA-NISR-SAS-2025-v01` / `#124` & `#113`):* Segment and large-scale holding microdata with sampling design weights.
2. **NISR Consumer Price Index (CPI) & Producer Price Index (PPI):**
   * Monthly urban, rural, and national food & energy price indices (through September 2026: $17.2\%$ YoY CPI).
3. **WFP & Tangabid Market & Farm-Gate Price Series:**
   * Subnational farm-gate ($P_O$) and retail/wholesale market ($P_D$) prices across Rwandan districts and Kigali markets.
4. **CHIRPS v2 / Meteo Rwanda Subnational Agro-Climatic Indicators:**
   * 10-day (dekadal), 1-month (`r1q`), and 3-month (`r3q`) rainfall totals and historical anomaly ratios mapped to Rwanda's 30 administrative districts.

### 6.2 How the System Handles New, Changing, or Streaming Data
A core requirement of AgrIntel is that **data is never frozen into static, unmaintainable UI templates**. The architecture handles ongoing data arrival through a **Three-Tier Idempotent Lifecycle**:

1. **Dynamic Discovery & Schema Normalization (`pipeline/`):**
   * Scripts do not hardcode three districts or two crops. They dynamically iterate over `districts.csv`, `commodities.csv`, and all rows present in `data/clean/` or Neon Postgres tables. When new districts, crops, or livestock metrics are added to the source tables, the econometric and arbitrage engines automatically compute scores for them.
2. **Database Persistence + Fast Edge Fallback (`Neon Postgres + Drizzle` / `src/lib/data/`):**
   * Modeled outputs are upserted into Neon Postgres via composite natural keys (`district_id + commodity_id + season_or_period + metric_type`) so repeated pipeline runs update existing records cleanly without duplicating rows.
   * Where offline resilience or zero-latency SSR is needed, the Python pipeline also serializes a synchronized snapshot to `src/lib/data/` so the Next.js app never crashes if a cloud connection times out during a live pitch.
3. **Interactive Live Update Simulation (`/alerts` -> `actions.ts`):**
   * The platform includes an interactive **"Simulate Data Update"** workflow that demonstrates the end-to-end production pipeline for judges:
     $$\text{New Observation Arrives} \to \text{Schema & Range Validation} \to \text{Residual & Arbitrage Recalculation} \to \text{Bilingual Alert Drafted}$$

---

## 7. ANTI-SDD OPERATING PROTOCOLS FOR AUTONOMOUS AI AGENTS

Traditional Spec-Driven Development (SDD) fails because static specs drift from reality, recreate Waterfall traps, encourage over-engineering, and cause AI agents to break brownfield codebases. **Antigravity and any AI agent operating in this repository must obey these 6 protocols:**

### Protocol 1: Code & Data Are the Source of Truth (Anti-Drift)
* **Never blindly trust an assumed column name or table structure.** Before writing any Python or TypeScript code, use filesystem/terminal tools to inspect actual CSV headers in `data/clean/`, existing Drizzle tables in `src/db/schema.ts`, and existing data loaders in `src/lib/data/`.
* If you evolve the schema or add a superior analytical feature during implementation, update the code, tests, and `/methodology` page simultaneously so documentation never drifts from reality.

### Protocol 2: Zero Hardcoding & Zero Artificial Scope Caps (Anti-Bias)
* **Do not hardcode districts or commodities.** While Musanze, Nyagatare, Bugesera, and Kigali (and Irish potatoes, tomatoes, maize, beans, dairy cattle) may serve as highlighted default selections in the UI, all backend functions, database schemas, and UI selectors must dynamically support **all 30 districts of Rwanda** and **any crop or livestock category** present in the data tables.
* **Think like a Co-Founder:** If you discover an opportunity in the datasets to surface a sharper cross-indicator insight (e.g., linking Season C marshland irrigation rates to tomato price stability, or linking dry-spell rainfall anomalies to both dairy pasture stress and bean yields), build it in.

### Protocol 3: Non-Destructive Brownfield Evolution (Anti-Collateral Damage)
* Your teammate has already built working components (`price-chart.tsx`, `crop-cards.tsx`, `audio-advisory.tsx`, `data-status-banner.tsx`, `risk-badge.tsx`, `action-badge.tsx`) and working Neon/Drizzle loaders.
* **Extend and enrich—do not rip and replace.** Preserve existing props and route structures under `src/app/[locale]/` so existing features continue to pass tests while new econometric and arbitrage capabilities are layered in.

### Protocol 4: Epistemic Honesty & Provenance Tagging (Anti-Hallucination)
* Every metric, chart, and advisory card rendered in the UI must preserve provenance metadata: **Source**, **Update/Reference Period**, **Geographic Coverage**, and **Status** (`verified`, `estimated/modeled`, `sample`, or `simulated`).
* Never invent fake machine-learning accuracy percentages (e.g., claiming "98.4% accuracy" without a held-out evaluation split). Report actual historical backtest metrics (MAE, RMSE, directional accuracy) or clearly label structural scenario models.

### Protocol 5: Simple, Iterative Vertical Slices (Anti-Over-Engineering)
* Avoid bloated enterprise abstractions, unnecessary microservices, or complex authentication gates that block judges from exploring the platform.
* Every feature must be delivered as a complete vertical slice: **Clean Data $\to$ Tested Python/TS Logic $\to$ Bilingual UI Component (`en.json` + `rw.json`) $\to$ Verified Build**.

### Protocol 6: Mandatory Self-Verification Gate (Creator, Not Proofreader)
* An AI agent must never hand off untested code for the human developer to debug. Before completing any task, the agent must autonomously execute:
  1. `pytest` across `pipeline/tests/` to verify mathematical and data-pipeline integrity.
  2. `npm run build` (or `npx next build`) to guarantee zero TypeScript, Drizzle, ESLint, or Next.js SSR compilation errors.
  3. Bilingual key parity check between `src/messages/en.json` and `src/messages/rw.json` so no raw translation keys ever appear in the UI.

---

## 8. ROLE-BY-ROLE CAPABILITY CHECKLIST (THE WINNING WALKTHROUGH)

When judges evaluate the deployed application, each route must answer a high-stakes operational question immediately:

1. **Overview Hub (`/[locale]`):**
   * Instant role selector, live provenance status banner, headline macro/agro-climatic pulse, and seamless English/Kinyarwanda toggle.
2. **Government & NISR/MINAGRI Terminal (`/[locale]/national`):**
   * Interactive all-district risk overview separating **Exogenous Agro-Climatic/Water Stress** (crop + dairy forage stress) from **Endogenous Input-to-Yield Residual Anomalies ($z$-scores)**.
   * Highlights seasonal input dynamics (e.g., Season A vs. Season B/C certified seed drop, fertilizer utilization, marshland irrigation buffer) and policy response simulations.
3. **Trader & Logistics Arbitrage Terminal (`/[locale]/retailer`):**
   * Origin-to-Destination spatial arbitrage table and route analyzer comparing farm-gate ($P_O$) vs. wholesale/retail ($P_D$) spreads net of spoilage and diesel freight costs.
   * Interactive **Diesel Policy Stress-Tester** ($\text{Rwf } 2,927/\text{L}$ regulated vs. $\text{Rwf } 3,600/\text{L}$ unsubsidized counterfactual, plus custom slider) showing real-time margin compression and dispatch recommendations (`DISPATCH_SURPLUS` vs. `HOLD_LOCAL`).
4. **Citizen Market Outlook & Smart Basket (`/[locale]/market`):**
   * Historical vs. forecasted commodity price trajectories with confidence intervals, plain-language trend indicators (`rising`, `stable`, `easing`), driver attribution, and affordable commodity substitution comparisons during high-inflation periods.
5. **Farmer, Cooperative & Livestock Advisory (`/[locale]/farmer`):**
   * District- and commodity-specific operational guidance covering crop planting/harvest timing, certified seed vs. informal seed pathogen warnings, marshland irrigation cues, and **dairy cattle water/feed stress advisories**, paired with spoken Kinyarwanda/English audio playback (`audio-advisory.tsx`).
6. **Alert Center & Live Pipeline Simulator (`/[locale]/alerts`):**
   * Bilingual SMS/USSD previewer and one-click **"Simulate Data Update"** button demonstrating live ingestion $\to$ validation $\to$ econometric recalculation $\to$ automated draft alert generation.
7. **Methodology & Statistical Proof (`/[locale]/methodology`):**
   * Dataset registry, NISR SAS Multiple Frame Sampling (MFS) weight documentation, explicit mathematical equations for the yield-residual and spatial arbitrage models, and backtest validation transparency.

feel free to change the spec as new decisions or directions are taken that affects the spec that other AIs can be uptodate.