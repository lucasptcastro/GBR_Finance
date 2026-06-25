import { eq, sql } from "drizzle-orm";
import { DollarSign, Landmark } from "lucide-react";
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
import { db } from "@/db";
import { bankAccountsTable, transactionsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { SummaryCard } from "../_components/summary-card";
import { AddBankAccountButton } from "./_components/add-bank-account-button";
import { BankAccountsTable } from "./_components/bank-accounts-table";

function formatCurrency(amountInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountInCents / 100);
}

export default async function BankAccountsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const bankAccounts = await db.query.bankAccountsTable.findMany({
    where: (bankAccountsTable, { eq }) =>
      eq(bankAccountsTable.userId, session.user.id),
    orderBy: (bankAccountsTable, { asc }) => [asc(bankAccountsTable.name)],
  });

  const txSums = await db
    .select({
      bankAccountId: transactionsTable.bankAccountId,
      type: transactionsTable.type,
      total: sql<number>`coalesce(sum(${transactionsTable.amountInCents}), 0)`,
    })
    .from(transactionsTable)
    .where(eq(transactionsTable.userId, session.user.id))
    .groupBy(transactionsTable.bankAccountId, transactionsTable.type);

  const bankAccountsWithBalance = bankAccounts.map((account) => {
    const accountTxs = txSums.filter((t) => t.bankAccountId === account.id);
    const deposits = accountTxs.find((t) => t.type === "deposit")?.total ?? 0;
    const expenses = accountTxs.find((t) => t.type === "expense")?.total ?? 0;
    const investments =
      accountTxs.find((t) => t.type === "investment")?.total ?? 0;

    const computedBalanceInCents =
      account.currentBalanceInCents +
      Number(deposits) -
      Number(expenses) -
      Number(investments);

    return { ...account, computedBalanceInCents };
  });

  const totalBalanceInCents = bankAccountsWithBalance.reduce(
    (sum, a) => sum + a.computedBalanceInCents,
    0,
  );

  const bankAccountsSummary = [
    {
      title: "Total de Contas Bancárias",
      amount: bankAccounts.length,
      icon: (
        <div className="rounded-sm bg-green-500/10 p-1.5">
          <Landmark size={16} className="text-green-500" />
        </div>
      ),
    },
    {
      title: "Saldo Total",
      amount: formatCurrency(totalBalanceInCents),
      icon: (
        <div className="rounded-sm bg-blue-500/10 p-1.5">
          <DollarSign size={16} className="text-blue-500" />
        </div>
      ),
    },
  ];

  return (
    <>
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
                Visualize, filtre e gerencie todas as contas bancárias
                cadastradas no sistema
              </span>
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <div className="flex w-full justify-end">
              <AddBankAccountButton />
            </div>
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="grid w-full grid-cols-1 gap-6 min-[500px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1600px]:grid-cols-4">
            {bankAccountsSummary.map((item) => (
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
            <BankAccountsTable bankAccounts={bankAccountsWithBalance} />
          </div>
        </PageContent>
      </PageContainer>
    </>
  );
}
