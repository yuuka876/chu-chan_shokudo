import { NextRequest, NextResponse } from 'next/server';
import { sendReservationConfirmation } from '@/lib/services/line-service';

/**
 * 予約確認のテストメッセージを送信するAPIエンドポイント
 * POST /api/line/notify/reservation-test
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // 明日の日付を取得
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // テスト用の予約情報
    const testUserName = 'テストユーザー';
    const testTime = '18:00';
    const testNumberOfPeople = 2;

    // 予約確認メッセージを送信
    const result = await sendReservationConfirmation(
      testUserName,
      formattedDate,
      testTime,
      testNumberOfPeople,
      userId
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('LINE予約テスト通知エラー:', error);
    return NextResponse.json(
      { error: 'LINE予約テスト通知の送信に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 