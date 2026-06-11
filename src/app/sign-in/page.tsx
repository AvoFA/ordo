import { signInAction } from "@/features/auth/actions/auth.actions";
import { AuthForm } from "@/features/auth/ui/auth-form";
import { getRequestLocale } from "@/shared/lib/i18n/request-locale";
import { translate } from "@/shared/lib/i18n/i18n";
import { AuthShell } from "@/widgets/auth-shell/auth-shell";

type SignInPageProps = {
  searchParams: Promise<{
    registered?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const locale = await getRequestLocale();
  const t = (key: string) => translate(locale, key);

  return (
    <AuthShell
      eyebrow={t("auth.signInEyebrow")}
      title={t("auth.signInHeroTitle")}
      description={t("auth.signInHeroDesc")}
      brandSubtitle={t("auth.brandSub")}
      controlsLabel={t("auth.controlsLabel")}
      featureLabels={[
        t("auth.featurePrivate"),
        t("auth.featureFocus"),
        t("auth.featureProgress"),
      ]}
      contextEyebrow={t("auth.contextEyebrow")}
      contextTitle={t("auth.contextTitle")}
      contextStatus={t("auth.contextStatus")}
      contextNote={t("auth.contextNote")}
    >
      <AuthForm
        title={t("auth.signInTitle")}
        description={t("auth.signInDesc")}
        submitLabel={t("auth.signInSubmit")}
        pendingLabel={t("auth.signingIn")}
        footerText={t("auth.newToOrdo")}
        footerHref="/sign-up"
        footerLabel={t("auth.createAccount")}
        secondaryHref="/forgot-password"
        secondaryLabel={t("auth.forgotPassword")}
        securityNote={t("auth.securityNote")}
        fields={[
          {
            id: "email",
            label: t("auth.email"),
            type: "email",
            placeholder: "you@example.com",
            autoComplete: "email",
          },
          {
            id: "password",
            label: t("auth.password"),
            type: "password",
            placeholder: t("auth.passwordPlaceholder"),
            autoComplete: "current-password",
          },
        ]}
        action={signInAction}
        notice={params.registered === "1" ? t("auth.registeredNotice") : undefined}
      />
    </AuthShell>
  );
}
