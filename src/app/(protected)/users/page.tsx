import { HatGlasses, Shield, Users } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/app/_components/page-container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getRole } from "@/data/get-role";
import { auth } from "@/lib/auth";

import { AddUserButton } from "./_components/add-user-button";
import { SummaryCard } from "../_components/summary-card";
import { UsersTable } from "./_components/users-table";
import { getUsers } from "./_data/get-users";

export default async function UsersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const { role } = await getRole();

  if (role?.slug !== "admin") {
    redirect("/dashboard");
  }

  const { users, roles, totalUsers, totalAdmins, totalMembers } =
    await getUsers();

  const usersSummary = [
    {
      title: "Total de Usuários",
      amount: totalUsers,
      icon: (
        <div className="rounded-sm bg-green-500/10 p-1.5">
          <Users size={16} className="text-green-500" />
        </div>
      ),
    },
    {
      title: "Administradores",
      amount: totalAdmins,
      icon: (
        <div className="rounded-sm bg-blue-500/10 p-1.5">
          <Shield size={16} className="text-blue-500" />
        </div>
      ),
    },
    {
      title: "Membros",
      amount: totalMembers,
      icon: (
        <div className="bg-muted-foreground/10 rounded-sm p-1.5">
          <HatGlasses size={16} />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink className="font-semibold">
                    Sistema
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-primary" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-primary font-semibold">
                    Usuários
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <PageTitle>Usuários</PageTitle>
            <PageDescription>
              <span className="text-muted-foreground font-sans font-medium">
                Visualize, adicione e gerencie todos os usuários do sistema.
                Controle permissões e informações de cada conta de usuário
              </span>
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <div className="flex w-full justify-end">
              <AddUserButton roles={roles} />
            </div>
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="grid w-full grid-cols-1 gap-6 min-[500px]:grid-cols-2 min-[900px]:grid-cols-3">
            {usersSummary.map((item) => (
              <SummaryCard
                className="gap-2 py-4"
                key={item.title}
                icon={item.icon}
                title={item.title}
                amount={item.amount}
              />
            ))}
          </div>

          <div className="flex flex-col space-y-6 overflow-hidden">
            <UsersTable users={users} roles={roles} />
          </div>
        </PageContent>
      </PageContainer>
    </>
  );
}
