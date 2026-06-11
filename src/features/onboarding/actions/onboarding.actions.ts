"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "../../../../auth";
import {
  createLearningPathForUser,
  getLearningPathForUser,
} from "@/entities/learning-path/api/learning-paths.repository";
import { createTopicForUser } from "@/entities/topic/api/topics.repository";
import { onboardingSchema } from "@/features/onboarding/model/onboarding.schemas";

export type OnboardingActionState = {
  error?: string;
};

export async function completeOnboardingAction(
  _previousState: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const parsed = onboardingSchema.safeParse({
    pathTitle: formData.get("pathTitle"),
    pathDescription: formData.get("pathDescription"),
    topicTitle: formData.get("topicTitle"),
    topicNextStep: formData.get("topicNextStep"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  try {
    const learningPath = await createLearningPathForUser(userEmail, {
      title: parsed.data.pathTitle,
      description: parsed.data.pathDescription,
    });
    const createdPath = await getLearningPathForUser(userEmail, learningPath.slug);

    if (!createdPath) {
      return { error: "Unable to prepare your first learning path." };
    }

    await createTopicForUser(userEmail, {
      pathId: createdPath.id,
      title: parsed.data.topicTitle,
      description: parsed.data.topicNextStep,
      estimatedMinutes: 45,
      nextStep: parsed.data.topicNextStep,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to finish onboarding.",
    };
  }

  revalidatePath("/today");
  revalidatePath("/learning-paths");
  redirect("/today");
}
