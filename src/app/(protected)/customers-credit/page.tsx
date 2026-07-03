import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { bankAccountsTable } from "@/db/schema";

import { getCustomersCredit } from "./_data/get-customers-credit";
import { CustomersCreditTable } from "./_components/customers-credit-table";

export default async function CustomersCreditPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const [customers, bankAccounts] = await Promise.all([
    getCustomersCredit(),
    session?.user
      ? db.query.bankAccountsTable.findMany({
          where: eq(bankAccountsTable.userId, session.user.id),
          columns: { id: true, name: true, color: true },
          orderBy: (t, { asc }) => [asc(t.name)],
        })
      : [],
  ]);

  const totalRemaining = customers.reduce(
    (sum, c) => sum + c.remainingInCents,
    0,
  );

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crediário</h1>
          <p className="text-muted-foreground text-sm">
            Clientes com saldo devedor em crediário.
          </p>
        </div>
        {customers.length > 0 && (
          <div className="text-right">
            <p className="text-muted-foreground text-xs">Total a receber</p>
            <p className="text-destructive text-xl font-bold">
              {formatCurrency(totalRemaining)}
            </p>
          </div>
        )}
      </div>

      <CustomersCreditTable
        customers={customers}
        bankAccounts={bankAccounts}
      />
    </div>
  );
}
