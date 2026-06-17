import { Bird, Egg, EggOff, LayoutGrid, Wheat } from "lucide-react";
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

import { SummaryCard } from "../_components/summary-card";
import { MonthSelector } from "./_components/month-selector";
import { ProductionTable } from "./_components/production-table";
import { WarehouseSelector } from "./_components/warehouse-selector";
import { getEggProduction } from "./_data/get-egg-production";
import { getWarehousesList } from "./_data/get-warehouses-list";

interface ProductionPageProps {
  searchParams: Promise<{ month?: string; warehouse?: string }>;
}

export default async function ProductionPage({
  searchParams,
}: ProductionPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const { month, warehouse } = await searchParams;

  const warehouses = await getWarehousesList();

  if (!warehouse && warehouses.length > 0) {
    const params = new URLSearchParams();
    params.set("warehouse", warehouses[0].id);
    if (month) params.set("month", month);
    redirect(`/production?${params.toString()}`);
  }

  const productionData = await getEggProduction(month, warehouse);

  const {
    records,
    totalTraysThisMonth,
    totalEggsLeftoverThisMonth,
    totalCrackedEggsThisMonth,
    totalFeedUsedThisMonth,
    totalDeadBirdsThisMonth,
    currentBirdsCount,
  } = productionData;

  const summary = [
    {
      title: "Bandejas no Mês",
      amount: totalTraysThisMonth.toLocaleString("pt-BR"),
      icon: (
        <div className="rounded-sm bg-green-500/10 p-1.5">
          <LayoutGrid size={16} className="text-green-500" />
        </div>
      ),
    },
    {
      title: "Ovos Sobrados no Mês",
      amount: totalEggsLeftoverThisMonth.toLocaleString("pt-BR"),
      icon: (
        <div className="rounded-sm bg-yellow-500/10 p-1.5">
          <Egg size={16} className="text-yellow-500" />
        </div>
      ),
    },
    {
      title: "Ovos Trincados no Mês",
      amount: totalCrackedEggsThisMonth.toLocaleString("pt-BR"),
      icon: (
        <div className="rounded-sm bg-orange-500/10 p-1.5">
          <EggOff size={16} className="text-orange-500" />
        </div>
      ),
    },
    {
      title: "Rações Usadas no Mês",
      amount: totalFeedUsedThisMonth.toLocaleString("pt-BR"),
      icon: (
        <div className="rounded-sm bg-lime-500/10 p-1.5">
          <Wheat size={16} className="text-lime-500" />
        </div>
      ),
    },
    {
      title: "Aves Mortas no Mês",
      amount: totalDeadBirdsThisMonth.toLocaleString("pt-BR"),
      icon: (
        <div className="rounded-sm bg-red-500/10 p-1.5">
          <Bird size={16} className="text-red-500" />
        </div>
      ),
    },
    {
      title: "Aves no Galpão",
      amount: currentBirdsCount.toLocaleString("pt-BR"),
      icon: (
        <div className="rounded-sm bg-blue-500/10 p-1.5">
          <Bird size={16} className="text-blue-500" />
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="font-semibold">
                  Produção
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary font-semibold">
                  Acompanhamento
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <PageTitle>Acompanhamento de Produção</PageTitle>
          <PageDescription>
            <span className="text-muted-foreground font-sans font-medium">
              Registre e acompanhe a produção diária de ovos, incluindo
              bandejas, perdas e consumo de ração
            </span>
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <div className="flex w-full items-center justify-end gap-3">
            <WarehouseSelector warehouses={warehouses} />
            <MonthSelector />
          </div>
        </PageActions>
      </PageHeader>

      <PageContent>
        <div className="grid w-full grid-cols-1 gap-6 min-[500px]:grid-cols-2 min-[750px]:grid-cols-3 min-[1100px]:grid-cols-6">
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

        <div className="flex flex-col space-y-6 overflow-hidden">
          {!warehouse ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-16">
              <p className="text-sm font-medium">
                Selecione um galpão para ver os dados de produção.
              </p>
            </div>
          ) : (
            <ProductionTable records={records} warehouseId={warehouse} />
          )}
        </div>
      </PageContent>
    </PageContainer>
  );
}
