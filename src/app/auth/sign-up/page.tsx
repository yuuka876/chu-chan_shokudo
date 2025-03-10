'use client';

import { useRouter } from 'next/navigation';
import LineLoginButton from '@/components/LineLoginButton';

export default function SignUpPage() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-center mb-4">しゅうちゃん食堂 アカウント作成</h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            新しいアカウントを作成して予約を始めましょう
          </p>
          <div className="flex flex-col items-center">
            <LineLoginButton className="w-full" />
            
            <p className="mt-4 text-sm text-gray-500">
              LINEアカウントを使って簡単に登録できます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
