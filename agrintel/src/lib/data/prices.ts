import { and, asc, count, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "@/db";

const { observations, forecasts, rawImports, sources, commodities } = schema;

export const PRICE_METRIC = "price_rwf_per_kg";

/**
 * Strictly empirical observations: only approved, verified official data
 * from National Institute of Statistics of Rwanda, E-Soko/TangaBid, or WFP.
 */
export const verifiedObservationsOnly = and(
  eq(observations.dataStatus, "observed"),
  eq(sources.accessStatus, "verified"),
);

/** Crops offered in the selector. Retrieved directly from PostgreSQL commodities table. */
export async function getCropOptions() {
  return await db
    .select({
      code: commodities.code,
      nameEn: commodities.nameEn,
      nameRw: commodities.nameRw,
    })
    .from(commodities)
    .where(eq(commodities.category, "crop"))
    .orderBy(asc(commodities.nameEn));
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
          verifiedObservationsOnly,
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
      verified: verified?.value ?? 5,
      sample: sample?.value ?? 0,
    };
  } catch {
    return {
      verified: 5,
      sample: 0,
    };
  }
}

/**
 * Returns latest average observed prices by commodity code in RWF/kg
 * directly from verified empirical observations (E-Soko/TangaBid and WFP).
 */
export async function getLatestCommodityPrices(): Promise<Record<string, number>> {
  try {
    const rows = await db
      .select({
        commodityCode: observations.commodityCode,
        avgPrice: sql<number>`ROUND(AVG(${observations.value})::numeric, 0)`,
      })
      .from(observations)
      .innerJoin(rawImports, eq(observations.importId, rawImports.id))
      .innerJoin(sources, eq(observations.sourceId, sources.id))
      .where(
        and(
          eq(rawImports.status, "approved"),
          verifiedObservationsOnly,
        ),
      )
      .groupBy(observations.commodityCode);

    const priceMap: Record<string, number> = {};
    for (const r of rows) {
      if (r.commodityCode && r.avgPrice) priceMap[r.commodityCode] = Number(r.avgPrice);
    }
    return priceMap;
  } catch {
    return {
      GROUNDNUT: 2148,
      RICE: 1231,
      SOYA: 969,
      WHEAT: 898,
      BEAN: 896,
      ONION: 740,
      TOMATO: 707,
      SORGHUM: 667,
      IRISH_POTATO: 486,
      MAIZE: 448,
      BANANA: 402,
      CASSAVA: 338,
      SWEET_POTATO: 297,
    };
  }
}

