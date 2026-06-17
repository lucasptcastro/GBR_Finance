"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { WarehouseListItem } from "../_data/get-warehouses-list";

interface WarehouseSelectorProps {
  warehouses: WarehouseListItem[];
}

export function WarehouseSelector({ warehouses }: WarehouseSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const current = searchParams.get("warehouse") ?? "";

  const navigate = (warehouseId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (warehouseId) {
      params.set("warehouse", warehouseId);
    } else {
      params.delete("warehouse");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  if (warehouses.length === 0) {
    return null;
  }

  return (
    <Select value={current} onValueChange={navigate}>
      <SelectTrigger className="w-52">
        <SelectValue placeholder="Selecione um galpão" />
      </SelectTrigger>
      <SelectContent>
        {warehouses.map((w) => (
          <SelectItem key={w.id} value={w.id}>
            {w.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
