import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, Layers3, PlayCircle, ShieldCheck, Target } from "lucide-react";
import { LocaleToggle } from "@/features/locale-toggle/locale-toggle";
import { ThemeToggle } from "@/features/theme-toggle/theme-toggle";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  brandSubtitle: string;
  controlsLabel: string;
  featureLabels: [string, string, string];
  contextEyebrow: string;
  contextTitle: string;
  contextStatus: string;
  contextNote: string;
  children: ReactNode;
};

const contextSteps = [
  { label: "Path", value: "Frontend Engineering", icon: Layers3 },
  { label: "Topic", value: "Semantic HTML", icon: BookOpen },
  { label: "Session", value: "Focused block", icon: PlayCircle },
  { label: "Practice", value: "Evidence waiting", icon: Target },
] as const;

export function AuthShell({
  eyebrow,
  title,
  description,
  brandSubtitle,
  controlsLabel,
  featureLabels,
  contextEyebrow,
  contextTitle,
  contextStatus,
  contextNote,
  children,
}: AuthShellProps) {
  const featureIcons = [ShieldCheck, PlayCircle, CheckCircle2] as const;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-[1400px] gap-4 px-4 py-4 md:px-6 lg:grid-cols-[330px_minmax(0,1fr)_440px]">
        <aside className="flex flex-col justify-between rounded-[32px] border border-border/55 bg-card p-5 shadow-sm">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-surface-elevated shadow-sm">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 text-primary" />
              </span>
              <span>
                <span className="block text-sm font-bold leading-none text-foreground">Ordo</span>
                <span className="mt-1 block text-xs font-medium text-muted-foreground">
                  {brandSubtitle}
                </span>
              </span>
            </Link>

            <div className="mt-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                {eyebrow}
              </p>
              <h1 className="mt-5 text-[38px] font-bold leading-[1.02] tracking-tight text-foreground">
                {title}
              </h1>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">{description}</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2" aria-label={controlsLabel}>
            <LocaleToggle />
            <ThemeToggle />
          </div>
        </aside>

        <section className="hidden rounded-[32px] border border-border/55 bg-surface p-5 shadow-sm lg:block">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border/55 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {contextEyebrow}
                </p>
                <h2 className="mt-1 text-xl font-bold text-foreground">{contextTitle}</h2>
              </div>
              <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                {contextStatus}
              </span>
            </div>

            <div className="grid flex-1 content-center gap-4 py-6">
              <div className="rounded-[30px] border border-border/55 bg-card p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {contextSteps.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-3xl border border-border/45 bg-surface-elevated p-4">
                        <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-bold text-foreground">{item.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border/45 bg-secondary/25 px-4 py-3 text-xs font-semibold text-muted-foreground">
                  <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-primary" />
                  {contextNote}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {featureLabels.map((item, index) => {
                  const Icon = featureIcons[index] ?? ShieldCheck;
                  return (
                    <div key={item} className="rounded-3xl border border-border/45 bg-card p-4">
                      <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                      <p className="mt-4 text-sm font-bold text-foreground">{item}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center rounded-[32px] border border-border/55 bg-surface p-4 shadow-sm">
          <div className="w-full">{children}</div>
        </section>
      </div>
    </main>
  );
}
