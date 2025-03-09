'use client';

import { useEffect } from 'react';
import { SignIn, useAuth } from "@clerk/nextjs";
import LineLoginButton from "@/components/ui/LineLoginButton";
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // ログイン完了後、保存されている予約情報があればホームに戻る
  useEffect(() => {
    if (isSignedIn) {
      const pendingReservation = sessionStorage.getItem('pendingReservation');
      
      if (pendingReservation) {
        console.log('ログイン成功: 保存された予約情報が見つかりました', pendingReservation);
        
        // 予約情報はセッションストレージに残しておく
        // これによりホームページでMenuReservationコンポーネントが
        // マウントされたときに処理できるようになる
        
        // ホームページにリダイレクト
        router.push('/');
      }
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-bold text-center mb-4">しゅうちゃん食堂 ログイン</h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            予約を完了するにはログインしてください
          </p>
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary: 'bg-blue-500 hover:bg-blue-600 text-white',
                footerActionLink: 'text-blue-500 hover:text-blue-600'
              }
            }}
          />
        </div>
        
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">または</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <LineLoginButton />
        </div>
      </div>
    </div>
  );
}
