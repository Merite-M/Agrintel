/**
 * Loads data/sample/market_prices_sample.csv through the same steps real data will use:
 *   register the raw file -> validate -> store observations -> approve -> audit.
 * Every row is marked dataStatus = "sample", so the UI labels it as demonstration data.
 *
 * Run with: npm run db:seed:sample   (run npm run db:seed first)
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { and, eq } from "drizzle-orm";
import Papa from "papaparse";
import { db, schema } from "./index";

const { sources, markets, rawImports, validationResults, observations, metrics, commodities, auditLog, districts } =
  schema;

const SAMPLE_SOURCE_CODE = "DEMO-SAMPLE-2026";
const RELATIVE_PATH = path.join("data", "sample", "market_prices_sample.csv");
const REQUIRED_COLUMNS = [
  "period_start",
  "period_end",
  "market_name",
  "district_code",
  "commodity_code",
  "metric_code",
  "value",
  "unit",
] as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type CsvRow = Record<(typeof REQUIRED_COLUMNS)[number], string>;

type Check = { name: string; passed: boolean; failedRows: number; detail?: unknown };

function sha256(content: string) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

/** Runs all checks in memory first. Nothing is written to the database unless every error check passes. */
function validate(rows: CsvRow[], headers: string[], knownDistricts: Set<string>, knownCommodities: Set<string>, expectedUnit: string) {
  const checks: Check[] = [];

  const missingColumns = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  checks.push({
    name: "required_columns",
    passed: missingColumns.length === 0,
    failedRows: 0,
    detail: missingColumns,
  });

  const badDates = rows.filter((r) => !DATE_PATTERN.test(r.period_start) || !DATE_PATTERN.test(r.period_end) || r.period_end < r.period_start);
  checks.push({ name: "date_format_and_order", passed: badDates.length === 0, failedRows: badDates.length });

  const badNumbers = rows.filter((r) => {
    const v = Number(r.value);
    return !Number.isFinite(v) || v <= 0;
  });
  checks.push({ name: "numeric_positive_values", passed: badNumbers.length === 0, failedRows: badNumbers.length });

  const badUnits = rows.filter((r) => r.unit.trim() !== expectedUnit);
  checks.push({ name: "unit_matches_metric", passed: badUnits.length === 0, failedRows: badUnits.length, detail: { expectedUnit } });

  const unknownDistricts = rows.filter((r) => !knownDistricts.has(r.district_code));
  checks.push({ name: "district_codes_known", passed: unknownDistricts.length === 0, failedRows: unknownDistricts.length });

  const unknownCommodities = rows.filter((r) => !knownCommodities.has(r.commodity_code));
  checks.push({ name: "commodity_codes_known", passed: unknownCommodities.length === 0, failedRows: unknownCommodities.length });

  const keys = rows.map((r) => `${r.market_name}|${r.commodity_code}|${r.period_start}`);
  const duplicates = keys.length - new Set(keys).size;
  checks.push({ name: "no_duplicate_rows", passed: duplicates === 0, failedRows: duplicates });

  return checks;
}

