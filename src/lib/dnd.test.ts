import { describe, expect, it } from "vitest";
import { dropSide, resolveBeforeId } from "@/lib/dnd";

const rect = { top: 100, height: 40 };

describe("dropSide", () => {
  it("上半分なら before", () => {
    expect(dropSide(100, rect)).toBe("before");
    expect(dropSide(119, rect)).toBe("before");
  });

  it("中央ちょうどは after", () => {
    expect(dropSide(120, rect)).toBe("after");
  });

  it("下半分なら after", () => {
    expect(dropSide(139, rect)).toBe("after");
  });
});

describe("resolveBeforeId", () => {
  const ids = ["1", "2", "3"];

  it("before なら対象そのものを返す", () => {
    expect(resolveBeforeId(ids, "2", "before")).toBe("2");
  });

  it("after なら次の ID を返す", () => {
    expect(resolveBeforeId(ids, "2", "after")).toBe("3");
  });

  it("末尾の after は null（列の末尾）", () => {
    expect(resolveBeforeId(ids, "3", "after")).toBeNull();
  });

  it("知らない ID の after は null", () => {
    expect(resolveBeforeId(ids, "unknown", "after")).toBeNull();
  });
});
