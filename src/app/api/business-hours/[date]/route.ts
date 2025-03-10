import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/menu-service';
import { cookies } from 'next/headers';

// GET: 特定の日付の営業時間設定を取得
export async function GET(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const dateString = params.date;
    
    // 日付の形式をチェック（YYYY-MM-DD）
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return NextResponse.json(
        { error: '無効な日付形式です。YYYY-MM-DD形式で指定してください。' },
        { status: 400 }
      );
    }
    
    // データベースから営業時間設定を取得
    const settings = await prisma.bUSENESS_CARENDER_TBL.findUnique({
      where: {
        date: new Date(dateString)
      }
    });
    
    // 設定がない場合は空のオブジェクトを返す
    if (!settings) {
      return NextResponse.json({ settings: null });
    }
    
    // メニューIDの取得（実際のアプリでは関連テーブルから取得）
    // 現在はダミーデータを返す
    const menuIds: string[] = [];
    
    return NextResponse.json({
      settings: {
        date: dateString,
        startTime: settings.startTime,
        endTime: settings.endTime,
        isHoliday: settings.isHoliday,
        menuIds
      }
    });
  } catch (error) {
    console.error('営業時間設定取得エラー:', error);
    return NextResponse.json(
      { error: '営業時間設定の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// PUT: 特定の日付の営業時間設定を更新
export async function PUT(
  req: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const { userId } = await auth();
    
    // 認証チェック
    if (!userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    
    // TODO: 実際のアプリでは、ここで管理者権限をチェックする
    // if (!isAdmin(userId)) {
    //   return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    // }
    
    const dateString = params.date;
    
    // 日付の形式をチェック（YYYY-MM-DD）
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return NextResponse.json(
        { error: '無効な日付形式です。YYYY-MM-DD形式で指定してください。' },
        { status: 400 }
      );
    }
    
    const body = await req.json();
    
    // 必須フィールドのバリデーション
    if (body.isHoliday === undefined) {
      return NextResponse.json(
        { error: '休業日設定は必須です' },
        { status: 400 }
      );
    }
    
    // 営業日の場合は開始時間と終了時間が必要
    if (!body.isHoliday && (!body.startTime || !body.endTime)) {
      return NextResponse.json(
        { error: '営業日の場合は開始時間と終了時間が必要です' },
        { status: 400 }
      );
    }
    
    // データベースに営業時間設定を保存（upsert）
    const settings = await prisma.bUSENESS_CARENDER_TBL.upsert({
      where: {
        date: new Date(dateString)
      },
      update: {
        startTime: body.startTime,
        endTime: body.endTime,
        isHoliday: body.isHoliday
      },
      create: {
        date: new Date(dateString),
        startTime: body.startTime || '00:00',
        endTime: body.endTime || '00:00',
        isHoliday: body.isHoliday
      }
    });
    
    // メニューIDの保存（実際のアプリでは関連テーブルに保存）
    // 現在は保存せずに成功を返す
    
    return NextResponse.json({
      message: '営業時間設定を保存しました',
      settings: {
        date: dateString,
        startTime: settings.startTime,
        endTime: settings.endTime,
        isHoliday: settings.isHoliday,
        menuIds: body.menuIds || []
      }
    });
  } catch (error) {
    console.error('営業時間設定保存エラー:', error);
    return NextResponse.json(
      { error: '営業時間設定の保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 