import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/app/_components/page-container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { Bird, Egg, EggOff, LayoutGrid, Wheat } from "lucide-react";

import { SummaryCard } from "../_components/summary-card";
import { RangeDatePicker } from "../_components/range-date-picker";
import { getMonthlyProductionByYear } from "./_data/get-monthly-production-by-year";
import { getProductionSummaryByDateRange } from "./_data/get-production-summary-by-date-range";
import { getMonthlySalesByYear } from "./_data/get-monthly-sales-by-year";
import { getSalesSummaryByDateRange } from "./_data/get-sales-summary-by-date-range";
import { getTopCrediaryCustomers } from "./_data/get-top-crediary-customers";
import { getTopBuyingCustomers } from "./_data/get-top-buying-customers";
import { getSalesByPaymentMethod } from "./_data/get-sales-by-payment-method";
import { getSalesByStatus } from "./_data/get-sales-by-status";
import { getCrediaryEvolutionByYear } from "./_data/get-crediary-evolution-by-year";
import { getSalesByDayOfWeek } from "./_data/get-sales-by-day-of-week";
import { getInactiveCustomers } from "./_data/get-inactive-customers";
import { getSalesTicketDistribution } from "./_data/get-sales-ticket-distribution";
import { getWarehouses } from "../warehouses/_data/get-warehouses";
import { getProductionByWarehouse } from "./_data/get-production-by-warehouse";
import { DashboardCharts } from "./_components/dashboard-charts";
import { DashboardSalesCharts } from "./_components/dashboard-sales-charts";
import { SalesSummaryCards } from "./_components/sales-summary-cards";
import { SalesPercentageCard } from "./_components/sales-percentage-card";
import { ProductionPercentageCard } from "./_components/production-percentage-card";

