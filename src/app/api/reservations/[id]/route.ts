import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/menu-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 予約情報を取得
    const reservation = await prisma.rESERVATION_TBL.findUnique({
      where: { id },
      include: { menu: true }
    });
    
    if (!reservation) {
      return NextResponse.json(
        { success: false, error: '予約が見つかりません' },
        { status: 404 }
      );
    }
    
    // 予約を削除
    await prisma.rESERVATION_TBL.delete({
      where: { id }
    });
    
    // メニューの予約状態を更新
    // 同じメニューに対する他の予約がなければ、isReservedをfalseに設定
    const otherReservations = await prisma.rESERVATION_TBL.findMany({
      where: {
        menuNo: reservation.menuNo,
        id: { not: id }
      }
    });
    
    if (otherReservations.length === 0) {
      await prisma.mENU_TBL.update({
        where: { menuNo: reservation.menuNo },
        data: { isReserved: false }
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '予約をキャンセルしました' 
    });
  } catch (error) {
    console.error('予約キャンセルエラー:', error);
    return NextResponse.json(
      { success: false, error: '予約のキャンセルに失敗しました' },
      { status: 500 }
    );
  }
} 