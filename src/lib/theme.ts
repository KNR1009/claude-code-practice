export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "kanban-theme";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

/** 保存済みの設定があればそれを、無ければ OS の設定を採用する */
export function resolveInitialTheme(
  stored: string | null,
  prefersDark: boolean,
): Theme {
  if (isTheme(stored)) return stored;
  return prefersDark ? "dark" : "light";
}

export function toggleTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

/**
 * 初回描画前に data-theme を当てて、切り替え時のちらつきを防ぐスクリプト。
 * layout から同期実行する。
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=(s==='light'||s==='dark')?s:(d?'dark':'light');}catch(e){}})();`;