async function main() {
  const absolutePath = path.join(process.cwd(), RELATIVE_PATH);
  const content = readFileSync(absolutePath, "utf8");
  const fileHash = sha256(content);

  const parsed = Papa.parse<CsvRow>(content, { header: true, skipEmptyLines: true });
  if (parsed.errors.length > 0) {
    throw new Error(`CSV parse error at row ${parsed.errors[0].row}: ${parsed.errors[0].message}`);
  }
  const rows = parsed.data;
  const headers = parsed.meta.fields ?? [];

  // Reference lookups
  const [source] = await db.select().from(sources).where(eq(sources.code, SAMPLE_SOURCE_CODE));
  if (!source) {
    throw new Error(`Source ${SAMPLE_SOURCE_CODE} not found. Run "npm run db:seed" first.`);
  }

  const [metric] = await db.select().from(metrics).where(eq(metrics.code, "price_rwf_per_kg"));
  if (!metric) throw new Error("Metric price_rwf_per_kg not found. Run db:seed first.");

  const knownDistricts = new Set((await db.select({ code: districts.code }).from(districts)).map((d) => d.code));
  const knownCommodities = new Set((await db.select({ code: commodities.code }).from(commodities)).map((c) => c.code));

  // Stop early if this exact file was already loaded
  const [existing] = await db
    .select({ id: rawImports.id })
    .from(rawImports)
    .where(and(eq(rawImports.sha256, fileHash), eq(rawImports.sourceId, source.id)));
  if (existing) {
    console.log(`This file was already loaded (import #${existing.id}). Nothing to do.`);
    return;
  }

  // 1. Validate in memory
  const checks = validate(rows, headers, knownDistricts, knownCommodities, metric.unit);
  const failed = checks.filter((c) => !c.passed);
  if (failed.length > 0) {
    console.error("Validation failed. Nothing was written to the database.");
    for (const check of failed) console.error(`  - ${check.name}: ${check.failedRows} row(s)`, check.detail ?? "");
    process.exit(1);
  }

  // 2. Register the raw import (status "received" until approved)
  const periods = rows.map((r) => r.period_start).sort();
  const ends = rows.map((r) => r.period_end).sort();

  const [importRow] = await db
    .insert(rawImports)
    .values({
      sourceId: source.id,
      filename: path.basename(RELATIVE_PATH),
      storagePath: RELATIVE_PATH.split(path.sep).join("/"),
      sha256: fileHash,
      rowCount: rows.length,
      periodStart: periods[0],
      periodEnd: ends[ends.length - 1],
      status: "validated",
      notes: "Sample data for demonstration. Not official statistics.",
    })
    .returning({ id: rawImports.id });

  // 3. Record validation results
  await db.insert(validationResults).values(
    checks.map((c) => ({
      importId: importRow.id,
      checkName: c.name,
      severity: "error",
      passed: c.passed,
      failedRows: c.failedRows,
      detail: c.detail ?? null,
    })),
  );

  // 4. Ensure the sample market exists (named only as a sample, not a real market)
  const marketRows = [...new Map(rows.map((r) => [`${r.market_name}|${r.district_code}`, r])).values()];
  for (const row of marketRows) {
    await db
      .insert(markets)
      .values({ name: row.market_name, districtCode: row.district_code, sourceId: source.id })
      .onConflictDoNothing();
  }
  const marketIdByKey = new Map<string, number>();
  for (const row of marketRows) {
    const [market] = await db
      .select({ id: markets.id })
      .from(markets)
      .where(and(eq(markets.name, row.market_name), eq(markets.districtCode, row.district_code)));
    marketIdByKey.set(`${row.market_name}|${row.district_code}`, market.id);
  }

  // 5. Store observations, all marked as sample
  const observationRows = rows.map((r, index) => ({
    importId: importRow.id,
    sourceId: source.id,
    districtCode: r.district_code,
    marketId: marketIdByKey.get(`${r.market_name}|${r.district_code}`) ?? null,
    commodityCode: r.commodity_code,
    metricCode: r.metric_code,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    value: Number(r.value),
    unit: r.unit.trim(),
    dataStatus: "sample" as const,
    sourceRow: index + 2, // header is line 1
  }));

  await db.insert(observations).values(observationRows).onConflictDoNothing();

  // 6. Approve: sample data is approved for demo display only
  await db
    .update(rawImports)
    .set({ status: "approved", approvedAt: new Date() })
    .where(eq(rawImports.id, importRow.id));

  // 7. Audit trail
  await db.insert(auditLog).values({
    action: "import_approved",
    entityType: "raw_import",
    entityId: String(importRow.id),
    payload: { file: RELATIVE_PATH, rows: rows.length, sha256: fileHash, dataStatus: "sample" },
  });

  console.log(`Loaded ${rows.length} sample price rows as import #${importRow.id} (approved for demo display).`);
}

main().catch((error) => {
  console.error("Sample load failed:", error);
  process.exit(1);
});
