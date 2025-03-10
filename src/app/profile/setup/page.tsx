'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLineAuth } from '@/lib/line-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChefHat, User } from 'lucide-react';

export default function ProfileSetupPage() {
  const { user, isLoading } = useLineAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | null>(null);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">読み込み中...</div>;
  }

  if (!user) {
    router.push('/auth/sign-in');
    return null;
  }

  const handleRoleSelect = async () => {
    if (!selectedRole) {
      toast.error('ロールを選択してください');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/user/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userName: user.displayName || '名前なし',
          isAdmin: selectedRole === 'admin',
          lineUserName: user.displayName,
        }),
      });

      if (!response.ok) {
        throw new Error('プロフィールの設定に失敗しました');
      }

      toast.success('プロフィールを設定しました');
      
      // 管理者の場合は管理画面へ、ユーザーの場合はプロフィール詳細設定へ
      if (selectedRole === 'admin') {
        router.push('/admin');
      } else {
        router.push('/profile/details');
      }
    } catch (error) {
      console.error('プロフィール設定エラー:', error);
      toast.error('プロフィールの設定に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>ユーザータイプを選択</CardTitle>
            <CardDescription>
              しゅうちゃん食堂でのあなたの役割を選択してください
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRole === 'user' ? 'border-blue-500 ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedRole('user')}
              >
                <CardHeader className="p-4">
                  <User className="h-12 w-12 mx-auto text-blue-500" />
                </CardHeader>
                <CardContent className="text-center p-4 pt-0">
                  <h3 className="font-medium">ユーザー</h3>
                  <p className="text-sm text-gray-500">食事を予約する</p>
                </CardContent>
              </Card>
              
              <Card 
                className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedRole === 'admin' ? 'border-blue-500 ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedRole('admin')}
              >
                <CardHeader className="p-4">
                  <ChefHat className="h-12 w-12 mx-auto text-blue-500" />
                </CardHeader>
                <CardContent className="text-center p-4 pt-0">
                  <h3 className="font-medium">柊人ママ</h3>
                  <p className="text-sm text-gray-500">メニューを管理する</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleRoleSelect}
              disabled={!selectedRole || isSubmitting}
            >
              {isSubmitting ? '処理中...' : '続ける'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 