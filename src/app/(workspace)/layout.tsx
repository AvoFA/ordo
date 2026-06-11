import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { AppShell } from "@/widgets/app-shell/app-shell";
import { isDemoModeActive } from "@/shared/lib/demo";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();
  const isDemo = isDemoModeActive();

  if (!session?.user && !isDemo) {
    redirect("/sign-in");
  }

  const currentUser = session?.user || (isDemo ? { email: "demo@ordo.app", name: "Demo Learner" } : undefined);

  return <AppShell user={currentUser}>{children}</AppShell>;
}
