import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  children?: ReactNode;
};

export function EmptyState({
  eyebrow,
  title,
  description,
  emptyTitle,
  emptyDescription,
  children,
}: EmptyStateProps) {
  return (
    <div className="w-full space-y-6">
      <section className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase leading-none tracking-[0.08em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 text-[34px] font-semibold leading-tight text-foreground">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
      </section>

      <Card className="rounded-lg border-border/70 bg-card/85 shadow-none">
        <CardHeader>
          <CardTitle>{emptyTitle}</CardTitle>
          <CardDescription>{emptyDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-5" />
          {children ?? (
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              This section is ready for product functionality once real learning data is connected.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
