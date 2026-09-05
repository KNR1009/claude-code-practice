import { CATEGORIES, type CategoryId } from "@/types/task";

type Props = {
  id?: string;
  value: CategoryId;
  onChange: (categoryId: CategoryId) => void;
  className?: string;
};

/** カテゴリ選択。フォームと詳細画面で共用する */
export function CategorySelect({ id, value, onChange, className }: Props) {
  return (
    <select
      id={id}
      className={className}
      value={value}
      onChange={(event) => onChange(event.target.value as CategoryId)}
    >
      {CATEGORIES.map((category) => (
        <option key={category.id} value={category.id}>
          {category.label}
        </option>
      ))}
    </select>
  );
}
