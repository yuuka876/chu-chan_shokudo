'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLineAuth } from '@/lib/line-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// APIレスポンスの型定義
type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
};

// プロフィール情報の型定義
type ProfileData = {
  userName: string;
  allergies?: string;
  preferences?: string;
  dislikes?: string;
  notes?: string;
};

export default function ProfileDetailsPage() {
  const { user, isLoading } = useLineAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading2, setIsLoading2] = useState(true);
  
  // フォームの状態
  const [formData, setFormData] = useState<ProfileData>({
    userName: '',
    allergies: '',
    preferences: '',
    dislikes: '',
    notes: ''
  });

  // プロファイル情報を取得
  useEffect(() => {
    const fetchProfile = async () => {
      if (isLoading) return;
      
      try {
        setIsLoading2(true);
        
        // ユーザー認証確認
        if (!user) {
          // LINE認証されていない場合はログインページへリダイレクト
          router.push('/auth/sign-in');
          return;
        }
        
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
          const errorData = await response.json() as ApiResponse;
          throw new Error(errorData.error || 'プロフィールの取得に失敗しました');
        }
        
        const data = await response.json() as ApiResponse;
        
        if (data.success && data.data?.profile) {
          // プロフィール情報をフォームにセット
          const profile = data.data.profile as ProfileData;
          setFormData({
            userName: profile.userName || user.displayName || '',
            allergies: profile.allergies || '',
            preferences: profile.preferences || '',
            dislikes: profile.dislikes || '',
            notes: profile.notes || ''
          });
        } else {
          // 初期値をセット
          setFormData({
            userName: user.displayName || '',
            allergies: '',
            preferences: '',
            dislikes: '',
            notes: ''
          });
        }
      } catch (error) {
        console.error('プロフィール取得エラー:', error);
        toast.error(error instanceof Error ? error.message : 'プロフィールの取得に失敗しました');
      } finally {
        setIsLoading2(false);
      }
    };
    
    fetchProfile();
  }, [isLoading, user, router]);

  if (isLoading || isLoading2) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">読み込み中...</span>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // LINE認証でのユーザーID取得
      const userId = user?.id;
      
      if (!userId) {
        throw new Error('ユーザーIDが取得できません');
      }
      
      console.log('送信するプロフィールデータ:', {
        userId,
        ...formData
      });
      
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...formData
        }),
      });

      // レスポンスのステータスコードを確認
      console.log('APIレスポンスステータス:', response.status);
      
      // レスポンスのJSONデータを取得
      const responseData = await response.json() as ApiResponse;
      console.log('APIレスポンスデータ:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || 'プロフィールの更新に失敗しました');
      }

      toast.success(responseData.message || 'プロフィールを更新しました');
      router.push('/');
    } catch (error) {
      console.error('プロフィール更新エラー詳細:', error);
      
      let errorMessage = 'プロフィールの更新に失敗しました';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('エラーの種類:', error.name);
        console.error('エラーメッセージ:', error.message);
        console.error('エラースタック:', error.stack);
      } else {
        console.error('不明なエラー:', error);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>プロフィール詳細設定</CardTitle>
          <CardDescription>
            食事の好みやアレルギー情報を教えてください。柊人ママがあなたに合ったメニューを提供します。
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">お名前</div>
              <Input
                id="userName"
                name="userName"
                placeholder="お名前を入力してください"
                value={formData.userName}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">アレルギー情報</div>
              <Textarea
                id="allergies"
                name="allergies"
                placeholder="卵、乳製品、小麦粉など、アレルギーがある食材を入力してください"
                value={formData.allergies}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">好きな食べ物</div>
              <Textarea
                id="preferences"
                name="preferences"
                placeholder="特に好きな料理や食材を教えてください"
                value={formData.preferences}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">苦手な食べ物</div>
              <Textarea
                id="dislikes"
                name="dislikes"
                placeholder="苦手な食材や料理があれば教えてください"
                value={formData.dislikes}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">その他の備考</div>
              <Textarea
                id="notes"
                name="notes"
                placeholder="その他、食事について伝えたいことがあれば記入してください"
                value={formData.notes}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? '保存中...' : 'プロフィールを保存'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 