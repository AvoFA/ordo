import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { listLearningPathsForUser } from "@/entities/learning-path/api/learning-paths.repository";
import {
  getActiveSessionForUser,
  getSuggestedSessionTopicForUser,
  listRecentSessionsForUser,
} from "@/entities/session/api/sessions.repository";
import { listNotesForUser } from "@/entities/note/api/notes.repository";
import {
  listPracticeTasksByTopicForUser,
  listPracticeTasksForUser,
} from "@/entities/practice-task/api/practice.repository";
import { listInboxItemsForUser } from "@/entities/inbox/api/inbox.repository";
import type { PracticeTaskPreview } from "@/entities/practice-task/model/practice-task";
import { WorkspaceHome } from "@/widgets/workspace-home/workspace-home";
import {
  runInDemoMode,
  isDemoModeActive,
  demoSessions,
  demoSuggestedTopic,
  demoPaths,
  demoPracticeTasks,
  demoNotes,
} from "@/shared/lib/demo";

export default async function TodayPage() {
  const session = await auth();
  const isDemo = isDemoModeActive();
  let userEmail = session?.user?.email;

  if (!userEmail && isDemo) {
    userEmail = "demo@ordo.app";
  }

  if (!userEmail) {
    redirect("/sign-in");
  }

  const [activeSession, suggestedTopic, learningPaths, recentSessions, , inboxItems, allPracticeTasks] = await Promise.all([
    runInDemoMode(() => getActiveSessionForUser(userEmail), demoSessions["semantic-html-session"]),
    runInDemoMode(() => getSuggestedSessionTopicForUser(userEmail), demoSuggestedTopic),
    runInDemoMode(() => listLearningPathsForUser(userEmail), demoPaths),
    runInDemoMode(() => listRecentSessionsForUser(userEmail), [demoSessions["flexbox-session"]]),
    runInDemoMode(() => listNotesForUser(userEmail), demoNotes),
    runInDemoMode(() => listInboxItemsForUser(userEmail), []),
    runInDemoMode(() => listPracticeTasksForUser(userEmail), demoPracticeTasks),
  ]);

  let activePracticeTasks: PracticeTaskPreview[] = [];
  if (activeSession?.topicId) {
    activePracticeTasks = await runInDemoMode(
      () => listPracticeTasksByTopicForUser(userEmail, activeSession.topicId!),
      demoPracticeTasks.filter((task) => task.linkedTopic === activeSession.topic),
    );
  }

  const practiceTasksNeedingReview = allPracticeTasks.filter(
    (task) =>
      task.status !== "completed" &&
      (task.attemptSummary?.latestResult === "failed" ||
        task.attemptSummary?.latestResult === "partial"),
  );

  return (
    <WorkspaceHome
      activeSession={activeSession}
      suggestedTopic={suggestedTopic}
      pathCount={learningPaths.length}
      recentSessionCount={recentSessions.length}
      activePracticeTasks={activePracticeTasks}
      practiceTasksNeedingReview={practiceTasksNeedingReview}
      inboxCount={inboxItems.filter((item) => item.status === "captured").length}
    />
  );
}
