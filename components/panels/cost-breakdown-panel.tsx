"use client";

import { motion } from "motion/react";
import { Separator } from "@base-ui/react/separator";
import type { CostResult, Mode } from "@/lib/types";
import AnimatedNumber from "@/components/ui/animated-number";

interface CostBreakdownPanelProps {
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
  result,
  mode,
  onClose,
}: CostBreakdownPanelProps) {
  const gapHighlight: "positive" | "negative" =
    result.realityGap >= 0 ? "positive" : "negative";

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
