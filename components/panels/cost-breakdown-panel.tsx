"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Separator } from "@base-ui/react/separator";
import type { CostResult, Mode } from "@/lib/types";
import AnimatedNumber from "@/components/ui/animated-number";

interface CostBreakdownPanelProps {
  citySlug: string;
  result: CostResult;
  mode: Mode;
  onClose: () => void;
}

function Row({
  label,
  value,
  prefix = "$",
  highlight,
}: {
  label: string;
  value: number;
  prefix?: string;
  highlight?: "positive" | "negative";
}) {
  const colorClass =
    highlight === "positive"
      ? "text-positive"
      : highlight === "negative"
        ? "text-negative"
        : "text-ink";
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-body-sm text-ink-light">{label}</span>
      <AnimatedNumber
        value={value}
        prefix={prefix}
        className={`text-subheading tabular-nums ${colorClass}`}
      />
    </div>
  );
}

export default function CostBreakdownPanel({
  citySlug,
  result,
  mode,
  onClose,
}: CostBreakdownPanelProps) {
  const gapHighlight: "positive" | "negative" =
    result.realityGap >= 0 ? "positive" : "negative";
  const [summary, setSummary] = useState("");
  const [summaryStatus, setSummaryStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      setSummary("");
      setSummaryStatus("loading");

      try {
        const response = await fetch("/api/affordability-summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            citySlug,
            mode,
            result,
          }),
        });

        if (!response.ok) {
          throw new Error("Summary request failed");
        }

        const data = (await response.json()) as { summary?: string };
        if (!active) return;

        setSummary(data.summary?.trim() ?? "");
        setSummaryStatus("ready");
      } catch {
        if (!active) return;
        setSummaryStatus("error");
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, [citySlug, mode, result]);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%", transition: { duration: 0.25, ease: "easeIn" } }}
      transition={{ duration: 0.35, ease: [0.2, 0, 0, 1] }}
      className="fixed bottom-3 left-[218px] right-3 z-30 glass rounded-2xl sm:right-[390px]"
    >
      <div className="max-w-2xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-heading text-ink">Your Reality Check</p>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg text-ink-muted transition-[color] duration-150 ease-out hover:text-ink active:scale-[0.96] cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        <Row label="Rent" value={result.rent} />
        <Row label="Transport" value={result.transport} />
        <Row label="Food" value={result.food} />
        <Row label="Lifestyle" value={result.lifestyle} />
        {result.studentLoans > 0 && (
          <Row label="Student Loans" value={result.studentLoans} />
        )}

        <Separator className="separator my-3" />

        <Row label="Monthly Cost" value={result.monthlyCost} />
        <Row label="Comfortable Monthly Cost" value={result.comfortableMonthlyCost} />
        <Row label="Recommended Annual Salary" value={result.recommendedSalary} />

        <Separator className="separator my-2" />

        <Row
          label="Reality Gap"
          value={Math.abs(result.realityGap)}
          prefix={result.realityGap >= 0 ? "+$" : "-$"}
          highlight={gapHighlight}
        />

        <Separator className="separator my-3" />

        <div
          className="rounded-[18px] px-4 py-3"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.05), 0 12px 32px rgba(0,0,0,0.16)",
          }}
        >
          <p className="text-label text-ink-muted mb-1">AI Take</p>
          {summaryStatus === "loading" && (
            <p className="text-body-sm text-ink-light [text-wrap:pretty]">
              Turning your numbers into a quick read...
            </p>
          )}
          {summaryStatus === "ready" && summary && (
            <p className="text-body-sm text-ink-light [text-wrap:pretty] whitespace-pre-line">
              {summary}
            </p>
          )}
          {summaryStatus === "error" && (
            <p className="text-body-sm text-ink-muted [text-wrap:pretty]">
              AI summary is unavailable right now.
            </p>
          )}
        </div>

        {mode === "making-change" && result.disposableIncome !== undefined && (
          <>
            <Separator className="separator my-2" />
            <Row
              label="Disposable Income / mo"
              value={Math.abs(result.disposableIncome)}
              prefix={result.disposableIncome >= 0 ? "$" : "-$"}
              highlight={result.disposableIncome >= 0 ? "positive" : "negative"}
            />
            {result.monthsToEmergencyFund !== undefined && (
              <Row
                label="Months to $10K Emergency Fund"
                value={result.monthsToEmergencyFund}
                prefix=""
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
