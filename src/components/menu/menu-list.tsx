'use client';

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import Link from 'next/link';

export default function UserMenu() {
  return (
    <div className="flex items-center gap-4">
      <SignedIn>
        {/* ログイン済みの場合 */}
        <div className="flex items-center gap-4">
          <Link href="/profile" className="text-blue-500 hover:underline">
            プロフィール
          </Link>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: 'w-10 h-10',
              }
            }}
          />
        </div>
      </SignedIn>

      <SignedOut>
        {/* 未ログインの場合 */}
        <div className="flex items-center gap-2">
          <SignInButton>
            <button className="text-blue-500 hover:underline">
              ログイン
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              新規登録
            </button>
          </SignUpButton>
        </div>
      </SignedOut>
    </div>
  );
} 