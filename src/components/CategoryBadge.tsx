import { findCategory, type CategoryId } from "@/types/task";
import styles from "./CategoryBadge.module.css";

type Props = {
  categoryId: CategoryId;
};

/** カテゴリ名を色付きで表示する。カテゴリなしの場合は何も出さない */
export function CategoryBadge({ categoryId }: Props) {
  if (categoryId === "none") return null;
  const category = findCategory(categoryId);

  return (
    <span
      className={styles.badge}
      style={{ "--category-color": category.color } as React.CSSProperties}
    >
      {category.label}
    </span>
  );
}
