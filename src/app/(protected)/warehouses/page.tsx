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

import { RangeDatePicker } from "../_components/range-date-picker";
import { AddWarehouseButton } from "./_components/add-warehouse-button";
import { BirdsSummaryCard } from "./_components/birds-summary-card";
import { EggsProductionSummaryCard } from "./_components/eggs-production-summary-card";
import { EggsStockSummaryCard } from "./_components/eggs-stock-summary-card";
import { FeedBagsSummaryCard } from "./_components/feed-bags-summary-card";
import { FeedPerBirdSummaryCard } from "./_components/feed-per-bird-summary-card";
import { WarehouseSelector } from "./_components/warehouse-selector";
import { WarehousesTable } from "./_components/warehouses-table";
import { getWarehouseSummaryByDateRange } from "./_data/get-warehouse-summary-by-date-range";
import { getWarehouses } from "./_data/get-warehouses";
import { getWarehousesList } from "../production/_data/get-warehouses-list";

interface WarehousesPageProps {
  searchParams: Promise<{
    warehouse?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function WarehousesPage({
  searchParams,
}: WarehousesPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const { warehouse, from, to } = await searchParams;

  const [warehousesList, warehouses] = await Promise.all([
    getWarehousesList(),
    getWarehouses(),
  ]);

  if (!warehouse && warehousesList.length > 0) {
    const params = new URLSearchParams();
    params.set("warehouse", warehousesList[0].id);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    redirect(`/warehouses?${params.toString()}`);
  }

  const summary = warehouse
    ? await getWarehouseSummaryByDateRange(warehouse, from, to)
    : null;

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
                  Galpões
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <PageTitle>Galpões</PageTitle>
          <PageDescription>
            <span className="text-muted-foreground font-sans font-medium">
              Gerencie os galpões e acompanhe os lotes de aves com suas idades
              atualizadas automaticamente
            </span>
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <div className="flex w-full flex-col items-end justify-end gap-3 sm:flex-row">
            <RangeDatePicker />
            <WarehouseSelector warehouses={warehousesList} />
            <AddWarehouseButton />
          </div>
        </PageActions>
      </PageHeader>

      <PageContent>
        {warehouse && summary && (
          <div className="mb-6 grid w-full grid-cols-1 gap-6 min-[500px]:grid-cols-2 min-[750px]:grid-cols-3 min-[1100px]:grid-cols-4 min-[1400px]:grid-cols-5">
            <FeedBagsSummaryCard
              feedBagsRemaining={summary.feedBagsRemaining}
              totalFeedBagsRegistered={summary.totalFeedBagsRegistered}
            />
            <FeedPerBirdSummaryCard
              feedKgPerBird={summary.feedKgPerBird}
              totalFeedUsed={summary.totalFeedUsed}
              birdsForFeedRate={summary.birdsForFeedRate}
            />
            <BirdsSummaryCard
              birdsAvailable={summary.birdsAvailable}
              totalBirdsRegistered={summary.totalBirdsRegistered}
              mortalityPercentage={summary.mortalityPercentage}
            />
            <EggsProductionSummaryCard
              totalEggs={summary.totalEggs}
              approximateTrays={summary.approximateTrays}
            />
            <EggsStockSummaryCard
              stockEggs={summary.stockEggs}
              stockTrays={summary.stockTrays}
            />
          </div>
        )}

        <WarehousesTable warehouses={warehouses} />
      </PageContent>
    </PageContainer>
  );
}
