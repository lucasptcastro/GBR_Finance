"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps as NextThemeProviderProps,
} from "next-themes";
import * as React from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
} & Omit<NextThemeProviderProps, "children">;

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "grv-finance-theme",
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      defaultTheme={defaultTheme}
      storageKey={storageKey}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
