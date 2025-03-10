'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

interface LineUser {
  id: string;
  displayName: string;
  pictureUrl?: string;
}

interface LineAuthContextType {
  user: LineUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const LineAuthContext = createContext<LineAuthContextType | undefined>(undefined);

export function LineAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LineUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      // ユーザープロファイルAPIを呼び出し
      const response = await fetch('/api/user/profile');
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.userData) {
          setUser({
            id: userData.userData.userId,
            displayName: userData.userData.userName || 'ゲスト',
            pictureUrl: userData.userData.pictureUrl
          });
          return;
        }
      }
      
      // クッキーから直接読み取り（バックアッププラン）
      const lineUserId = getCookie('line_user_id');
      const lineDisplayName = getCookie('line_display_name');
      const linePictureUrl = getCookie('line_picture_url');
      
      if (lineUserId) {
        setUser({
          id: lineUserId as string,
          displayName: (lineDisplayName as string) || 'ゲスト',
          pictureUrl: linePictureUrl as string
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('ユーザー情報の取得に失敗しました', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // サーバーサイドでのセッション削除
      await fetch('/api/auth/signout', { method: 'POST' });
      
      // フロントエンドのクッキーを削除
      deleteCookie('line_user_id');
      deleteCookie('line_display_name');
      deleteCookie('line_picture_url');
      
      // ユーザー状態をリセット
      setUser(null);
      
      // ホームページにリダイレクト
      router.push('/');
    } catch (error) {
      console.error('サインアウト中にエラーが発生しました', error);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
    refreshUser
  };

  return (
    <LineAuthContext.Provider value={value}>
      {children}
    </LineAuthContext.Provider>
  );
}

export function useLineAuth() {
  const context = useContext(LineAuthContext);
  if (context === undefined) {
    throw new Error('useLineAuth must be used within a LineAuthProvider');
  }
  return context;
} 