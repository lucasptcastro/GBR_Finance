import { Wheat } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface FeedBagsSummaryCardProps {
  feedBagsRemaining: number;
  totalFeedBagsRegistered: number;
}

export function FeedBagsSummaryCard({
  feedBagsRemaining,
  totalFeedBagsRegistered,
}: FeedBagsSummaryCardProps) {
  return (
    <Card className="gap-2 bg-transparent py-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-sm bg-lime-500/10 p-1.5">
            <Wheat size={16} className="text-lime-500" />
          </div>
          <p className="text-muted-foreground">Sacos de Ração Disponíveis</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {feedBagsRemaining.toLocaleString("pt-BR")}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Total cadastrado:{" "}
          <span className="font-medium text-foreground">
            {totalFeedBagsRegistered.toLocaleString("pt-BR")}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
