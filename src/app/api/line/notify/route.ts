import { NextRequest, NextResponse } from 'next/server';
import { sendTextMessage } from '@/lib/services/line-service';

/**
 * LINE通知を送信するためのAPIエンドポイント
 * POST /api/line/notify
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'メッセージが必要です' },
        { status: 400 }
      );
    }

    // LINEメッセージを送信
    const result = await sendTextMessage(message, userId);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('LINE通知エラー:', error);
    return NextResponse.json(
      { error: 'LINE通知の送信に失敗しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
