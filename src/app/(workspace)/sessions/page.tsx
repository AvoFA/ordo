import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import {
  getActiveSessionForUser,
  listRecentSessionsForUser,
} from "@/entities/session/api/sessions.repository";
import { SessionsOverview } from "@/widgets/sessions-overview/sessions-overview";
import { runInDemoMode, isDemoModeActive, demoSessions } from "@/shared/lib/demo";

export default async function SessionsPage() {
  const session = await auth();
  const isDemo = isDemoModeActive();
  let userEmail = session?.user?.email;

  if (!userEmail && isDemo) {
    userEmail = "demo@ordo.app";
  }

  if (!userEmail) {
    redirect("/sign-in");
  }

  const [activeSession, recentSessions] = await Promise.all([
    runInDemoMode(() => getActiveSessionForUser(userEmail), demoSessions["semantic-html-session"]),
    runInDemoMode(() => listRecentSessionsForUser(userEmail), [demoSessions["flexbox-session"]]),
  ]);

  return <SessionsOverview activeSession={activeSession} recentSessions={recentSessions} />;
}
