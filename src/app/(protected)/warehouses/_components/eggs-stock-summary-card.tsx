import { LayoutGrid } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface EggsStockSummaryCardProps {
  stockEggs: number;
  stockTrays: number;
}

export function EggsStockSummaryCard({
  stockEggs,
  stockTrays,
}: EggsStockSummaryCardProps) {
  return (
    <Card className="gap-2 bg-transparent py-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-sm bg-yellow-500/10 p-1.5">
            <LayoutGrid size={16} className="text-yellow-500" />
          </div>
          <p className="text-muted-foreground">Ovos em Estoque</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {stockEggs.toLocaleString("pt-BR")}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Bandejas em estoque:{" "}
          <span className="font-medium text-foreground">
            {stockTrays.toLocaleString("pt-BR")}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
