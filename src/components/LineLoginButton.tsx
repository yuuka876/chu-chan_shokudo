'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface LineLoginButtonProps {
  redirectUri?: string;
  className?: string;
}

export default function LineLoginButton({ redirectUri, className }: LineLoginButtonProps) {
  const router = useRouter();
  
  const handleLogin = () => {
    // LINE認証URLの生成
    const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
    const state = Math.random().toString(36).substring(2);
    
    // 必要なスコープを設定
    const scope = encodeURIComponent('profile openid');
    
    // リダイレクトURIの設定
    const callbackUrl = redirectUri || `${window.location.origin}/api/auth/callback/line`;
    const encodedRedirectUri = encodeURIComponent(callbackUrl);
    
    // LineログインURLを構築
    const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodedRedirectUri}&state=${state}&scope=${scope}`;
    
    // セッションストレージに状態を保存（CSRF対策）
    sessionStorage.setItem('line_auth_state', state);
    
    // 現在のURLをセッションに保存して、ログイン後に戻れるようにする
    if (window.location.pathname !== '/auth/sign-in') {
      sessionStorage.setItem('line_auth_redirect', window.location.pathname);
    }
    
    // LINE認証ページにリダイレクト
    router.push(lineLoginUrl);
  };
  
  return (
    <Button 
      onClick={handleLogin} 
      className={`bg-[#06C755] hover:bg-[#06B755] text-white ${className}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        width="24" 
        height="24" 
        className="mr-2"
      >
        <path 
          fill="currentColor" 
          d="M19.11 17.205c-.372 0-.754-.019-1.108-.05-1.22-.067-2.27-.364-3.195-.773a.75.75 0 00-.856.2 15.45 15.45 0 01-1.622 1.618c-.816.727-1.87 1.595-2.99 2.43l-.564.429c-.178.135-.398.21-.633.21-.19 0-.38-.046-.554-.135a1.17 1.17 0 01-.53-.611 1.168 1.168 0 01-.096-.695l.002-.005 1.063-4.46A1.165 1.165 0 016.873 16a.79.79 0 00-.73-.215c-.434.86-1.568.073-2.462-.45-.868-.507-1.71-1.161-2.411-1.874a10.152 10.152 0 01-2.08-2.876A7.326 7.326 0 018.039 3.91a7.286 7.286 0 015.879 9.708 7.32 7.32 0 005.196 3.587zm0 0"></path>
      </svg>
      LINEでログイン
    </Button>
  );
} 