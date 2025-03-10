import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日付をYYYY-MM-DD形式にフォーマットする
 * @param date フォーマットする日付
 * @returns YYYY-MM-DD形式の文字列
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 日付を日本語形式（YYYY年MM月DD日）にフォーマットする
 * @param date フォーマットする日付
 * @returns 日本語形式の日付文字列
 */
export function formatDateJP(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * 時間を日本語形式（HH:MM）にフォーマットする
 * @param timeString 時間文字列（例: "07:30"）
 * @returns 日本語形式の時間文字列
 */
export function formatTimeJP(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  return `${hours}時${minutes}分`;
}

/**
 * 日付が過去かどうかをチェックする
 * @param date チェックする日付
 * @returns 過去の日付の場合はtrue、そうでない場合はfalse
 */
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * 日付が予約可能かどうかをチェックする（3日以上先の日付）
 * @param date チェックする日付
 * @returns 予約可能な場合はtrue、そうでない場合はfalse
 */
export function isReservableDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  // 3日後の日付を計算
  const minReservableDate = new Date(today);
  minReservableDate.setDate(today.getDate() + 3);
  
  return date >= minReservableDate;
}

/**
 * 日付が予約キャンセル可能かどうかをチェックする（前日12時まで）
 * @param date チェックする日付
 * @returns キャンセル可能な場合はtrue、そうでない場合はfalse
 */
export function isCancellableReservation(date: Date): boolean {
  const now = new Date();
  const reservationDate = new Date(date);
  
  // 予約日の前日の12時を計算
  const cancellationDeadline = new Date(reservationDate);
  cancellationDeadline.setDate(reservationDate.getDate() - 1);
  cancellationDeadline.setHours(12, 0, 0, 0);
  
  return now < cancellationDeadline;
}

/**
 * 曜日を日本語に変換する
 * @param dayIndex 曜日のインデックス（0: 日曜日, 1: 月曜日, ...）
 * @returns 日本語の曜日
 */
export function getDayOfWeekJP(dayIndex: number): string {
  const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
  return daysOfWeek[dayIndex];
}

/**
 * 日付を「YYYY年MM月DD日（曜日）」形式にフォーマットする
 * @param date フォーマットする日付
 * @returns 日本語形式の日付と曜日
 */
export function formatDateWithDayJP(date: Date): string {
  const dayOfWeek = getDayOfWeekJP(date.getDay());
  return `${formatDateJP(date)}（${dayOfWeek}）`;
} 