import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  Inbox,
  Layers3,
  NotebookTabs,
  PlayCircle,
  ShieldCheck,
  Target,
} from "lucide-react";
import { auth } from "../../auth";
import { LocaleToggle } from "@/features/locale-toggle/locale-toggle";
import { ThemeToggle } from "@/features/theme-toggle/theme-toggle";
import { isDemoModeActive } from "@/shared/lib/demo";
import { getRequestLocale } from "@/shared/lib/i18n/request-locale";
import type { Locale } from "@/shared/lib/i18n/i18n";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

const copy = {
  en: {
    brandSub: "Learning operating system",
    signIn: "Sign in",
    start: "Start learning",
    eyebrow: "Private learning workspace",
    headline: "A calmer way to keep self-education moving.",
    subhead:
      "Ordo connects learning paths, topics, focused sessions, notes, resources, and practice so your next step is never hidden in scattered tabs.",
    note: "Built for self-learners who want structure without turning learning into task management.",
    previewTitle: "Today",
    previewSubtitle: "Your current learning context stays visible.",
    currentPath: "Current path",
    currentTopic: "Current topic",
    activeSession: "Active session",
    nextStep: "Next step",
    evidence: "Evidence",
    pathValue: "Frontend Engineering",
    topicValue: "Semantic HTML",
    sessionValue: "62% through focus block",
    nextValue: "Capture one note, then practice once.",
    evidenceValue: "1 note / 2 resources / 1 practice task",
    loopEyebrow: "The Ordo loop",
    loopTitle: "Plan the path. Work one topic. Capture knowledge. Practice deliberately.",
    loopDesc:
      "The product is organized around continuity: every note, resource, and practice task belongs to a topic inside a learning path.",
    intake: "Capture",
    intakeDesc: "Save useful material before it gets lost.",
    roadmap: "Organize",
    roadmapDesc: "Turn study goals into paths and topics.",
    session: "Focus",
    sessionDesc: "Study one topic in a dedicated session.",
    knowledge: "Remember",
    knowledgeDesc: "Attach notes and resources to the topic.",
    practice: "Reinforce",
    practiceDesc: "Use practice as proof of understanding.",
    notTitle: "Ordo is not another notes app.",
    notDesc:
      "Notes are only one part of the system. Ordo is about preserving the learning context around them.",
    privateTitle: "Private-first by design",
    privateDesc:
      "Your learning system is personal. The workspace is built around private progress, not social feeds or public dashboards.",
    ctaTitle: "Start with one path and one topic.",
    ctaDesc:
      "Create a workspace, choose a learning path, and let Ordo keep the next step visible.",
    createAccount: "Create account",
  },
  uk: {
    brandSub: "Операційна система навчання",
    signIn: "Увійти",
    start: "Почати навчання",
    eyebrow: "Приватний навчальний простір",
    headline: "Спокійніший спосіб рухати самоосвіту вперед.",
    subhead:
      "Ordo поєднує шляхи навчання, теми, фокус-сесії, нотатки, ресурси й практику, щоб наступний крок не губився серед вкладок.",
    note: "Для людей, які навчаються самостійно й хочуть структуру без перетворення навчання на менеджер задач.",
    previewTitle: "Сьогодні",
    previewSubtitle: "Поточний навчальний контекст завжди видно.",
    currentPath: "Поточний шлях",
    currentTopic: "Поточна тема",
    activeSession: "Активна сесія",
    nextStep: "Наступний крок",
    evidence: "Докази",
    pathValue: "Frontend Engineering",
    topicValue: "Semantic HTML",
    sessionValue: "62% фокус-блоку",
    nextValue: "Зафіксувати одну нотатку й один раз потренуватись.",
    evidenceValue: "1 нотатка / 2 ресурси / 1 практичне завдання",
    loopEyebrow: "Цикл Ordo",
    loopTitle: "Спланувати шлях. Опрацювати тему. Зафіксувати знання. Закріпити практикою.",
    loopDesc:
      "Продукт побудований навколо безперервності: кожна нотатка, ресурс і практичне завдання належать темі всередині навчального шляху.",
    intake: "Зібрати",
    intakeDesc: "Зберегти корисний матеріал, перш ніж він загубиться.",
    roadmap: "Організувати",
    roadmapDesc: "Перетворити навчальні цілі на шляхи й теми.",
    session: "Сфокусуватись",
    sessionDesc: "Вивчати одну тему в окремій сесії.",
    knowledge: "Запам'ятати",
    knowledgeDesc: "Прив'язати нотатки й ресурси до теми.",
    practice: "Закріпити",
    practiceDesc: "Використати практику як доказ розуміння.",
    notTitle: "Ordo — не ще один застосунок для нотаток.",
    notDesc:
      "Нотатки є лише частиною системи. Ordo зберігає навчальний контекст навколо них.",
    privateTitle: "Приватність з першого кроку",
    privateDesc:
      "Ваша система навчання персональна. Простір побудований навколо приватного прогресу, а не стрічок чи публічних dashboard.",
    ctaTitle: "Почніть з одного шляху й однієї теми.",
    ctaDesc:
      "Створіть простір, оберіть навчальний шлях, а Ordo триматиме наступний крок видимим.",
    createAccount: "Створити акаунт",
  },
} satisfies Record<Locale, Record<string, string>>;

