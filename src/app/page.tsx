import { headers } from "next/headers";
import { redirect } from "next/navigation";

// import { APP_VERSION } from "@/app/_constants/version";
import { auth } from "@/lib/auth";

import { SignInForm } from "./_components/sign-in-form";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <SignInForm appVersion="1.0.0" />
    </div>
  );
}
