import { Loader2 } from "lucide-react";

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

export default function Loading() {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="font-semibold">
                  Pessoas
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary font-semibold">
                  Clientes
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <PageTitle>Clientes</PageTitle>
          <PageDescription>
            <span className="text-muted-foreground font-sans font-medium">
              Visualize, filtre e gerencie todos os clientes cadastrados no
              sistema. Tenha controle total sobre informações e status de cada
              cliente
            </span>
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-24">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm font-medium">Carregando clientes…</span>
        </div>
      </PageContent>
    </PageContainer>
  );
}
