/** ドラッグ中のタスク ID を dataTransfer に載せるときのキー */
export const TASK_ID_MIME = "text/plain";

/** カードのどちら側に差し込むか */
export type DropSide = "before" | "after";

/** カードの上半分に落ちたなら before、下半分なら after */
export function dropSide(
  clientY: number,
  rect: { top: number; height: number },
): DropSide {
  return clientY < rect.top + rect.height / 2 ? "before" : "after";
}

/**
 * 表示中の並びから、差し込み先の基準となるタスク ID を決める。
 * after で末尾のカードに落ちた場合は null（＝列の末尾）を返す。
 */
export function resolveBeforeId(
  orderedIds: readonly string[],
  targetId: string,
  side: DropSide,
): string | null {
  if (side === "before") return targetId;
  const index = orderedIds.indexOf(targetId);
  if (index < 0) return null;
  return orderedIds[index + 1] ?? null;
}
