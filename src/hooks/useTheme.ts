"use client";

import { useCallback, useEffect, useState } from "react";
import {
  resolveInitialTheme,
  THEME_STORAGE_KEY,
  toggleTheme,
  type Theme,
} from "@/lib/theme";

export type UseTheme = {
  theme: Theme;
  /** マウント前は OS / 保存値が読めないため、確定するまで false */
  ready: boolean;
  toggle: () => void;
};

/** テーマを保持し、<html data-theme> と localStorage に反映するフック */
export function useTheme(): UseTheme {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  // SSR とハイドレーションの不一致を避けるため、実際の値はマウント後に読む
  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia?.(
      "(prefers-color-scheme: dark)",
    ).matches;
    setTheme(resolveInitialTheme(stored, Boolean(prefersDark)));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, ready]);

  const toggle = useCallback(() => {
    setTheme((current) => toggleTheme(current));
  }, []);

  return { theme, ready, toggle };
}
