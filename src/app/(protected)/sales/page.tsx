import { getSaleFormData } from "./_data/get-sale-form-data";
import { getSales } from "./_data/get-sales";
import { AddSaleButton } from "./_components/add-sale-button";
import { SalesTable } from "./_components/sales-table";

export default async function SalesPage() {
  const [sales, formData] = await Promise.all([
    getSales(),
    getSaleFormData(),
  ]);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendas</h1>
          <p className="text-muted-foreground text-sm">
            Registre e gerencie a venda de bandejas de ovos.
          </p>
        </div>
        <AddSaleButton formData={formData} />
      </div>

      <SalesTable sales={sales} bankAccounts={formData.bankAccounts} />
    </div>
  );
}
