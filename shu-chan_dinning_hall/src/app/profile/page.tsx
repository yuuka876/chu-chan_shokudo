'use client';

import { useUser } from '@clerk/nextjs';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">読み込み中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">プロフィール</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-6 mb-6">
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt={user.firstName || 'ユーザー'}
              className="w-20 h-20 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {user?.firstName || 'ゲスト'} {user?.lastName || ''}
            </h2>
            <p className="text-gray-600">{user?.emailAddresses[0]?.emailAddress || 'メールアドレスなし'}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">アカウント情報</h3>
          <div className="space-y-2">
            <div className="flex">
              <span className="w-40 text-gray-600">ユーザーID:</span>
              <span className="font-mono text-sm">{user?.id}</span>
            </div>
            <div className="flex">
              <span className="w-40 text-gray-600">作成日:</span>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ja-JP') : '不明'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 