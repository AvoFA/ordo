import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { listInboxItemsForUser } from "@/entities/inbox/api/inbox.repository";
import { listPracticeTopicOptionsForUser } from "@/entities/practice-task/api/practice.repository";
import { LearningInbox } from "@/widgets/learning-inbox/learning-inbox";
import { demoPracticeOptions, isDemoModeActive, runInDemoMode } from "@/shared/lib/demo";

export default async function InboxPage() {
  const session = await auth();
  const isDemo = isDemoModeActive();
  let userEmail = session?.user?.email;

  if (!userEmail && isDemo) {
    userEmail = "demo@ordo.app";
  }

  if (!userEmail) {
    redirect("/sign-in");
  }

  const [items, topicOptions] = await Promise.all([
    runInDemoMode(() => listInboxItemsForUser(userEmail), []),
    runInDemoMode(() => listPracticeTopicOptionsForUser(userEmail), demoPracticeOptions),
  ]);

  return <LearningInbox items={items} topicOptions={topicOptions} />;
}
