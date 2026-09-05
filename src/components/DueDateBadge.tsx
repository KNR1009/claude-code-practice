import { dueState, formatDueDate } from "@/lib/date";
import styles from "./DueDateBadge.module.css";

type Props = {
  dueDate: string;
  /** "YYYY-MM-DD"。未確定（マウント前）なら期限切れの色分けをしない */
  today: string | null;
};

const STATE_LABEL = {
  overdue: "期限切れ",
  today: "今日が締切",
  upcoming: "締切",
} as const;

/** 締切日を表示し、今日との前後関係で色を変えるバッジ */
export function DueDateBadge({ dueDate, today }: Props) {
  const state = today ? dueState(dueDate, today) : "upcoming";

  return (
    <span
      className={`${styles.badge} ${styles[state]}`}
      data-state={today ? state : undefined}
    >
      <span className={styles.srOnly}>{STATE_LABEL[state]}</span>
      {formatDueDate(dueDate)}
    </span>
  );
}
