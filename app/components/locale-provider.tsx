"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { writeBrowserCookie } from "@/app/lib";
import {
  getMessages,
  LOCALE_COOKIE_NAME,
  type Locale,
} from "@/app/lib/locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: ReturnType<typeof getMessages>;
};

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(nextLocale: Locale) {
    setLocaleState(nextLocale);
    writeBrowserCookie(LOCALE_COOKIE_NAME, nextLocale, {
      maxAge: ONE_YEAR_IN_SECONDS,
      path: "/",
      sameSite: "Lax",
    });
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      messages: getMessages(locale),
    }),
    [locale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
