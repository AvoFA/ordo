import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { auth } from "../../../../../auth";
import { getLearningPathForUser } from "@/entities/learning-path/api/learning-paths.repository";
import { listTopicParentOptionsForPath } from "@/entities/topic/api/topics.repository";
import { LearningPathWorkspace } from "@/widgets/learning-path-workspace/learning-path-workspace";
import { runInDemoMode, isDemoModeActive, demoPathDetails } from "@/shared/lib/demo";

type LearningPathDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function LearningPathDetailPage({ params }: LearningPathDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const isDemo = isDemoModeActive();
  let userEmail = session?.user?.email;

  if (!userEmail && isDemo) {
    userEmail = "demo@ordo.app";
  }

  if (!userEmail) {
    redirect("/sign-in");
  }

  // Find the detail record based on slug/id in demo mapping
  const demoFallback = demoPathDetails[id] || demoPathDetails["frontend-engineering"];

  const learningPath = await runInDemoMode(
    () => getLearningPathForUser(userEmail, id),
    demoFallback
  );

  if (!learningPath) {
    notFound();
  }

  const parentOptions = await runInDemoMode(
    () => listTopicParentOptionsForPath(userEmail, learningPath.id),
    []
  );

  return <LearningPathWorkspace learningPath={learningPath} parentOptions={parentOptions} />;
}
