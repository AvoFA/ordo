import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { auth } from "../../../../../auth";
import { listNotesByTopicForUser } from "@/entities/note/api/notes.repository";
import { listPracticeTasksByTopicForUser } from "@/entities/practice-task/api/practice.repository";
import { getSessionForUser } from "@/entities/session/api/sessions.repository";
import { SessionWorkspace } from "@/widgets/session-workspace/session-workspace";
import {
  runInDemoMode,
  isDemoModeActive,
  demoSessions,
  demoNotes,
  demoPracticeTasks,
} from "@/shared/lib/demo";

type SessionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;
  const authSession = await auth();
  const isDemo = isDemoModeActive();
  let userEmail = authSession?.user?.email;

  if (!userEmail && isDemo) {
    userEmail = "demo@ordo.app";
  }

  if (!userEmail) {
    redirect("/sign-in");
  }

  const demoSessionFallback = demoSessions[id] || demoSessions["semantic-html-session"];

  const session = await runInDemoMode(
    () => getSessionForUser(userEmail, id),
    demoSessionFallback
  );

  if (!session) {
    notFound();
  }

  const [notes, practiceTasks] = session.topicId
    ? await Promise.all([
        runInDemoMode(() => listNotesByTopicForUser(userEmail, session.topicId!), demoNotes),
        runInDemoMode(() => listPracticeTasksByTopicForUser(userEmail, session.topicId!), demoPracticeTasks),
      ])
    : [[], []];

  return <SessionWorkspace session={session} notes={notes} practiceTasks={practiceTasks} />;
}
