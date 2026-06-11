"use client";

import { useActionState } from "react";
import { ArrowRight, BookOpen, ListChecks, Sparkles } from "lucide-react";
import {
  completeOnboardingAction,
  type OnboardingActionState,
} from "@/features/onboarding/actions/onboarding.actions";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

type OnboardingFormCopy = {
  cardTitle: string;
  cardDescription: string;
  pathTitleLabel: string;
  pathTitlePlaceholder: string;
  pathDescriptionLabel: string;
  pathDescriptionPlaceholder: string;
  topicTitleLabel: string;
  topicTitlePlaceholder: string;
  topicNextStepLabel: string;
  topicNextStepPlaceholder: string;
  submit: string;
  submitting: string;
  stepPath: string;
  stepTopic: string;
  stepToday: string;
};

type OnboardingFormProps = {
  copy: OnboardingFormCopy;
};

const initialState: OnboardingActionState = {};

export function OnboardingForm({ copy }: OnboardingFormProps) {
  const [state, formAction, isPending] = useActionState(completeOnboardingAction, initialState);

  return (
    <Card className="rounded-3xl border-border/70 bg-card/95 shadow-xl shadow-black/5 dark:shadow-black/25">
      <CardHeader className="border-b border-border/55 pb-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-primary" />
          </span>
          <div>
            <CardTitle className="text-2xl leading-tight">{copy.cardTitle}</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.cardDescription}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: BookOpen, label: copy.stepPath },
            { icon: ListChecks, label: copy.stepTopic },
            { icon: ArrowRight, label: copy.stepToday },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-border/55 bg-secondary/20 p-3 text-xs font-semibold text-foreground"
              >
                <Icon aria-hidden="true" className="mb-2 h-4 w-4 text-primary" />
                {item.label}
              </div>
            );
          })}
        </div>

        <form action={formAction} className="space-y-5" aria-label={copy.cardTitle}>
          <div className="space-y-2">
            <label htmlFor="pathTitle" className="text-sm font-semibold text-foreground">
              {copy.pathTitleLabel}
            </label>
            <Input
              id="pathTitle"
              name="pathTitle"
              placeholder={copy.pathTitlePlaceholder}
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="pathDescription" className="text-sm font-semibold text-foreground">
              {copy.pathDescriptionLabel}
            </label>
            <textarea
              id="pathDescription"
              name="pathDescription"
              placeholder={copy.pathDescriptionPlaceholder}
              rows={3}
              className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-6 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/45 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="topicTitle" className="text-sm font-semibold text-foreground">
                {copy.topicTitleLabel}
              </label>
              <Input
                id="topicTitle"
                name="topicTitle"
                placeholder={copy.topicTitlePlaceholder}
                autoComplete="off"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="topicNextStep" className="text-sm font-semibold text-foreground">
                {copy.topicNextStepLabel}
              </label>
              <Input
                id="topicNextStep"
                name="topicNextStep"
                placeholder={copy.topicNextStepPlaceholder}
                autoComplete="off"
              />
            </div>
          </div>

          {state.error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">
              {state.error}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isPending}>
            {isPending ? copy.submitting : copy.submit}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
