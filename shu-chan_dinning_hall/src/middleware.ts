import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 保護されたルートのパターンを定義
const isProtectedRoute = createRouteMatcher(['/users(.*)', '/profile(.*)']);

// 公開ルートのパターンを定義
const isPublicRoute = createRouteMatcher([
  '/',
  '/button-demo',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook/clerk',
  '/api/webhook/stripe'
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    // サインイン状態を取得（await が必要）
    const { userId } = await auth();

    // パスが保護されたルートでユーザーが未認証の場合はサインインページにリダイレクト
    if (isProtectedRoute(req) && !userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // それ以外はそのまま次に進む
    return NextResponse.next();
  } catch (error) {
    console.error('Clerk middleware error:', error);
    return NextResponse.next();
  }
});

// Next.jsのmatcherパターンをさらに単純化
export const config = {
  matcher: [
    // APIルートとプライベートルートを保護
    '/api/(.*)',
    '/profile',
    '/users/(.*)'
  ],
}; 