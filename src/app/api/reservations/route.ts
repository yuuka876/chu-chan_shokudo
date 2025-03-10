import { NextRequest, NextResponse } from 'next/server';
import { menuService } from '@/lib/services/menu-service';
import { prisma } from '@/lib/services/menu-service';
import { formatDateJP } from '@/lib/utils';
import { sendReservationConfirmationRich } from '@/lib/services/line-service';

// POST: 新しい予約を作成
export async function POST(req: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await req.json();
    const { menuId, userId, reservationTime, date } = body;
    
    // 必須パラメータのチェック
    if (!menuId || !userId || !reservationTime) {
      return NextResponse.json(
        { success: false, error: 'メニューID、ユーザーID、予約時間は必須です' },
        { status: 400 }
      );
    }

    console.log('予約リクエスト:', { menuId, userId, reservationTime, date });

    try {
      // メニューサービスを使用して予約を作成
      const reservation = await menuService.createReservation(menuId, userId, reservationTime);
      
      // 予約情報を取得
      const reservationWithDetails = await menuService.getUserReservations(userId);
      const createdReservation = reservationWithDetails.find(r => r.menuNo === menuId);
      
      if (createdReservation) {
        // LINE通知を送信
        try {
          // LINEユーザーIDを取得
          const user = await prisma.uSER_TBL.findUnique({
            where: { userId }
          });
          
          if (user && user.lineUserName) {
            // リッチメッセージで予約確認を送信
            await sendReservationConfirmationRich(createdReservation, user.lineUserName);
          }
        } catch (notifyError) {
          console.error('LINE通知エラー:', notifyError);
          // 通知エラーは予約失敗とはしない
        }
      }
      
      return NextResponse.json(
        { 
          success: true, 
          message: '予約が作成されました', 
          reservation: createdReservation || reservation 
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('予約作成エラー:', error);
      
      // エラーメッセージを取得
      const errorMessage = error instanceof Error ? error.message : '予約の作成に失敗しました';
      
      // メニュー固定エラーの場合は専用のエラーメッセージを返す
      if (errorMessage.includes('同じ日に既に予約されているメニューがあります')) {
        return NextResponse.json(
          { 
            success: false,
            error: '同じ日に既に予約されているメニューがあります',
            message: '柊人ママは同じ日に複数のメニューを作ることができないため、既に予約されているメニューのみ予約可能です。'
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('予約処理エラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '予約の処理中にエラーが発生しました', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

// GET: ユーザーの予約一覧を取得
export async function GET(request: NextRequest) {
  try {
    // すべての予約を取得
    const reservations = await prisma.rESERVATION_TBL.findMany({
      include: {
        menu: true,
        user: true
      },
      orderBy: [
        {
          menu: {
            provideDate: 'desc'
          }
        },
        {
          reservationTime: 'asc'
        }
      ]
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

// DELETE: 予約をキャンセル
export async function DELETE(req: NextRequest) {
  try {
    // クエリパラメータから予約IDを取得
    const url = new URL(req.url);
    const reservationId = url.searchParams.get('id');
    
    if (!reservationId) {
      return NextResponse.json({ success: false, error: '予約IDが必要です' }, { status: 400 });
    }
    
    // 予約をキャンセル
    const result = await menuService.cancelReservation(reservationId);
    
    if (!result) {
      return NextResponse.json({ success: false, error: '予約のキャンセルに失敗しました' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: '予約がキャンセルされました' });
  } catch (error) {
    console.error('予約キャンセルエラー:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '予約のキャンセル中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 