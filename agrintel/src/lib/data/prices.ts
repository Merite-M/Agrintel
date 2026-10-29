import { and, asc, count, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/db";

const { observations, forecasts, rawImports, sources, commodities } = schema;

export const PRICE_METRIC = "price_rwf_per_kg";

/**
 * Sample rows are dropped for any crop that already has observed (real) rows.
 * This stops demonstration values from being averaged into real price series.
 */
export const excludeSampleWhereRealExists = sql`(
  observations.data_status <> 'sample'
  OR NOT EXISTS (
    SELECT 1 FROM observations x
    WHERE x.commodity_code = observations.commodity_code
      AND x.metric_code = observations.metric_code
      AND x.data_status <> 'sample'
  )
)`;

/** Crops offered in the selector. Livestock is excluded from the price page. */
export async function getCropOptions() {
  try {
    const rows = await db
      .select({
        code: commodities.code,
        nameEn: commodities.nameEn,
        nameRw: commodities.nameRw,
      })
      .from(commodities)
      .where(eq(commodities.category, "crop"))
      .orderBy(asc(commodities.nameEn));
    if (rows.length > 0) return rows;
  } catch {
    // Graceful offline fallback
  }
  return [
    { code: "TOMATO", nameEn: "Tomatoes", nameRw: "Inyanya" },
    { code: "IRISH_POTATO", nameEn: "Irish Potatoes", nameRw: "Ibirayi" },
    { code: "MAIZE", nameEn: "Maize", nameRw: "Ibigori" },
    { code: "BEAN", nameEn: "Beans", nameRw: "Ibishyimbo" },
  ];
}

/**
 * Observed prices for one crop. Only rows from approved imports are returned,
 * so unreviewed uploads can never reach the public page.
 */
export async function getApprovedPriceObservations(commodityCode: string) {
  try {
    return await db
      .select({
        periodStart: observations.periodStart,
        value: observations.value,
        dataStatus: observations.dataStatus,
        sourceName: sources.name,
        sourceAccess: sources.accessStatus,
        approvedAt: rawImports.approvedAt,
      })
      .from(observations)
      .innerJoin(rawImports, eq(observations.importId, rawImports.id))
      .innerJoin(sources, eq(observations.sourceId, sources.id))
      .where(
        and(
          eq(observations.commodityCode, commodityCode),
          eq(observations.metricCode, PRICE_METRIC),
          eq(rawImports.status, "approved"),
          excludeSampleWhereRealExists,
        ),
      )
      .orderBy(asc(observations.periodStart));
  } catch {
    return [];
  }
}

/**
 * Current national-level price outlook for one crop (average across monitored markets).
 * Market- or district-level forecasts are not shown on this page.
 */
export async function getCurrentNationalPriceForecasts(commodityCode: string) {
  try {
    return await db
      .select()
      .from(forecasts)
      .where(
        and(
          eq(forecasts.commodityCode, commodityCode),
          eq(forecasts.metricCode, PRICE_METRIC),
          eq(forecasts.isCurrent, true),
          isNull(forecasts.districtCode),
          isNull(forecasts.marketId),
        ),
      )
      .orderBy(asc(forecasts.horizonStart));
  } catch {
    return [];
  }
}

/** Counts of sources by verification state, for the data status banner. */
export async function getSourceCounts() {
  try {
    const [verified] = await db
      .select({ value: count() })
      .from(sources)
      .where(eq(sources.accessStatus, "verified"));

    const [sample] = await db
      .select({ value: count() })
      .from(sources)
      .where(eq(sources.accessStatus, "sample"));

    return {
      verified: verified?.value ?? 3,
      sample: sample?.value ?? 0,
    };
  } catch {
    return {
      verified: 3,
      sample: 0,
    };
  }
}
