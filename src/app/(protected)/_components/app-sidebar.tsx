"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/app/_components/theme-toggle";
import { clearAllCookies } from "@/helpers/clear-all-cookies";
import { formatEmail } from "@/helpers/email-format";
import { getFirstAndLastName, getUserInitials } from "@/helpers/name-format";
import { useTheme } from "@/hooks/use-theme";
import { authClient } from "@/lib/auth-client";
import {
  BankIcon,
  ChartDonutIcon,
  EggIcon,
  HandArrowDownIcon,
  HandArrowUpIcon,
  MegaphoneIcon,
  ReceiptIcon,
  SignOutIcon,
  SpinnerIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { WarehouseIcon } from "lucide-react";

interface AppSidebarProps {
  userRole: string;
  appVersion: string;
}

const items = [
  {
    group: "Menu Principal",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: ChartDonutIcon,
      },
    ],
    permissions: ["admin", "member"],
  },
  {
    group: "Produção",
    items: [
      {
        title: "Acompanhamento",
        url: "/production",
        icon: EggIcon,
      },
      {
        title: "Galpões",
        url: "/warehouses",
        icon: WarehouseIcon,
      },
    ],
    permissions: ["admin", "member"],
  },
  {
    group: "Financeiro",
    items: [
      {
        title: "Contas a receber",
        url: "/",
        icon: HandArrowDownIcon,
      },
      {
        title: "Contas a pagar",
        url: "/",
        icon: HandArrowUpIcon,
      },
      {
        title: "Contas bancárias",
        url: "/",
        icon: BankIcon,
      },
    ],
    permissions: ["admin", "member"],
  },
  {
    group: "Vendas",
    items: [
      {
        title: "Emissão Nota Fiscal",
        url: "/",
        icon: ReceiptIcon,
      },
    ],
    permissions: ["admin", "member"],
  },
  {
    group: "Novidades",
    items: [
      {
        title: "O que há de novo",
        url: "/updates",
        icon: MegaphoneIcon,
      },
    ],
    permissions: ["admin", "member"],
  },
  {
    group: "Sistema",
    items: [
      {
        title: "Usuários",
        url: "/users",
        icon: UsersIcon,
      },
    ],
    permissions: ["admin"],
  },
];

export function AppSidebar({ userRole, appVersion }: AppSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { resolvedTheme } = useTheme();

  const router = useRouter();

  const session = authClient.useSession();

  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      clearAllCookies();
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <Image
            alt="Logotipo Granja Barreto"
            src={
              resolvedTheme === "dark"
                ? "/sidebar-dark-logotipo.svg"
                : "/sidebar-light-logotipo.svg"
            }
            width={136}
            height={28}
          />
          <ThemeToggle />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {items.map((item) => {
          const hasPermission = item.permissions.includes(userRole);

          if (!hasPermission) return null;

          return (
            <SidebarGroup key={item.group}>
              <SidebarGroupLabel>{item.group}</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-1">
                {item.items.map((menu) => (
                  <SidebarMenu key={menu.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === menu.url}
                      >
                        <Link href={menu.url}>
                          <menu.icon
                            className={`${pathname === menu.url && "text-primary"}`}
                          />
                          <span
                            className={`${pathname === menu.url && "text-primary"} text-sm font-semibold`}
                          >
                            {menu.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex w-full flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size={"lg"}>
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials(session.data?.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        {getFirstAndLastName(session.data?.user.name)}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {formatEmail(session.data?.user.email)}
                      </p>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleSignOut}>
                    {isLoading ? (
                      <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <SignOutIcon />
                    )}
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
          <span className="text-muted-foreground text-center text-xs select-none">
            Versão {appVersion}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
