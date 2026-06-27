import { Badge } from "@/components/ui/badge";

interface SupplierStatusBadgeProps {
  status: "active" | "inactive";
}

export const SupplierStatusBadge = ({ status }: SupplierStatusBadgeProps) => {
  if (status === "active") {
    return (
      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
        Ativo
      </Badge>
    );
  }

  if (status === "inactive") {
    return (
      <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
        Inativo
      </Badge>
    );
  }
};
