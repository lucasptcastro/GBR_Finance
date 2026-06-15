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
import { WarehousesTable } from "./_components/warehouses-table";
import { getWarehouses } from "./_data/get-warehouses";

export default async function WarehousesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const warehouses = await getWarehouses();

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
          <div className="flex w-full justify-end">
            <AddWarehouseButton />
          </div>
        </PageActions>
      </PageHeader>

      <PageContent>
        <WarehousesTable warehouses={warehouses} />
      </PageContent>
    </PageContainer>
  );
}
