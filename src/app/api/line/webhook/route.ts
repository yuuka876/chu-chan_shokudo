import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/services/menu-service';
import { formatDate } from '@/lib/utils';

// 環境変数から取得するか、直接設定する
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || 'a61bc3a02f37401bc3e76a235588c905';
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '3ATEVHVRENFgCAu+HWty3SDCQvGR1oRvF6u2yTyVUWoxSFnutxfSfICEIBChr8iJGqmFd0V4YWA4qTa/fLx5nGH+yWv27of4C5RbcmPF8tf6pv/sUAc0DtXA8x3p/DWzbIQzm3OlbTHWL7jD8TM+egdB04t89/1O/w1cDnyilFU=';

interface LineEvent {
  type: string;
  message?: {
    type: string;
    text?: string;
  };
  source?: {
    userId?: string;
    type?: string;
  };
  replyToken?: string;
}

/**
 * LINEからのウェブフックを処理するAPIエンドポイント
 * POST /api/line/webhook
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    // 署名を検証
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: '不正な署名です' }, { status: 401 });
    }

    // ボディをJSONに変換
    const data = JSON.parse(body);
    console.log('LINE Webhook受信:', data);

    // イベントを処理
    const events = data.events || [];
    for (const event of events) {
      await handleEvent(event);
    }

    // LINEプラットフォームへの応答は常に200 OKを返す
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('LINEウェブフックエラー:', error);
    // エラーが発生しても200を返す（LINEプラットフォームの要件）
    return NextResponse.json({ success: false });
  }
}

/**
 * 署名を検証する
 * @param body リクエストボディ
 * @param signature x-line-signatureヘッダーの値
 * @returns 署名が有効かどうか
 */
function verifySignature(body: string, signature: string | null): boolean {
  if (!signature) return false;
  
  const hmac = crypto.createHmac('sha256', LINE_CHANNEL_SECRET);
  const digest = hmac.update(body).digest('base64');
  
  return digest === signature;
}

/**
 * LINEイベントを処理する
 * @param event LINEイベント
 */
async function handleEvent(event: LineEvent) {
  const { type, message, source, replyToken } = event;

  // メッセージイベントの処理
  if (type === 'message' && message.type === 'text') {
    const userId = source.userId;
    const messageText = message.text;
    
    console.log(`ユーザー ${userId} からのメッセージ: ${messageText}`);
    
    try {
      // ユーザー情報を取得または作成
      let user = await prisma.uSER_TBL.findFirst({
        where: { lineUserName: userId }
      });
      
      
      if (!user) {
        // LINEプロフィール情報を取得
        const profile = await getLineUserProfile(userId);
        
        // ユーザーを作成
        user = await prisma.uSER_TBL.create({
          data: {
            userName: profile.displayName || 'LINEユーザー',
            lineUserName: userId,
            isAdmin: false
          }
        });
      }
      
      // メッセージの内容に応じた処理
      if (messageText.includes('予約') || messageText.includes('よやく')) {
        // 予約関連のメッセージ
        await handleReservationMessage(replyToken, userId, messageText);
      } else if (messageText.includes('メニュー') || messageText.includes('めにゅー')) {
        // メニュー関連のメッセージ
        await handleMenuMessage(replyToken, userId);
      } else if (messageText.includes('キャンセル') || messageText.includes('きゃんせる')) {
        // キャンセル関連のメッセージ
        await handleCancelMessage(replyToken, userId);
      } else if (messageText.includes('ヘルプ') || messageText.includes('へるぷ') || messageText.includes('使い方')) {
        // ヘルプメッセージ
        await sendHelpMessage(replyToken);
      } else {
        // その他のメッセージ
        await replyToMessage(replyToken, `こんにちは！しゅうちゃん食堂です。\n以下のキーワードで操作できます：\n・予約\n・メニュー\n・キャンセル\n・ヘルプ`);
      }
    } catch (error) {
      console.error('メッセージ処理エラー:', error);
      await replyToMessage(replyToken, 'すみません、エラーが発生しました。しばらくしてからもう一度お試しください。');
    }
  }
  
  // フォローイベント（友達追加）の処理
  if (type === 'follow') {
    const userId = source.userId;
    
    try {
      // LINEプロフィール情報を取得
      const profile = await getLineUserProfile(userId);
      
      // LINEユーザーIDからユーザーを検索
      const existingUser = await prisma.uSER_TBL.findFirst({
        where: { lineUserName: userId }
      });
      
      if (existingUser) {
        // 既存ユーザーを更新
        await prisma.uSER_TBL.update({
          where: { userId: existingUser.userId },
          data: {
            userName: profile.displayName || 'LINEユーザー'
          }
        });
      } else {
        // 新規ユーザーを作成
        await prisma.uSER_TBL.create({
          data: {
            userId: crypto.randomUUID(),
            userName: profile.displayName || 'LINEユーザー',
            lineUserName: userId,
            isAdmin: false
          }
        });
      }
      
      // 歓迎メッセージを送信
      await replyToMessage(replyToken, `${profile.displayName}さん、しゅうちゃん食堂へようこそ！\n\nこちらのLINEから食事の予約ができます。\n\n「予約」と送信すると予約ページへのリンクが表示されます。\n「メニュー」と送信すると今日のメニューが表示されます。\n\nご不明な点があれば「ヘルプ」と送信してください。`);
    } catch (error) {
      console.error('フォロー処理エラー:', error);
    }
  }
}

