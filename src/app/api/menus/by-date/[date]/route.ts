import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/menu-service';
import { cookies } from 'next/headers';
import { menuService } from '@/lib/services/menu-service';

interface Params {
  params: {
    date: string;
  };
}

// GET: 特定の日付のメニューを取得
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { date } = params;
    const mealType = req.nextUrl.searchParams.get('type') as 'breakfast' | 'lunch' | 'dinner' | undefined;
    
    // 日付の形式チェック（YYYY-MM-DD形式を想定）
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: '無効な日付形式です。YYYY-MM-DD形式で指定してください。' },
        { status: 400 }
      );
    }
    
    const menus = await menuService.getMenuItems(new Date(date), mealType);
    const timeSlots = menuService.getAvailableTimeSlots(new Date(date));
    
    return NextResponse.json({ date, menus, timeSlots });
  } catch (error) {
    console.error('メニュー取得エラー:', error);
    return NextResponse.json(
      { error: 'メニューの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// PATCH: 特定の日付のメニューを更新（管理者のみ）
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    
    // 管理者かどうかのチェック
    if (!userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    
    // TODO: 実際のアプリでは、ここで管理者権限をチェックする
    
    const { date } = params;
    
    // 注意: 現在のmenuServiceにはメニュー更新メソッドがない
    // 実際のアプリでは、メニュー更新用のメソッドを追加する必要がある
    
    return NextResponse.json(
      { message: '機能実装中です。後日ご利用ください。' },
      { status: 501 }
    );
  } catch (error) {
    console.error('メニュー更新エラー:', error);
    return NextResponse.json(
      { error: 'メニューの更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// DELETE: 特定の日付のメニューを削除（管理者のみ）
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    
    // 管理者かどうかのチェック
    if (!userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    
    // TODO: 実際のアプリでは、ここで管理者権限をチェックする
    
    const { date } = params;
    
    // 注意: 現在のmenuServiceにはメニュー削除メソッドがない
    // 実際のアプリでは、メニュー削除用のメソッドを追加する必要がある
    
    return NextResponse.json(
      { message: '機能実装中です。後日ご利用ください。' },
      { status: 501 }
    );
  } catch (error) {
    console.error('メニュー削除エラー:', error);
    return NextResponse.json(
      { error: 'メニューの削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 