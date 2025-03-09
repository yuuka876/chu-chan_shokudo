import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

// LINE tokenエンドポイント
const LINE_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';
// LINE プロフィールエンドポイント
const LINE_PROFILE_URL = 'https://api.line.me/v2/profile';

export async function GET(request: NextRequest) {
  try {
    // URLからコードとステートを取得
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (!code) {
      return NextResponse.redirect(new URL('/sign-in?error=missing_code', request.url));
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
        client_id: process.env.NEXT_PUBLIC_LINE_CLIENT_ID || '',
        client_secret: process.env.LINE_CLIENT_SECRET || '',
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('LINE Token Error:', errorData);
      return NextResponse.redirect(new URL('/sign-in?error=token_error', request.url));
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
      return NextResponse.redirect(new URL('/sign-in?error=profile_error', request.url));
    }
    
    const profileData = await profileResponse.json();
    
    // ここでClerkと連携
    // 実際のプロジェクトでは、ClerkのOAuthプロバイダーを使用するか
    // Clerkのユーザー管理APIを使用して処理します
    // サンプルとしてはLINEユーザー情報をセッションに格納してリダイレクト
    
    // セッションクッキーにLINEユーザー情報を保存（実際はより安全な方法を使用）
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('line_user_id', profileData.userId);
    response.cookies.set('line_display_name', profileData.displayName);
    response.cookies.set('line_picture_url', profileData.pictureUrl || '');
    
    return response;
  } catch (error) {
    console.error('LINE Auth Callback Error:', error);
    return NextResponse.redirect(new URL('/sign-in?error=unknown', request.url));
  }
} 