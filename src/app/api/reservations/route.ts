import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createReservation, getReservationsByUserId } from '@/lib/services/reservation-service';

// POST: 新しい予約を作成
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    console.log('認証ユーザーID:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const body = await req.json();
    const { menuNo, reservationTime } = body;
    console.log('リクエストデータ:', { userId, menuNo, reservationTime });

    if (!menuNo || !reservationTime) {
      return NextResponse.json(
        { error: 'メニュー番号と予約時間は必須です' },
        { status: 400 }
      );
    }

    console.log('予約作成処理を開始します...');
    const result = await createReservation(userId, menuNo, reservationTime);
    console.log('予約作成結果:', result);

    if (!result.success) {
      console.error('予約作成失敗:', result.error);
      return NextResponse.json(
        { error: '予約の作成に失敗しました', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: '予約が作成されました', reservation: result.reservation },
      { status: 201 }
    );
  } catch (error) {
    console.error('予約作成エラー詳細:', error);
    return NextResponse.json(
      { error: '予約の作成中にエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// GET: ユーザーの予約一覧を取得
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const result = await getReservationsByUserId(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: '予約の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reservations: result.reservations });
  } catch (error) {
    console.error('予約取得エラー:', error);
    return NextResponse.json(
      { error: '予約の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 