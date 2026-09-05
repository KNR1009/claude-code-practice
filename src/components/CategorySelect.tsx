import type { Category } from "@/types/category";

type Props = {
  id?: string;
  categories: readonly Category[];
  value: string | null;
  onChange: (categoryId: string | null) => void;
  className?: string;
};

/** カテゴリ選択。フォームと詳細画面で共用する */
export function CategorySelect({
  id,
  categories,
  value,
  onChange,
  className,
}: Props) {
  return (
    <select
      id={id}
      className={className}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value || null)}
    >
      <option value="">なし</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.label}
        </option>
      ))}
    </select>
  );
}
