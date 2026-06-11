import Link from "next/link";
import { Mail } from "lucide-react";
import { getRequestLocale } from "@/shared/lib/i18n/request-locale";
import { translate } from "@/shared/lib/i18n/i18n";
import { AuthShell } from "@/widgets/auth-shell/auth-shell";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

export default async function ForgotPasswordPage() {
  const locale = await getRequestLocale();
  const t = (key: string) => translate(locale, key);

  return (
    <AuthShell
      eyebrow={t("auth.recoveryEyebrow")}
      title={t("auth.recoveryHeroTitle")}
      description={t("auth.recoveryHeroDesc")}
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
      <Card className="rounded-xl border-border/75 bg-card shadow-[0_18px_60px_rgba(18,16,12,0.08)] dark:shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex size-9 items-center justify-center rounded-md border border-border/70 bg-secondary/40">
            <Mail aria-hidden="true" className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl leading-tight">{t("auth.recoveryTitle")}</CardTitle>
            <CardDescription className="mt-2 leading-6">
              {t("auth.recoveryDesc")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" aria-label="Forgot password">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                {t("auth.email")}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <Button type="button" className="w-full">
              {t("auth.recoverySubmit")}
            </Button>
          </form>

          <div className="mt-6 border-t border-border/70 pt-5 text-center text-sm text-muted-foreground">
            {t("auth.rememberedPassword")}{" "}
            <Link
              href="/sign-in"
              className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
            >
              {t("auth.signIn")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
