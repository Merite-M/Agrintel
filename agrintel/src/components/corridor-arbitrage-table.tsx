"use client";

import { useState, useTransition } from "react";
import {
  type CorridorArbitrageRecord,
  FUEL_PRICES,
  simulateCustomFuelPrice,
} from "@/lib/data/spatial-arbitrage";

interface CorridorArbitrageTableProps {
  initialCorridors: CorridorArbitrageRecord[];
  commodityCode: string;
  labels: {
    sliderTitle: string;
    sliderHelp: string;
    regulatedBtn: string;
    unsubsidizedBtn: string;
    currentFuelPrice: string;
    perLitre: string;
    subsidyImpact: string;
    columns: {
      corridor: string;
      distance: string;
      farmgatePrice: string;
      retailPrice: string;
      freightCost: string;
      netMargin: string;
      compression: string;
      breakeven: string;
      action: string;
    };
    recommendations: {
      DISPATCH_SURPLUS: string;
      MODERATE_MARGIN: string;
      HOLD_LOCAL: string;
    };
    howToRead: {
      title: string;
      body: string;
    };
  };
}

export function CorridorArbitrageTable({
  initialCorridors,
  labels,
}: CorridorArbitrageTableProps) {
  const [fuelPrice, setFuelPrice] = useState<number>(FUEL_PRICES.regulated);
  const [, startTransition] = useTransition();

  const handlePriceChange = (val: number) => {
    startTransition(() => {
      setFuelPrice(val);
    });
  };

  const isRegulated = fuelPrice === FUEL_PRICES.regulated;
  const isUnsubsidized = fuelPrice === FUEL_PRICES.unsubsidized;

  const priceFormat = (n: number) =>
    new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex flex-col gap-6">
      {/* Interactive Fuel Stress Slider Island */}
      <section
        aria-label={labels.sliderTitle}
        className="rounded-2xl border border-line bg-paper p-6 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-canopy">{labels.sliderTitle}</h3>
            <p className="mt-1 text-sm text-muted">{labels.sliderHelp}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handlePriceChange(FUEL_PRICES.regulated)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                isRegulated
                  ? "bg-canopy text-cream shadow"
                  : "border border-line bg-cream/50 text-canopy hover:border-leaf"
              }`}
            >
              {labels.regulatedBtn}
            </button>
            <button
              type="button"
              onClick={() => handlePriceChange(FUEL_PRICES.unsubsidized)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                isUnsubsidized
                  ? "bg-clay text-cream shadow"
                  : "border border-line bg-cream/50 text-canopy hover:border-clay"
              }`}
            >
              {labels.unsubsidizedBtn}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center gap-6">
          <div className="flex-1">
            <input
              type="range"
              min={2000}
              max={4500}
              step={50}
              value={fuelPrice}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-line accent-canopy"
              aria-label={labels.currentFuelPrice}
            />
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>2,000 Rwf/L</span>
              <span className="font-semibold text-canopy">2,927 (Regulated)</span>
              <span className="font-semibold text-clay">3,600 (Unsubsidized)</span>
              <span>4,500 Rwf/L</span>
            </div>
          </div>

          <div className="rounded-xl border border-line/80 bg-cream/40 px-5 py-3 text-center min-w-[14rem]">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              {labels.currentFuelPrice}
            </span>
            <div className="text-2xl font-bold text-canopy">
              {priceFormat(fuelPrice)}{" "}
              <span className="text-sm font-normal text-ink">{labels.perLitre}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Corridors Table */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-paper shadow-sm">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-cream/20 text-muted font-semibold">
              <th scope="col" className="px-4 py-3">{labels.columns.corridor}</th>
              <th scope="col" className="px-4 py-3">{labels.columns.distance}</th>
              <th scope="col" className="px-4 py-3">{labels.columns.farmgatePrice}</th>
              <th scope="col" className="px-4 py-3">{labels.columns.retailPrice}</th>
              <th scope="col" className="px-4 py-3">{labels.columns.freightCost}</th>
              <th scope="col" className="px-4 py-3">{labels.columns.netMargin}</th>
              <th scope="col" className="px-4 py-3">{labels.columns.breakeven}</th>
              <th scope="col" className="px-4 py-3">{labels.columns.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {initialCorridors.map((corridor) => {
              const sim = simulateCustomFuelPrice(corridor, fuelPrice);
              const isProfitable = sim.netMargin >= 40;
              const isModerate = sim.netMargin >= 10 && sim.netMargin < 40;

              return (
                <tr
                  key={`${corridor.origin_district_code}_${corridor.destination_code}`}
                  className="hover:bg-cream/30 transition-colors"
                >
                  <th scope="row" className="px-4 py-3.5 font-semibold text-canopy">
                    <span className="text-base">{corridor.origin_district_code}</span>
                    <span className="mx-1.5 text-muted">→</span>
                    <span className="text-ink font-medium">{corridor.destination_code}</span>
                    <span className="block text-xs font-normal text-muted mt-0.5">
                      {corridor.destination_name}
                    </span>
                  </th>
                  <td className="px-4 py-3 text-ink">
                    <div>{corridor.distance_km} km</div>
                    <span className="text-xs text-clay">
                      -{corridor.spoilage_loss_pct.toFixed(1)}% spoilage
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink font-mono">
                    {priceFormat(corridor.farmgate_price_origin)} Rwf
                  </td>
                  <td className="px-4 py-3 text-ink font-mono">
                    {priceFormat(corridor.retail_price_dest)} Rwf
                  </td>
                  <td className="px-4 py-3 font-mono text-muted">
                    {sim.freightCost.toFixed(1)} Rwf/kg
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span
                      className={`font-semibold text-base ${
                        isProfitable
                          ? "text-leaf"
                          : isModerate
                          ? "text-harvest"
                          : "text-clay"
                      }`}
                    >
                      {sim.netMargin > 0 ? `+${sim.netMargin.toFixed(1)}` : sim.netMargin.toFixed(1)}
                    </span>{" "}
                    <span className="text-xs text-muted">Rwf/kg</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted font-mono">
                    {corridor.breakeven_diesel_price > 0 && corridor.breakeven_diesel_price < 20000
                      ? `${priceFormat(corridor.breakeven_diesel_price)} Rwf/L`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                        isProfitable
                          ? "bg-sprout text-leaf"
                          : isModerate
                          ? "bg-harvest/20 text-soil"
                          : "bg-clay/15 text-clay"
                      }`}
                    >
                      {labels.recommendations[sim.recommendation]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Explanatory Footer */}
      <section className="rounded-2xl border border-line bg-paper p-5 text-sm text-ink shadow-sm">
        <h4 className="font-semibold text-canopy">{labels.howToRead.title}</h4>
        <p className="mt-2 text-muted leading-relaxed">{labels.howToRead.body}</p>
      </section>
    </div>
  );
}
