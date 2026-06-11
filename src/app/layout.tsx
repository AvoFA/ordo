import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/app/providers";
import { getRequestLocale } from "@/shared/lib/i18n/request-locale";

export const metadata: Metadata = {
  title: "Ordo",
  description: "Calm learning operating system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
