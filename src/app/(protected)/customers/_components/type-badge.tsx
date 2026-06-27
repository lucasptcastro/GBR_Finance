import { Badge } from "@/components/ui/badge";

interface CustomerTypeBadgeProps {
  type: "individual" | "company";
}

export const CustomerTypeBadge = ({ type }: CustomerTypeBadgeProps) => {
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
