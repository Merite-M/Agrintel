import { notFound } from "next/navigation";
import { DataStatusBanner } from "@/components/data-status-banner";
import { RiskBadge } from "@/components/risk-badge";
import { buildSms, guidanceKey } from "@/lib/advisory";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getAllCommodities } from "@/lib/data/advisory";
import { getCurrentNationalPriceForecasts, getSourceCounts } from "@/lib/data/prices";
import { getAllDistricts, getCurrentRiskSignals, parseDriver, type RiskCategory } from "@/lib/data/risk";

// Reads approved data from Neon on each request.
export const dynamic = "force-dynamic";

/** Demo default: the district that has sample price data, so the page opens with real content. */
const DEMO_DEFAULT_DISTRICT = "GASABO";

const percent = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "percent", maximumFractionDigits: 1 }).format(Math.abs(value));

const monthYear = (value: Date | string) =>
  new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));

const dayMonthYear = (value: Date | string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Africa/Kigali" }).format(
    new Date(value),
  );

const priceFormat = (value: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value);

export default async function FarmerAdvisoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ district?: string; commodity?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const query = await searchParams;

  const [districts, commodityOptions, counts] = await Promise.all([
    getAllDistricts(),
    getAllCommodities(),
    getSourceCounts(),
  ]);

  const district =
    districts.find((d) => d.code === query.district) ??
    districts.find((d) => d.code === DEMO_DEFAULT_DISTRICT) ??
    districts[0];
  const commodity =
    commodityOptions.find((c) => c.code === query.commodity) ??
    commodityOptions.find((c) => c.category === "crop") ??
    commodityOptions[0];
  if (!district || !commodity) notFound();

  const isLivestock = commodity.category === "livestock";
  const cropName = (c: { nameEn: string; nameRw: string }) => (locale === "rw" ? c.nameRw : c.nameEn);
  const districtName = (d: { nameEn: string; nameRw: string }) => (locale === "rw" ? d.nameRw : d.nameEn);

  const [signals, forecasts] = await Promise.all([
    isLivestock ? Promise.resolve([]) : getCurrentRiskSignals(commodity.code),
    isLivestock ? Promise.resolve([]) : getCurrentNationalPriceForecasts(commodity.code),
  ]);

  const signal = signals.find((s) => s.districtCode === district.code);
  const category: RiskCategory = isLivestock ? "unavailable" : ((signal?.category as RiskCategory) ?? "unavailable");
  const driver = parseDriver(signal?.driverSummary ?? null);

  const changeText = driver
    ? driver.changePct > 0.005
      ? t.national.evidence.riseText.replace("{percent}", percent(driver.changePct))
      : driver.changePct < -0.005
        ? t.national.evidence.fallText.replace("{percent}", percent(driver.changePct))
        : t.national.evidence.flatText
    : null;

  // ----- SMS preview: built from the same values the advisory shows -----
  const signalLabel = signal ? t.national.categories[category] : null;
  const smsValues = {
    district: districtName(district),
    crop: cropName(commodity),
    signal: signalLabel,
    status: driver?.basedOnSample ? t.advisory.smsStatus.sample : t.advisory.smsStatus.observed,
    period: signal ? monthYear(signal.periodEnd) : "",
    updated: signal ? dayMonthYear(signal.createdAt) : "",
  };
  const smsEn = buildSms(signal ? t.advisory.sms.withSignal : t.advisory.sms.noSignal, smsValues);
  const smsRw = buildSms(signal ? t.advisory.sms.withSignalRw : t.advisory.sms.noSignalRw, smsValues);

  const firstForecast = forecasts[0];
  const lastForecast = forecasts[forecasts.length - 1];
  const guidance = t.advisory.guidance[guidanceKey(category, isLivestock)];

  return (
    <div className="flex flex-col gap-8">
      <DataStatusBanner verifiedCount={counts.verified} sampleCount={counts.sample} labels={t.status} />

      <section className="max-w-3xl">
        <h1 className="text-4xl font-semibold md:text-5xl">{t.advisory.title}</h1>
        <p className="mt-4 text-lg text-ink">{t.advisory.intro}</p>
      </section>

      {/* Selectors: a plain GET form, so it works without JavaScript */}
      <form
        method="get"
        action={`/${locale}/farmer`}
        className="grid gap-4 rounded-xl border border-line bg-paper p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="district" className="text-sm font-semibold text-canopy">
            {t.advisory.form.district}
          </label>
          <select
            id="district"
            name="district"
            defaultValue={district.code}
            className="rounded-lg border border-line bg-cream px-3 py-2 text-ink"
          >
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {districtName(d)} ({d.province})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="commodity" className="text-sm font-semibold text-canopy">
            {t.advisory.form.commodity}
          </label>
          <select
            id="commodity"
            name="commodity"
            defaultValue={commodity.code}
            className="rounded-lg border border-line bg-cream px-3 py-2 text-ink"
          >
            {commodityOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {cropName(c)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-full bg-canopy px-5 py-2 font-semibold text-cream hover:bg-leaf"
        >
          {t.advisory.form.submit}
        </button>
      </form>

      <section aria-labelledby="conditions-title" className="flex flex-col gap-4">
        <h2 id="conditions-title" className="text-2xl font-semibold">
          {t.advisory.conditions.title}
        </h2>
        <p className="text-base font-semibold text-canopy">
          {districtName(district)}, {district.province} · {cropName(commodity)}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {isLivestock ? (
            <UnavailableCard
            title={t.advisory.conditions.livestock.title}
            body={t.advisory.conditions.livestock.body}
            unavailableLabel={t.status.unavailableLabel}
          />
          ) : (
            <div className="rounded-xl border border-line bg-paper p-5">
              <p className="text-sm text-muted">{t.advisory.conditions.market}</p>
              <div className="mt-2">
                <RiskBadge category={category} label={t.national.categories[category]} />
              </div>
              {driver && changeText ? (
                <>
                  <p className="mt-3 text-sm text-ink">{changeText}</p>
                  <p className="mt-1 text-sm text-ink">
                    <span className="font-semibold">{t.advisory.conditions.priceAverage}:</span>{" "}
                    {priceFormat(driver.recentAverage)}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-sm text-ink">{t.national.evidence.noSignal}</p>
              )}
            </div>
          )}

          <UnavailableCard
            title={t.advisory.conditions.weather.title}
            body={t.advisory.conditions.weather.body}
            unavailableLabel={t.status.unavailableLabel}
          />
          <UnavailableCard
            title={t.advisory.conditions.soil.title}
            body={t.advisory.conditions.soil.body}
            unavailableLabel={t.status.unavailableLabel}
          />
        </div>
      </section>

      <section aria-labelledby="outlook-title" className="rounded-xl border border-line bg-paper p-6">
        <h2 id="outlook-title" className="text-2xl font-semibold">{t.advisory.outlook.title}</h2>
        <p className="mt-2 text-sm text-muted">{t.advisory.outlook.note}</p>
        {isLivestock || !firstForecast || !lastForecast ? (
          <p className="mt-3 text-ink">{t.advisory.outlook.none}</p>
        ) : (
          <p className="mt-3 text-ink">
            {monthYear(firstForecast.horizonStart)} – {monthYear(lastForecast.horizonStart)}:{" "}
            <span className="font-semibold">{priceFormat(firstForecast.pointValue ?? 0)}</span>
            {" → "}
            <span className="font-semibold">{priceFormat(lastForecast.pointValue ?? 0)}</span>{" "}
            {t.market.unitLabel}. {t.advisory.outlook.range}: {priceFormat(firstForecast.lowerBound ?? 0)} –{" "}
            {priceFormat(firstForecast.upperBound ?? 0)} ({monthYear(firstForecast.horizonStart)}).
          </p>
        )}
      </section>

      <section aria-labelledby="guidance-title" className="rounded-xl border-l-4 border-leaf bg-paper p-6">
        <h2 id="guidance-title" className="text-2xl font-semibold">{t.advisory.guidance.title}</h2>
        <p className="mt-2 text-base text-ink">{guidance}</p>
        <p className="mt-3 text-sm font-semibold text-soil">{t.advisory.guidance.note}</p>
      </section>

      <section aria-labelledby="sms-title" className="flex flex-col gap-4">
        <h2 id="sms-title" className="text-2xl font-semibold">{t.advisory.sms.title}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <SmsCard label={t.advisory.sms.englishLabel} sms={smsEn} labels={t.advisory.sms} />
          <SmsCard label={t.advisory.sms.kinyarwandaLabel} sms={smsRw} labels={t.advisory.sms} />
        </div>
        <p className="text-sm font-semibold text-soil">{t.advisory.sms.nothingSent}</p>
      </section>

      <p className="text-sm text-muted">{t.advisory.disclaimer}</p>
    </div>
  );
}

function UnavailableCard({
  title,
  body,
  unavailableLabel,
}: {
  title: string;
  body: string;
  unavailableLabel: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-paper p-5">
      <p className="text-sm text-muted">{title}</p>
      <p className="mt-2 font-semibold text-muted">{unavailableLabel}</p>
      <p className="mt-1 text-sm text-ink">{body}</p>
    </div>
  );
}

function SmsCard({
  label,
  sms,
  labels,
}: {
  label: string;
  sms: { text: string; length: number; fitsOneMessage: boolean };
  labels: { characters: string; longWarning: string };
}) {
  return (
    <figure className="rounded-xl border border-line bg-paper p-5">
      <figcaption className="text-sm font-semibold text-canopy">{label}</figcaption>
      <p className="mt-3 rounded-lg bg-cream p-4 font-mono text-sm text-ink">{sms.text}</p>
      <p className="mt-2 text-xs text-muted">
        {labels.characters}: {sms.length}
        {sms.fitsOneMessage ? null : ` — ${labels.longWarning}`}
      </p>
    </figure>
  );
}
