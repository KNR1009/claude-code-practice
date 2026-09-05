import { describe, expect, it } from "vitest";
import { dueState, formatDueDate, toIsoDate } from "@/lib/date";

describe("toIsoDate", () => {
  it("ローカルタイムの YYYY-MM-DD に整形する", () => {
    expect(toIsoDate(new Date(2026, 8, 5))).toBe("2026-09-05");
    expect(toIsoDate(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("dueState", () => {
  it("今日より前なら overdue", () => {
    expect(dueState("2026-09-04", "2026-09-05")).toBe("overdue");
  });

  it("同日なら today", () => {
    expect(dueState("2026-09-05", "2026-09-05")).toBe("today");
  });

  it("今日より後なら upcoming", () => {
    expect(dueState("2026-09-06", "2026-09-05")).toBe("upcoming");
  });

  it("年をまたいでも正しく比較する", () => {
    expect(dueState("2025-12-31", "2026-01-01")).toBe("overdue");
  });
});

describe("formatDueDate", () => {
  it("ゼロ埋めを外した M/D で表示する", () => {
    expect(formatDueDate("2026-09-05")).toBe("9/5");
    expect(formatDueDate("2026-12-31")).toBe("12/31");
  });
});
