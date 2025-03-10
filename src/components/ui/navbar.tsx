'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, User, LogOut } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ユーザー情報を取得
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.user?.isAdmin || false);
          setUserName(data.user?.userName || 'ゲスト');
        }
      } catch (error) {
        console.error('ユーザー情報取得エラー:', error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="hidden sm:inline-block">しゅうちゃん食堂</span>
        </Link>
        
        {/* モバイルメニューボタン */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden ml-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* デスクトップナビゲーション */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            ホーム
          </Link>
          <Link
            href="/menu"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/menu' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            メニュー
          </Link>
          <Link
            href="/calendar"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === '/calendar' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            カレンダー
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              管理者
            </Link>
          )}
        </nav>
        
        {/* モバイルナビゲーション */}
        {isMenuOpen && (
          <div className="absolute top-14 left-0 w-full bg-background border-b md:hidden">
            <nav className="flex flex-col p-4">
              <Link
                href="/"
                className={`py-2 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/' ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                ホーム
              </Link>
              <Link
                href="/menu"
                className={`py-2 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/menu' ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                メニュー
              </Link>
              <Link
                href="/calendar"
                className={`py-2 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === '/calendar' ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                カレンダー
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`py-2 text-sm font-medium transition-colors hover:text-primary ${
                    pathname.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  管理者
                </Link>
              )}
            </nav>
          </div>
        )}
        
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.png" alt={userName} />
                  <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {isAdmin ? '管理者' : 'ユーザー'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/profile" className="flex w-full items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>プロフィール</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/auth/signout" className="flex w-full items-center text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ログアウト</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 