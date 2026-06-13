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
                  Sistema
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-primary" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-primary font-semibold">
                  Usuários
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <PageTitle>Usuários</PageTitle>
          <PageDescription>
            <span className="text-muted-foreground font-sans font-medium">
              Visualize, adicione e gerencie todos os usuários do sistema.
              Controle permissões e informações de cada conta de usuário
            </span>
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="text-muted-foreground flex items-center justify-center gap-2 py-24">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-sm font-medium">Carregando usuários…</span>
        </div>
      </PageContent>
    </PageContainer>
  );
}
