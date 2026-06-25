import { CircleIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface BankAccountColorBadgeProps {
  color: string;
}

export const BankAccountColorBadge = ({
  color,
}: BankAccountColorBadgeProps) => {
  return (
    <Badge className="bg-transparent">
      <CircleIcon className="mr-2" style={{ fill: color }} size={10} />
    </Badge>
  );
};
