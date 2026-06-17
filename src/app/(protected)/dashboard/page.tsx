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
import { auth } from "@/lib/auth";
import { Bird, Egg, EggOff, LayoutGrid, Wheat } from "lucide-react";
import { SummaryCard } from "../_components/summary-card";
import { getMonthlyProductionByYear } from "./_data/get-monthly-production-by-year";
import { getProductionSummaryByDateRange } from "./_data/get-production-summary-by-date-range";
import { DashboardCharts } from "./_components/dashboard-charts";
import { RangeDatePicker } from "../_components/range-date-picker";
import { getWarehouses } from "../warehouses/_data/get-warehouses";

interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
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

  const { from, to } = await searchParams;

  const currentYear = new Date().getFullYear();

  const [monthlyProductionData, warehousesData, productionSummary] =
    await Promise.all([
      getMonthlyProductionByYear(currentYear),
      getWarehouses(),
      getProductionSummaryByDateRange(from, to),
    ]);

  const warehouses = warehousesData.map(({ id, name }) => ({ id, name }));

  const summary = [
    {
      title: "Total de Ovos ",
      amount: productionSummary.totalEggs.toLocaleString("pt-BR"),
      icon: (
        <div className="bg-primary/10 rounded-sm p-1.5">
          <Egg size={16} className="text-primary" />
        </div>
      ),
    },
    {
      title: "Bandejas ",
      amount: 0,
      icon: (
        <div className="bg-primary/10 rounded-sm p-1.5">
          <LayoutGrid size={16} className="text-primary" />
        </div>
      ),
    },
    {
      title: "Ovos Sobrados ",
      amount: 0,
      icon: (
        <div className="bg-primary/10 rounded-sm p-1.5">
          <Egg size={16} className="text-primary" />
        </div>
      ),
    },
    {
      title: "Ovos Trincados ",
      amount: 0,
      icon: (
        <div className="bg-primary/10 rounded-sm p-1.5">
          <EggOff size={16} className="text-primary" />
        </div>
      ),
    },
    {
      title: "Rações Usadas ",
      amount: 0,
      icon: (
        <div className="bg-primary/10 rounded-sm p-1.5">
          <Wheat size={16} className="text-primary" />
        </div>
      ),
    },
    {
      title: "Aves Mortas ",
      amount: 0,
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
          <div className="flex h-full flex-col space-y-6">
            <div className="flex h-full w-full flex-col gap-6 xl:flex-row">
              <div className="flex h-full flex-1 flex-row gap-6">
                <div className="flex w-full flex-col gap-6">
                  <div className="grid w-full grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    {summary.map((item) => (
                      <SummaryCard
                        className="gap-2 py-4"
                        key={item.title}
                        icon={item.icon}
                        title={item.title}
                        amount={item.amount}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col gap-6">
                    <DashboardCharts
                      monthlyProductionData={monthlyProductionData}
                      startFrom={String(currentYear)}
                      warehouses={warehouses}
                    />

                    {/* <DashboardPieCharts
                      bankAccountsSummary={bankAccountsSummary}
                      typesPercentage={typesPercentage}
                      incomeAllocationPercentage={incomeAllocationPercentage}
                      depositsTotal={depositsTotal}
                      investmentsTotal={investmentsTotal}
                      expensesTotal={expensesTotal}
                    /> */}
                  </div>
                </div>
              </div>

              <div className="max-h-full w-full flex-1 xl:max-w-[300px]">
                {/* <ExpensesPerCategory
                  expensesPerCategory={totalExpensePerCategory}
                /> */}
              </div>
            </div>
          </div>
        </PageContent>
      </PageContainer>
    </>
  );
}
