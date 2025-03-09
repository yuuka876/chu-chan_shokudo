import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// 営業時間の型定義
interface BusinessHour {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  lunchStart: string;
  lunchEnd: string;
  dinnerStart: string;
  dinnerEnd: string;
  breakTime?: {
    start: string;
    end: string;
  };
}

// 現在は仮のデータを使用（実際にはデータベースから取得）
const defaultBusinessHours: BusinessHour[] = [
  {
    day: "月曜日",
    isOpen: true,
    openTime: "11:00",
    closeTime: "21:00",
    lunchStart: "11:30",
    lunchEnd: "14:00",
    dinnerStart: "17:30",
    dinnerEnd: "21:00",
    breakTime: {
      start: "14:00",
      end: "17:30"
    }
  },
  {
    day: "火曜日",
    isOpen: true,
    openTime: "11:00",
    closeTime: "21:00",
    lunchStart: "11:30",
    lunchEnd: "14:00",
    dinnerStart: "17:30",
    dinnerEnd: "21:00",
    breakTime: {
      start: "14:00",
      end: "17:30"
    }
  },
  {
    day: "水曜日",
    isOpen: false,
    openTime: "",
    closeTime: "",
    lunchStart: "",
    lunchEnd: "",
    dinnerStart: "",
    dinnerEnd: ""
  },
  {
    day: "木曜日",
    isOpen: true,
    openTime: "11:00",
    closeTime: "21:00",
    lunchStart: "11:30",
    lunchEnd: "14:00",
    dinnerStart: "17:30",
    dinnerEnd: "21:00",
    breakTime: {
      start: "14:00",
      end: "17:30"
    }
  },
  {
    day: "金曜日",
    isOpen: true,
    openTime: "11:00",
    closeTime: "22:00",
    lunchStart: "11:30",
    lunchEnd: "14:00",
    dinnerStart: "17:30",
    dinnerEnd: "22:00",
    breakTime: {
      start: "14:00",
      end: "17:30"
    }
  },
  {
    day: "土曜日",
    isOpen: true,
    openTime: "11:00",
    closeTime: "22:00",
    lunchStart: "11:30",
    lunchEnd: "14:00",
    dinnerStart: "17:00",
    dinnerEnd: "22:00",
    breakTime: {
      start: "14:00",
      end: "17:00"
    }
  },
  {
    day: "日曜日",
    isOpen: true,
    openTime: "11:00",
    closeTime: "21:00",
    lunchStart: "11:30",
    lunchEnd: "15:00",
    dinnerStart: "17:30",
    dinnerEnd: "21:00",
    breakTime: {
      start: "15:00",
      end: "17:30"
    }
  }
];

// GET: 営業時間を取得
export async function GET(req: NextRequest) {
  try {
    // 実際のアプリではデータベースから取得
    return NextResponse.json({ businessHours: defaultBusinessHours });
  } catch (error) {
    console.error('営業時間取得エラー:', error);
    return NextResponse.json(
      { error: '営業時間の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// PUT: 営業時間を更新（管理者のみ）
export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    // 管理者かどうかのチェック
    if (!userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    
    // TODO: 実際のアプリでは、ここで管理者権限をチェックする
    
    const body = await req.json();
    const { businessHours } = body;
    
    if (!businessHours || !Array.isArray(businessHours)) {
      return NextResponse.json(
        { error: '無効なデータ形式です' },
        { status: 400 }
      );
    }
    
    // 実際のアプリではデータベースに保存
    // ここでは成功レスポンスを返すだけ
    
    return NextResponse.json({
      message: '営業時間が更新されました',
      businessHours
    });
  } catch (error) {
    console.error('営業時間更新エラー:', error);
    return NextResponse.json(
      { error: '営業時間の更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
