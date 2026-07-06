import type { MonthlySales } from "@/app/(protected)/dashboard/_data/get-monthly-sales-by-year";
import type { TopCrediaryCustomer } from "@/app/(protected)/dashboard/_data/get-top-crediary-customers";
import type { TopBuyingCustomer } from "@/app/(protected)/dashboard/_data/get-top-buying-customers";
import type { SalesByPaymentMethod } from "@/app/(protected)/dashboard/_data/get-sales-by-payment-method";
import type { SalesByStatus } from "@/app/(protected)/dashboard/_data/get-sales-by-status";
import type { MonthlyCrediaryEvolution } from "@/app/(protected)/dashboard/_data/get-crediary-evolution-by-year";
import type { SalesByDayOfWeek } from "@/app/(protected)/dashboard/_data/get-sales-by-day-of-week";
import type { InactiveCustomer } from "@/app/(protected)/dashboard/_data/get-inactive-customers";
import type { SalesTicketBucket } from "@/app/(protected)/dashboard/_data/get-sales-ticket-distribution";

import { MonthlySalesChart } from "./monthly-sales-chart";
import { TopCrediaryCustomersChart } from "./top-crediary-customers-chart";
import { TopBuyingCustomersChart } from "./top-buying-customers-chart";
import { SalesPaymentMethodChart } from "./sales-payment-method-chart";
import { SalesStatusChart } from "./sales-status-chart";
import { CrediaryEvolutionChart } from "./crediary-evolution-chart";
import { SalesByWeekdayChart } from "./sales-by-weekday-chart";
import { InactiveCustomersTable } from "./inactive-customers-table";
import { SalesTicketDistributionChart } from "./sales-ticket-distribution-chart";

interface DashboardSalesChartsProps {
  monthlySalesData: MonthlySales[];
  topCrediaryCustomers: TopCrediaryCustomer[];
  topBuyingCustomers: TopBuyingCustomer[];
  salesByPaymentMethod: SalesByPaymentMethod[];
  salesByStatus: SalesByStatus[];
  crediaryEvolutionData: MonthlyCrediaryEvolution[];
  salesByDayOfWeek: SalesByDayOfWeek[];
  inactiveCustomers: InactiveCustomer[];
  salesTicketDistribution: SalesTicketBucket[];
  startFrom?: string;
}

export function DashboardSalesCharts({
  monthlySalesData,
  topCrediaryCustomers,
  topBuyingCustomers,
  salesByPaymentMethod,
  salesByStatus,
  crediaryEvolutionData,
  salesByDayOfWeek,
  inactiveCustomers,
  salesTicketDistribution,
  startFrom,
}: DashboardSalesChartsProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Linha 1: gráfico de linha mensal + evolução crediário */}
      <div className="grid gap-6 2xl:grid-cols-2">
        <MonthlySalesChart
          monthlySalesData={monthlySalesData}
          startFrom={startFrom}
        />
        <CrediaryEvolutionChart
          evolutionData={crediaryEvolutionData}
          startFrom={startFrom}
        />
      </div>

      {/* Linha 2: vendas por dia da semana + distribuição por ticket */}
      <div className="grid gap-6 2xl:grid-cols-2">
        <SalesByWeekdayChart data={salesByDayOfWeek} />
        <SalesTicketDistributionChart data={salesTicketDistribution} />
      </div>

      {/* Linha 3: clientes que mais compram + maiores devedores */}
      <div className="grid gap-6 2xl:grid-cols-2">
        <TopBuyingCustomersChart customers={topBuyingCustomers} />
        <TopCrediaryCustomersChart customers={topCrediaryCustomers} />
      </div>

      {/* Linha 4: forma de pagamento + status das vendas */}
      <div className="grid gap-6 2xl:grid-cols-2">
        <SalesPaymentMethodChart data={salesByPaymentMethod} />
        <SalesStatusChart data={salesByStatus} />
      </div>

      {/* Linha 5: clientes inativos (full width) */}
      <InactiveCustomersTable customers={inactiveCustomers} />
    </div>
  );
}
