'use client';

import { useState, useEffect } from 'react';
import Calendar from "@/components/Calendar";
import MenuReservation from "@/components/MenuReservation";
import Modal from "@/components/Modal";
import { UserButton, useUser } from '@clerk/nextjs';
import LineLoginButton from '@/components/LineLoginButton';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lineUser, setLineUser] = useState<{ id: string; name: string; picture: string } | null>(null);
  const [reservationComplete, setReservationComplete] = useState(false);

  const { isSignedIn, user } = useUser();

  // クッキーからLINEユーザー情報を取得（実際のプロジェクトではより安全な方法を使用）
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const lineUserId = getCookie('line_user_id');
    const lineDisplayName = getCookie('line_display_name');
    const linePictureUrl = getCookie('line_picture_url');

    if (lineUserId && lineDisplayName) {
      setLineUser({
        id: lineUserId,
        name: lineDisplayName,
        picture: linePictureUrl || ''
      });
    }
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // 日付選択時は常にモーダルを表示
    setIsModalOpen(true);
    // 前回の予約完了状態をリセット
    setReservationComplete(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 予約完了時の処理
  const handleReservationComplete = () => {
    // 予約が完了したことを記録
    setReservationComplete(true);
    // すべてのモーダルを閉じる
    setIsModalOpen(false);
    
    // 選択状態をリセット（次回予約時のために）
    setTimeout(() => {
      setSelectedDate(null);
    }, 500);
  };

  // LINE認証済みかClerk認証済みかチェック
  const isAuthenticated = isSignedIn || lineUser !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">食堂メニュー予約</h1>
            <p className="mt-1 text-sm text-gray-500">希望日時と食事を選んで簡単予約</p>
          </div>
          
          <div className="hidden md:block">
            <h1 className="text-4xl font-bold text-blue-600 tracking-wide font-serif">しゅうちゃん食堂</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : lineUser ? (
              <div className="flex items-center gap-2">
                {lineUser.picture && (
                  <img
                    src={lineUser.picture}
                    alt={lineUser.name}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <span className="text-sm hidden sm:inline">{lineUser.name}</span>
                <button
                  onClick={() => {
                    // LINEログアウト処理（クッキー削除）
                    document.cookie = 'line_user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'line_display_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    document.cookie = 'line_picture_url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    window.location.reload();
                  }}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <div className="w-28">
                <LineLoginButton />
              </div>
            )}
          </div>
        </div>
        <div className="md:hidden text-center pb-4">
          <h1 className="text-3xl font-bold text-blue-600 tracking-wide font-serif">しゅうちゃん食堂</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          {/* カレンダーセクション - 常に表示 */}
          <div className="w-full max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">予約する日付を選択</h2>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Calendar onDateSelect={handleDateSelect} className="w-full" />
            </div>
            
            {/* 予約完了メッセージ */}
            {reservationComplete && (
              <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded text-green-700">
                <h3 className="font-bold">予約が完了しました</h3>
                <p className="mt-1">ご予約ありがとうございます。予約時間に食堂へお越しください。</p>
              </div>
            )}
            
            {!reservationComplete && (
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-blue-700">
                <h3 className="font-bold">ご利用案内</h3>
                <ul className="mt-2 space-y-1 list-disc list-inside text-sm">
                  <li>予約は3日前までにお願いします</li>
                  <li>キャンセルは前日12時まで可能です</li>
                  <li>食物アレルギーはメニュー予約時にご申告ください</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* メニュー予約モーダル - 誰でも閲覧可能 */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        title={selectedDate 
          ? `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日のメニュー予約`
          : 'メニュー予約'
        }
      >
        <MenuReservation 
          selectedDate={selectedDate} 
          onReservationComplete={handleReservationComplete} 
        />
      </Modal>

      <footer className="bg-white mt-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 text-sm">© 2024 食堂メニュー予約システム</p>
            </div>
            <div className="flex gap-8">
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">利用規約</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">プライバシーポリシー</a>
              <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">お問い合わせ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
