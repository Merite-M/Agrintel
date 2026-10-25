import Link from "next/link";
import { notFound } from "next/navigation";
import { DataStatusBanner } from "@/components/data-status-banner";
import { RiskBadge } from "@/components/risk-badge";
import { getDictionary, isLocale } from "@/lib/i18n";
import { getCropOptions, getCurrentNationalPriceForecasts, getSourceCounts } from "@/lib/data/prices";
import { getAllDistricts, getCurrentRiskSignals, parseDriver, type RiskCategory } from "@/lib/data/risk";

// Reads approved data from Neon on each request.
export const dynamic = "force-dynamic";

const priceFormat = (value: number) => new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value);

const monthYear = (value: Date | string) =>
  new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));

export default async function RetailerSupplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ commodity?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);
  const query = await searchParams;

  const [crops, districts, counts] = await Promise.all([getCropOptions(), getAllDistricts(), getSourceCounts()]);
  const crop = crops.find((c) => c.code === query.commodity) ?? crops[0];
  if (!crop) notFound();

  const [signals, forecasts] = await Promise.all([
    getCurrentRiskSignals(crop.code),
    getCurrentNationalPriceForecasts(crop.code),
  ]);
  const signalByDistrict = new Map(signals.map((s) => [s.districtCode, s]));

  const cropName = (c: { nameEn: string; nameRw: string }) => (locale === "rw" ? c.nameRw : c.nameEn);
  const districtName = (d: { nameEn: string; nameRw: string }) => (locale === "rw" ? d.nameRw : d.nameEn);

  // Only districts with evidence are compared on price; the rest stay visible as unavailable.
  const rows = districts.map((d) => {
    const signal = signalByDistrict.get(d.code);
    const category: RiskCategory = (signal?.category as RiskCategory) ?? "unavailable";
    const driver = parseDriver(signal?.driverSummary ?? null);
    return { district: d, category, driver };
  });

  const comparable = rows.filter((r) => r.driver !== null).length;

  const firstForecast = forecasts[0];
  const lastForecast = forecasts[forecasts.length - 1];

  return (
    <div className="flex flex-col gap-8">
      <DataStatusBanner verifiedCount={counts.verified} sampleCount={counts.sample} labels={t.status} />

      <section className="max-w-3xl">
        <h1 className="text-4xl font-semibold md:text-5xl">{t.retailer.title}</h1>
        <p className="mt-4 text-lg text-ink">{t.retailer.intro}</p>
        <p className="mt-3 text-sm text-muted">{t.retailer.readOnly}</p>
      </section>

      <nav aria-label={t.retailer.selectCommodity} className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-canopy">{t.retailer.selectCommodity}</span>
        <div className="flex flex-wrap gap-2">
          {crops.map((c) => {
            const active = c.code === crop.code;
            return (
              <Link
                key={c.code}
                href={`/${locale}/retailer?commodity=${c.code}`}
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

      <section aria-labelledby="outlook-title" className="rounded-xl border border-line bg-paper p-6">
        <h2 id="outlook-title" className="text-2xl font-semibold">{t.retailer.outlook.title}</h2>
        <p className="mt-2 text-sm text-muted">{t.retailer.outlook.note}</p>
        {firstForecast && lastForecast ? (
          <p className="mt-3 text-ink">
            {monthYear(firstForecast.horizonStart)} – {monthYear(lastForecast.horizonStart)}:{" "}
            <span className="font-semibold">{priceFormat(firstForecast.pointValue ?? 0)}</span> →{" "}
            <span className="font-semibold">{priceFormat(lastForecast.pointValue ?? 0)}</span> {t.market.unitLabel}
          </p>
        ) : (
          <p className="mt-3 text-ink">{t.retailer.outlook.none}</p>
        )}
      </section>

      <section aria-labelledby="table-title" className="flex flex-col gap-3">
        <h2 id="table-title" className="text-2xl font-semibold">{t.retailer.tableTitle}</h2>
        <p className="text-sm text-muted">
          {t.retailer.comparable.replace("{count}", String(comparable)).replace("{total}", String(districts.length))}
        </p>

        <div className="overflow-x-auto rounded-xl border border-line bg-paper">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th scope="col" className="px-4 py-3 font-semibold">{t.retailer.columns.district}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{t.retailer.columns.price}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{t.retailer.columns.priceSignal}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{t.retailer.columns.supply}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{t.retailer.columns.sourcing}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ district, category, driver }) => (
                <tr key={district.code} className="border-b border-line/60">
                  <th scope="row" className="px-4 py-3 font-semibold text-canopy">
                    {districtName(district)}
                    <span className="block text-xs font-normal text-muted">{district.province}</span>
                  </th>
                  <td className="px-4 py-3 text-ink">
                    {driver ? `${priceFormat(driver.recentAverage)} ${t.market.unitLabel}` : t.status.unavailableLabel}
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge category={category} label={t.national.categories[category]} />
                  </td>
                  <td className="px-4 py-3 text-muted">{t.retailer.supplyUnavailable}</td>
                  <td className="px-4 py-3 text-muted">{t.retailer.sourcingUnavailable}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-line bg-paper p-5 text-sm text-ink">
          <h3 className="font-semibold text-canopy">{t.retailer.howToRead.title}</h3>
          <p className="mt-2">{t.retailer.howToRead.body}</p>
        </div>
      </section>
    </div>
  );
}
