import type { MonthlyProduction } from "@/actions/get-dashboard-monthly-production-by-year";

import { MonthlyProductionChart } from "./montlhy-production-chart";

interface Warehouse {
  id: string;
  name: string;
}

interface DashboardChartsProps {
  monthlyProductionData: MonthlyProduction[];
  startFrom?: string;
  warehouses?: Warehouse[];
}

export function DashboardCharts({
  monthlyProductionData,
  startFrom,
  warehouses,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 2xl:grid-cols-2">
      <MonthlyProductionChart
        monthlyProductionData={monthlyProductionData}
        startFrom={startFrom}
        warehouses={warehouses}
      />
    </div>
  );
}