/**
 * LINEユーザーのプロフィールを取得
 */
async function getLineUserProfile(userId: string) {
  try {
    const response = await fetch(`https://api.line.me/v2/bot/profile/${userId}`, {
      headers: {
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`プロフィール取得エラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return { displayName: 'LINEユーザー' };
  }
}

/**
 * メッセージに返信する
 */
async function replyToMessage(replyToken: string, text: string) {
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: text
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE返信エラー:', errorData);
      throw new Error(`LINE返信エラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('メッセージ返信エラー:', error);
    throw error;
  }
}

/**
 * 予約関連のメッセージを処理
 */
async function handleReservationMessage(replyToken: string, userId: string, messageText: string) {
  // 予約ページへのリンクを含むメッセージを送信
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const reservationUrl = `${appUrl}?lineUserId=${userId}`;
  
  await replyToMessage(replyToken, `食事の予約はこちらからどうぞ！\n${reservationUrl}`);
}

/**
 * メニュー関連のメッセージを処理
 */
async function handleMenuMessage(replyToken: string, userId: string) {
  try {
    // 今日の日付
    const today = new Date();
    const formattedDate = formatDate(today);
    
    // 今日のメニューを取得
    const menus = await prisma.mENU_TBL.findMany({
      where: {
        provideDate: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
          lt: new Date(today.setHours(23, 59, 59, 999))
        }
      }
    });
    
    if (menus.length === 0) {
      await replyToMessage(replyToken, '今日のメニューはまだ登録されていません。');
      return;
    }
    
    // メニュー情報をフォーマット
    let menuText = `【${formattedDate} 今日のメニュー】\n\n`;
    menus.forEach(menu => {
      menuText += `・${menu.menuName}\n`;
    });
    
    menuText += '\n予約は「予約」と送信してください。';
    
    await replyToMessage(replyToken, menuText);
  } catch (error) {
    console.error('メニュー取得エラー:', error);
    await replyToMessage(replyToken, 'メニュー情報の取得中にエラーが発生しました。');
  }
}

/**
 * キャンセル関連のメッセージを処理
 */
async function handleCancelMessage(replyToken: string, userId: string) {
  try {
    // ユーザーの予約を取得
    const reservations = await prisma.rESERVATION_TBL.findMany({
      where: {
        userId: {
          equals: userId
        }
      },
      include: {
        menu: true
      }
    });
    
    if (reservations.length === 0) {
      await replyToMessage(replyToken, '現在予約はありません。');
      return;
    }
    
    // 予約情報をフォーマット
    let reservationText = '【あなたの予約】\n\n';
    reservations.forEach((reservation, index) => {
      const menuDate = new Date(reservation.menu.provideDate);
      const formattedDate = `${menuDate.getFullYear()}年${menuDate.getMonth() + 1}月${menuDate.getDate()}日`;
      
      reservationText += `${index + 1}. ${formattedDate} ${reservation.reservationTime}\n`;
      reservationText += `   ${reservation.menu.menuName}\n\n`;
    });
    
    // キャンセルページへのリンク
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const cancelUrl = `${appUrl}/reservations?lineUserId=${userId}`;
    
    reservationText += `予約のキャンセルはこちらから：\n${cancelUrl}`;
    
    await replyToMessage(replyToken, reservationText);
  } catch (error) {
    console.error('予約取得エラー:', error);
    await replyToMessage(replyToken, '予約情報の取得中にエラーが発生しました。');
  }
}

/**
 * ヘルプメッセージを送信
 */
async function sendHelpMessage(replyToken: string) {
  const helpText = `【しゅうちゃん食堂 使い方ガイド】\n\n` +
    `■ 基本的な操作\n` +
    `・「予約」: 食事予約ページを表示\n` +
    `・「メニュー」: 今日のメニューを表示\n` +
    `・「キャンセル」: 予約のキャンセルページを表示\n` +
    `・「ヘルプ」: このヘルプを表示\n\n` +
    `■ 予約について\n` +
    `・予約は3日前までにお願いします\n` +
    `・同じ日に既に予約されているメニューがある場合は、そのメニューのみ選択可能です\n` +
    `・キャンセルは前日12時まで可能です\n\n` +
    `■ その他\n` +
    `・食物アレルギーはメニュー予約時にご申告ください\n` +
    `・ご不明な点は柊人ママにお問い合わせください`;
  
  await replyToMessage(replyToken, helpText);
}
