import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SalesSummary } from "../_data/get-sales-summary-by-date-range";

interface SalesSummaryCardsProps {
  summary: SalesSummary;
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function SalesSummaryCards({ summary }: SalesSummaryCardsProps) {
  const cards = [
    {
      title: "Receita Total",
      value: formatCurrency(summary.current.totalAmountInCents),
      icon: <DollarSign size={16} className="text-primary" />,
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(summary.current.averageTicketInCents),
      icon: <TrendingUp size={16} className="text-primary" />,
    },
    {
      title: "Total de Vendas",
      value: summary.current.salesCount.toLocaleString("pt-BR"),
      icon: <ShoppingCart size={16} className="text-primary" />,
    },
  ];

  return (
    <>
      {cards.map((card) => (
        <Card key={card.title} className="bg-transparent">
          <CardHeader className="flex flex-row items-center">
            <div className="bg-primary/10 rounded-sm p-1.5">{card.icon}</div>
            <p className="text-muted-foreground text-sm">{card.title}</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
