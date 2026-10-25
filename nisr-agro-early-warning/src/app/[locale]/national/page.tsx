import Link from "next/link";
import { notFound } from "next/navigation";
import { DataStatusBanner } from "@/components/data-status-banner";
import { RiskBadge } from "@/components/risk-badge";
import { getDictionary, isLocale } from "@/lib/i18n";
import { calculateTrend, monthlyAverages } from "@/lib/trend";
import { getCropOptions, getSourceCounts } from "@/lib/data/prices";
import {
  getAllDistricts,
  getCurrentRiskSignals,
  getDistrictPriceEvidence,
  parseDriver,
  type RiskCategory,
} from "@/lib/data/risk";

// Reads approved data from Neon on each request.
export const dynamic = "force-dynamic";

const percent = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "percent", maximumFractionDigits: 1 }).format(Math.abs(value));

const shortDate = (value: Date | string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Africa/Kigali" }).format(new Date(value));

export default async function NationalDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ commodity?: string; district?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const query = await searchParams;

  const [crops, districts, counts] = await Promise.all([getCropOptions(), getAllDistricts(), getSourceCounts()]);
  const crop = crops.find((c) => c.code === query.commodity) ?? crops[0];
  if (!crop) notFound();

  const signals = await getCurrentRiskSignals(crop.code);
  const signalByDistrict = new Map(signals.map((s) => [s.districtCode, s]));

  // ----- Summary counts -----
  const categoryFor = (code: string): RiskCategory =>
    (signalByDistrict.get(code)?.category as RiskCategory | undefined) ?? "unavailable";

  const tally = { low: 0, moderate: 0, high: 0, unavailable: 0 } as Record<RiskCategory, number>;
  for (const d of districts) tally[categoryFor(d.code)] += 1;
  const monitored = tally.low + tally.moderate + tally.high;

  const latestPeriodEnd = signals.reduce<string | null>(
    (latest, s) => (!latest || s.periodEnd > latest ? s.periodEnd : latest),
    null,
  );

  // ----- Selected district evidence -----
  const selectedDistrict = districts.find((d) => d.code === query.district) ?? null;
  const evidenceRows = selectedDistrict
    ? await getDistrictPriceEvidence(selectedDistrict.code, crop.code)
    : [];
  const evidenceMonthly = monthlyAverages(
    evidenceRows.map((r) => ({ periodStart: r.periodStart, value: r.value })),
  );
  const evidenceTrend = calculateTrend(evidenceMonthly);
  const selectedSignal = selectedDistrict ? signalByDistrict.get(selectedDistrict.code) : undefined;
  const driver = parseDriver(selectedSignal?.driverSummary ?? null);
  const evidenceSampleOnly = evidenceRows.length > 0 && evidenceRows.every((r) => r.dataStatus === "sample");
  const evidenceSources = [...new Set(evidenceRows.map((r) => r.sourceName))];
  const evidenceLastApproved = evidenceRows.reduce<Date | null>((latest, r) => {
    if (!r.approvedAt) return latest;
    const d = new Date(r.approvedAt);
    return !latest || d > latest ? d : latest;
  }, null);

  const driverText = (() => {
    if (!driver) return null;
    const amount = percent(driver.changePct);
    if (driver.changePct > 0.005) return t.national.evidence.riseText.replace("{percent}", amount);
    if (driver.changePct < -0.005) return t.national.evidence.fallText.replace("{percent}", amount);
    return t.national.evidence.flatText;
  })();

  const cropName = (c: { nameEn: string; nameRw: string }) => (locale === "rw" ? c.nameRw : c.nameEn);
  const districtName = (d: { nameEn: string; nameRw: string }) => (locale === "rw" ? d.nameRw : d.nameEn);

  return (
    <div className="flex flex-col gap-8">
      <DataStatusBanner verifiedCount={counts.verified} sampleCount={counts.sample} labels={t.status} />

      <section className="max-w-3xl">
        <h1 className="text-4xl font-semibold md:text-5xl">{t.national.title}</h1>
        <p className="mt-4 text-lg text-ink">{t.national.intro}</p>
        <p className="mt-3 text-sm text-muted">{t.national.scopeNote}</p>
      </section>

      <nav aria-label={t.national.selectCommodity} className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-canopy">{t.national.selectCommodity}</span>
        <div className="flex flex-wrap gap-2">
          {crops.map((c) => {
            const active = c.code === crop.code;
            return (
              <Link
                key={c.code}
                href={`/${locale}/national?commodity=${c.code}`}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  active ? "bg-canopy text-cream" : "border border-line bg-paper text-canopy hover:border-leaf"
                }`}
              >
                {cropName(c)}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Summary indicators: counts only, nothing invented */}
      <section aria-label={t.national.summary.monitored} className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Stat label={t.national.summary.monitored} value={monitored} />
        <Stat label={t.national.summary.high} value={tally.high} />
        <Stat label={t.national.summary.moderate} value={tally.moderate} />
        <Stat label={t.national.summary.low} value={tally.low} />
        <Stat label={t.national.summary.unavailable} value={tally.unavailable} />
      </section>
      <p className="text-sm text-ink">
        <span className="font-semibold">{t.national.summary.latestData}:</span>{" "}
        {latestPeriodEnd ? shortDate(latestPeriodEnd) : t.welcome.latestUpdateNone}
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        {/* Primary view: district table */}
        <section aria-labelledby="district-table-title" className="min-w-0">
          <h2 id="district-table-title" className="text-2xl font-semibold">
            {t.national.tableCaption}
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-paper">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th scope="col" className="px-4 py-3 font-semibold">{t.national.columns.district}</th>
                  <th scope="col" className="px-4 py-3 font-semibold">{t.national.columns.province}</th>
                  <th scope="col" className="px-4 py-3 font-semibold">{t.national.columns.signal}</th>
                  <th scope="col" className="px-4 py-3 font-semibold">{t.national.columns.status}</th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    <span className="sr-only">{t.national.columns.detail}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {districts.map((d) => {
                  const category = categoryFor(d.code);
                  const signal = signalByDistrict.get(d.code);
                  const signalDriver = parseDriver(signal?.driverSummary ?? null);
                  const statusText =
                    category === "unavailable"
                      ? t.status.unavailableLabel
                      : signalDriver?.basedOnSample
                        ? t.market.statusLabels.sample
                        : t.market.statusLabels.observed;
                  const selected = selectedDistrict?.code === d.code;

                  return (
                    <tr key={d.code} className={`border-b border-line/60 ${selected ? "bg-sprout/50" : ""}`}>
                      <th scope="row" className="px-4 py-3 font-semibold text-canopy">
                        {districtName(d)}
                      </th>
                      <td className="px-4 py-3 text-ink">{d.province}</td>
                      <td className="px-4 py-3">
                        <RiskBadge category={category} label={t.national.categories[category]} />
                      </td>
                      <td className="px-4 py-3 text-ink">{statusText}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/${locale}/national?commodity=${crop.code}&district=${d.code}#evidence`}
                          className="font-semibold text-leaf underline underline-offset-4"
                        >
                          {t.national.viewEvidence}
                          <span className="sr-only"> {districtName(d)}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-xl border border-line bg-paper p-5">
            <h3 className="text-lg font-semibold">{t.national.ruleTitle}</h3>
            <p className="mt-2 text-sm text-ink">{t.national.ruleText}</p>
          </div>
        </section>

        {/* Evidence panel */}
        <aside id="evidence" aria-labelledby="evidence-title" className="flex flex-col gap-4 scroll-mt-6">
          <div className="rounded-xl border border-line bg-paper p-5">
            <h2 id="evidence-title" className="text-xl font-semibold">{t.national.evidence.title}</h2>

            {!selectedDistrict ? (
              <p className="mt-3 text-sm text-ink">{t.national.evidence.select}</p>
            ) : (
              <div className="mt-3 flex flex-col gap-4 text-sm text-ink">
                <p className="text-lg font-semibold text-canopy">
                  {districtName(selectedDistrict)}, {selectedDistrict.province}
                </p>
                <p>
                  <RiskBadge category={categoryFor(selectedDistrict.code)} label={t.national.categories[categoryFor(selectedDistrict.code)]} />
                </p>

                {!selectedSignal ? (
                  <p>{t.national.evidence.noSignal}</p>
                ) : (
                  <>
                    <div>
                      <h3 className="font-semibold">{t.national.evidence.driver}</h3>
                      <p className="mt-1">{driverText}</p>
                    </div>
                    {driver ? (
                      <p>
                        {t.national.evidence.latestAverage}:{" "}
                        <span className="font-semibold">{Math.round(driver.recentAverage)}</span>
                      </p>
                    ) : null}
                  </>
                )}

                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
                  <dt className="text-muted">{t.national.evidence.months}</dt>
                  <dd>{evidenceMonthly.length}</dd>
                  <dt className="text-muted">{t.national.evidence.status}</dt>
                  <dd>{evidenceSampleOnly ? t.market.statusLabels.sample : t.market.statusLabels.observed}</dd>
                  <dt className="text-muted">{t.national.evidence.source}</dt>
                  <dd>{evidenceSources.length ? evidenceSources.join(", ") : "—"}</dd>
                  <dt className="text-muted">{t.national.evidence.lastApproved}</dt>
                  <dd>{evidenceLastApproved ? shortDate(evidenceLastApproved) : "—"}</dd>
                  <dt className="text-muted">{t.market.trendTitle}</dt>
                  <dd>{t.market.trend[evidenceTrend.status]}</dd>
                </dl>

                <p className="text-xs text-muted">{t.national.evidence.uncertainty}</p>

                <div className="rounded-lg bg-sprout/60 p-3">
                  <h3 className="font-semibold">{t.national.evidence.responseTitle}</h3>
                  <p className="mt-1 text-xs text-ink">{t.national.evidence.responseNote}</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-canopy">{value}</p>
    </div>
  );
}
