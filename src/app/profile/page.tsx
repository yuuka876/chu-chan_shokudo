'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLineAuth } from '@/lib/line-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const { user, signOut, isAuthenticated } = useLineAuth();
  const router = useRouter();

  // プロフィールデータの取得
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/user/profile');
        
        if (response.ok) {
          const data = await response.json();
          setUserData(data.userData);
        } else {
          console.error('プロフィールデータの取得に失敗しました');
        }
      } catch (error) {
        console.error('プロフィールデータの取得中にエラーが発生しました', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfileData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // 認証されていない場合、サインインページにリダイレクト
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/auth/sign-in?redirect_url=/profile');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>プロフィール</CardTitle>
          <CardDescription>あなたのアカウント情報</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.pictureUrl} alt={user?.displayName} />
              <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-bold">{userData?.userName || user?.displayName}</h3>
              
              {userData?.email && (
                <p className="text-sm text-gray-500">メール: {userData.email}</p>
              )}
              
              {userData?.phoneNumber && (
                <p className="text-sm text-gray-500">電話番号: {userData.phoneNumber}</p>
              )}
              
              <p className="text-sm text-gray-500">
                LINEアカウントで認証済み
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push('/')}>
            戻る
          </Button>
          <Button variant="destructive" onClick={() => signOut()}>
            ログアウト
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 