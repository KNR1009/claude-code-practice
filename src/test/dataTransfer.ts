/**
 * jsdom には DataTransfer が無いため、テスト用の最小実装を用意する。
 * fireEvent の init に渡して drag/drop 間で値を受け渡す。
 */
export function createDataTransfer() {
  const store = new Map<string, string>();
  return {
    dropEffect: "none",
    effectAllowed: "none",
    setData: (format: string, value: string) => {
      store.set(format, value);
    },
    getData: (format: string) => store.get(format) ?? "",
  };
}
