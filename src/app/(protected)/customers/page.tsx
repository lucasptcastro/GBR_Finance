import dayjs from "dayjs";
import { Building2, CheckCircle, User, Users, XCircle } from "lucide-react";
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
import type { DataTableFilterField } from "@/app/(protected)/_components/data-table-filter-types";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
// import { RangeDatePicker } from "@/components/ui/range-date-picker";
import { getRole } from "@/data/get-role";
import { auth } from "@/lib/auth";

import { DataTable } from "../_components/data-table";
import { SummaryCard } from "../_components/summary-card";
import { AddCustomerButton } from "./_components/add-customer-button";
import { customerColumns } from "./_components/table-columns";
import { getCustomers } from "./_data/get-customers";

interface CustomersPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const { role: userRole } = await getRole();

  if (!userRole) {
    redirect("/");
  }

  const { from: fromParam, to: toParam } = await searchParams;

  const from = fromParam ?? dayjs().startOf("year").format("YYYY-MM-DD");
  const to = toParam ?? dayjs().endOf("year").format("YYYY-MM-DD");

  const {
    customers,
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    individualCustomers,
    companyCustomers,
  } = await getCustomers({ from, to });

  const customersFilterFields: DataTableFilterField[] = [
    {
      columnId: "name",
      label: "Nome",
      type: "text",
      placeholder: "Contém…",
    },
    {
      columnId: "nickname",
      label: "Apelido",
      type: "text",
      placeholder: "Contém…",
    },
    {
      columnId: "email",
      label: "E-mail",
      type: "text",
      placeholder: "Contém…",
    },
    {
      columnId: "type",
      label: "Tipo",
      type: "select",
      options: [
        { value: "individual", label: "Pessoa física" },
        { value: "company", label: "Pessoa jurídica" },
      ],
      allLabel: "Todos",
    },
    {
      columnId: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Ativo" },
        { value: "inactive", label: "Inativo" },
      ],
      allLabel: "Todos",
    },
  ];

  const customerSummary = [
    {
      title: "Total de Clientes",
      amount: totalCustomers,
      icon: (
        <div className="bg-muted-foreground/10 rounded-sm p-1.5">
          <Users size={16} />
        </div>
      ),
    },
    {
      title: "Clientes Ativos",
      amount: activeCustomers,
      icon: (
        <div className="rounded-sm bg-green-500/10 p-1.5">
          <CheckCircle size={16} className="text-green-500" />
        </div>
      ),
    },
    {
      title: "Clientes Inativos",
      amount: inactiveCustomers,
      icon: (
        <div className="rounded-sm bg-red-500/10 p-1.5">
          <XCircle size={16} className="text-red-500" />
        </div>
      ),
    },
    {
      title: "Pessoa Física",
      amount: individualCustomers,
      icon: (
        <div className="rounded-sm bg-blue-500/10 p-1.5">
          <User size={16} className="text-blue-500" />
        </div>
      ),
    },
    {
      title: "Pessoa Jurídica",
      amount: companyCustomers,
      icon: (
        <div className="rounded-sm bg-purple-500/10 p-1.5">
          <Building2 size={16} className="text-purple-500" />
        </div>
      ),
    },
  ] as const;

  return (
    <>
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
          <PageActions>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="flex w-full flex-wrap gap-2 sm:flex-nowrap">
                {/* <RangeDatePicker defaultRange="year" /> */}
              </div>

              <AddCustomerButton />
            </div>
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="grid w-full grid-cols-1 gap-6 min-[500px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1600px]:grid-cols-5">
            {customerSummary.map((item) => (
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
            <DataTable
              columns={customerColumns}
              data={customers.map((customer) => ({
                ...customer,
              }))}
              filterFields={customersFilterFields}
            />
          </div>
        </PageContent>
      </PageContainer>
    </>
  );
}
