'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLineAuth } from '@/lib/line-auth';
import { toast } from 'sonner';

export default function SignOutPage() {
  const { signOut } = useLineAuth();
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        // LINE認証をサインアウト
        await signOut();
        
        // ホームページにリダイレクト
        router.push('/');
      } catch (error) {
        console.error('サインアウトエラー:', error);
        toast.error('サインアウトに失敗しました');
        router.push('/');
      }
    };

    performSignOut();
  }, [signOut, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">ログアウト中...</h1>
        <p className="text-gray-500">しばらくお待ちください</p>
      </div>
    </div>
  );
} 