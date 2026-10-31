"use client";

import Link from "next/link";

export interface ActionCardItem {
  id: string;
  badge: string;
  badgeType: "danger" | "success" | "warning" | "neutral";
  title: string;
  metric: string;
  metricLabel: string;
  context: string;
  ctaText: string;
  ctaHref: string;
}

interface ActionSummaryDeckProps {
  sectionTitle: string;
  sectionSubtitle: string;
  cards: ActionCardItem[];
}

export function ActionSummaryDeck({
  sectionTitle,
  sectionSubtitle,
  cards,
}: ActionSummaryDeckProps) {
  const getBadgeStyle = (type: ActionCardItem["badgeType"]) => {
    switch (type) {
      case "danger":
        return "bg-clay/15 text-clay border-clay/30 font-bold";
      case "success":
        return "bg-sprout text-leaf border-leaf/30 font-bold";
      case "warning":
        return "bg-harvest/20 text-soil border-harvest/40 font-bold";
      case "neutral":
      default:
        return "bg-cream text-muted border-line";
    }
  };

  const getCtaStyle = (type: ActionCardItem["badgeType"]) => {
    switch (type) {
      case "danger":
        return "bg-clay text-cream hover:bg-clay/90 shadow-xs focus-visible:ring-clay";
      case "success":
        return "bg-leaf text-cream hover:bg-forest shadow-xs focus-visible:ring-leaf";
      case "warning":
        return "bg-soil text-cream hover:bg-soil/90 shadow-xs focus-visible:ring-soil";
      case "neutral":
      default:
        return "bg-canopy text-cream hover:bg-canopy/90 shadow-xs focus-visible:ring-canopy";
    }
  };

  return (
    <section
      aria-label={sectionTitle}
      className="@container rounded-3xl border border-line bg-paper p-6 shadow-sm sm:p-7"
      style={{ containerType: "inline-size" }}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between border-b border-line/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-clay opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-clay"></span>
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-canopy tracking-tight">
            {sectionTitle}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted">
          {sectionSubtitle}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 @lg:grid-cols-2 @2xl:grid-cols-3">
        {cards.map((card, idx) => (
          <article
            key={card.id}
            className="flex flex-col justify-between rounded-2xl border border-line/80 bg-cream/20 p-4 transition-all hover:border-canopy/40 hover:bg-cream/40"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-muted">
                  0{idx + 1}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-wider ${getBadgeStyle(
                    card.badgeType
                  )}`}
                >
                  {card.badge}
                </span>
              </div>

              <h3 className="mt-2 text-base font-bold text-canopy line-clamp-1">
                {card.title}
              </h3>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-ink font-mono">
                  {card.metric}
                </span>
                <span className="text-xs text-muted font-medium">
                  {card.metricLabel}
                </span>
              </div>

              <p className="mt-2 text-xs text-muted leading-relaxed line-clamp-2">
                {card.context}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-line/50">
              <Link
                href={card.ctaHref}
                className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-[0.98] ${getCtaStyle(
                  card.badgeType
                )}`}
              >
                <span>{card.ctaText}</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
