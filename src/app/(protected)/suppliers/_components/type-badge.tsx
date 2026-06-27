import { Badge } from "@/components/ui/badge";

interface SupplierTypeBadgeProps {
  type: "individual" | "company";
}

export const SupplierTypeBadge = ({ type }: SupplierTypeBadgeProps) => {
  if (type === "individual") {
    return (
      <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
        Pessoa Física
      </Badge>
    );
  }

  return (
    <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20">
      Pessoa Jurídica
    </Badge>
  );
};
