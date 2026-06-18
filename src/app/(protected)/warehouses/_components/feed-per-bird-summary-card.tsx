import { LeafyGreen, Wheat } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface FeedPerBirdSummaryCardProps {
  feedKgPerBird: number;
  totalFeedUsed: number;
  birdsForFeedRate: number;
}

export function FeedPerBirdSummaryCard({
  feedKgPerBird,
  totalFeedUsed,
  birdsForFeedRate,
}: FeedPerBirdSummaryCardProps) {
  return (
    <Card className="gap-2 bg-transparent py-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-sm bg-orange-500/10 p-1.5">
            <LeafyGreen size={16} className="text-orange-500" />
          </div>
          <p className="text-muted-foreground">Ração por Ave</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {feedKgPerBird.toLocaleString("pt-BR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}{" "}
          <span className="text-muted-foreground text-base font-medium">
            kg
          </span>
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          {totalFeedUsed.toLocaleString("pt-BR")} sacos ·{" "}
          {birdsForFeedRate.toLocaleString("pt-BR")} aves
        </p>
      </CardContent>
    </Card>
  );
}
