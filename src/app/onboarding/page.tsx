import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Brain, CheckCircle2, NotebookTabs, PlayCircle } from "lucide-react";
import { auth } from "../../../auth";
import { listLearningPathsForUser } from "@/entities/learning-path/api/learning-paths.repository";
import { OnboardingForm } from "@/features/onboarding/ui/onboarding-form";
import { translate, type Locale } from "@/shared/lib/i18n/i18n";

const principles = [
  { key: "path", icon: Brain },
  { key: "session", icon: PlayCircle },
  { key: "knowledge", icon: NotebookTabs },
  { key: "progress", icon: CheckCircle2 },
] as const;

export default async function OnboardingPage() {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) {
    redirect("/sign-in");
  }

  const paths = await listLearningPathsForUser(userEmail);

  if (paths.length > 0) {
    redirect("/today");
  }

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("ordo_locale")?.value;
  const locale = (localeCookie === "uk" ? "uk" : "en") as Locale;
  const t = (key: string) => translate(locale, key);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl gap-10 px-5 py-6 md:px-8 lg:grid-cols-[0.9fr_520px] lg:items-center">
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {t("onboarding.eyebrow")}
          </p>
          <h1 className="mt-5 max-w-2xl text-[36px] font-bold leading-[1.05] tracking-tight md:text-[52px]">
            {t("onboarding.title")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground">
            {t("onboarding.subtitle")}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {principles.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="rounded-2xl border border-border/55 bg-surface-elevated p-4"
                >
                  <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                  <h2 className="mt-3 text-sm font-bold text-foreground">
                    {t(`onboarding.principles.${item.key}.title`)}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {t(`onboarding.principles.${item.key}.desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <OnboardingForm
          copy={{
            cardTitle: t("onboarding.cardTitle"),
            cardDescription: t("onboarding.cardDescription"),
            pathTitleLabel: t("onboarding.pathTitleLabel"),
            pathTitlePlaceholder: t("onboarding.pathTitlePlaceholder"),
            pathDescriptionLabel: t("onboarding.pathDescriptionLabel"),
            pathDescriptionPlaceholder: t("onboarding.pathDescriptionPlaceholder"),
            topicTitleLabel: t("onboarding.topicTitleLabel"),
            topicTitlePlaceholder: t("onboarding.topicTitlePlaceholder"),
            topicNextStepLabel: t("onboarding.topicNextStepLabel"),
            topicNextStepPlaceholder: t("onboarding.topicNextStepPlaceholder"),
            submit: t("onboarding.submit"),
            submitting: t("onboarding.submitting"),
            stepPath: t("onboarding.stepPath"),
            stepTopic: t("onboarding.stepTopic"),
            stepToday: t("onboarding.stepToday"),
          }}
        />
      </div>
    </main>
  );
}
