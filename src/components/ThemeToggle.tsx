"use client";

import { useTheme } from "@/hooks/useTheme";
import styles from "./ThemeToggle.module.css";

/** ライト / ダークを切り替えるボタン */
export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      className={styles.toggle}
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={
        isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"
      }
    >
      <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
      <span className={styles.label}>{isDark ? "ライト" : "ダーク"}</span>
    </button>
  );
}
