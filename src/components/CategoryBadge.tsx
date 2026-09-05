import type { CSSProperties } from "react";
import type { Category } from "@/types/category";
import styles from "./CategoryBadge.module.css";

type Props = {
  category: Category | null;
};

/** カテゴリ名を色付きで表示する。未設定なら何も出さない */
export function CategoryBadge({ category }: Props) {
  if (!category) return null;

  return (
    <span
      className={styles.badge}
      style={{ "--category-color": category.color } as CSSProperties}
    >
      {category.label}
    </span>
  );
}
