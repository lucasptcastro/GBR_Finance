import type { MonthlyProduction } from "@/actions/get-dashboard-monthly-production-by-year";

import type { ProductionByWarehouse } from "../_data/get-production-by-warehouse";
import { MonthlyProductionChart } from "./montlhy-production-chart";
import { ProductionByWarehouseChart } from "./production-by-warehouse-chart";

interface Warehouse {
  id: string;
  name: string;
}

interface DashboardChartsProps {
  monthlyProductionData: MonthlyProduction[];
  startFrom?: string;
  warehouses?: Warehouse[];
  productionByWarehouse?: ProductionByWarehouse[];
}

export function DashboardCharts({
  monthlyProductionData,
  startFrom,
  warehouses,
  productionByWarehouse,
}: DashboardChartsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 2xl:grid-cols-2">
        <MonthlyProductionChart
          monthlyProductionData={monthlyProductionData}
          startFrom={startFrom}
          warehouses={warehouses}
        />
        <ProductionByWarehouseChart data={productionByWarehouse ?? []} />
      </div>
    </div>
  );
}
