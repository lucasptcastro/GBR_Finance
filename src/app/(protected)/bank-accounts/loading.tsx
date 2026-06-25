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
                  Financeiro
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary font-semibold">
                  Contas Bancárias
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <PageTitle>Contas Bancárias</PageTitle>
          <PageDescription>
            <span className="text-muted-foreground font-sans font-medium">
              Visualize, filtre e gerencie todas as contas bancárias cadastradas
              no sistema.
            </span>
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-24">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm font-medium">
            Carregando contas bancárias…
          </span>
        </div>
      </PageContent>
    </PageContainer>
  );
}
