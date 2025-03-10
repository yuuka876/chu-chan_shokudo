// 営業時間の型定義
export interface BusinessHours {
  date: Date | string;
  startTime: string;
  endTime: string;
  isHoliday: boolean;
} 