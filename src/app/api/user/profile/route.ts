import { NextRequest, NextResponse } from 'next/server';
import { prisma, testDatabaseConnection } from '@/lib/db';
import { cookies } from 'next/headers';
import { Prisma } from '@prisma/client';

// APIからのレスポンス型を定義
type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

// プロフィール情報の型を定義
type ProfileData = {
  userName: string;
  allergies?: string;
  preferences?: string;
  dislikes?: string;
  notes?: string;
};

// ユーザープロフィールテーブルがない場合は、prismaスキーマに追加する必要があります
// ここでは既存のUSER_TBLに追加フィールドを使用すると仮定します

export async function GET(request: NextRequest) {
  try {
    // クッキーからLINEユーザーIDを取得
    const cookieStore = await cookies();
    const lineUserId = cookieStore.get('line_user_id')?.value;
    
    // 認証チェック
    if (!lineUserId) {
      console.log('認証情報が見つかりません: lineUserId が null/undefined');
      return NextResponse.json<ApiResponse>(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }
    
    // ユーザーIDを設定
    const userId = lineUserId;
    console.log('認証済みユーザーID:', userId);
    
    try {
      // DB接続テスト
      const isConnected = await testDatabaseConnection();
      if (!isConnected) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'データベース接続に失敗しました。システム管理者にお問い合わせください。' },
          { status: 500 }
        );
      }
      
      // ユーザープロファイル情報を取得
      const user = await prisma.uSER_TBL.findUnique({
        where: { userId }
      });
      
      console.log('ユーザー検索結果:', user ? '見つかりました' : 'ユーザーが見つかりません', 
        user ? { userId: user.userId, userName: user.userName } : { searchedId: userId });
      
      if (!user) {
        // ユーザーが見つからない場合は新規作成の選択肢を提供
        return NextResponse.json<ApiResponse>({
          success: true,
          data: { 
            profile: null,
            userExists: false,
            message: 'ユーザープロフィールが見つかりません。新規作成が必要です。'
          }
        });
      }
      
      // メタデータからプロファイル情報を抽出
      let profile: ProfileData | null = null;
      
      if (user.metadata) {
        try {
          profile = JSON.parse(user.metadata) as ProfileData;
          console.log('プロファイルメタデータのパース成功:', { userName: profile.userName });
        } catch (e) {
          console.error('メタデータのパースエラー:', e);
          // メタデータが壊れている場合は基本情報だけで応答
          profile = {
            userName: user.userName
          };
        }
      } else {
        // メタデータがない場合は基本情報だけで応答
        profile = {
          userName: user.userName
        };
      }
      
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { 
          profile,
          userExists: true
        }
      });
    } catch (dbError) {
      console.error('データベースエラー詳細:', {
        name: dbError.name,
        message: dbError.message,
        stack: dbError.stack,
        code: dbError instanceof Prisma.PrismaClientKnownRequestError ? dbError.code : 'unknown',
        meta: dbError instanceof Prisma.PrismaClientKnownRequestError ? dbError.meta : 'unknown'
      });
      
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'データベースの操作に失敗しました: ' + dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('プロファイル取得エラー詳細:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'プロファイルの取得に失敗しました: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // クッキーからLINEユーザーIDを取得
    const cookieStore = await cookies();
    const lineUserId = cookieStore.get('line_user_id')?.value;
    const lineDisplayName = cookieStore.get('line_display_name')?.value;
    
    // リクエストボディからプロフィール情報を取得
    const body = await request.json();
    const { userId, allergies, preferences, dislikes, notes, userName: requestUserName } = body as {
      userId: string;
      allergies?: string;
      preferences?: string;
      dislikes?: string;
      notes?: string;
      userName?: string;
    };
    
    // ユーザーIDを確認
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'ユーザーIDが指定されていません' },
        { status: 400 }
      );
    }
    
    // 認証確認
    const authenticatedUserId = lineUserId;
    
    // 認証されていない場合
    if (!authenticatedUserId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }
    
    // リクエストのユーザーIDと認証されたユーザーIDが一致するか確認
    if (userId !== authenticatedUserId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '不正なリクエストです' },
        { status: 403 }
      );
    }
    
    // ユーザー名を取得
    let userName = '';
    
    if (requestUserName) {
      // リクエストからユーザー名を取得
      userName = requestUserName;
    } else if (lineDisplayName) {
      // LINEユーザーの場合、クッキーからユーザー名を取得
      userName = lineDisplayName;
    }
    
    // ユーザープロファイル情報を更新
    try {
      const profileData: ProfileData = {
        userName: userName || 'ユーザー',
        allergies,
        preferences,
        dislikes,
        notes
      };
      
      console.log('更新するプロファイルデータ:', {
        userId: authenticatedUserId,
        profileData
      });
      
      // トランザクションを使用してデータ整合性を確保
      const user = await prisma.$transaction(async (tx) => {
        return await tx.uSER_TBL.upsert({
          where: { 
            userId: authenticatedUserId 
          },
          update: {
            // メタデータとしてJSON形式で保存
            metadata: JSON.stringify(profileData),
            // ユーザー名も更新
            userName: userName || undefined
          },
          create: {
            userId: authenticatedUserId,
            userName: userName || 'ユーザー',
            isAdmin: false,
            metadata: JSON.stringify(profileData),
            lineUserName: lineDisplayName || undefined
          }
        });
      });
      
      console.log('プロファイル更新成功:', user);
      
      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'プロフィールを更新しました',
        data: { userId: user.userId }
      });
    } catch (dbError) {
      // エラーの詳細情報をログに出力
      console.error('データベース更新エラー詳細:', {
        name: dbError.name,
        message: dbError.message,
        stack: dbError.stack,
        code: dbError instanceof Prisma.PrismaClientKnownRequestError ? dbError.code : 'unknown',
        meta: dbError instanceof Prisma.PrismaClientKnownRequestError ? dbError.meta : 'unknown'
      });
      
      // Prismaの特定のエラーをより詳細に処理
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        if (dbError.code === 'P2002') {
          return NextResponse.json<ApiResponse>(
            { success: false, error: 'このユーザーIDは既に使用されています' },
            { status: 409 }
          );
        } else if (dbError.code === 'P2003') {
          return NextResponse.json<ApiResponse>(
            { success: false, error: '関連するレコードが見つかりません' },
            { status: 400 }
          );
        } else if (dbError.code === 'P2025') {
          return NextResponse.json<ApiResponse>(
            { success: false, error: '対象のレコードが見つかりません' },
            { status: 404 }
          );
        }
      }
      
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'データベースの更新に失敗しました: ' + dbError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'プロフィールの更新に失敗しました' },
      { status: 500 }
    );
  }
} 