import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/services/menu-service';

// LINEのトークンエンドポイント
const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';
// LINEプロフィールエンドポイント
const LINE_PROFILE_URL = 'https://api.line.me/v2/profile';

export async function GET(request: NextRequest) {
  try {
    // URLからコードとステートを取得
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const redirectPath = searchParams.get('redirect_path') || '/';
    
    if (!code) {
      return NextResponse.redirect(new URL('/auth/sign-in?error=missing_code', request.url));
    }
    
    // LINE APIでトークンを取得
    const tokenResponse = await fetch(LINE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.LINE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/line',
        client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID || '2006930835',
        client_secret: process.env.LINE_CLIENT_SECRET || 'a61bc3a02f37401bc3e76a235588c905',
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('LINE Token Error:', errorData);
      return NextResponse.redirect(new URL('/auth/sign-in?error=token_error', request.url));
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // LINEプロフィールを取得
    const profileResponse = await fetch(LINE_PROFILE_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (!profileResponse.ok) {
      const errorData = await profileResponse.json();
      console.error('LINE Profile Error:', errorData);
      return NextResponse.redirect(new URL('/auth/sign-in?error=profile_error', request.url));
    }
    
    const profileData = await profileResponse.json();
    
    // データベースに存在するか確認し、存在しなければ新規作成
    let user = await prisma.uSER_TBL.findFirst({
      where: {
        lineUserName: profileData.userId
      }
    });
    
    if (!user) {
      // 新規ユーザーの作成
      user = await prisma.uSER_TBL.create({
        data: {
          userName: profileData.displayName,
          lineUserName: profileData.userId,
          email: null, // LINEログインではメールは不要
          pictureUrl: profileData.pictureUrl || null,
          isAdmin: false, // 新規ユーザーは管理者権限なし
        }
      });
    } else {
      // 既存ユーザーの情報を更新
      user = await prisma.uSER_TBL.update({
        where: { userId: user.userId },
        data: {
          userName: profileData.displayName,
          pictureUrl: profileData.pictureUrl || user.pictureUrl,
        }
      });
    }
    
    // クッキーにLINEユーザー情報を保存
    const cookieStore = cookies();
    cookieStore.set('line_user_id', profileData.userId, { 
      maxAge: 30 * 24 * 60 * 60, // 30日間
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    cookieStore.set('line_display_name', profileData.displayName, { 
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    if (profileData.pictureUrl) {
      cookieStore.set('line_picture_url', profileData.pictureUrl, { 
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }
    
    // ユーザーIDをクッキーに設定（アプリ内のユーザー識別用）
    cookieStore.set('userId', user.userId, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    // リダイレクト先の決定（デフォルトはホームページ）
    let redirectUrl = '/';
    
    // セッションに保存されたリダイレクト先があれば使用
    if (redirectPath && redirectPath !== '/auth/sign-in') {
      redirectUrl = redirectPath;
    }
    
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error('LINE認証コールバックエラー:', error);
    return NextResponse.redirect(new URL('/auth/sign-in?error=unknown', request.url));
  }
} 