import { HTMLAttributes, ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UserSummaryCardProps {
  icon: ReactNode;
  title: string;
  amount: number | string;
  className?: HTMLAttributes<HTMLDivElement>["className"];
}

export function SummaryCard({
  icon,
  title,
  amount,
  className,
}: UserSummaryCardProps) {
  return (
    <Card className={cn("bg-transparent", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          {icon}
          <p className="text-muted-foreground">{title}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{amount}</p>
      </CardContent>
    </Card>
  );
}
