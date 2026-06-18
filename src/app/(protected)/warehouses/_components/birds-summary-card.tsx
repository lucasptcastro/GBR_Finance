import { Bird, Skull, TrendingDown } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">
            {birdsAvailable.toLocaleString("pt-BR")}
          </p>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <TrendingDown className="size-4 text-red-500" />
                <span className="font-medium text-red-500">
                  {mortalityPercentage.toLocaleString("pt-BR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 1,
                  })}
                  %
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>Percentual mortalidade de aves</TooltipContent>
          </Tooltip>
        </div>
        <p className="text-muted-foreground mt-2 text-sm">
          Total cadastrado:{" "}
          <span className="text-foreground font-medium">
            {totalBirdsRegistered.toLocaleString("pt-BR")}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
