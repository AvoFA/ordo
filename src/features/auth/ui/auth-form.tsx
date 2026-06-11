"use client";

import { useActionState } from "react";
import { AuthCard, type AuthField } from "@/features/auth/ui/auth-card";
import type { AuthActionState } from "@/features/auth/actions/auth.actions";

type AuthFormProps = {
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
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  notice?: string;
};

const initialState: AuthActionState = {};

export function AuthForm({ action, ...cardProps }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <AuthCard
      {...cardProps}
      action={formAction}
      errorMessage={state.error}
      isPending={isPending}
    />
  );
}
