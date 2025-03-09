'use client';

import { useState, useEffect } from 'react';
import { MenuItem, TimeSlot, menuService } from '@/lib/services/menu-service';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface MenuReservationProps {
  selectedDate: Date | null;
  onReservationComplete?: () => void; // 予約完了時のコールバック
}

// APIレスポンスの型定義
interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  details?: any;
  reservation?: any;
}

export default function MenuReservation({ selectedDate, onReservationComplete }: MenuReservationProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPendingReservation, setIsPendingReservation] = useState(false); // 保留中の予約フラグ
  
  const router = useRouter();
  
  // ユーザーの認証状態を確認
  const { isSignedIn, user } = useUser();
  const [lineUser, setLineUser] = useState<{ id: string; name: string; picture: string } | null>(null);
  
  // クッキーからLINEユーザー情報を取得
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    };

    const lineUserId = getCookie('line_user_id');
    const lineDisplayName = getCookie('line_display_name');

    if (lineUserId && lineDisplayName) {
      setLineUser({
        id: lineUserId,
        name: lineDisplayName,
        picture: ''
      });
    }
  }, []);
  
  // ログイン状態の確認
  const isAuthenticated = isSignedIn || lineUser !== null;
  
  // ログイン後に保存された予約情報を復元して予約確認モーダルを表示
  useEffect(() => {
    // フラグをリセット（コンポーネントが再マウントされた場合も考慮）
    let isMounted = true;
    
    console.log('予約情報復元チェック開始 - 認証状態:', isAuthenticated, '選択日:', selectedDate);
    
    // ログイン状態の変化を監視（ログイン成功後）
    if (isAuthenticated) {
      const pendingReservationStr = sessionStorage.getItem('pendingReservation');
      console.log('セッションストレージ内の予約情報:', pendingReservationStr);
      
      if (pendingReservationStr) {
        try {
          // 現在の状態をログに出力
          console.log('復元処理中ステータス:', isPendingReservation);
          
          // isPendingReservation フラグをチェックしない - ログイン成功直後は常に処理する
          setIsPendingReservation(true);
          
          const pendingReservation = JSON.parse(pendingReservationStr);
          console.log('パース済み予約情報:', pendingReservation);
          
          // 日付の復元
          if (pendingReservation.date) {
            const reservationDate = new Date(pendingReservation.date);
            console.log('日付比較:', 
              '保存日付:', reservationDate, 
              '現在選択日付:', selectedDate,
              '一致:', selectedDate && reservationDate.getTime() === selectedDate.getTime()
            );
            
            // 選択日付がなければ、自動的に復元する
            if (!selectedDate) {
              // ここでは直接モーダルを表示せず、ホームページのコンポーネントに日付選択を任せる
              console.log('選択日付がないため、復元しません - ホームページで処理されるはず');
              return;
            }
            
            if (selectedDate) {
              console.log('時間スロット:', timeSlots.length, '個検出');
              
              // 時間スロットの復元
              if (pendingReservation.timeSlotId && timeSlots.length > 0) {
                const timeSlot = timeSlots.find(slot => slot.id === pendingReservation.timeSlotId);
                console.log('該当する時間スロット:', timeSlot);
                
                if (timeSlot) {
                  setSelectedTimeSlot(timeSlot);
                  
                  // 選択された時間に基づいてメニュー項目を読み込む
                  const items = menuService.getMenuItems(selectedDate, timeSlot.mealType);
                  console.log('メニュー項目:', items.length, '個読み込み');
                  setMenuItems(items);
                  
                  // メニューアイテムの復元
                  if (pendingReservation.menuItemId && items.length > 0) {
                    const menuItem = items.find(item => item.id === pendingReservation.menuItemId);
                    console.log('該当するメニュー項目:', menuItem);
                    
                    if (menuItem) {
                      setSelectedMenuItem(menuItem);
                      
                      // すべての情報が揃ったらモーダルを表示（マウント状態を確認）
                      console.log('全ての情報が揃いました - モーダル表示を準備');
                      const timerId = setTimeout(() => {
                        if (isMounted) {
                          console.log('モーダルを表示します');
                          setIsConfirmModalOpen(true);
                          // ここではセッションストレージを消去しない
                          // モーダルが表示された後、予約確定したタイミングで消去する
                        }
                      }, 1000); // 遅延を少し長くして確実に表示
                      
                      // クリーンアップ時にタイマーをクリア
                      return () => {
                        clearTimeout(timerId);
                      };
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('予約情報の復元中にエラーが発生しました:', error);
        }
      }
    }
    
    // クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, selectedDate, timeSlots, menuService]);
  
  useEffect(() => {
    if (selectedDate) {
      // 選択した日付の予約可能時間を取得
      const availableSlots = menuService.getAvailableTimeSlots(selectedDate);
      setTimeSlots(availableSlots);
      
      // 時間スロットが変更されたら選択をリセット
      setSelectedTimeSlot(null);
      setMenuItems([]);
      setSelectedMenuItem(null);
    }
  }, [selectedDate]);
  
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (!timeSlot.available) return;
    
    setSelectedTimeSlot(timeSlot);
    
    // 選択した時間帯に応じたメニューを取得
    if (selectedDate) {
      const items = menuService.getMenuItems(selectedDate, timeSlot.mealType);
      setMenuItems(items);
      setSelectedMenuItem(null);
    }
  };
  
  const handleMenuItemSelect = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
  };
  
  // 予約確認モーダルを表示
  const handleConfirmation = () => {
    if (!selectedDate || !selectedTimeSlot || !selectedMenuItem) return;
    
    // ログインしていない場合は直接サインインページに遷移
    if (!isAuthenticated) {
      // 選択した予約情報をセッションストレージに保存して、ログイン後に復元できるようにする
      sessionStorage.setItem('pendingReservation', JSON.stringify({
        date: selectedDate.toISOString(),
        timeSlotId: selectedTimeSlot.id,
        menuItemId: selectedMenuItem.id
      }));
      
      // サインインページへリダイレクト
      router.push('/sign-in');
      return;
    }
    
    // ログイン済みの場合は確認モーダルを表示
    setIsConfirmModalOpen(true);
  };
  
  // 予約確認モーダルを閉じる
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };
  
  // 最終的な予約処理
  const handleFinalReservation = async () => {
    try {
      // メニュー番号を生成（日付と選択したメニューアイテムのIDを使用）
      const year = selectedDate!.getFullYear();
      const month = String(selectedDate!.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate!.getDate()).padStart(2, '0');
      const menuId = String(selectedMenuItem?.id).padStart(4, '0');
      const menuNo = `${year}${month}${day}${menuId}`;
      
      // 予約情報をAPIに送信
      console.log('予約APIを呼び出します:', { menuNo, reservationTime: selectedTimeSlot?.label });
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuNo,
          reservationTime: selectedTimeSlot?.label,
        }),
      });
      
      const data = await response.json() as ApiResponse;
      console.log('APIレスポンス:', data);
      
      if (!response.ok) {
        const errorDetails = typeof data.details === 'object' 
          ? JSON.stringify(data.details, null, 2)
          : data.details;
        
        const errorMessage = data.details 
          ? `${data.error}\n詳細: ${errorDetails}`
          : data.error || '予約に失敗しました';
        
        throw new Error(errorMessage);
      }
      
      // 成功メッセージを表示
      alert(`予約が完了しました！\n日付: ${selectedDate?.toLocaleDateString('ja-JP')}\n時間: ${selectedTimeSlot?.label}\nメニュー: ${selectedMenuItem?.name}`);
      
      // 確認モーダルを閉じる
      setIsConfirmModalOpen(false);
      
      // 予約情報が復元された場合、セッションストレージをクリーンアップ
      sessionStorage.removeItem('pendingReservation');
      
      // 予約処理フラグをリセット
      setIsPendingReservation(false);
      
      // 親コンポーネントに予約完了を通知して全てのモーダルを閉じる
      if (onReservationComplete) {
        onReservationComplete();
      }
    } catch (error) {
      console.error('予約エラー詳細:', error);
      
      // エラーメッセージをステートに保存
      setErrorMessage(error instanceof Error ? error.message : '不明なエラーが発生しました');
      
      // 確認モーダルを閉じる
      setIsConfirmModalOpen(false);
    }
  };

  // 日付が選択されていない場合
  if (!selectedDate) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-lg text-gray-500">カレンダーから日付を選択してください</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h3 className="text-xl font-bold">
          {selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}の予約
        </h3>
      </div>
      
      <div className="p-5">
        <h4 className="font-semibold mb-3">予約可能時間</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
          {timeSlots.map((slot) => (
            <motion.button
              key={slot.id}
              onClick={() => handleTimeSlotSelect(slot)}
              className={`p-2 rounded-md text-center transition-colors ${
                !slot.available 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : selectedTimeSlot?.id === slot.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
              whileHover={slot.available ? { scale: 1.05 } : {}}
              whileTap={slot.available ? { scale: 0.98 } : {}}
              disabled={!slot.available}
            >
              {slot.label}
            </motion.button>
          ))}
        </div>
        
        {selectedTimeSlot && (
          <>
            <h4 className="font-semibold mb-3">メニュー選択</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {menuItems.map((item) => (
                <motion.div
                  key={item.id}
                  onClick={() => handleMenuItemSelect(item)}
                  className={`p-4 border rounded-lg cursor-pointer ${
                    selectedMenuItem?.id === item.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex justify-between">
                    <h5 className="font-bold">{item.name}</h5>
                    <span className="font-bold text-blue-600">{item.price}円</span>
                  </div>
                  <p className="text-gray-600 mt-1 text-sm">{item.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-500">{item.calories}kcal</span>
                    <div className="flex gap-1">
                      {item.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
        
        {selectedMenuItem && (
          <motion.button
            onClick={handleConfirmation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            予約確認
          </motion.button>
        )}
      </div>
      
      {/* 予約確認モーダル */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={closeConfirmModal}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md z-10 overflow-hidden"
            >
              <div className="bg-blue-600 text-white p-4">
                <h3 className="text-xl font-bold">予約内容の確認</h3>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="font-semibold mb-4 text-gray-700">以下の内容で予約を確定しますか？</h4>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">日付</p>
                      <p className="font-medium text-gray-900">
                        {selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">時間</p>
                      <p className="font-medium text-gray-900">{selectedTimeSlot?.label}</p>
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">メニュー</p>
                      <p className="font-medium text-gray-900">{selectedMenuItem?.name}</p>
                    </div>
                    
                    <div className="flex justify-between items-center border-t pt-3 mt-3">
                      <span className="text-gray-500">料金</span>
                      <span className="font-bold text-lg">{selectedMenuItem?.price}円</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={closeConfirmModal}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  
                  <motion.button
                    onClick={handleFinalReservation}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    予約確定
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 