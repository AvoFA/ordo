import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

export type AuthField = {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  placeholder: string;
  autoComplete: string;
};

type AuthCardProps = {
  title: string;
  description: string;
  fields: AuthField[];
  submitLabel: string;
  pendingLabel?: string;
  footerText: string;
  footerHref: string;
  footerLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  securityNote?: string;
  action?: (formData: FormData) => void;
  errorMessage?: string;
  isPending?: boolean;
  notice?: string;
};

export function AuthCard({
  title,
  description,
  fields,
  submitLabel,
  pendingLabel = "Please wait...",
  footerText,
  footerHref,
  footerLabel,
  secondaryHref,
  secondaryLabel,
  securityNote = "Authentication is private-first. Passwords are never stored in plain text.",
  action,
  errorMessage,
  isPending = false,
  notice,
}: AuthCardProps) {
  return (
    <Card className="rounded-[28px] border-border/75 bg-card shadow-xl">
      <CardHeader className="space-y-4 pb-5">
        <div className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-secondary/40">
          <LockKeyhole aria-hidden="true" className="h-4 w-4 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl leading-tight tracking-tight">{title}</CardTitle>
          <CardDescription className="mt-2 leading-7">{description}</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-4" aria-label={title}>
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id} className="text-sm font-medium text-foreground">
                {field.label}
              </label>
              <Input
                id={field.id}
                name={field.id}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                className="h-11 rounded-xl"
              />
            </div>
          ))}

          {errorMessage ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
              {errorMessage}
            </p>
          ) : null}

          {notice ? (
            <p className="rounded-md border border-primary/20 bg-secondary/35 px-3 py-2 text-sm leading-6 text-foreground">
              {notice}
            </p>
          ) : null}

          <Button type="submit" className="mt-2 h-11 w-full rounded-xl" disabled={isPending}>
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </form>

        {secondaryHref && secondaryLabel ? (
          <div className="mt-3 text-right text-xs">
            <Link
              href={secondaryHref}
              className="font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
            >
              {secondaryLabel}
            </Link>
          </div>
        ) : null}

        <p className="mt-4 text-xs leading-5 text-muted-foreground">{securityNote}</p>

        <div className="mt-6 border-t border-border/70 pt-5 text-center text-sm text-muted-foreground">
          {footerText}{" "}
          <Link
            href={footerHref}
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
          >
            {footerLabel}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
