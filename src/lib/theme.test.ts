import { describe, expect, it } from "vitest";
import { isTheme, resolveInitialTheme, toggleTheme } from "@/lib/theme";

describe("isTheme", () => {
  it("light / dark だけを受け入れる", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});

describe("resolveInitialTheme", () => {
  it("保存済みの設定を優先する", () => {
    expect(resolveInitialTheme("light", true)).toBe("light");
    expect(resolveInitialTheme("dark", false)).toBe("dark");
  });

  it("保存値が無ければ OS の設定に従う", () => {
    expect(resolveInitialTheme(null, true)).toBe("dark");
    expect(resolveInitialTheme(null, false)).toBe("light");
  });

  it("不正な保存値は無視する", () => {
    expect(resolveInitialTheme("blue", true)).toBe("dark");
  });
});

describe("toggleTheme", () => {
  it("light と dark を往復する", () => {
    expect(toggleTheme("light")).toBe("dark");
    expect(toggleTheme("dark")).toBe("light");
  });
});
