import { signUpAction } from "@/features/auth/actions/auth.actions";
import { AuthForm } from "@/features/auth/ui/auth-form";
import { getRequestLocale } from "@/shared/lib/i18n/request-locale";
import { translate } from "@/shared/lib/i18n/i18n";
import { AuthShell } from "@/widgets/auth-shell/auth-shell";

export default async function SignUpPage() {
  const locale = await getRequestLocale();
  const t = (key: string) => translate(locale, key);

  return (
    <AuthShell
      eyebrow={t("auth.signUpEyebrow")}
      title={t("auth.signUpHeroTitle")}
      description={t("auth.signUpHeroDesc")}
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
        title={t("auth.signUpTitle")}
        description={t("auth.signUpDesc")}
        submitLabel={t("auth.signUpSubmit")}
        pendingLabel={t("auth.creatingAccount")}
        footerText={t("auth.alreadyHaveAccount")}
        footerHref="/sign-in"
        footerLabel={t("auth.signIn")}
        securityNote={t("auth.securityNote")}
        fields={[
          {
            id: "name",
            label: t("auth.name"),
            type: "text",
            placeholder: t("auth.namePlaceholder"),
            autoComplete: "name",
          },
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
            placeholder: t("auth.newPasswordPlaceholder"),
            autoComplete: "new-password",
          },
        ]}
        action={signUpAction}
      />
    </AuthShell>
  );
}
