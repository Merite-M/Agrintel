import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.siteName,
    description: t.tagline,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typedLocale: Locale = locale;
  const t = getDictionary(typedLocale);

  return (
    <html
      lang={typedLocale}
      className={`${fraunces.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-paper focus:px-4 focus:py-2 focus:text-canopy"
        >
          {t.skipToContent}
        </a>

        <header className="bg-canopy text-cream">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <Link href={`/${typedLocale}`} className="font-display text-xl font-semibold">
              {t.siteName}
            </Link>

            <nav aria-label={t.language.label} className="flex items-center gap-2 text-sm">
              <span className="sr-only">{t.language.label}</span>
              {locales.map((option) => {
                const active = option === typedLocale;
                const label = option === "en" ? t.language.en : t.language.rw;
                return (
                  <Link
                    key={option}
                    href={`/${option}`}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-full px-3 py-1 ${
                      active
                        ? "bg-harvest font-semibold text-canopy"
                        : "border border-cream/40 text-cream hover:bg-leaf"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <nav aria-label={t.siteName} className="border-b border-line bg-paper">
          <ul className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-2 px-4 py-3 text-sm font-semibold text-canopy">
            {[
              { href: `/${typedLocale}`, label: t.nav.overview },
              { href: `/${typedLocale}/market`, label: t.nav.market },
              { href: `/${typedLocale}/national`, label: t.nav.national },
              { href: `/${typedLocale}/farmer`, label: t.nav.farmer },
              { href: `/${typedLocale}/retailer`, label: t.nav.retailer },
              { href: `/${typedLocale}/alerts`, label: t.nav.alerts },
              { href: `/${typedLocale}/methodology`, label: t.nav.methodology },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-leaf hover:underline underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-line bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">
            <p>{t.tagline}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
