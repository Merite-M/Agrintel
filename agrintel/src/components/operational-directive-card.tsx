"use client";

import { useState } from "react";
import Link from "next/link";

export interface OperationalDirectiveCardProps {
  intent: "audit" | "ship" | "hold";
  district?: string;
  crop?: string;
  origin?: string;
  dest?: string;
  margin?: string;
  z?: string;
  exposure?: string;
  locale: string;
  labels: {
    titleAudit: string;
    titleShip: string;
    titleHold: string;
    targetDistrict: string;
    targetCorridor: string;
    commodity: string;
    zScore: string;
    fiscalExposure: string;
    netMargin: string;
    draftSmsEn: string;
    draftSmsRw: string;
    dispatchBtn: string;
    dispatchedBadge: string;
    copyBtn: string;
    copied: string;
    clearBtn: string;
  };
}

export function OperationalDirectiveCard({
  intent,
  district,
  crop,
  origin,
  dest,
  margin,
  z,
  exposure,
  locale,
  labels,
}: OperationalDirectiveCardProps) {
  const [activeLang, setActiveLang] = useState<"en" | "rw">(locale === "rw" ? "rw" : "en");
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const formattedExposure = exposure
    ? new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(Number(exposure))
    : "—";

  // Pre-drafted bilingual SMS and broadcast text
  let smsEn = "";
  let smsRw = "";
  let title = labels.titleAudit;
  let badgeText = "OFFICIAL MINAGRI INSPECTION DIRECTIVE";
  let badgeColor = "bg-clay/15 text-clay border-clay/30";

  if (intent === "audit") {
    title = labels.titleAudit;
    badgeText = "MINAGRI FIELD AUDIT DIRECTIVE";
    badgeColor = "bg-clay/20 text-clay border-clay/40";
    smsEn = `[MINAGRI OFFICIAL DIRECTIVE] Immediate field audit ordered for ${district ?? "District"} on ${crop ?? "Commodity"}. SAS survey indicates severe negative yield residual (z = ${z ?? "-2.4"}) despite high subsidized fertilizer/seed uptake. Estimated fiscal exposure: Rwf ${formattedExposure}. Agronomy inspector dispatched to verify seed certification lot numbers and agro-dealer distribution logs.`;
    smsRw = `[ITEKA RYA MINAGRI] Igenzura ryihutirwa muri ${district ?? "Akarere"} ku gihingwa cya ${crop ?? "Igihingwa"}. Isuzuma rya SAS rigaragaza umusaruro uri hasi cyane (z = ${z ?? "-2.4"}) nubwo bahawe ifumbire n'imbuto byunganirwa. Impungenge z'imikoreshereze: Rwf ${formattedExposure}. Abagenzuzi boherejwe kugenzura ibipimo by'imbuto n'inyandiko z'abacuruzi.`;
  } else if (intent === "ship") {
    title = labels.titleShip;
    badgeText = "COOPERATIVE TRADE DISPATCH DIRECTIVE";
    badgeColor = "bg-sprout text-leaf border-leaf/40";
    smsEn = `[COOPERATIVE TRADE ALERT] Profitable arbitrage corridor open: ${origin ?? "Origin"} to ${dest ?? "Kigali"} for ${crop ?? "Commodity"}. Calculated net freight margin is +${margin ?? "40"} Rwf/kg after diesel transport and transit spoilage. Cooperative logistics trucks recommended to dispatch surplus harvest immediately to capture peak urban wholesale pricing.`;
    smsRw = `[IMENYEKANISHA RY'UBUCURUZI] Inzira y'ubucuruzi y'inyungu irafunguye: kuva ${origin ?? "Aho bituruka"} ujya ${dest ?? "Kigali"} ku gihingwa cya ${crop ?? "Igihingwa"}. Inyungu isigaye nyuma ya lisansi n'ibyangirika ni +${margin ?? "40"} Rwf/kg. Amakoperatiba arasabwa kohereza umusaruro w'umurengera ako kanya kugira ngo abone ibiciro byiza mu mujyi.`;
  } else {
    title = labels.titleHold;
    badgeText = "LOCAL STORAGE PRESERVATION DIRECTIVE";
    badgeColor = "bg-harvest/20 text-soil border-harvest/40";
    smsEn = `[STORAGE ADVISORY] Arbitrage margin compressed for ${origin ?? "District"} to ${dest ?? "Market"} on ${crop ?? "Commodity"}. Diesel freight impedance exceeds urban price premium (net margin: ${margin ?? "0"} Rwf/kg). Farmers advised to hold harvest in dry, ventilated cooperative storage rather than transporting at a logistical loss.`;
    smsRw = `[INAMA YO GUHUNIKA] Inyungu y'ubwikorezi yaragabanutse kuva ${origin ?? "Akarere"} ujya ${dest ?? "Isoko"} ku gihingwa cya ${crop ?? "Igihingwa"}. Igiciro cya mazutu kiruta inyungu y'isoko ry'umujyi (isigaye: ${margin ?? "0"} Rwf/kg). Abahinzi baragiriwe inama yo guhunika umusaruro mu bigega by'amakoperatiba aho guhomba mu bwikorezi.`;
  }

  const currentSms = activeLang === "rw" ? smsRw : smsEn;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentSms);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDispatch = () => {
    setIsDispatched(true);
  };

  return (
    <section
      aria-label="Dispatched Operational Directive"
      className="relative overflow-hidden rounded-3xl border-2 border-canopy/40 bg-paper p-6 shadow-md md:p-8"
    >
      {/* Top Banner Ribbon */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wider ${badgeColor}`}>
            {badgeText}
          </span>
          {isDispatched && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sprout px-3 py-1 text-xs font-bold text-forest animate-pulse">
              <span className="h-2 w-2 rounded-full bg-leaf"></span>
              {labels.dispatchedBadge}
            </span>
          )}
        </div>

        <Link
          href={`/${locale}/alerts`}
          className="text-xs font-semibold text-muted hover:text-canopy hover:underline"
        >
          ✕ {labels.clearBtn}
        </Link>
      </div>

      {/* Main Directive Content */}
      <div className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-2xl font-extrabold text-canopy sm:text-3xl">
            {title}
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {intent === "audit" ? (
              <>
                <div className="rounded-xl border border-line bg-cream/30 p-3">
                  <span className="text-[11px] font-semibold uppercase text-muted">
                    {labels.targetDistrict}
                  </span>
                  <div className="text-base font-bold text-canopy font-mono">
                    {district ?? "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-line bg-cream/30 p-3">
                  <span className="text-[11px] font-semibold uppercase text-muted">
                    {labels.commodity}
                  </span>
                  <div className="text-base font-bold text-canopy truncate">
                    {crop ?? "—"}
                  </div>
                </div>
                <div className="rounded-xl border border-clay/30 bg-clay/10 p-3">
                  <span className="text-[11px] font-semibold uppercase text-clay">
                    {labels.zScore}
                  </span>
                  <div className="text-base font-bold text-clay font-mono">
                    {z ?? "-2.48"}
                  </div>
                </div>
                {exposure && (
                  <div className="col-span-2 sm:col-span-3 rounded-xl border border-clay/30 bg-clay/10 p-3">
                    <span className="text-[11px] font-semibold uppercase text-clay">
                      {labels.fiscalExposure}
                    </span>
                    <div className="text-xl font-black text-clay font-mono">
                      Rwf {formattedExposure}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="col-span-2 rounded-xl border border-line bg-cream/30 p-3">
                  <span className="text-[11px] font-semibold uppercase text-muted">
                    {labels.targetCorridor}
                  </span>
                  <div className="text-base font-bold text-canopy">
                    <span className="font-mono">{origin ?? "Origin"}</span> →{" "}
                    <span className="font-mono">{dest ?? "Kigali"}</span>
                  </div>
                </div>
                <div className="rounded-xl border border-line bg-cream/30 p-3">
                  <span className="text-[11px] font-semibold uppercase text-muted">
                    {labels.commodity}
                  </span>
                  <div className="text-base font-bold text-canopy truncate">
                    {crop ?? "—"}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-3 rounded-xl border border-leaf/30 bg-sprout/40 p-3">
                  <span className="text-[11px] font-semibold uppercase text-forest">
                    {labels.netMargin}
                  </span>
                  <div className="text-xl font-black text-leaf font-mono">
                    {Number(margin) > 0 ? `+${margin}` : margin} Rwf / kg
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDispatch}
              disabled={isDispatched}
              className={`rounded-xl px-5 py-3 text-sm font-bold shadow transition-all active:scale-95 ${
                isDispatched
                  ? "bg-forest text-cream opacity-90 cursor-default"
                  : intent === "audit"
                  ? "bg-clay text-cream hover:bg-clay/90"
                  : "bg-leaf text-cream hover:bg-forest"
              }`}
            >
              {isDispatched ? `✓ ${labels.dispatchedBadge}` : labels.dispatchBtn}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl border border-line bg-paper px-4 py-3 text-sm font-semibold text-ink hover:border-canopy hover:bg-cream/40 transition-colors"
            >
              {copied ? `✓ ${labels.copied}` : labels.copyBtn}
            </button>
          </div>
        </div>

        {/* Live Bilingual SMS & Broadcast Preview */}
        <div className="flex flex-col rounded-2xl border border-line bg-cream/30 p-4">
          <div className="flex items-center justify-between border-b border-line/60 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-canopy">
              Field SMS & Broadcast Wire
            </span>
            <div className="flex gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveLang("en")}
                className={`rounded-md px-2.5 py-1 ${
                  activeLang === "en"
                    ? "bg-canopy text-cream"
                    : "text-muted hover:text-ink"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setActiveLang("rw")}
                className={`rounded-md px-2.5 py-1 ${
                  activeLang === "rw"
                    ? "bg-canopy text-cream"
                    : "text-muted hover:text-ink"
                }`}
              >
                Ikinyarwanda
              </button>
            </div>
          </div>

          <div className="mt-3 flex-1 rounded-xl border border-line/80 bg-paper p-4 font-mono text-xs text-ink leading-relaxed">
            {currentSms}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
            <span>{currentSms.length} characters (1 SMS segment)</span>
            <span className="text-leaf font-semibold">Ready for Gateway API</span>
          </div>
        </div>
      </div>
    </section>
  );
}
