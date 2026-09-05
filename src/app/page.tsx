import { KanbanBoard } from "@/components/KanbanBoard";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>カンバンタスク管理</h1>
      <p className={styles.lead}>
        タスクを追加し、カードをドラッグして列の間を移動できます。
        カードをクリックすると詳細の確認・編集・アーカイブ・削除ができます。
      </p>
      <KanbanBoard />
    </main>
  );
}
