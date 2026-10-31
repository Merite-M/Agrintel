"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  type CorridorArbitrageRecord,
  FUEL_PRICES,
  simulateCustomFuelPrice,
} from "@/lib/data/spatial-arbitrage";

interface CorridorArbitrageTableProps {
  initialCorridors: CorridorArbitrageRecord[];
  commodityCode: string;
  locale?: string;
  labels: {
    sliderTitle: string;
    sliderHelp: string;
    regulatedBtn: string;
    unsubsidizedBtn: string;
    currentFuelPrice: string;
    perLitre: string;
    subsidyImpact: string;
    truckSize?: string;
    truckSizes?: {
      pickup?: string;
      canter?: string;
      fuso?: string;
      heavy?: string;
    };
    alertShipBtn?: string;
    holdBtn?: string;
    reviewBtn?: string;
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
  commodityCode,
  locale = "en",
  labels,
}: CorridorArbitrageTableProps) {
  const [fuelPrice, setFuelPrice] = useState<number>(FUEL_PRICES.regulated);
  const [truckPayload, setTruckPayload] = useState<number>(5000);
  const [, startTransition] = useTransition();

  const handlePriceChange = (val: number) => {
    startTransition(() => {
      setFuelPrice(val);
    });
  };

  const handleTruckChange = (val: number) => {
    startTransition(() => {
      setTruckPayload(val);
    });
  };

  const isRegulated = fuelPrice === FUEL_PRICES.regulated;
  const isUnsubsidized = fuelPrice === FUEL_PRICES.unsubsidized;
  const isShock = fuelPrice === 4000;

  const priceFormat = (n: number) =>
    new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n);

  // Live route profitability breakdown under current fuel price
  const routeStats = initialCorridors.reduce(
    (acc, corridor) => {
      const sim = simulateCustomFuelPrice(corridor, fuelPrice, truckPayload);
      if (sim.recommendation === "DISPATCH_SURPLUS") acc.dispatch += 1;
      else if (sim.recommendation === "MODERATE_MARGIN") acc.moderate += 1;
      else acc.hold += 1;
      return acc;
    },
    { dispatch: 0, moderate: 0, hold: 0 }
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Interactive Fuel & Truck Stress Slider Island */}
      <section
        aria-label={labels.sliderTitle}
        className="@container rounded-3xl border border-line/80 bg-paper p-6 shadow-xs"
        style={{ containerType: "inline-size" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-canopy/10 px-2.5 py-0.5 text-xs font-bold text-canopy uppercase tracking-wider">
                Live Spatial Solver
              </span>
              <span className="text-xs text-muted font-medium">
                0.32 L/km burn · Round-trip freight impedance
              </span>
            </div>
            <h3 className="mt-1 text-xl sm:text-2xl font-black text-canopy">
              {labels.sliderTitle}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              {labels.sliderHelp}
            </p>
          </div>

          {/* Quick Fuel Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handlePriceChange(FUEL_PRICES.regulated)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isRegulated
                  ? "bg-canopy text-cream shadow-xs"
                  : "border border-line bg-cream/50 text-canopy hover:border-leaf"
              }`}
            >
              {labels.regulatedBtn}
            </button>
            <button
              type="button"
              onClick={() => handlePriceChange(FUEL_PRICES.unsubsidized)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isUnsubsidized
                  ? "bg-clay text-cream shadow-xs"
                  : "border border-line bg-cream/50 text-canopy hover:border-clay"
              }`}
            >
              {labels.unsubsidizedBtn}
            </button>
            <button
              type="button"
              onClick={() => handlePriceChange(4000)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isShock
                  ? "bg-soil text-cream shadow-xs"
                  : "border border-line bg-cream/50 text-soil hover:border-harvest"
              }`}
            >
              {locale === "rw" ? "Igiciro Cyiyongereye (Rwf 4,000)" : "Severe Shock (Rwf 4,000)"}
            </button>
          </div>
        </div>

        {/* Dual Controls: Fuel Range Slider & Truck Payload Size Selector */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Fuel Slider */}
          <div className="flex flex-col justify-center rounded-2xl border border-line/70 bg-cream/20 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-canopy mb-2">
              <span className="uppercase tracking-wider font-bold">{labels.currentFuelPrice}:</span>
              <span className="font-mono text-base font-extrabold text-canopy tabular-nums">
                {priceFormat(fuelPrice)} <span className="text-xs font-normal text-muted">{labels.perLitre}</span>
              </span>
            </div>
            <input
              type="range"
              min={2500}
              max={4000}
              step={25}
              value={fuelPrice}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-line accent-canopy"
              aria-label={labels.currentFuelPrice}
            />
            <div className="mt-2 flex justify-between text-[11px] text-muted font-mono tabular-nums">
              <span>2,500 Rwf</span>
              <span className="font-bold text-canopy">2,927 (Regulated)</span>
              <span className="font-bold text-clay">3,600 (Unsubsidized)</span>
              <span>4,000 Rwf</span>
            </div>
          </div>

          {/* Truck Payload Size Selector */}
          <div className="flex flex-col justify-center rounded-2xl border border-line/70 bg-cream/20 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-canopy mb-2">
              {labels.truckSize ?? "Truck Freight Load Capacity"}
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { weight: 1500, label: labels.truckSizes?.pickup ?? "1.5T (Pickup)" },
                { weight: 3500, label: labels.truckSizes?.canter ?? "3.5T (Canter)" },
                { weight: 5000, label: labels.truckSizes?.fuso ?? "5.0T (Fuso)" },
                { weight: 10000, label: labels.truckSizes?.heavy ?? "10.0T (Heavy)" },
              ].map((truck) => {
                const isSelected = truckPayload === truck.weight;
                return (
                  <button
                    key={truck.weight}
                    type="button"
                    onClick={() => handleTruckChange(truck.weight)}
                    className={`rounded-xl px-2 py-2 text-xs font-bold transition-all cursor-pointer text-center ${
                      isSelected
                        ? "bg-canopy text-cream shadow-xs"
                        : "border border-line bg-paper text-ink hover:border-canopy"
                    }`}
                  >
                    {truck.label}
                  </button>
                );
              })}
            </div>
            <span className="mt-2 text-[11px] text-muted">
              Payload divisor: <span className="font-mono font-semibold text-ink tabular-nums">{priceFormat(truckPayload)} kg</span> (affects freight cost/kg).
            </span>
          </div>
        </div>

        {/* Live Corridor Impact Telemetry Summary Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-line/60">
          <div className="rounded-xl border border-leaf/30 bg-sprout/30 p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-leaf block">
                {labels.recommendations?.DISPATCH_SURPLUS ?? "DISPATCH SURPLUS"}
              </span>
              <span className="text-xl font-black text-leaf font-mono tabular-nums">
                {routeStats.dispatch} <span className="text-xs font-normal text-muted">routes</span>
              </span>
            </div>
            <span className="text-xs text-leaf font-bold">≥ +40 Rwf/kg</span>
          </div>

          <div className="rounded-xl border border-harvest/40 bg-harvest/15 p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-soil block">
                {labels.recommendations?.MODERATE_MARGIN ?? "MODERATE MARGIN"}
              </span>
              <span className="text-xl font-black text-soil font-mono tabular-nums">
                {routeStats.moderate} <span className="text-xs font-normal text-muted">routes</span>
              </span>
            </div>
            <span className="text-xs text-soil font-bold">10–40 Rwf/kg</span>
          </div>

          <div className="rounded-xl border border-clay/30 bg-clay/10 p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-clay block">
                {labels.recommendations?.HOLD_LOCAL ?? "HOLD LOCAL"}
              </span>
              <span className="text-xl font-black text-clay font-mono tabular-nums">
                {routeStats.hold} <span className="text-xs font-normal text-muted">routes</span>
              </span>
            </div>
            <span className="text-xs text-clay font-bold">&lt; 10 Rwf/kg</span>
          </div>
        </div>
      </section>

      {/* Corridors Table */}
      <div className="overflow-x-auto rounded-3xl border border-line bg-paper shadow-sm">
        <table className="w-full min-w-[64rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-cream/30 text-muted font-semibold">
              <th scope="col" className="px-4 py-3.5">{labels.columns.corridor}</th>
              <th scope="col" className="px-4 py-3.5">{labels.columns.distance}</th>
              <th scope="col" className="px-4 py-3.5">{labels.columns.farmgatePrice}</th>
              <th scope="col" className="px-4 py-3.5">{labels.columns.retailPrice}</th>
              <th scope="col" className="px-4 py-3.5">{labels.columns.freightCost}</th>
              <th scope="col" className="px-4 py-3.5">{labels.columns.netMargin}</th>
              <th scope="col" className="px-4 py-3.5">{labels.columns.breakeven}</th>
              <th scope="col" className="px-4 py-3.5 text-right">{labels.columns.action}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {initialCorridors.map((corridor) => {
              const sim = simulateCustomFuelPrice(corridor, fuelPrice, truckPayload);
              const isDispatch = sim.recommendation === "DISPATCH_SURPLUS";
              const isModerate = sim.recommendation === "MODERATE_MARGIN";

              return (
                <tr
                  key={`${corridor.origin_district_code}_${corridor.destination_code}`}
                  className="hover:bg-cream/30 transition-colors"
                >
                  <th scope="row" className="px-4 py-3.5 font-semibold text-canopy">
                    <span className="text-base font-bold">{corridor.origin_district_code}</span>
                    <span className="mx-1.5 text-muted">→</span>
                    <span className="text-ink font-bold">{corridor.destination_code}</span>
                    <span className="block text-xs font-normal text-muted mt-0.5">
                      {corridor.destination_name}
                    </span>
                  </th>
                  <td className="px-4 py-3.5 text-ink">
                    <div className="font-mono font-medium tabular-nums">{corridor.distance_km} km</div>
                    <span className="text-xs text-clay font-mono tabular-nums">
                      -{corridor.spoilage_loss_pct.toFixed(1)}% spoilage
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-ink font-mono tabular-nums">
                    {priceFormat(corridor.farmgate_price_origin)} Rwf
                  </td>
                  <td className="px-4 py-3.5 text-ink font-mono font-medium tabular-nums">
                    {priceFormat(corridor.retail_price_dest)} Rwf
                  </td>
                  <td className="px-4 py-3.5 font-mono text-muted tabular-nums">
                    {sim.freightCost.toFixed(1)} Rwf/kg
                  </td>
                  <td className="px-4 py-3.5 font-mono tabular-nums">
                    <span
                      className={`font-black text-base ${
                        isDispatch
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
                  <td className="px-4 py-3.5 text-xs text-muted font-mono tabular-nums">
                    {corridor.breakeven_diesel_price > 0 && corridor.breakeven_diesel_price < 20000
                      ? `${priceFormat(corridor.breakeven_diesel_price)} Rwf/L`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      {/* Dynamic Action Badge */}
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                          isDispatch
                            ? "border-leaf/30 bg-sprout text-leaf"
                            : isModerate
                            ? "border-harvest/40 bg-harvest/20 text-soil"
                            : "border-clay/30 bg-clay/15 text-clay"
                        }`}
                      >
                        {isDispatch
                          ? labels.recommendations?.DISPATCH_SURPLUS ?? "DISPATCH_SURPLUS"
                          : isModerate
                          ? labels.recommendations?.MODERATE_MARGIN ?? "MODERATE_MARGIN"
                          : labels.recommendations?.HOLD_LOCAL ?? "HOLD_LOCAL"}
                      </span>

                      {/* Direct One-Click Action Route into /alerts */}
                      {isDispatch ? (
                        <Link
                          href={`/${locale}/alerts?origin=${corridor.origin_district_code}&dest=${corridor.destination_code}&commodity=${commodityCode}&crop=${commodityCode}&margin=${Math.round(
                            sim.netMargin
                          )}&intent=ship`}
                          className="inline-flex items-center gap-1 rounded-xl bg-leaf px-3 py-1.5 text-xs font-bold text-cream shadow-xs transition-all hover:bg-forest active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                          <span>{labels.alertShipBtn ?? "Send Trader Dispatch SMS →"}</span>
                        </Link>
                      ) : isModerate ? (
                        <Link
                          href={`/${locale}/alerts?origin=${corridor.origin_district_code}&dest=${corridor.destination_code}&commodity=${commodityCode}&crop=${commodityCode}&margin=${Math.round(
                            sim.netMargin
                          )}&intent=ship`}
                          className="inline-flex items-center gap-1 rounded-xl border border-harvest bg-harvest/20 px-3 py-1.5 text-xs font-bold text-soil transition-all hover:bg-harvest/30 active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                          <span>{labels.reviewBtn ?? "Monitor & Ship →"}</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/${locale}/alerts?origin=${corridor.origin_district_code}&dest=${corridor.destination_code}&commodity=${commodityCode}&crop=${commodityCode}&margin=${Math.round(
                            sim.netMargin
                          )}&intent=hold`}
                          className="inline-flex items-center gap-1 rounded-xl border border-clay/40 bg-clay/10 px-3 py-1.5 text-xs font-bold text-clay transition-all hover:bg-clay/20 active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                          <span>{labels.holdBtn ?? "Issue Storage Notice →"}</span>
                        </Link>
                      )}
                    </div>
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