const loopItems = [
  { title: "intake", desc: "intakeDesc", icon: Inbox },
  { title: "roadmap", desc: "roadmapDesc", icon: Layers3 },
  { title: "session", desc: "sessionDesc", icon: PlayCircle },
  { title: "knowledge", desc: "knowledgeDesc", icon: NotebookTabs },
  { title: "practice", desc: "practiceDesc", icon: Target },
] as const;

export default async function LandingPage() {
  const session = await auth();

  if (session?.user || isDemoModeActive()) {
    redirect("/today");
  }

  const locale = await getRequestLocale();
  const t = copy[locale];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 md:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-border/60 pb-5">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30"
          >
            <span className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-surface-elevated shadow-sm">
              <Brain aria-hidden="true" className="h-4 w-4 text-primary" />
            </span>
            <span>
              <span className="block text-sm font-bold leading-none text-foreground">Ordo</span>
              <span className="mt-1 block text-xs font-medium text-muted-foreground">
                {t.brandSub}
              </span>
            </span>
          </Link>

          <nav className="flex items-center gap-2" aria-label="Public navigation">
            <LocaleToggle className="hidden sm:inline-flex" />
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/sign-in">{t.signIn}</Link>
            </Button>
            <Button asChild size="sm" className="rounded-xl">
              <Link href="/sign-up">{t.start}</Link>
            </Button>
          </nav>
        </header>

        <section className="grid gap-10 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(440px,0.72fr)] lg:items-center lg:py-16">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {t.eyebrow}
            </p>
            <h1 className="mt-5 max-w-4xl text-[40px] font-bold leading-[1.04] tracking-tight text-foreground md:text-[64px]">
              {t.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {t.subhead}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 rounded-xl px-5">
                <Link href="/sign-up">
                  {t.start}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl border-border/70 px-5">
                <Link href="/sign-in">{t.signIn}</Link>
              </Button>
            </div>

            <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground">{t.note}</p>
          </div>

          <Card className="rounded-[28px] border-border/70 bg-card p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  {t.previewTitle}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">Semantic HTML</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.previewSubtitle}</p>
              </div>
              <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                Private
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                [t.currentPath, t.pathValue, Layers3],
                [t.currentTopic, t.topicValue, BookOpen],
                [t.activeSession, t.sessionValue, PlayCircle],
                [t.nextStep, t.nextValue, CheckCircle2],
                [t.evidence, t.evidenceValue, FileText],
              ].map(([label, value, Icon]) => {
                const ItemIcon = Icon as typeof Layers3;

                return (
                  <div
                    key={label as string}
                    className="grid grid-cols-[32px_130px_1fr] items-center gap-3 rounded-2xl border border-border/45 bg-surface-elevated px-3 py-3"
                  >
                    <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ItemIcon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {label as string}
                    </span>
                    <span className="text-sm font-bold leading-6 text-foreground">{value as string}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        <section className="border-t border-border/60 py-10">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {t.loopEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t.loopTitle}
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">{t.loopDesc}</p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {loopItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/55 bg-card p-5"
                >
                  <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                  <h3 className="mt-5 text-base font-bold text-foreground">{t[item.title]}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{t[item.desc]}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 border-t border-border/60 py-10 md:grid-cols-2">
          <Card className="rounded-3xl border-border/60 bg-card p-6">
            <NotebookTabs aria-hidden="true" className="h-5 w-5 text-primary" />
            <h2 className="mt-5 text-2xl font-bold text-foreground">{t.notTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{t.notDesc}</p>
          </Card>
          <Card className="rounded-3xl border-border/60 bg-card p-6">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-primary" />
            <h2 className="mt-5 text-2xl font-bold text-foreground">{t.privateTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{t.privateDesc}</p>
          </Card>
        </section>

        <section className="pb-10">
          <div className="flex flex-col gap-4 rounded-[28px] border border-border/60 bg-surface-elevated p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t.ctaTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.ctaDesc}</p>
            </div>
            <Button asChild size="lg" className="shrink-0 rounded-xl">
              <Link href="/sign-up">{t.createAccount}</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
