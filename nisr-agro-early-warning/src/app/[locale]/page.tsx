import Link from "next/link";
import { notFound } from "next/navigation";
import { count, eq, max } from "drizzle-orm";
import { db, schema } from "@/db";
import { DataStatusBanner } from "@/components/data-status-banner";
import { getDictionary, isLocale } from "@/lib/i18n";

// The welcome page reads live counts from Neon, so it must render per request.
export const dynamic = "force-dynamic";

const { sources, rawImports } = schema;

const cardKeys = [
  { key: "national", path: "national" },
  { key: "market", path: "market" },
  { key: "retailer", path: "retailer" },
  { key: "farmer", path: "farmer" },
] as const;

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  const [verified] = await db
    .select({ value: count() })
    .from(sources)
    .where(eq(sources.accessStatus, "verified"));

  const [sample] = await db
    .select({ value: count() })
    .from(sources)
    .where(eq(sources.accessStatus, "sample"));

  const [latest] = await db
    .select({ value: max(rawImports.approvedAt) })
    .from(rawImports)
    .where(eq(rawImports.status, "approved"));

  const latestUpdate = latest?.value
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Kigali",
      }).format(new Date(latest.value))
    : null;

  return (
    <div className="flex flex-col gap-8">
      <DataStatusBanner
        verifiedCount={verified?.value ?? 0}
        sampleCount={sample?.value ?? 0}
        labels={t.status}
      />

      <section className="max-w-3xl">
        <h1 className="text-4xl font-semibold md:text-5xl">{t.welcome.title}</h1>
        <p className="mt-4 text-lg text-ink">{t.welcome.intro}</p>
        <p className="mt-3 text-sm text-muted">{t.welcome.disclaimer}</p>
        <p className="mt-4 text-sm text-ink">
          <span className="font-semibold">{t.welcome.latestUpdate}:</span>{" "}
          {latestUpdate ?? t.welcome.latestUpdateNone}
        </p>
      </section>

      <section aria-label={t.welcome.title} className="grid gap-4 sm:grid-cols-2">
        {cardKeys.map(({ key, path }) => {
          const card = t.welcome.cards[key];
          return (
            <Link
              key={key}
              href={`/${locale}/${path}`}
              className="group rounded-xl border border-line bg-paper p-6 shadow-sm transition hover:border-leaf hover:shadow-md"
            >
              <h2 className="text-2xl font-semibold text-canopy group-hover:text-leaf">
                {card.title}
              </h2>
              <p className="mt-2 text-base text-ink">{card.body}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
