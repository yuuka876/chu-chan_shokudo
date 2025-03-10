'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateJP } from '@/lib/utils';
import { toast } from 'sonner';
import { User } from '@/types/user';
import { Reservation } from '@/types/index';

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);

  // 予約データを取得
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/reservations');
        
        if (!response.ok) {
          throw new Error('予約の取得に失敗しました');
        }
        
        const data = await response.json();
        setReservations(data.reservations || []);
        setFilteredReservations(data.reservations || []);
      } catch (error) {
        console.error('予約取得エラー:', error);
        toast.error('予約の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReservations();
  }, []);

  // 検索条件が変更されたときにフィルタリング
  useEffect(() => {
    let filtered = [...reservations];
    
    // 日付でフィルタリング
    if (searchDate) {
      const dateStr = searchDate;
      filtered = filtered.filter((reservation: Reservation) => {
        const menuDate = new Date(reservation.menu?.provideDate);
        return menuDate.toISOString().split('T')[0] === dateStr;
      });
    }
    
    // テキストでフィルタリング
    if (searchText) {
      const text = searchText.toLowerCase();
      filtered = filtered.filter((reservation: Reservation) => {
        const userName = (reservation.user?.userName || '').toLowerCase();
        const menuName = (reservation.menu?.menuName || '').toLowerCase();
        return userName.includes(text) || menuName.includes(text);
      });
    }
    
    setFilteredReservations(filtered);
  }, [searchDate, searchText, reservations]);

  // 予約をキャンセル
  const handleCancelReservation = async (id: string) => {
    if (!confirm('この予約をキャンセルしますか？')) return;
    
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('予約のキャンセルに失敗しました');
      }
      
      // 成功したら予約リストから削除
      setReservations(reservations.filter((r: Reservation) => r.id !== id));
      toast.success('予約をキャンセルしました');
    } catch (error) {
      console.error('予約キャンセルエラー:', error);
      toast.error('予約のキャンセルに失敗しました');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">予約管理</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">予約検索</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input 
            type="date" 
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="md:w-1/3" 
          />
          <Input 
            type="text" 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1" 
            placeholder="名前やメニューで検索" 
          />
          <Button 
            onClick={() => {
              setSearchDate('');
              setSearchText('');
            }}
            variant="outline"
          >
            クリア
          </Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">予約一覧</h2>
        
        {isLoading ? (
          <div className="text-center py-8">読み込み中...</div>
        ) : filteredReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="py-2 px-4 text-left">予約ID</th>
                  <th className="py-2 px-4 text-left">日付</th>
                  <th className="py-2 px-4 text-left">時間</th>
                  <th className="py-2 px-4 text-left">ユーザー</th>
                  <th className="py-2 px-4 text-left">メニュー</th>
                  <th className="py-2 px-4 text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation: Reservation) => (
                  <tr key={reservation.id} className="border-b">
                    <td className="py-2 px-4">{reservation.id.substring(0, 8)}</td>
                    <td className="py-2 px-4">
                      {reservation.menu?.provideDate 
                        ? formatDateJP(new Date(reservation.menu.provideDate)) 
                        : '日付なし'}
                    </td>
                    <td className="py-2 px-4">{reservation.reservationTime}</td>
                    <td className="py-2 px-4">{reservation.user?.userName || 'ユーザー不明'}</td>
                    <td className="py-2 px-4">{reservation.menu?.menuName || 'メニュー不明'}</td>
                    <td className="py-2 px-4">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleCancelReservation(reservation.id as string)}
                      >
                        キャンセル
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            予約が見つかりません
          </div>
        )}
      </div>
    </div>
  );
}
