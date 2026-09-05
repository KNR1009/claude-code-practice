/** 締切日の状態。バッジの色分けに使う */
export type DueState = "overdue" | "today" | "upcoming";

/** Date をローカルタイムの "YYYY-MM-DD" に変換する */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 今日の日付を "YYYY-MM-DD" で返す */
export function todayIso(): string {
  return toIsoDate(new Date());
}

/**
 * 締切日が今日より前なら overdue、当日なら today、それ以外は upcoming。
 * "YYYY-MM-DD" は辞書順比較がそのまま日付順になる。
 */
export function dueState(dueDate: string, today: string): DueState {
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  return "upcoming";
}

/** 締切日を "9/12" の形で表示する */
export function formatDueDate(dueDate: string): string {
  const [, month, day] = dueDate.split("-");
  return `${Number(month)}/${Number(day)}`;
}
