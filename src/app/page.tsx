'use client';

import { useState } from 'react';
import CalendarView from "@/components/calendar/calendar-view";
import MenuForm from "@/components/forms/menu-form";
import Modal from "@/components/layouts/Modal";
import { useLineAuth } from '@/lib/line-auth';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import UserMenu from '@/components/UserMenu';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservationComplete, setReservationComplete] = useState(false);
  const router = useRouter();

  const { user, isAuthenticated } = useLineAuth();

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

  // プロファイル設定ページへ移動
  const navigateToProfileSettings = () => {
    router.push('/profile/details');
  };

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
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToProfileSettings}
                className="flex items-center gap-1 mr-2"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">食事設定</span>
              </Button>
            )}
            <UserMenu />
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
              <CalendarView onDateSelect={handleDateSelect} className="w-full" />
            </div>
            
            {/* 食事設定ボタン - モバイル向け */}
            {isAuthenticated && (
              <div className="mt-4 sm:hidden flex justify-center">
                <Button
                  variant="outline"
                  onClick={navigateToProfileSettings}
                  className="flex items-center gap-2"
                >
                  <Settings size={16} />
                  アレルギー・好き嫌い設定
                </Button>
              </div>
            )}
            
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
                  <li>同じ日に既に予約されているメニューがある場合は、そのメニューのみ選択可能です</li>
                  <li>柊人ママは同じ日に複数のメニューを作ることができないため、ご了承ください</li>
                </ul>
                
                {/* 食事設定案内 */}
                {isAuthenticated && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="font-semibold">アレルギーや好き嫌いの設定</p>
                    <p className="text-sm mt-1">
                      アレルギーや好き嫌いの情報を登録しておくと、予約時に自動的に反映されます。
                      <Button
                        variant="link"
                        onClick={navigateToProfileSettings}
                        className="text-blue-700 p-0 h-auto font-semibold"
                      >
                        食事設定を行う
                      </Button>
                    </p>
                  </div>
                )}
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
        <MenuForm 
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
