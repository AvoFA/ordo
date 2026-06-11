import { cookies, headers } from "next/headers";
import type { Locale } from "@/shared/lib/i18n/i18n";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("ordo_locale")?.value;

  if (localeCookie === "uk" || localeCookie === "en") {
    return localeCookie;
  }

  const headerStore = await headers();
  const acceptedLanguage = headerStore.get("accept-language")?.toLowerCase() ?? "";

  if (acceptedLanguage.includes("uk") || acceptedLanguage.includes("ua")) {
    return "uk";
  }

  return "en";
}
