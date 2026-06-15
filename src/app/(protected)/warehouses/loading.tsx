import { Loader2 } from "lucide-react";

import {
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
      </PageHeader>

      <PageContent>
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-24">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm font-medium">Carregando galpões…</span>
        </div>
      </PageContent>
    </PageContainer>
  );
}
