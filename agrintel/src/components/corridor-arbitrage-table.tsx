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
  const isShock = fuelPrice === 4200;

  const priceFormat = (n: number) =>
    new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(n);

  return (
    <div className="flex flex-col gap-6">
      {/* Interactive Fuel & Truck Stress Slider Island */}
      <section
        aria-label={labels.sliderTitle}
        className="@container rounded-3xl border border-line bg-paper p-6 shadow-sm"
        style={{ containerType: "inline-size" }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-canopy/10 px-2.5 py-0.5 text-xs font-bold text-canopy uppercase tracking-wider">
                Live Spatial Solver
              </span>
            </div>
            <h3 className="mt-1 text-xl sm:text-2xl font-bold text-canopy">
              {labels.sliderTitle}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-muted">
              {labels.sliderHelp}
            </p>
          </div>

          {/* Quick Fuel Presets */}
          <div className="flex flex-wrap gap-2">
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
              onClick={() => handlePriceChange(4200)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isShock
                  ? "bg-soil text-cream shadow-xs"
                  : "border border-line bg-cream/50 text-soil hover:border-harvest"
              }`}
            >
              Severe Shock (Rwf 4,200)
            </button>
          </div>
        </div>

        {/* Dual Controls: Truck Payload Selector & Fuel Price Range Slider */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Fuel Slider */}
          <div className="flex flex-col justify-center rounded-2xl border border-line/70 bg-cream/20 p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-canopy mb-2">
              <span className="uppercase tracking-wider">{labels.currentFuelPrice}:</span>
              <span className="font-mono text-base font-extrabold text-canopy">
                {priceFormat(fuelPrice)} <span className="text-xs font-normal text-muted">{labels.perLitre}</span>
              </span>
            </div>
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
            <div className="mt-2 flex justify-between text-[11px] text-muted font-mono">
              <span>2,000 Rwf</span>
              <span className="font-semibold text-canopy">2,927 (Regulated)</span>
              <span className="font-semibold text-clay">3,600 (Unsubsidized)</span>
              <span>4,500 Rwf</span>
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
              Payload divisor: <span className="font-mono font-semibold text-ink">{priceFormat(truckPayload)} kg</span> (affects freight cost/kg).
            </span>
          </div>
        </div>
      </section>

      {/* Corridors Table */}
      <div className="overflow-x-auto rounded-3xl border border-line bg-paper shadow-sm">
        <table className="w-full min-w-[62rem] text-left text-sm">
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
              const isProfitable = sim.netMargin >= 40;
              const isModerate = sim.netMargin >= 10 && sim.netMargin < 40;

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
                    <div className="font-mono font-medium">{corridor.distance_km} km</div>
                    <span className="text-xs text-clay">
                      -{corridor.spoilage_loss_pct.toFixed(1)}% spoilage
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-ink font-mono">
                    {priceFormat(corridor.farmgate_price_origin)} Rwf
                  </td>
                  <td className="px-4 py-3.5 text-ink font-mono font-medium">
                    {priceFormat(corridor.retail_price_dest)} Rwf
                  </td>
                  <td className="px-4 py-3.5 font-mono text-muted">
                    {sim.freightCost.toFixed(1)} Rwf/kg
                  </td>
                  <td className="px-4 py-3.5 font-mono">
                    <span
                      className={`font-black text-base ${
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
                  <td className="px-4 py-3.5 text-xs text-muted font-mono">
                    {corridor.breakeven_diesel_price > 0 && corridor.breakeven_diesel_price < 20000
                      ? `${priceFormat(corridor.breakeven_diesel_price)} Rwf/L`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {isProfitable ? (
                      <Link
                        href={`/${locale}/alerts?origin=${corridor.origin_district_code}&dest=${corridor.destination_code}&crop=${commodityCode}&margin=${Math.round(
                          sim.netMargin
                        )}&intent=ship`}
                        className="inline-flex items-center gap-1 rounded-xl bg-leaf px-3 py-1.5 text-xs font-bold text-cream shadow-xs transition-all hover:bg-forest active:scale-95 whitespace-nowrap"
                      >
                        <span>{labels.alertShipBtn ?? "Alert Cooperative to Ship →"}</span>
                      </Link>
                    ) : isModerate ? (
                      <Link
                        href={`/${locale}/alerts?origin=${corridor.origin_district_code}&dest=${corridor.destination_code}&crop=${commodityCode}&margin=${Math.round(
                          sim.netMargin
                        )}&intent=ship`}
                        className="inline-flex items-center gap-1 rounded-xl border border-harvest bg-harvest/20 px-3 py-1.5 text-xs font-bold text-soil transition-all hover:bg-harvest/30 active:scale-95 whitespace-nowrap"
                      >
                        <span>{labels.reviewBtn ?? "Monitor & Ship →"}</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/${locale}/alerts?origin=${corridor.origin_district_code}&dest=${corridor.destination_code}&crop=${commodityCode}&margin=${Math.round(
                          sim.netMargin
                        )}&intent=hold`}
                        className="inline-flex items-center gap-1 rounded-xl border border-clay/40 bg-clay/10 px-3 py-1.5 text-xs font-bold text-clay transition-all hover:bg-clay/20 active:scale-95 whitespace-nowrap"
                      >
                        <span>{labels.holdBtn ?? "Issue Storage Notice →"}</span>
                      </Link>
                    )}
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
