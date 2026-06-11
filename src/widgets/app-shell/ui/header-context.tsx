"use client";

import { usePathname } from "next/navigation";
import { useTranslation } from "@/shared/lib/i18n/TranslationContext";

export function HeaderContext() {
  const pathname = usePathname();
  const { t } = useTranslation();

  let section = t("nav.workspace");
  if (pathname === "/today") {
    section = t("nav.today");
  } else if (pathname.startsWith("/learning-paths")) {
    section = t("nav.paths");
  } else if (pathname.startsWith("/sessions")) {
    section = t("nav.sessions");
  } else if (pathname === "/notes") {
    section = t("nav.notes");
  } else if (pathname === "/practice") {
    section = t("nav.practice");
  } else if (pathname === "/analytics") {
    section = t("nav.analytics");
  } else if (pathname === "/settings") {
    section = t("nav.settings");
  }

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground select-none">
      <span className="text-muted-foreground/60">Ordo</span>
      <span className="text-muted-foreground/30 font-normal">/</span>
      <span className="text-foreground/90">{section}</span>
    </div>
  );
}
