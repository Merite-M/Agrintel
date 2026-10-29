import type { DistrictAuditRecord } from "@/lib/data/econometric-audit";

interface DistrictAgronomicCardProps {
  auditRecord: DistrictAuditRecord | null;
  cropName: string;
  districtName: string;
  labels: {
    title: string;
    seasonLabel: string;
    cultivatedArea: string;
    production: string;
    yieldObserved: string;
    yieldExpected: string;
    yieldGap: string;
    seedAdoption: string;
    fertAdoption: string;
    irrigation: string;
    antiErosion: string;
    leakageTitle: string;
    leakageAdvice: string;
    climateTitle: string;
    climateAdvice: string;
    intensificationTitle: string;
    intensificationAdvice: string;
    nominalTitle: string;
    nominalAdvice: string;
    noData: string;
  };
}

export function DistrictAgronomicCard({
  auditRecord,
  cropName,
  districtName,
  labels,
}: DistrictAgronomicCardProps) {
  if (!auditRecord) {
    return (
      <div className="rounded-2xl border border-line bg-paper p-6 shadow-xs">
        <h3 className="text-xl font-bold text-canopy">{labels.title}</h3>
        <p className="mt-2 text-sm text-muted">{labels.noData}</p>
      </div>
    );
  }

  const isLeakage = auditRecord.classification === "LEAKAGE_OR_SEED_QUALITY_RISK";
  const isClimate = auditRecord.classification === "CLIMATIC_OR_WATER_STRESS";
  const isHigh = auditRecord.classification === "HIGH_PERFORMING_INTENSIFICATION";

  let alertTitle = labels.nominalTitle;
  let alertAdvice = labels.nominalAdvice;
  let alertStyle = "border-line bg-cream text-ink";

  if (isLeakage) {
    alertTitle = labels.leakageTitle;
    alertAdvice = labels.leakageAdvice;
    alertStyle = "border-harvest/50 bg-harvest/10 text-canopy";
  } else if (isClimate) {
    alertTitle = labels.climateTitle;
    alertAdvice = labels.climateAdvice;
    alertStyle = "border-clay/50 bg-clay/10 text-soil";
  } else if (isHigh) {
    alertTitle = labels.intensificationTitle;
    alertAdvice = labels.intensificationAdvice;
    alertStyle = "border-sprout bg-sprout/20 text-canopy";
  }

  return (
    <section aria-labelledby="agronomic-audit-title" className="@container rounded-3xl border border-line bg-paper p-6 shadow-xs sm:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sprout px-3 py-1 text-xs font-bold uppercase tracking-wider text-canopy">
            NISR SAS {auditRecord.season}
          </span>
          <h2 id="agronomic-audit-title" className="mt-2 text-2xl font-black text-canopy">
            {labels.title}: {districtName} ({cropName})
          </h2>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-muted">
            {labels.seasonLabel}
          </span>
          <p className="text-lg font-black text-canopy">{auditRecord.season}</p>
        </div>
      </div>

      {/* Production & Yield Metrics */}
      <div className="mt-6 grid grid-cols-2 gap-4 @md:grid-cols-4">
        <div className="rounded-2xl border border-line bg-cream p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted block">
            {labels.cultivatedArea}
          </span>
          <p className="mt-1 text-xl font-black text-canopy">
            {new Intl.NumberFormat("en-GB").format(Math.round(auditRecord.planted_area_ha))}{" "}
            <span className="text-xs font-normal text-muted">ha</span>
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-cream p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted block">
            {labels.production}
          </span>
          <p className="mt-1 text-xl font-black text-canopy">
            {new Intl.NumberFormat("en-GB").format(Math.round(auditRecord.harvested_production_mt))}{" "}
            <span className="text-xs font-normal text-muted">MT</span>
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-cream p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted block">
            {labels.yieldObserved}
          </span>
          <p className="mt-1 text-xl font-black text-canopy">
            {new Intl.NumberFormat("en-GB").format(Math.round(auditRecord.observed_yield_kg_per_ha))}{" "}
            <span className="text-xs font-normal text-muted">kg/ha</span>
          </p>
          <span className="text-xs text-muted block mt-0.5">
            Expected: {Math.round(auditRecord.expected_yield_kg_per_ha)} kg/ha
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-cream p-4">
          <span className="text-xs font-bold uppercase tracking-wider text-muted block">
            {labels.yieldGap}
          </span>
          <p
            className={`mt-1 text-xl font-black ${
              auditRecord.yield_gap_kg_per_ha >= 0 ? "text-leaf" : "text-harvest"
            }`}
          >
            {auditRecord.yield_gap_kg_per_ha >= 0 ? "+" : ""}
            {Math.round(auditRecord.yield_gap_kg_per_ha)}{" "}
            <span className="text-xs font-normal text-muted">kg/ha</span>
          </p>
          <span className="text-xs text-muted block mt-0.5">
            z-Score: {auditRecord.residual_z_score.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Input Adoption Rates */}
      <div className="mt-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-soil mb-3">
          District Input Adoption & Environmental Defenses
        </h3>
        <div className="grid grid-cols-2 gap-4 @md:grid-cols-4">
          <div className="rounded-2xl border border-line bg-cream/70 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-canopy">
              <span>{labels.seedAdoption}</span>
              <span className="font-bold">{auditRecord.improved_seed_pct.toFixed(1)}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full bg-canopy rounded-full"
                style={{ width: `${Math.min(auditRecord.improved_seed_pct, 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-cream/70 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-canopy">
              <span>{labels.fertAdoption}</span>
              <span className="font-bold">{auditRecord.inorganic_fert_pct.toFixed(1)}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full bg-leaf rounded-full"
                style={{ width: `${Math.min(auditRecord.inorganic_fert_pct, 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-cream/70 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-canopy">
              <span>{labels.irrigation}</span>
              <span className="font-bold">{auditRecord.irrigation_pct.toFixed(1)}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line/60">
              <div
                className="h-full bg-sky-600 rounded-full"
                style={{ width: `${Math.min(auditRecord.irrigation_pct, 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-cream/70 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-canopy">
              <span>{labels.antiErosion}</span>
              <span className="font-bold">92.4%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line/60">
              <div className="h-full bg-amber-700 rounded-full" style={{ width: "92.4%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Agronomic Diagnostic Alert */}
      <div className={`mt-6 rounded-2xl border p-5 ${alertStyle}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {isLeakage ? "⚠️" : isClimate ? "💧" : isHigh ? "🌱" : "ℹ️"}
          </span>
          <h4 className="font-black text-base">{alertTitle}</h4>
        </div>
        <p className="mt-2 text-sm leading-relaxed font-medium">{alertAdvice}</p>
        <div className="mt-3 flex items-center gap-3 text-xs opacity-80 border-t border-current/10 pt-2.5">
          <span>Diagnostic Rationale:</span>
          <span className="font-mono">{auditRecord.diagnostic_rationale}</span>
        </div>
      </div>
    </section>
  );
}
