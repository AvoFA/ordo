import en from "./dictionaries/en.json";
import uk from "./dictionaries/uk.json";

export type Locale = "en" | "uk";

export const dictionaries = { en, uk } as const;

export type TranslationKey = string;
export type TranslationParams = Record<string, string | number>;

export function getNestedValue(obj: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: TranslationParams
): string {
  const dictionary = dictionaries[locale] || en;
  const template = getNestedValue(dictionary, key) || getNestedValue(en, key);

  if (!template) {
    return key;
  }

  let result = template;

  if (template.includes("|") && params && typeof params.count === "number") {
    const count = params.count;
    const parts = template.split("|").map((p) => p.trim());
    if (locale === "uk") {
      const mod10 = count % 10;
      const mod100 = count % 100;
      let partIndex = 2; // "many" (e.g. 5, 10, 11...)
      if (mod10 === 1 && mod100 !== 11) {
        partIndex = 0; // "one" (e.g. 1, 21...)
      } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        partIndex = 1; // "few" (e.g. 2, 3, 4, 22...)
      }
      // Fallback in case dictionary parts are incomplete
      result = parts[partIndex] ?? parts[parts.length - 1] ?? template;
    } else {
      // English rules
      result = count === 1 ? parts[0]! : (parts[1] ?? parts[0]!);
    }
  }

  if (params) {
    Object.entries(params).forEach(([paramKey, val]) => {
      result = result.replace(new RegExp(`{${paramKey}}`, "g"), String(val));
    });
  }

  return result;
}
