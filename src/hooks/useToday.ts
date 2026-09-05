"use client";

import { useEffect, useState } from "react";
import { todayIso } from "@/lib/date";

/**
 * 今日の日付を "YYYY-MM-DD" で返す。
 * ページは静的に事前生成されるため、日付はマウント後にクライアントで確定させる。
 */
export function useToday(): string | null {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(todayIso());
  }, []);

  return today;
}
