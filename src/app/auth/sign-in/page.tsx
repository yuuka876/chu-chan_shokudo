'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LineLoginButton from '@/components/LineLoginButton';
import { useLineAuth } from '@/lib/line-auth';

export default function SignInPage() {
  const { isAuthenticated, isLoading } = useLineAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/';
  const error = searchParams.get('error');

  // ログイン完了後、リダイレクト先に遷移
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('ユーザーがログインしました。リダイレクトします:', redirectUrl);
      
      // ホームページに遷移
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, redirectUrl, router]);

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-center mb-4">しゅうちゃん食堂 ログイン</h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            予約を完了するにはログインしてください
          </p>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error === 'missing_code' && 'LINEから認証コードが取得できませんでした。'}
              {error === 'token_error' && 'LINE認証トークンの取得に失敗しました。'}
              {error === 'profile_error' && 'LINEプロフィール情報の取得に失敗しました。'}
              {error === 'unknown' && '不明なエラーが発生しました。もう一度お試しください。'}
            </div>
          )}
          
          <div className="flex flex-col items-center">
            <LineLoginButton className="w-full" />
            
            <p className="mt-4 text-sm text-gray-500">
              アカウントをお持ちでない方も、LINEアカウントで簡単に登録できます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
