import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { listLearningPathsForUser } from "@/entities/learning-path/api/learning-paths.repository";
import {
  getActiveSessionForUser,
  getSuggestedSessionTopicForUser,
  listRecentSessionsForUser,
} from "@/entities/session/api/sessions.repository";
import { listPracticeTasksByTopicForUser } from "@/entities/practice-task/api/practice.repository";
import type { PracticeTaskPreview } from "@/entities/practice-task/model/practice-task";
import { WorkspaceHome } from "@/widgets/workspace-home/workspace-home";
import {
  runInDemoMode,
  isDemoModeActive,
  demoSessions,
  demoSuggestedTopic,
  demoPaths,
  demoPracticeTasks,
} from "@/shared/lib/demo";

export default async function Home() {
  const session = await auth();
  const isDemo = isDemoModeActive();
  let userEmail = session?.user?.email;

  if (!userEmail && isDemo) {
    userEmail = "demo@ordo.app";
  }

  if (!userEmail) {
    redirect("/sign-in");
  }

  const [activeSession, suggestedTopic, learningPaths, recentSessions] = await Promise.all([
    runInDemoMode(() => getActiveSessionForUser(userEmail), demoSessions["semantic-html-session"]),
    runInDemoMode(() => getSuggestedSessionTopicForUser(userEmail), demoSuggestedTopic),
    runInDemoMode(() => listLearningPathsForUser(userEmail), demoPaths),
    runInDemoMode(() => listRecentSessionsForUser(userEmail), [demoSessions["flexbox-session"]]),
  ]);

  let activePracticeTasks: PracticeTaskPreview[] = [];
  if (activeSession?.topicId) {
    activePracticeTasks = await runInDemoMode(
      () => listPracticeTasksByTopicForUser(userEmail, activeSession.topicId!),
      demoPracticeTasks
    );
  }

  return (
    <WorkspaceHome
      activeSession={activeSession}
      suggestedTopic={suggestedTopic}
      pathCount={learningPaths.length}
      recentSessionCount={recentSessions.length}
      activePracticeTasks={activePracticeTasks}
    />
  );
}
