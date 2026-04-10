import type { CityCostData, CostResult, Mode, UserAnswers } from "./types";

function upgradeLifestyle(
  tier: keyof CityCostData["lifestyle"]
): keyof CityCostData["lifestyle"] {
  const order: (keyof CityCostData["lifestyle"])[] = [
    "minimal",
    "balanced",
    "social",
    "premium",
  ];
  const idx = order.indexOf(tier);
  return order[Math.min(idx + 1, order.length - 1)];
}

function estimateMonthlyTax(annualIncome: number): number {
  const effectiveRate = 0.25;
  return (annualIncome * effectiveRate) / 12;
}

export function calculateCost(
  data: CityCostData,
  answers: UserAnswers,
  mode: Mode
): CostResult {
  const rent = data.rent[answers.living] ?? data.rent.alone;
  const transport = data.transport[answers.transport];
  const food = data.food[answers.food];
  const lifestyle = data.lifestyle[answers.lifestyle];
  const studentLoans =
    mode === "starting-out" ? (answers.studentLoans ?? 0) : 0;

  const monthlyCost = rent + transport + food + lifestyle + studentLoans;

  const comfortableLifestyle = data.lifestyle[upgradeLifestyle(answers.lifestyle)];
  const comfortableFood = data.food.medium;
  const comfortableMonthlyCost =
    rent + transport + comfortableFood + comfortableLifestyle + studentLoans;

  const multiplier = mode === "starting-out" ? 1.25 : 1.3;
  const recommendedSalary = Math.round(monthlyCost * 12 * multiplier);
  const realityGap = answers.income - recommendedSalary;

  const result: CostResult = {
    rent,
    transport,
    food,
    lifestyle,
    studentLoans,
    monthlyCost,
    comfortableMonthlyCost,
    recommendedSalary,
    realityGap,
  };

  if (mode === "making-change") {
    const monthlyTax = estimateMonthlyTax(answers.income);
    const monthlyIncome = answers.income / 12;
    result.disposableIncome = Math.round(
      monthlyIncome - monthlyTax - monthlyCost
    );
    const savingsPerMonth = Math.max(result.disposableIncome, 1);
    result.monthsToEmergencyFund = Math.ceil(10000 / savingsPerMonth);
  }

  return result;
}
