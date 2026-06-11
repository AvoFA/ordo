"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";
import { ThemeProvider } from "@/shared/theme/theme-provider";
import { ToastContainer } from "@/shared/ui/toast-container";
import { TranslationProvider } from "@/shared/lib/i18n/TranslationContext";
import type { Locale } from "@/shared/lib/i18n/i18n";

export function Providers({
  children,
  initialLocale,
}: Readonly<{
  children: React.ReactNode;
  initialLocale: Locale;
}>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TranslationProvider initialLocale={initialLocale}>
          <ThemeProvider>
            {children}
            <ToastContainer />
          </ThemeProvider>
        </TranslationProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
