import { and, asc, eq, isNotNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { PRICE_METRIC, excludeSampleWhereRealExists } from "@/lib/data/prices";

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

const FALLBACK_DISTRICTS = [
  { code: "GASABO", nameEn: "Gasabo", nameRw: "Gasabo", province: "Kigali City" },
  { code: "KICUKIRO", nameEn: "Kicukiro", nameRw: "Kicukiro", province: "Kigali City" },
  { code: "NYARUGENGE", nameEn: "Nyarugenge", nameRw: "Nyarugenge", province: "Kigali City" },
  { code: "BURERA", nameEn: "Burera", nameRw: "Burera", province: "Northern" },
  { code: "GAKENKE", nameEn: "Gakenke", nameRw: "Gakenke", province: "Northern" },
  { code: "GICUMBI", nameEn: "Gicumbi", nameRw: "Gicumbi", province: "Northern" },
  { code: "MUSANZE", nameEn: "Musanze", nameRw: "Musanze", province: "Northern" },
  { code: "RULINDO", nameEn: "Rulindo", nameRw: "Rulindo", province: "Northern" },
  { code: "GISAGARA", nameEn: "Gisagara", nameRw: "Gisagara", province: "Southern" },
  { code: "HUYE", nameEn: "Huye", nameRw: "Huye", province: "Southern" },
  { code: "KAMONYI", nameEn: "Kamonyi", nameRw: "Kamonyi", province: "Southern" },
  { code: "MUHANGA", nameEn: "Muhanga", nameRw: "Muhanga", province: "Southern" },
  { code: "NYAMAGABE", nameEn: "Nyamagabe", nameRw: "Nyamagabe", province: "Southern" },
  { code: "NYANZA", nameEn: "Nyanza", nameRw: "Nyanza", province: "Southern" },
  { code: "NYARUGURU", nameEn: "Nyaruguru", nameRw: "Nyaruguru", province: "Southern" },
  { code: "RUHANGO", nameEn: "Ruhango", nameRw: "Ruhango", province: "Southern" },
  { code: "KARONGI", nameEn: "Karongi", nameRw: "Karongi", province: "Western" },
  { code: "NGORORERO", nameEn: "Ngororero", nameRw: "Ngororero", province: "Western" },
  { code: "NYABIHU", nameEn: "Nyabihu", nameRw: "Nyabihu", province: "Western" },
  { code: "NYAMASHEKE", nameEn: "Nyamasheke", nameRw: "Nyamasheke", province: "Western" },
  { code: "RUBAVU", nameEn: "Rubavu", nameRw: "Rubavu", province: "Western" },
  { code: "RUSIZI", nameEn: "Rusizi", nameRw: "Rusizi", province: "Western" },
  { code: "RUTSIRO", nameEn: "Rutsiro", nameRw: "Rutsiro", province: "Western" },
  { code: "BUGESERA", nameEn: "Bugesera", nameRw: "Bugesera", province: "Eastern" },
  { code: "GATSIBO", nameEn: "Gatsibo", nameRw: "Gatsibo", province: "Eastern" },
  { code: "KAYONZA", nameEn: "Kayonza", nameRw: "Kayonza", province: "Eastern" },
  { code: "KIREHE", nameEn: "Kirehe", nameRw: "Kirehe", province: "Eastern" },
  { code: "NGOMA", nameEn: "Ngoma", nameRw: "Ngoma", province: "Eastern" },
  { code: "NYAGATARE", nameEn: "Nyagatare", nameRw: "Nyagatare", province: "Eastern" },
  { code: "RWAMAGANA", nameEn: "Rwamagana", nameRw: "Rwamagana", province: "Eastern" },
];

export async function getAllDistricts() {
  try {
    const rows = await db
      .select({
        code: districts.code,
        nameEn: districts.nameEn,
        nameRw: districts.nameRw,
        province: districts.province,
      })
      .from(districts)
      .orderBy(asc(districts.province), asc(districts.nameEn));
    if (rows.length > 0) return rows;
  } catch {
    // Graceful offline fallback
  }
  return FALLBACK_DISTRICTS;
}

/** Current risk signal per district for one crop. Only current rows are returned. */
export async function getCurrentRiskSignals(commodityCode: string) {
  try {
    return await db
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
  } catch {
    return [];
  }
}

/** Approved district-level price observations for one district and crop, for the evidence panel. */
export async function getDistrictPriceEvidence(districtCode: string, commodityCode: string) {
  try {
    return await db
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
          excludeSampleWhereRealExists,
        ),
      )
      .orderBy(asc(observations.periodStart));
  } catch {
    return [];
  }
}
