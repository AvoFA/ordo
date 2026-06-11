import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import {
  listPracticeTasksForUser,
  listPracticeTopicOptionsForUser,
} from "@/entities/practice-task/api/practice.repository";
import { PracticeOverview } from "@/widgets/practice-overview/practice-overview";
import { runInDemoMode, isDemoModeActive, demoPracticeTasks, demoPracticeOptions } from "@/shared/lib/demo";

export default async function PracticePage() {
  const session = await auth();
  const isDemo = isDemoModeActive();
  let userEmail = session?.user?.email;

  if (!userEmail && isDemo) {
    userEmail = "demo@ordo.app";
  }

  if (!userEmail) {
    redirect("/sign-in");
  }

  const [tasks, topicOptions] = await Promise.all([
    runInDemoMode(() => listPracticeTasksForUser(userEmail), demoPracticeTasks),
    runInDemoMode(() => listPracticeTopicOptionsForUser(userEmail), demoPracticeOptions),
  ]);

  return <PracticeOverview tasks={tasks} topicOptions={topicOptions} />;
}
