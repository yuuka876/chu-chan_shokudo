'use client';

import { useLineAuth } from '@/lib/line-auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LineLoginButton from '@/components/LineLoginButton';

export default function UserMenu() {
  const { user, isAuthenticated } = useLineAuth();

  return (
    <div className="flex items-center gap-4">
      {isAuthenticated ? (
        // ログイン済みの場合
        <div className="flex items-center gap-4">
          <Link href="/profile" className="text-blue-500 hover:underline">
            プロフィール
          </Link>
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {user?.displayName?.charAt(0) || 'U'}
          </div>
        </div>
      ) : (
        // 未ログインの場合
        <div className="flex items-center gap-2">
          <LineLoginButton />
        </div>
      )}
    </div>
  );
} 