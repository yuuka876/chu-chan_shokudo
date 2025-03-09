'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LineLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLineLogin = async () => {
    setIsLoading(true);
    
    try {
      // LINEログインURLを構築
      const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
      const redirectUri = encodeURIComponent(process.env.NEXT_PUBLIC_LINE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/line');
      const state = Math.random().toString(36).substring(2, 15);
      
      // ステートをセッションストレージに保存して、コールバック時に検証
      sessionStorage.setItem('line_auth_state', state);
      
      // LINEログイン認証ページにリダイレクト
      const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid&bot_prompt=normal`;
      
      window.location.href = lineLoginUrl;
    } catch (error) {
      console.error('LINE認証エラー:', error);
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleLineLogin}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 bg-[#06C755] hover:bg-[#05B04B] text-white font-bold py-2 px-4 rounded-md w-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* LINE LOGO */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M22 10.6C22 5.9 17.5 2 12 2C6.5 2 2 5.9 2 10.6C2 14.8 5.4 18.3 10 19.3C10.5 19.4 11.1 19.7 11.2 20.1C11.3 20.5 11.3 21.1 11.1 21.5C11.1 21.5 10.9 22.5 10.8 22.7C10.7 23.1 10.4 24 12 23.3C13.6 22.6 19 19.1 21.1 16.3C22.3 14.9 22 12.9 22 10.6Z" fill="white"/>
        <path d="M9.8 13.9H8.2C8 13.9 7.8 13.7 7.8 13.5V10C7.8 9.8 8 9.6 8.2 9.6H9.8C10 9.6 10.2 9.8 10.2 10V13.5C10.2 13.7 10 13.9 9.8 13.9Z" fill="#06C755"/>
        <path d="M16.8 13.9H15.2C15 13.9 14.8 13.7 14.8 13.5V10C14.8 9.8 15 9.6 15.2 9.6H16.8C17 9.6 17.2 9.8 17.2 10V13.5C17.2 13.7 17 13.9 16.8 13.9Z" fill="#06C755"/>
        <path d="M14.2 9.6H12.8C12.6 9.6 12.4 9.8 12.4 10V13.5C12.4 13.7 12.6 13.9 12.8 13.9H14.2C14.4 13.9 14.6 13.7 14.6 13.5V10C14.6 9.8 14.4 9.6 14.2 9.6Z" fill="#06C755"/>
        <path d="M9.2 12.4V13.5C9.2 13.7 9 13.9 8.8 13.9H7.2C7 13.9 6.8 13.7 6.8 13.5V10C6.8 9.8 7 9.6 7.2 9.6H8.8C9 9.6 9.2 9.8 9.2 10V10.8L7.2 12.1V13L9.2 11.7V12.4Z" fill="#06C755"/>
      </svg>
      
      <span>
        {isLoading ? 'ログイン中...' : 'LINEでログイン'}
      </span>
    </motion.button>
  );
} 