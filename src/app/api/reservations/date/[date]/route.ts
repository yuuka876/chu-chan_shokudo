import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/menu-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params;
    
    // 日付の範囲を設定（指定された日の0時から23時59分59秒まで）
    const startDate = new Date(`${date}T00:00:00`);
    const endDate = new Date(`${date}T23:59:59`);
    
    // 指定された日付の予約を取得
    const reservations = await prisma.rESERVATION_TBL.findMany({
      where: {
        menu: {
          provideDate: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      include: {
        menu: true,
        user: true
      },
      orderBy: {
        reservationTime: 'asc'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      reservations 
    });
  } catch (error) {
    console.error('予約取得エラー:', error);
    return NextResponse.json(
      { success: false, error: '予約の取得に失敗しました' },
      { status: 500 }
    );
  }
} 