import type { ReactNode } from "react";
import Link from "next/link";
import type { Session } from "next-auth";
import { signOut } from "../../../auth";
import { UserAccountMenu } from "@/features/auth/ui/user-account-menu";
import { getCommandCenterGroupsForUser } from "@/features/command-center/api/command-items.repository";
import { getActiveSessionForUser } from "@/entities/session/api/sessions.repository";
import { CommandCenter } from "@/features/command-center/command-center";
import { ThemeToggle } from "@/features/theme-toggle/theme-toggle";
import { AppSidebar, type SidebarFocusData } from "@/widgets/app-sidebar/app-sidebar";
import { runInDemoMode, demoCommandGroups, demoSessions } from "@/shared/lib/demo";

import { HeaderContext } from "./ui/header-context";

import { cookies } from "next/headers";
import { translate, type Locale } from "@/shared/lib/i18n/i18n";

type AppShellProps = {
  children: ReactNode;
  user?: Session["user"];
};

const mobileNavigation = [
  { labelKey: "nav.today", href: "/today" },
  { labelKey: "nav.inbox", href: "/inbox" },
  { labelKey: "nav.paths", href: "/learning-paths" },
  { labelKey: "nav.sessions", href: "/sessions" },
  { labelKey: "nav.notes", href: "/notes" },
  { labelKey: "nav.practice", href: "/practice" },
];

import { EditModeToggle } from "@/features/edit-mode-toggle/edit-mode-toggle";

export async function AppShell({ children, user }: AppShellProps) {
  const displayName = user?.name ?? user?.email ?? "Learner";
  const secondaryLabel = user?.email ?? "Personal workspace";
  const userEmail = user?.email;

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("ordo_locale")?.value;
  const locale = (localeCookie === "uk" ? "uk" : "en") as Locale;

  return (
    <main className="min-h-screen bg-background text-foreground md:h-screen md:overflow-hidden">
      <div className="grid min-h-screen md:grid-cols-[auto_1fr] md:h-screen md:overflow-hidden">
        <SidebarFocusBridge userEmail={userEmail} />

        <div className="flex flex-col min-w-0 h-full md:h-screen overflow-hidden">
          <header className="border-b border-border/40 bg-surface-nav shrink-0">
            <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-7">
              <HeaderContext />

              <div className="flex flex-wrap items-center gap-2">
                <EditModeToggle />
                <CommandCenterBridge userEmail={userEmail} />
                <UserAccountMenu
                  displayName={displayName}
                  secondaryLabel={secondaryLabel}
                  accountMenuLabel={translate(locale, "account.openMenu")}
                  settingsLabel={translate(locale, "account.settings")}
                  signOutLabel={translate(locale, "account.signOut")}
                  signOutAction={async () => {
                    "use server";

                    await signOut({ redirectTo: "/sign-in" });
                  }}
                />
                <ThemeToggle />
              </div>
            </div>

            <nav
              aria-label="Mobile workspace navigation"
              className="flex gap-2 overflow-x-auto border-t border-border/60 px-5 py-2 md:hidden"
            >
              {mobileNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-md border border-border/65 bg-surface-elevated px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
                >
                  {translate(locale, item.labelKey)}
                </Link>
              ))}
            </nav>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-5 md:px-7 md:py-10">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

async function SidebarFocusBridge({ userEmail }: { userEmail?: string | null }) {
  let focusData: SidebarFocusData = null;

  if (userEmail) {
    const activeSession = await runInDemoMode(
      () => getActiveSessionForUser(userEmail),
      demoSessions["semantic-html-session"],
    );

    if (activeSession && activeSession.status === "in-progress") {
      focusData = {
        sessionId: activeSession.id,
        topic: activeSession.topic,
        path: activeSession.path,
        progress: activeSession.progress,
      };
    }
  }

  return <AppSidebar focusData={focusData} />;
}

async function CommandCenterBridge({ userEmail }: { userEmail?: string | null }) {
  const groups = userEmail
    ? await runInDemoMode(() => getCommandCenterGroupsForUser(userEmail), demoCommandGroups)
    : [];

  return <CommandCenter groups={groups} />;
}
