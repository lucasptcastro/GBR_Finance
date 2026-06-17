import type { MonthlyProduction } from "@/actions/get-dashboard-monthly-production-by-year";

import { MonthlyProductionChart } from "./montlhy-production-chart";

interface DashboardChartsProps {
  monthlyProductionData: MonthlyProduction[];
  startFrom?: string;
}

export function DashboardCharts({
  monthlyProductionData,
  startFrom,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 2xl:grid-cols-2">
      <MonthlyProductionChart
        monthlyProductionData={monthlyProductionData}
        startFrom={startFrom}
      />
    </div>
  );
}
