import { PrismaClient } from '@prisma/client';

// PrismaClientのシングルトンインスタンスを作成
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 営業時間の型定義
export interface BusinessHours {
  date: Date;
  startTime: string;
  endTime: string;
  isHoliday: boolean;
}

// カレンダーサービス
export const calendarService = {
  // 特定の年月の営業日を取得
  getBusinessDays: async (year: number, month: number): Promise<BusinessHours[]> => {
    try {
      // 指定された年月の最初の日と最後の日を計算
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      // データベースから営業日を取得
      const businessDays = await prisma.bUSENESS_CARENDER_TBL.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          date: 'asc'
        }
      });
      
      // BusinessHours形式に変換
      return businessDays.map(day => ({
        date: day.date,
        startTime: day.startTime,
        endTime: day.endTime,
        isHoliday: day.isHoliday
      }));
    } catch (error) {
      console.error('営業日取得エラー:', error);
      return [];
    }
  },
  
  // 営業日を設定
  setBusinessDay: async (businessHours: BusinessHours): Promise<boolean> => {
    try {
      // 日付のフォーマットを整える（時間部分を削除）
      const date = new Date(businessHours.date);
      date.setHours(0, 0, 0, 0);
      
      // 既存の営業日を検索
      const existingDay = await prisma.bUSENESS_CARENDER_TBL.findUnique({
        where: {
          date
        }
      });
      
      if (existingDay) {
        // 既存の営業日を更新
        await prisma.bUSENESS_CARENDER_TBL.update({
          where: {
            date
          },
          data: {
            startTime: businessHours.startTime,
            endTime: businessHours.endTime,
            isHoliday: businessHours.isHoliday
          }
        });
      } else {
        // 新しい営業日を作成
        await prisma.bUSENESS_CARENDER_TBL.create({
          data: {
            date,
            startTime: businessHours.startTime,
            endTime: businessHours.endTime,
            isHoliday: businessHours.isHoliday
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('営業日設定エラー:', error);
      return false;
    }
  },
  
  // 特定の日の営業時間を取得
  getBusinessHoursForDate: async (date: Date): Promise<BusinessHours | null> => {
    try {
      // 日付のフォーマットを整える（時間部分を削除）
      const formattedDate = new Date(date);
      formattedDate.setHours(0, 0, 0, 0);
      
      // データベースから営業時間を取得
      const businessDay = await prisma.bUSENESS_CARENDER_TBL.findUnique({
        where: {
          date: formattedDate
        }
      });
      
      if (!businessDay) {
        return null;
      }
      
      return {
        date: businessDay.date,
        startTime: businessDay.startTime,
        endTime: businessDay.endTime,
        isHoliday: businessDay.isHoliday
      };
    } catch (error) {
      console.error('営業時間取得エラー:', error);
      return null;
    }
  },
  
  // 営業日かどうかを判定
  isBusinessDay: async (date: Date): Promise<boolean> => {
    try {
      // 日付のフォーマットを整える（時間部分を削除）
      const formattedDate = new Date(date);
      formattedDate.setHours(0, 0, 0, 0);
      
      // データベースから営業日を取得
      const businessDay = await prisma.bUSENESS_CARENDER_TBL.findUnique({
        where: {
          date: formattedDate
        }
      });
      
      // 営業日データがない場合はデフォルトで営業日とする
      if (!businessDay) {
        return true;
      }
      
      // 休業日フラグがtrueの場合は営業日ではない
      return !businessDay.isHoliday;
    } catch (error) {
      console.error('営業日判定エラー:', error);
      return false;
    }
  }
};
