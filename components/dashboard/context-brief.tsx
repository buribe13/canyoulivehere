"use client";

import { useDashboard } from "@/components/dashboard/dashboard-provider";
import type {
  FinancialBackup,
  HousingPreference,
  LanguageFluency,
  MoveReason,
  SpendingHabit,
  WorkStyle,
} from "@/lib/types";

function NumberField({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-caption text-ink-muted">{label}</span>
      <div className="flex h-9 items-center rounded-lg border border-border bg-[rgba(255,255,255,0.03)] px-3">
        {prefix ? <span className="text-caption text-ink-muted mr-1.5">{prefix}</span> : null}
        <input
          type="number"
          min={0}
          step={100}
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className="w-full bg-transparent text-body-sm text-ink outline-none [appearance:textfield]"
        />
      </div>
    </label>
  );
}

function SegmentedField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-caption text-ink-muted">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`h-8 rounded-lg px-2.5 text-caption transition-[background-color,color] duration-150 ease-out active:scale-[0.96] ${
                active
                  ? "bg-[rgba(255,255,255,0.1)] text-ink"
                  : "border border-border bg-transparent text-ink-muted hover:bg-[rgba(255,255,255,0.04)] hover:text-ink-light"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-label text-ink-muted">{children}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export default function ContextBrief() {
  const {
    cities,
    citySlug,
    setCitySlug,
    profile,
    updateFinancial,
    updateLifestyle,
    updatePositionality,
  } = useDashboard();

  return (
    <aside className="flex h-full flex-col overflow-y-auto border-r border-border bg-[rgba(14,14,14,0.96)] px-4 py-4">
      <div className="mb-5">
        <p className="text-body text-ink">Context brief</p>
        <p className="text-caption text-ink-muted mt-0.5">
          Edit inputs to re-run the readout.
        </p>
      </div>

      <div className="flex flex-col gap-1.5 mb-5">
        <span className="text-caption text-ink-muted">City</span>
        <div className="flex flex-wrap gap-1.5">
          {cities.map((city) => {
            const active = city.slug === citySlug;
            return (
              <button
                key={city.slug}
                type="button"
                onClick={() => setCitySlug(city.slug)}
                className={`h-8 rounded-lg px-2.5 text-caption transition-[background-color,color] duration-150 ease-out active:scale-[0.96] ${
                  active
                    ? "bg-[rgba(255,255,255,0.1)] text-ink"
                    : "border border-border bg-transparent text-ink-muted hover:bg-[rgba(255,255,255,0.04)] hover:text-ink-light"
                }`}
              >
                {city.shortName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <SectionLabel>Financial profile</SectionLabel>
        <NumberField label="Annual income" value={profile.financial.annualIncome} prefix="$" onChange={(v) => updateFinancial({ annualIncome: v })} />
        <NumberField label="Savings" value={profile.financial.savings} prefix="$" onChange={(v) => updateFinancial({ savings: v })} />
        <NumberField label="Monthly debt" value={profile.financial.monthlyDebt} prefix="$" onChange={(v) => updateFinancial({ monthlyDebt: v })} />

        <SectionLabel>Lifestyle</SectionLabel>
        <NumberField label="Current monthly cost" value={profile.lifestyle.currentMonthlyCost} prefix="$" onChange={(v) => updateLifestyle({ currentMonthlyCost: v })} />
        <SegmentedField<SpendingHabit> label="Spending" value={profile.lifestyle.spendingHabit} onChange={(v) => updateLifestyle({ spendingHabit: v })} options={[{ label: "Careful", value: "careful" }, { label: "Balanced", value: "balanced" }, { label: "Social", value: "social" }]} />
        <SegmentedField<HousingPreference> label="Housing" value={profile.lifestyle.housingPreference} onChange={(v) => updateLifestyle({ housingPreference: v })} options={[{ label: "Roommates", value: "roommates" }, { label: "Solo", value: "alone" }, { label: "Family", value: "family" }]} />
        <SegmentedField<WorkStyle> label="Work" value={profile.lifestyle.workStyle} onChange={(v) => updateLifestyle({ workStyle: v })} options={[{ label: "Remote", value: "remote" }, { label: "Hybrid", value: "hybrid" }, { label: "In person", value: "in-person" }]} />

        <SectionLabel>Positionality</SectionLabel>
        <SegmentedField<FinancialBackup> label="Financial backup" value={profile.positionality.financialBackup} onChange={(v) => updatePositionality({ financialBackup: v })} options={[{ label: "None", value: "none" }, { label: "Some", value: "some" }, { label: "Strong", value: "strong" }]} />
        <SegmentedField<LanguageFluency> label="Language fluency" value={profile.positionality.languageFluency} onChange={(v) => updatePositionality({ languageFluency: v })} options={[{ label: "Learning", value: "learning" }, { label: "Conversational", value: "conversational" }, { label: "Fluent", value: "fluent" }]} />
        <SegmentedField<MoveReason> label="Moving for" value={profile.positionality.moveReason} onChange={(v) => updatePositionality({ moveReason: v })} options={[{ label: "Opportunity", value: "opportunity" }, { label: "Necessity", value: "necessity" }, { label: "Caretaking", value: "caretaking" }]} />
      </div>
    </aside>
  );
}
