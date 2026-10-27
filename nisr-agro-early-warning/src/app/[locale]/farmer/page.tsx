import { notFound } from "next/navigation";
import { DataStatusBanner } from "@/components/data-status-banner";
import { RiskBadge } from "@/components/risk-badge";
import { CropSelectorCards } from "@/components/crop-cards";
import { ActionRecommendationCard } from "@/components/action-badge";
import { AudioAdvisoryPlayer } from "@/components/audio-advisory";
import { buildSms, guidanceKey } from "@/lib/advisory";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getAllCommodities } from "@/lib/data/advisory";
import { getCurrentNationalPriceForecasts, getSourceCounts } from "@/lib/data/prices";
import { getAllDistricts, getCurrentRiskSignals, parseDriver, type RiskCategory } from "@/lib/data/risk";

// Reads approved data from Neon on each request.
export const dynamic = "force-dynamic";

/** Default district: one of the six with recent WFP potato prices, so the page opens with real data. */
const DEMO_DEFAULT_DISTRICT = "GISAGARA";

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
  const cropName = locale === "rw" ? commodity.nameRw : commodity.nameEn;
  const districtName = locale === "rw" ? district.nameRw : district.nameEn;

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

  // Build audio text for automated speech synthesis
  let speechSummary = "";
  if (locale === "rw") {
    if (isLivestock) {
      speechSummary = `Inama ku bahinzi n'aborozi. Akarere ka ${districtName}, amatungo: ${cropName}. ${t.advisory.guidance.livestock}`;
    } else if (driver && driver.changePct >= 0.08) {
      speechSummary = `Inama ku bahinzi. Akarere ka ${districtName}, igihingwa cy' ${cropName}. Icyemezo: GURISHA UBU. Ibiciro birazamuka ku isoko, impuzandengo ni amafaranga ${priceFormat(driver.recentAverage)} kuri kilo. ${t.advisory.action.sellAdvice.replace("{percent}", percent(driver.changePct))}`;
    } else if (driver && driver.changePct <= -0.05) {
      speechSummary = `Inama ku bahinzi. Akarere ka ${districtName}, igihingwa cy' ${cropName}. Icyemezo: BIKA UMUSARURO. Ibiciro biragabanuka, impuzandengo ni amafaranga ${priceFormat(driver.recentAverage)} kuri kilo. ${t.advisory.action.storeAdvice.replace("{percent}", percent(driver.changePct))}`;
    } else if (driver) {
      speechSummary = `Inama ku bahinzi. Akarere ka ${districtName}, igihingwa cy' ${cropName}. Icyemezo: TEGEREZA CYANGWA GURISHA BISANZWE. Ibiciro biratuje, impuzandengo ni amafaranga ${priceFormat(driver.recentAverage)} kuri kilo. ${t.advisory.action.monitorAdvice.replace("{percent}", percent(driver.changePct))}`;
    } else {
      speechSummary = `Inama ku bahinzi. Akarere ka ${districtName}, igihingwa cy' ${cropName}. ${t.advisory.guidance.unavailable}`;
    }
  } else {
    if (isLivestock) {
      speechSummary = `Farmer advisory for ${districtName} district, ${cropName}. ${t.advisory.guidance.livestock}`;
    } else if (driver && driver.changePct >= 0.08) {
      speechSummary = `Farmer advisory for ${districtName} district, ${cropName}. Recommendation: SELL NOW. Market prices are rising, current average is ${priceFormat(driver.recentAverage)} Rwandan Francs per kilo. ${t.advisory.action.sellAdvice.replace("{percent}", percent(driver.changePct))}`;
    } else if (driver && driver.changePct <= -0.05) {
      speechSummary = `Farmer advisory for ${districtName} district, ${cropName}. Recommendation: STORE AND WAIT. Market prices are declining, current average is ${priceFormat(driver.recentAverage)} Rwandan Francs per kilo. ${t.advisory.action.storeAdvice.replace("{percent}", percent(driver.changePct))}`;
    } else if (driver) {
      speechSummary = `Farmer advisory for ${districtName} district, ${cropName}. Recommendation: REGULAR MARKETING. Prices are stable, current average is ${priceFormat(driver.recentAverage)} Rwandan Francs per kilo. ${t.advisory.action.monitorAdvice.replace("{percent}", percent(driver.changePct))}`;
    } else {
      speechSummary = `Farmer advisory for ${districtName} district, ${cropName}. ${t.advisory.guidance.unavailable}`;
    }
  }

  // ----- SMS preview: built from the same values the advisory shows -----
  const signalLabel = signal ? t.national.categories[category] : null;
  const smsValues = {
    district: districtName,
    crop: cropName,
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

      {/* Header section with Kinyarwanda-first presentation */}
      <section className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-sprout px-3 py-1 text-xs font-bold uppercase tracking-wider text-canopy">
          {locale === "rw" ? "Ubufasha ku bahinzi" : "Farmer Intelligence"}
        </div>
        <h1 className="mt-2 text-4xl font-extrabold text-canopy md:text-5xl">
          {locale === "rw" ? "Inama ku Bahinzi n'Ibyemezo by'Isoko" : t.advisory.title}
        </h1>
        <p className="mt-4 text-lg text-ink leading-relaxed">
          {locale === "rw"
            ? "Amakuru yihuse kandi asobanutse ku masoko yo mu karere kawe, ifoto y'ibihingwa, n'inama zisomerwa mu majwi ku muturage wese."
            : t.advisory.intro}
        </p>
      </section>

      {/* 1. Large Photographic Crop Selector Cards */}
      <CropSelectorCards
        commodities={commodityOptions}
        selectedCode={commodity.code}
        districtCode={district.code}
        locale={locale}
        labels={t.advisory.cropCards}
      />

      {/* 2. Simplified Sell / Store / Buy Recommendation Badge + Price Changes */}
      <ActionRecommendationCard
        category={category}
        driver={driver}
        isLivestock={isLivestock}
        locale={locale}
        cropName={cropName}
        districtName={districtName}
        labels={t.advisory.action}
      />

      {/* 3. Audio Playback Integration (Automated Text-to-Speech) */}
      <AudioAdvisoryPlayer
        locale={locale}
        cropName={cropName}
        districtName={districtName}
        speechText={speechSummary}
        labels={t.advisory.audio}
      />

      {/* District Quick Switcher Form */}
      <form
        method="get"
        action={`/${locale}/farmer`}
        className="grid gap-4 rounded-2xl border border-line bg-paper p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end shadow-xs"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="district" className="text-sm font-bold text-canopy">
            {locale === "rw" ? "Hindura akarere kawe:" : t.advisory.form.district}
          </label>
          <select
            id="district"
            name="district"
            defaultValue={district.code}
            className="rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm font-medium text-ink focus:ring-2 focus:ring-canopy"
          >
            {districts.map((d) => (
              <option key={d.code} value={d.code}>
                {locale === "rw" ? d.nameRw : d.nameEn} ({d.province})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="commodity" className="text-sm font-bold text-canopy">
            {locale === "rw" ? "Igihingwa:" : t.advisory.form.commodity}
          </label>
          <select
            id="commodity"
            name="commodity"
            defaultValue={commodity.code}
            className="rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm font-medium text-ink focus:ring-2 focus:ring-canopy"
          >
            {commodityOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {locale === "rw" ? c.nameRw : c.nameEn} ({c.category})
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-canopy px-6 py-2.5 font-bold text-cream hover:bg-leaf transition-colors cursor-pointer"
        >
          {t.advisory.form.submit}
        </button>
      </form>

      {/* Local Conditions & Provenance */}
      <section aria-labelledby="conditions-title" className="flex flex-col gap-4">
        <h2 id="conditions-title" className="text-2xl font-bold text-canopy">
          {t.advisory.conditions.title}
        </h2>
        <p className="text-base font-semibold text-soil">
          {districtName}, {district.province} · {cropName}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {isLivestock ? (
            <UnavailableCard
              title={t.advisory.conditions.livestock.title}
              body={t.advisory.conditions.livestock.body}
              unavailableLabel={t.status.unavailableLabel}
            />
          ) : (
            <div className="rounded-2xl border border-line bg-paper p-5 shadow-xs">
              <p className="text-xs font-semibold uppercase text-muted tracking-wider">
                {t.advisory.conditions.market}
              </p>
              <div className="mt-2.5">
                <RiskBadge category={category} label={t.national.categories[category]} />
              </div>
              {driver && changeText ? (
                <>
                  <p className="mt-3 text-sm text-ink font-medium">{changeText}</p>
                  <p className="mt-1.5 text-sm text-ink">
                    <span className="font-bold">{t.advisory.conditions.priceAverage}:</span>{" "}
                    {priceFormat(driver.recentAverage)} RWF/kg
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

      {/* National Outlook */}
      <section aria-labelledby="outlook-title" className="rounded-2xl border border-line bg-paper p-6 shadow-xs">
        <h2 id="outlook-title" className="text-2xl font-bold text-canopy">{t.advisory.outlook.title}</h2>
        <p className="mt-2 text-sm text-muted">{t.advisory.outlook.note}</p>
        {isLivestock || !firstForecast || !lastForecast ? (
          <p className="mt-3 text-ink">{t.advisory.outlook.none}</p>
        ) : (
          <p className="mt-3 text-ink font-medium">
            {monthYear(firstForecast.horizonStart)} – {monthYear(lastForecast.horizonStart)}:{" "}
            <span className="font-bold text-canopy">{priceFormat(firstForecast.pointValue ?? 0)}</span>
            {" → "}
            <span className="font-bold text-canopy">{priceFormat(lastForecast.pointValue ?? 0)}</span>{" "}
            {t.market.unitLabel}. {t.advisory.outlook.range}: {priceFormat(firstForecast.lowerBound ?? 0)} –{" "}
            {priceFormat(firstForecast.upperBound ?? 0)} ({monthYear(firstForecast.horizonStart)}).
          </p>
        )}
      </section>

      {/* Advisory Guidance */}
      <section aria-labelledby="guidance-title" className="rounded-2xl border-l-4 border-leaf bg-paper p-6 shadow-xs">
        <h2 id="guidance-title" className="text-2xl font-bold text-canopy">{t.advisory.guidance.title}</h2>
        <p className="mt-2 text-base text-ink leading-relaxed">{guidance}</p>
        <p className="mt-3 text-xs font-semibold text-soil">{t.advisory.guidance.note}</p>
      </section>

      {/* SMS & Simple Phone Delivery Preview */}
      <section aria-labelledby="sms-title" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 id="sms-title" className="text-2xl font-bold text-canopy">{t.advisory.sms.title}</h2>
          <span className="rounded-full bg-sprout px-3 py-1 text-xs font-semibold text-canopy">
            GSM SMS
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SmsCard label={t.advisory.sms.kinyarwandaLabel} sms={smsRw} labels={t.advisory.sms} />
          <SmsCard label={t.advisory.sms.englishLabel} sms={smsEn} labels={t.advisory.sms} />
        </div>
        <p className="text-xs font-semibold text-soil">{t.advisory.sms.nothingSent}</p>
      </section>

      <p className="text-xs text-muted leading-normal">{t.advisory.disclaimer}</p>
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
    <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-5">
      <p className="text-xs font-semibold uppercase text-muted tracking-wider">{title}</p>
      <p className="mt-2 font-bold text-muted">{unavailableLabel}</p>
      <p className="mt-1 text-xs text-ink/80">{body}</p>
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
    <figure className="rounded-2xl border border-line bg-paper p-5 shadow-xs">
      <figcaption className="text-sm font-bold text-canopy flex items-center justify-between">
        <span>{label}</span>
        <span className="text-xs font-normal text-muted">Telefoni isanzwe</span>
      </figcaption>
      <p className="mt-3 rounded-xl bg-cream p-4 font-mono text-sm text-ink leading-relaxed border border-line/60">
        {sms.text}
      </p>
      <p className="mt-2 text-xs text-muted">
        {labels.characters}: {sms.length}
        {sms.fitsOneMessage ? null : ` — ${labels.longWarning}`}
      </p>
    </figure>
  );
}
