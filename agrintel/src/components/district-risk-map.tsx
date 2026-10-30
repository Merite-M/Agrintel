"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { DistrictAuditRecord } from "@/lib/data/econometric-audit";

export type DistrictGeographicMatrixProps = {
  districts: Array<{
    code: string;
    nameEn: string;
    nameRw: string;
    province: string;
  }>;
  auditRecords: DistrictAuditRecord[];
  selectedDistrictCode?: string;
  selectedCommodity: string;
  locale: string;
  labels: {
    title: string;
    subtitle: string;
    allDistricts: string;
    leakageFilter: string;
    climateFilter: string;
    intensificationFilter: string;
    nominalFilter: string;
    viewEvidence: string;
    residualScore: string;
    yieldLabel: string;
    inputsLabel: string;
    leakageBadge: string;
    climateBadge: string;
    highBadge: string;
    nominalBadge: string;
  };
};

type ProvinceGroup = "Kigali City" | "Northern" | "Southern" | "Eastern" | "Western";

export function DistrictGeographicMatrix({
  districts,
  auditRecords,
  selectedDistrictCode,
  selectedCommodity,
  locale,
  labels,
}: DistrictGeographicMatrixProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const filterGroup = useId();

  // Map latest audit record by district
  const auditByDistrict = new Map<string, DistrictAuditRecord>();
  for (const rec of auditRecords) {
    if (!auditByDistrict.has(rec.district_code)) {
      auditByDistrict.set(rec.district_code, rec);
    }
  }

  // Tally classifications
  const tallies = {
    all: districts.length,
    leakage: 0,
    climate: 0,
    high: 0,
    nominal: 0,
  };

  for (const d of districts) {
    const rec = auditByDistrict.get(d.code);
    if (!rec) {
      tallies.nominal += 1;
      continue;
    }
    if (rec.classification === "LEAKAGE_OR_SEED_QUALITY_RISK") tallies.leakage += 1;
    else if (rec.classification === "CLIMATIC_OR_WATER_STRESS") tallies.climate += 1;
    else if (rec.classification === "HIGH_PERFORMING_INTENSIFICATION") tallies.high += 1;
    else tallies.nominal += 1;
  }

  // Filter districts
  const filteredDistricts = districts.filter((d) => {
    if (activeFilter === "all") return true;
    const rec = auditByDistrict.get(d.code);
    if (!rec) return activeFilter === "nominal";
    if (activeFilter === "leakage") return rec.classification === "LEAKAGE_OR_SEED_QUALITY_RISK";
    if (activeFilter === "climate") return rec.classification === "CLIMATIC_OR_WATER_STRESS";
    if (activeFilter === "high") return rec.classification === "HIGH_PERFORMING_INTENSIFICATION";
    if (activeFilter === "nominal") return rec.classification === "NOMINAL_EXPECTED_RANGE";
    return true;
  });

  // Group by province
  const provinces: ProvinceGroup[] = [
    "Kigali City",
    "Northern",
    "Southern",
    "Eastern",
    "Western",
  ];

  return (
    <section
      aria-labelledby="matrix-title"
      className="@container rounded-3xl border border-line bg-paper p-6 shadow-sm sm:p-8"
      style={{ containerType: "inline-size" }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-canopy/10 px-3 py-1 text-xs font-bold text-canopy uppercase tracking-wider">
            All 30 Districts Nationwide
          </span>
          <h2 id="matrix-title" className="mt-2 text-2xl font-extrabold text-canopy">
            {labels.title}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {labels.subtitle}
          </p>
        </div>

        {/* Filter Pills */}
        <div
          role="radiogroup"
          aria-label="Filter districts by diagnostic audit state"
          className="flex flex-wrap gap-2 text-xs font-semibold"
        >
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`rounded-full px-3.5 py-1.5 transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-canopy text-cream shadow-xs"
                : "border border-line bg-cream/30 text-ink hover:border-canopy"
            }`}
          >
            {labels.allDistricts} ({tallies.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("leakage")}
            className={`rounded-full px-3.5 py-1.5 transition-all cursor-pointer ${
              activeFilter === "leakage"
                ? "bg-clay text-cream shadow-xs"
                : "border border-clay/30 bg-clay/10 text-clay hover:bg-clay/20"
            }`}
          >
            {labels.leakageFilter} ({tallies.leakage})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("high")}
            className={`rounded-full px-3.5 py-1.5 transition-all cursor-pointer ${
              activeFilter === "high"
                ? "bg-leaf text-cream shadow-xs"
                : "border border-leaf/30 bg-sprout/30 text-leaf hover:bg-sprout/50"
            }`}
          >
            {labels.intensificationFilter} ({tallies.high})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("nominal")}
            className={`rounded-full px-3.5 py-1.5 transition-all cursor-pointer ${
              activeFilter === "nominal"
                ? "bg-stone-700 text-cream shadow-xs"
                : "border border-line bg-cream/30 text-muted hover:border-canopy"
            }`}
          >
            {labels.nominalFilter} ({tallies.nominal})
          </button>
        </div>
      </div>

      {/* Province Groups Grid */}
      <div className="mt-6 flex flex-col gap-6">
        {provinces.map((prov) => {
          const provDistricts = filteredDistricts.filter((d) => d.province === prov);
          if (provDistricts.length === 0) return null;

          return (
            <div key={prov} className="rounded-2xl border border-line/60 bg-cream/15 p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-line/40 pb-2.5 mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-soil">
                  {prov} Province / City
                </h3>
                <span className="text-xs text-muted font-mono font-medium">
                  {provDistricts.length} districts
                </span>
              </div>

              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {provDistricts.map((d) => {
                  const rec = auditByDistrict.get(d.code);
                  const isSelected = selectedDistrictCode === d.code;
                  const districtName = locale === "rw" ? d.nameRw : d.nameEn;

                  let badgeColor = "bg-cream text-muted border-line";
                  let badgeText = labels.nominalBadge;
                  let zColor = "text-ink";

                  if (rec) {
                    if (rec.classification === "LEAKAGE_OR_SEED_QUALITY_RISK") {
                      badgeColor = "bg-clay/15 text-clay border-clay/30 font-bold";
                      badgeText = labels.leakageBadge;
                      zColor = "text-clay font-bold";
                    } else if (rec.classification === "HIGH_PERFORMING_INTENSIFICATION") {
                      badgeColor = "bg-sprout text-leaf border-leaf/30 font-bold";
                      badgeText = labels.highBadge;
                      zColor = "text-leaf font-bold";
                    } else if (rec.classification === "CLIMATIC_OR_WATER_STRESS") {
                      badgeColor = "bg-harvest/20 text-harvest border-harvest/40 font-bold";
                      badgeText = labels.climateBadge;
                      zColor = "text-harvest font-bold";
                    }
                  }

                  return (
                    <Link
                      key={d.code}
                      href={`/${locale}/national?commodity=${selectedCommodity}&district=${d.code}&tab=audit`}
                      className={`flex flex-col justify-between rounded-xl border p-3.5 transition-all hover:scale-101 hover:shadow-xs ${
                        isSelected
                          ? "border-2 border-canopy bg-cream/60 shadow-xs ring-2 ring-canopy/20"
                          : "border-line bg-paper hover:border-canopy/60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-canopy text-sm truncate">
                            {districtName}
                          </span>
                          <span className="font-mono text-xs text-muted uppercase">
                            {d.code}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-muted">{labels.residualScore}:</span>
                          <span className={`font-mono ${zColor}`}>
                            {rec ? `${rec.residual_z_score >= 0 ? "+" : ""}${rec.residual_z_score.toFixed(2)}` : "0.00"}
                          </span>
                        </div>

                        {rec && (
                          <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                            <span>{labels.yieldLabel}:</span>
                            <span className="font-mono">
                              {new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(rec.observed_yield_kg_per_ha)} kg/ha
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-line/40 flex items-center justify-between">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] ${badgeColor}`}>
                          {badgeText}
                        </span>
                        <span className="text-[11px] font-semibold text-leaf hover:underline">
                          Inspect →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
