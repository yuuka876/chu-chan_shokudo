import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/menu-service';
import { cookies } from 'next/headers';
import { formatDate } from '@/lib/utils';
import { calendarService } from '@/lib/services/calendar-service';

// 営業時間の型定義
interface BusinessHour {
  date: string;
  isHoliday: boolean;
  startTime: string;
  endTime: string;
  memo?: string;
}

// GET: 特定の年月の営業時間を取得
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const yearParam = url.searchParams.get('year');
    const monthParam = url.searchParams.get('month');
    
    if (!yearParam || !monthParam) {
      return NextResponse.json(
        { success: false, error: '年と月を指定してください' },
        { status: 400 }
      );
    }
    
    const year = parseInt(yearParam);
    const month = parseInt(monthParam);
    
    if (isNaN(year) || isNaN(month)) {
      return NextResponse.json(
        { success: false, error: '年と月は数値で指定してください' },
        { status: 400 }
      );
    }
    
    const businessHours = await calendarService.getBusinessDays(year, month);
    
    return NextResponse.json({
      success: true,
      businessHours
    });
  } catch (error) {
    console.error('営業時間取得エラー:', error);
    return NextResponse.json(
      { success: false, error: '営業時間の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 営業時間を設定
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, isHoliday } = body;
    
    if (!date) {
      return NextResponse.json(
        { success: false, error: '日付を指定してください' },
        { status: 400 }
      );
    }
    
    const businessHours = {
      date: new Date(date),
      startTime: startTime || '08:00',
      endTime: endTime || '20:00',
      isHoliday: isHoliday || false
    };
    
    const success = await calendarService.setBusinessDay(businessHours);
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: '営業時間の設定に失敗しました' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '営業時間を設定しました',
      businessHours
    });
  } catch (error) {
    console.error('営業時間設定エラー:', error);
    return NextResponse.json(
      { success: false, error: '営業時間の設定に失敗しました' },
      { status: 500 }
    );
  }
}

// 管理者権限をチェックする関数
async function checkAdminPermission(userId: string): Promise<boolean> {
  try {
    // ユーザー情報を取得
    const user = await prisma.uSER_TBL.findUnique({
      where: { userId }
    });
    
    // 管理者フラグをチェック
    return user?.isAdmin === true;
  } catch (error) {
    console.error('管理者権限チェックエラー:', error);
    return false;
  }
}
