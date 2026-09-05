import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTheme } from "@/hooks/useTheme";
import { THEME_STORAGE_KEY } from "@/lib/theme";

/** jsdom には matchMedia が無いためスタブを差し込む */
function stubMatchMedia(prefersDark: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches: prefersDark }),
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useTheme", () => {
  it("保存値が無ければ OS の設定を採用し、html に反映する", () => {
    stubMatchMedia(true);
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("保存済みの設定を優先する", () => {
    stubMatchMedia(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("light");
  });

  it("toggle で切り替え、localStorage に保存する", () => {
    stubMatchMedia(false);
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
