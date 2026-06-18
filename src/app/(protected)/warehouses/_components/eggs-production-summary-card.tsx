import { Egg } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface EggsProductionSummaryCardProps {
  totalEggs: number;
  approximateTrays: number;
}

export function EggsProductionSummaryCard({
  totalEggs,
  approximateTrays,
}: EggsProductionSummaryCardProps) {
  return (
    <Card className="gap-2 bg-transparent py-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-sm bg-green-500/10 p-1.5">
            <Egg size={16} className="text-green-500" />
          </div>
          <p className="text-muted-foreground">Ovos Produzidos</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {totalEggs.toLocaleString("pt-BR")}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Bandejas aproximadas:{" "}
          <span className="font-medium text-foreground">
            {approximateTrays.toLocaleString("pt-BR")}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
