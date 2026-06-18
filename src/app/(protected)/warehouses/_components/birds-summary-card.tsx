import { Bird } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface BirdsSummaryCardProps {
  birdsAvailable: number;
  totalBirdsRegistered: number;
  mortalityPercentage: number;
}

export function BirdsSummaryCard({
  birdsAvailable,
  totalBirdsRegistered,
  mortalityPercentage,
}: BirdsSummaryCardProps) {
  return (
    <Card className="gap-2 bg-transparent py-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-sm bg-blue-500/10 p-1.5">
            <Bird size={16} className="text-blue-500" />
          </div>
          <p className="text-muted-foreground">Aves Disponíveis</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {birdsAvailable.toLocaleString("pt-BR")}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Total cadastrado:{" "}
          <span className="font-medium text-foreground">
            {totalBirdsRegistered.toLocaleString("pt-BR")}
          </span>
        </p>
        <p className="text-muted-foreground text-sm">
          Mortalidade:{" "}
          <span className="font-medium text-foreground">
            {mortalityPercentage.toLocaleString("pt-BR", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 1,
            })}
            %
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
