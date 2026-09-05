export type Category = {
  id: string;
  label: string;
  /** COLOR_PALETTE のいずれかの値 */
  color: string;
};

/** カテゴリ作成時にユーザーが入力する値 */
export type CategoryDraft = {
  label: string;
  color: string;
};

export type PaletteColor = {
  value: string;
  label: string;
};

/** カテゴリに設定できる 10 色 */
export const COLOR_PALETTE: readonly PaletteColor[] = [
  { value: "#dc2626", label: "レッド" },
  { value: "#ea580c", label: "オレンジ" },
  { value: "#d97706", label: "アンバー" },
  { value: "#16a34a", label: "グリーン" },
  { value: "#0d9488", label: "ティール" },
  { value: "#2563eb", label: "ブルー" },
  { value: "#4f46e5", label: "インディゴ" },
  { value: "#9333ea", label: "パープル" },
  { value: "#db2777", label: "ピンク" },
  { value: "#64748b", label: "グレー" },
] as const;

export const DEFAULT_COLOR = COLOR_PALETTE[5].value;

/** 初期状態で用意しておくカテゴリ */
export const DEFAULT_CATEGORIES: readonly Category[] = [
  { id: "work", label: "仕事", color: "#2563eb" },
  { id: "personal", label: "プライベート", color: "#16a34a" },
  { id: "urgent", label: "緊急", color: "#dc2626" },
] as const;
