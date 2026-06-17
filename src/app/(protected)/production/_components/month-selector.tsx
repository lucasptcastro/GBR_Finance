"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

export function MonthSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const monthParam = searchParams.get("month");

  const current = monthParam
    ? (() => {
        const [y, m] = monthParam.split("-").map(Number);
        return new Date(y, m - 1, 1);
      })()
    : (() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
      })();

  const formatted = current.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const navigate = (offset: number) => {
    const next = new Date(current.getFullYear(), current.getMonth() + offset, 1);
    const key = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(-1)}
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="min-w-36 text-center text-sm font-semibold capitalize">
        {formatted}
      </span>

      <Button
        variant="outline"
        size="icon"
        onClick={() => navigate(1)}
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
