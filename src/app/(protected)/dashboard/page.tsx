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
// import { DateRangePreset } from "@/components/ui/date-range-preset";
// import { RangeDatePicker } from "@/components/ui/range-date-picker";
import { auth } from "@/lib/auth";

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
            <div className="flex w-full flex-col justify-end gap-2"></div>
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="flex h-full flex-col space-y-6">
            <div className="flex h-full w-full flex-col gap-6 xl:flex-row">
              <div className="flex h-full flex-1 flex-row gap-6">
                <div className="flex w-full flex-col gap-6">
                  <div className="flex flex-col gap-6"></div>
                </div>
              </div>

              <div className="max-h-full w-full flex-1 xl:max-w-[300px]"></div>
            </div>
          </div>
        </PageContent>
      </PageContainer>
    </>
  );
}
