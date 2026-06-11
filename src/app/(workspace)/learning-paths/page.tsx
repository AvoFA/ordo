import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import { listLearningPathsForUser } from "@/entities/learning-path/api/learning-paths.repository";
import { LearningPathsOverview } from "@/widgets/learning-paths-overview/learning-paths-overview";
import { runInDemoMode, isDemoModeActive, demoPaths } from "@/shared/lib/demo";

export default async function LearningPathsPage() {
  const session = await auth();
  const isDemo = isDemoModeActive();
  let userEmail = session?.user?.email;

  if (!userEmail && isDemo) {
    userEmail = "demo@ordo.app";
  }

  if (!userEmail) {
    redirect("/sign-in");
  }

  const learningPaths = await runInDemoMode(
    () => listLearningPathsForUser(userEmail),
    demoPaths
  );

  return <LearningPathsOverview learningPaths={learningPaths} />;
}
