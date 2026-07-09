import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppFooter } from "@/app/(protected)/_components/app-footer";
import { AppSidebar } from "@/app/(protected)/_components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getRole } from "@/data/get-role";
import { auth } from "@/lib/auth";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/");
  }

  const { role } = await getRole();

  const roleSlug = role?.slug ? role.slug : "member";

  return (
    <SidebarProvider>
      <AppSidebar userRole={roleSlug} appVersion="1.0.0" />
      <main className="flex min-h-svh w-full flex-col">
        <SidebarTrigger />
        <div className="flex-1">{children}</div>
        <AppFooter />
      </main>
    </SidebarProvider>
  );
}
