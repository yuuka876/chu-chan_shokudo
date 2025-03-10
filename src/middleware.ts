import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/menu-service';

// 保護されたルートのパターンを定義
const isProtectedRoute = (path: string) => {
  const patterns = [
    /^\/users(.*)/,
    /^\/profile(.*)/,
    /^\/admin(.*)/,
    /^\/menu(.*)/,
    /^\/calendar(.*)/
  ];
  return patterns.some(pattern => pattern.test(path));
};

// 管理者専用ルートのパターンを定義
const isAdminRoute = (path: string) => {
  return /^\/admin(.*)/.test(path);
};

// プロフィール設定ルートのパターンを定義
const isProfileSetupRoute = (path: string) => {
  return /^\/profile\/setup/.test(path);
};

// 公開APIルートのパターンを定義
const isPublicApiRoute = (path: string) => {
  const patterns = [
    /^\/api\/webhook(.*)/,
    /^\/api\/auth(.*)/,
    /^\/api\/users(.*)/  // ユーザーAPIを公開ルートに追加
  ];
  return patterns.some(pattern => pattern.test(path));
};

// 公開ルートのパターンを定義
const isPublicRoute = (path: string) => {
  const patterns = [
    /^\/$/,
    /^\/auth(.*)/
  ];
  return patterns.some(pattern => pattern.test(path)) || isPublicApiRoute(path);
};

export async function middleware(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;
    console.log('ミドルウェア実行:', path);
    
    // 公開APIルートは認証をスキップ
    if (isPublicApiRoute(path)) {
      console.log('公開APIルートなのでスキップ:', path);
      return NextResponse.next();
    }
    
    // クッキーからユーザー情報を取得
    const cookies = request.cookies;
    const lineUserId = cookies.get('line_user_id')?.value;
    const userId = cookies.get('userId')?.value;
    
    console.log('認証状態:', { lineUserId, userId });
    
    // LINEユーザーIDまたはアプリユーザーIDがある場合は認証済みとみなす
    const isAuthenticated = !!lineUserId || !!userId;
    
    // パスが保護されたルートでユーザーが未認証の場合はサインインページにリダイレクト
    if (isProtectedRoute(path) && !isAuthenticated) {
      const signInUrl = new URL('/auth/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', path);
      return NextResponse.redirect(signInUrl);
    }
    
    // ユーザーが認証済みの場合、管理者権限のみチェック
    if (isAuthenticated && isAdminRoute(path)) {
      // ユーザーIDがクッキーにない場合は管理者ではない
      if (!userId) {
        console.log('ユーザーIDがないため、管理者ページへのアクセスを拒否');
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      // データベースからユーザー情報を取得して管理者権限をチェック
      const user = await prisma.uSER_TBL.findUnique({
        where: { userId: userId }
      });
      console.log('ユーザー情報:', user);
      
      // 管理者でない場合はホームページにリダイレクト
      if (!user || !user.isAdmin) {
        console.log('管理者権限がないため、管理者ページへのアクセスを拒否');
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    
    // それ以外はそのまま次に進む
    return NextResponse.next();
  } catch (error) {
    console.error('ミドルウェアエラー:', error);
    return NextResponse.next();
  }
}

// Next.jsのmatcherパターン
export const config = {
  matcher: [
    // APIルートとプライベートルートを保護
    '/api/(.*)',
    '/profile/(.*)',
    '/users/(.*)',
    '/admin/(.*)',
    '/menu/(.*)',
    '/calendar/(.*)'
  ],
}; 