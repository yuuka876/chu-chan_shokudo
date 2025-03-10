'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Menu, MessageCircle, Users } from 'lucide-react';
import { formatDateJP } from '@/lib/utils';
import { User } from '@/types/user';
import { Reservation } from '@/types/index';

export default function AdminDashboardPage() {
  const [todayReservations, setTodayReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date();

  // 今日の予約を取得
  useEffect(() => {
    const fetchTodayReservations = async () => {
      try {
        setIsLoading(true);
        const dateStr = today.toISOString().split('T')[0];
        const response = await fetch(`/api/reservations/date/${dateStr}`);
        
        if (!response.ok) {
          throw new Error('予約の取得に失敗しました');
        }
        
        const data = await response.json();
        setTodayReservations(data.reservations || []);
      } catch (error) {
        console.error('予約取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayReservations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
        <p className="text-gray-500">{formatDateJP(today)}</p>
      </div>

      {/* 今日の予約状況 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            今日の予約状況
          </CardTitle>
          <CardDescription>
            {formatDateJP(today)}の予約一覧
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">読み込み中...</div>
          ) : todayReservations.length > 0 ? (
            <div className="space-y-2">
              {todayReservations.map((reservation: Reservation) => (
                <div key={reservation.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div>
                    <p className="font-medium">{reservation.user?.userName || '名前なし'}</p>
                    <p className="text-sm text-gray-500">{reservation.menu?.menuName || 'メニュー未設定'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{reservation.reservationTime}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">今日の予約はありません</div>
          )}
        </CardContent>
        <CardFooter>
          <Link href="/admin/reservations" className="w-full">
            <Button variant="outline" className="w-full">
              すべての予約を表示
            </Button>
          </Link>
        </CardFooter>
      </Card>

      {/* 管理メニュー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/menu">
          <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="h-5 w-5" />
                メニュー管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                メニューの追加、編集、削除を行います
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/calendar">
          <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                カレンダー管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                営業日・休業日の設定、時間帯の設定を行います
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/line">
          <Card className="h-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                LINE通知管理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                LINE通知の設定、メッセージ送信を行います
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 