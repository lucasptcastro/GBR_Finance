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

import { AddWarehouseButton } from "./_components/add-warehouse-button";
import { BirdsSummaryCard } from "./_components/birds-summary-card";
import { FeedBagsSummaryCard } from "./_components/feed-bags-summary-card";
import { WarehouseSelector } from "./_components/warehouse-selector";
import { WarehousesTable } from "./_components/warehouses-table";
import { getWarehouses } from "./_data/get-warehouses";
import { getWarehousesList } from "../production/_data/get-warehouses-list";

interface WarehousesPageProps {
  searchParams: Promise<{ warehouse?: string }>;
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

  const { warehouse } = await searchParams;

  const [warehousesList, warehouses] = await Promise.all([
    getWarehousesList(),
    getWarehouses(),
  ]);

  if (!warehouse && warehousesList.length > 0) {
    redirect(`/warehouses?warehouse=${warehousesList[0].id}`);
  }

  const selectedWarehouse = warehouses.find((w) => w.id === warehouse);
  const feedBagsRemaining = selectedWarehouse?.feedBagsRemaining ?? 0;
  const totalFeedBagsRegistered = selectedWarehouse?.totalFeedBagsRegistered ?? 0;
  const birdsAvailable = selectedWarehouse?.birdsAvailable ?? 0;
  const totalBirdsRegistered = selectedWarehouse?.totalBirdsRegistered ?? 0;
  const mortalityPercentage = selectedWarehouse?.mortalityPercentage ?? 0;

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
          <div className="flex w-full items-center justify-end gap-3">
            <WarehouseSelector warehouses={warehousesList} />
            <AddWarehouseButton />
          </div>
        </PageActions>
      </PageHeader>

      <PageContent>
        {warehouse && (
          <div className="mb-6 grid w-full grid-cols-1 gap-6 min-[500px]:grid-cols-2 min-[750px]:grid-cols-3">
            <FeedBagsSummaryCard
              feedBagsRemaining={feedBagsRemaining}
              totalFeedBagsRegistered={totalFeedBagsRegistered}
            />
            <BirdsSummaryCard
              birdsAvailable={birdsAvailable}
              totalBirdsRegistered={totalBirdsRegistered}
              mortalityPercentage={mortalityPercentage}
            />
          </div>
        )}

        <WarehousesTable warehouses={warehouses} />
      </PageContent>
    </PageContainer>
  );
}
