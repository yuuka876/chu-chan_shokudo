import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/lib/services/menu-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params;
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: '無効な日付形式です。YYYY-MM-DD形式で指定してください。' },
        { status: 400 }
      );
    }
    
    const selectedDate = new Date(date);
    const timeSlots = await menuService.getAvailableTimeSlots(selectedDate);
    
    return NextResponse.json({ timeSlots });
  } catch (error) {
    console.error('時間枠取得エラー:', error);
    return NextResponse.json(
      { error: '時間枠の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 