interface DashboardPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    prodCompareFrom?: string;
    prodCompareTo?: string;
    salesFrom?: string;
    salesTo?: string;
    salesCompareFrom?: string;
    salesCompareTo?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const {
    from,
    to,
    prodCompareFrom,
    prodCompareTo,
    salesFrom,
    salesTo,
    salesCompareFrom,
    salesCompareTo,
  } = await searchParams;

  const currentYear = new Date().getFullYear();

  const now = new Date();
  const defaultProdCompareFrom = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  )
    .toISOString()
    .split("T")[0];
  const defaultProdCompareTo = new Date(now.getFullYear(), now.getMonth(), 0)
    .toISOString()
    .split("T")[0];

  const [
    monthlyProductionData,
    warehousesData,
    productionSummary,
    productionCompareSummary,
    productionByWarehouse,
    monthlySalesData,
    salesSummary,
    topCrediaryCustomers,
    topBuyingCustomers,
    salesByPaymentMethod,
    salesByStatus,
    crediaryEvolutionData,
    salesByDayOfWeek,
    inactiveCustomers,
    salesTicketDistribution,
  ] = await Promise.all([
    getMonthlyProductionByYear(currentYear),
    getWarehouses(),
    getProductionSummaryByDateRange(from, to),
    getProductionSummaryByDateRange(
      prodCompareFrom || defaultProdCompareFrom,
      prodCompareTo || defaultProdCompareTo,
    ),
    getProductionByWarehouse(from, to),
    getMonthlySalesByYear(currentYear),
    getSalesSummaryByDateRange(
      salesFrom,
      salesTo,
      salesCompareFrom,
      salesCompareTo,
    ),
    getTopCrediaryCustomers(10, salesFrom, salesTo),
    getTopBuyingCustomers(10, salesFrom, salesTo),
    getSalesByPaymentMethod(salesFrom, salesTo),
    getSalesByStatus(salesFrom, salesTo),
    getCrediaryEvolutionByYear(currentYear),
    getSalesByDayOfWeek(salesFrom, salesTo),
    getInactiveCustomers(),
    getSalesTicketDistribution(salesFrom, salesTo),
  ]);

  const warehouses = warehousesData.map(({ id, name }) => ({ id, name }));

  const productionCards = [
    {
      title: "Total de Ovos",
      amount: productionSummary.totalEggs.toLocaleString("pt-BR"),
      icon: (
        <div className="bg-primary/10 rounded-sm p-1.5">
          <Egg size={16} className="text-primary" />
        </div>
      ),
    },
    {
      title: "Bandejas",
      amount: productionSummary.totalTrays.toLocaleString("pt-BR"),
      icon: (
        <div className="bg-primary/10 rounded-sm p-1.5">
          <LayoutGrid size={16} className="text-primary" />
        </div>
      ),
    },
    {
      title: "Ovos Sobrados",
      amount: productionSummary.eggsLeftover.toLocaleString("pt-BR"),
      icon: (
        <div className="bg-primary/10 rounded-sm p-1.5">
          <Egg size={16} className="text-primary" />
        </div>
      ),
    },
    {
      title: "Ovos Trincados",
      amount: productionSummary.crackedEggs.toLocaleString("pt-BR"),
      icon: (
        <div className="bg-primary/10 rounded-sm p-1.5">
          <EggOff size={16} className="text-primary" />
        </div>
      ),
    },
    {
      title: "Rações Usadas",
      amount: productionSummary.feedUsed.toLocaleString("pt-BR"),
      icon: (
        <div className="bg-primary/10 rounded-sm p-1.5">
          <Wheat size={16} className="text-primary" />
        </div>
      ),
    },
    {
      title: "Aves Mortas",
      amount: productionSummary.deadBirds.toLocaleString("pt-BR"),
      icon: (
        <div className="bg-primary/10 rounded-sm p-1.5">
          <Bird size={16} className="text-primary" />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink className="font-semibold">
                    Menu Principal
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-primary" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-primary font-semibold">
                    Dashboard
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <PageTitle>Dashboard</PageTitle>
            <PageDescription>
              <span className="text-muted-foreground font-sans font-medium">
                Acesse uma visão geral detalhada das principais métricas e
                resultados da gestão financeira do sistema
              </span>
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <div className="flex w-full flex-col justify-end gap-2">
              <div className="flex w-full flex-col gap-2 xl:flex-row xl:justify-end">
                <div className="flex w-full flex-row items-end justify-end gap-2">
                  <RangeDatePicker />
                </div>
              </div>
            </div>
          </PageActions>
        </PageHeader>
        <PageContent>
          <Tabs defaultValue="producao" className="flex flex-col gap-6">
            <TabsList className="w-fit">
              <TabsTrigger value="producao">Produção</TabsTrigger>
              <TabsTrigger value="vendas">Vendas</TabsTrigger>
            </TabsList>

            <TabsContent value="producao" className="mt-0">
              <div className="flex flex-col gap-6">
                <div className="grid w-full grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4">
                  <ProductionPercentageCard
                    current={productionSummary}
                    previous={productionCompareSummary}
                  />
                  {productionCards.map((item) => (
                    <SummaryCard
                      key={item.title}
                      icon={item.icon}
                      title={item.title}
                      amount={item.amount}
                    />
                  ))}
                </div>
                <DashboardCharts
                  monthlyProductionData={monthlyProductionData}
                  startFrom={String(currentYear)}
                  warehouses={warehouses}
                  productionByWarehouse={productionByWarehouse}
                />
              </div>
            </TabsContent>

            <TabsContent value="vendas" className="mt-0">
              <div className="flex flex-col gap-6">
                <div className="grid w-full grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-4">
                  <SalesSummaryCards summary={salesSummary} />
                  <SalesPercentageCard summary={salesSummary} />
                </div>
                <DashboardSalesCharts
                  monthlySalesData={monthlySalesData}
                  topCrediaryCustomers={topCrediaryCustomers}
                  topBuyingCustomers={topBuyingCustomers}
                  salesByPaymentMethod={salesByPaymentMethod}
                  salesByStatus={salesByStatus}
                  crediaryEvolutionData={crediaryEvolutionData}
                  salesByDayOfWeek={salesByDayOfWeek}
                  inactiveCustomers={inactiveCustomers}
                  salesTicketDistribution={salesTicketDistribution}
                  startFrom={String(currentYear)}
                />
              </div>
            </TabsContent>
          </Tabs>
        </PageContent>
      </PageContainer>
    </>
  );
}
