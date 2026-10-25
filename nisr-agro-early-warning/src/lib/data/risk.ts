import { and, asc, eq, isNotNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { PRICE_METRIC } from "@/lib/data/prices";

const { districts, riskSignals, observations, rawImports, sources } = schema;

export type RiskCategory = "low" | "moderate" | "high" | "unavailable";

/** Parsed form of risk_signals.driver_summary (written by pipeline/risk_signals.py). */
export type RiskDriver = {
  rule: string;
  ruleVersion: string;
  changePct: number;
  recentAverage: number;
  previousAverage: number;
  months: number;
  basedOnSample: boolean;
  importIds: number[];
};

export function parseDriver(raw: string | null): RiskDriver | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as RiskDriver;
    if (typeof parsed.changePct !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAllDistricts() {
  return db
    .select({
      code: districts.code,
      nameEn: districts.nameEn,
      nameRw: districts.nameRw,
      province: districts.province,
    })
    .from(districts)
    .orderBy(asc(districts.province), asc(districts.nameEn));
}

/** Current risk signal per district for one crop. Only current rows are returned. */
export async function getCurrentRiskSignals(commodityCode: string) {
  return db
    .select({
      id: riskSignals.id,
      districtCode: riskSignals.districtCode,
      category: riskSignals.category,
      periodStart: riskSignals.periodStart,
      periodEnd: riskSignals.periodEnd,
      driverSummary: riskSignals.driverSummary,
      createdAt: riskSignals.createdAt,
    })
    .from(riskSignals)
    .where(and(eq(riskSignals.commodityCode, commodityCode), eq(riskSignals.isCurrent, true)));
}

/** Approved district-level price observations for one district and crop, for the evidence panel. */
export async function getDistrictPriceEvidence(districtCode: string, commodityCode: string) {
  return db
    .select({
      periodStart: observations.periodStart,
      value: observations.value,
      dataStatus: observations.dataStatus,
      sourceName: sources.name,
      approvedAt: rawImports.approvedAt,
    })
    .from(observations)
    .innerJoin(rawImports, eq(observations.importId, rawImports.id))
    .innerJoin(sources, eq(observations.sourceId, sources.id))
    .where(
      and(
        eq(observations.districtCode, districtCode),
        eq(observations.commodityCode, commodityCode),
        eq(observations.metricCode, PRICE_METRIC),
        eq(rawImports.status, "approved"),
        isNotNull(observations.districtCode),
      ),
    )
    .orderBy(asc(observations.periodStart));
}
