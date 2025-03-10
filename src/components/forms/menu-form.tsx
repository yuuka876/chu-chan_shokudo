'use client';

import { useState, useEffect } from 'react';
import { MenuItem, TimeSlot, menuService } from '@/lib/services/menu-service';
import { motion, AnimatePresence } from 'framer-motion';
import { useLineAuth } from '@/lib/line-auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { ApiResponse } from '@/types/menu';
import { UserProfile } from '@/types/user';

interface MenuReservationProps {
  selectedDate: Date | null;
  onReservationComplete?: () => void; // 予約完了時のコールバック
}

export default function MenuReservation({ selectedDate, onReservationComplete }: MenuReservationProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPendingReservation, setIsPendingReservation] = useState(false); // 保留中の予約フラグ
  const [reservedMenus, setReservedMenus] = useState<MenuItem[]>([]);
  const [hasReservedMenu, setHasReservedMenu] = useState(false);
  const [isLoadingReservedMenus, setIsLoadingReservedMenus] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  const router = useRouter();
  
  // ユーザーの認証状態を確認
  const { isAuthenticated, user } = useLineAuth();
  
  // ログイン状態の確認
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        // 未ログインの場合は、現在のセッションに選択した情報を保存
        sessionStorage.setItem('pendingReservation', JSON.stringify({
          date: selectedDate,
          menuId: selectedMenuItem?.menuNo
        }));
        
        // ログインページにリダイレクト
        router.push('/auth/sign-in');
      }
    };
    
    // 最終的な予約確定時だけチェック
    if (isConfirmModalOpen) {
      checkAuth();
    }
  }, [isConfirmModalOpen, isAuthenticated, router, selectedDate, selectedMenuItem]);
  
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
          
          // 予約情報を復元
          if (pendingReservation.date) {
            const reservationDate = new Date(pendingReservation.date);
            console.log('復元する日付:', reservationDate);
          }
          
          if (pendingReservation.timeSlot) {
            setSelectedTimeSlot(pendingReservation.timeSlot);
            console.log('復元する時間枠:', pendingReservation.timeSlot);
          }
          
          if (pendingReservation.menuItem) {
            setSelectedMenuItem(pendingReservation.menuItem);
            console.log('復元するメニュー:', pendingReservation.menuItem);
          }
          
          // 予約確認モーダルを表示
          setIsConfirmModalOpen(true);
        } catch (error) {
          console.error('予約情報の復元に失敗:', error);
          sessionStorage.removeItem('pendingReservation');
        }
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isPendingReservation, selectedDate]);
  
  useEffect(() => {
    if (selectedDate) {
      // 選択した日付の予約可能時間をAPIから取得
      const fetchAvailableTimeSlots = async () => {
        try {
          const dateStr = selectedDate.toISOString().split('T')[0];
          const response = await fetch(`/api/time-slots/${dateStr}`);
          if (!response.ok) {
            throw new Error('時間枠の取得に失敗しました');
          }
          const data = await response.json();
          setTimeSlots(data.timeSlots);
        } catch (error) {
          console.error('時間枠取得エラー:', error);
          toast.error('予約可能な時間枠の取得に失敗しました');
          setTimeSlots([]);
        }
      };
      
      fetchAvailableTimeSlots();
      
      // 時間スロットが変更されたら選択をリセット
      setSelectedTimeSlot(null);
      setMenuItems([]);
      setSelectedMenuItem(null);
      
      // 選択した日付の予約済みメニューを取得
      fetchReservedMenus(selectedDate);
    }
  }, [selectedDate]);
  
  // 選択した日付の予約済みメニューを取得
  const fetchReservedMenus = async (date: Date) => {
    try {
      setIsLoadingReservedMenus(true);
      const menus = await menuService.getReservedMenusForDate(date);
      setReservedMenus(menus);
      setHasReservedMenu(menus.length > 0);
    } catch (error) {
      console.error('予約済みメニュー取得エラー:', error);
    } finally {
      setIsLoadingReservedMenus(false);
    }
  };
  
  const handleTimeSlotSelect = async (timeSlot: TimeSlot) => {
    if (!timeSlot.available) return;
    
    setSelectedTimeSlot(timeSlot);
    
    // 選択した時間帯に応じたメニューを取得
    if (selectedDate) {
      // 予約済みメニューがある場合は、そのメニューのみを表示
      if (hasReservedMenu) {
        // 選択した時間帯に合致する予約済みメニューをフィルタリング
        const filteredMenus = reservedMenus.filter(menu => menu.availability === timeSlot.mealType);
        setMenuItems(filteredMenus);
        
        // 予約済みメニューが1つだけの場合は自動選択
        if (filteredMenus.length === 1) {
          setSelectedMenuItem(filteredMenus[0]);
        } else {
          setSelectedMenuItem(null);
        }
      } else {
        // 予約済みメニューがない場合は通常通り全メニューを表示
        const items = await menuService.getMenuItems(selectedDate, timeSlot.mealType);
        setMenuItems(items);
        setSelectedMenuItem(null);
      }
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
    if (!selectedDate || !selectedTimeSlot || !selectedMenuItem) return;
    
    try {
      setIsPendingReservation(false);
      setErrorMessage(null);
      
      // ユーザーIDを取得
      let userId = '';
      if (isAuthenticated && user) {
        userId = user.id;
      } else {
        throw new Error('ユーザー情報が見つかりません');
      }
      
      // 予約情報を作成
      const reservationData = {
        menuId: selectedMenuItem.id,
        userId: userId,
        reservationTime: selectedTimeSlot.time,
        date: selectedDate.toISOString()
      };
      
      // 予約APIを呼び出す
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationData)
      });
      
      const data: ApiResponse = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || '予約に失敗しました');
      }
      
      // 保存されていた予約情報を削除
      sessionStorage.removeItem('pendingReservation');
      
      // 予約完了コールバックを呼び出す
      if (onReservationComplete) {
        onReservationComplete();
      }
      
      // 予約確認モーダルを閉じる
      setIsConfirmModalOpen(false);
    } catch (error) {
      console.error('予約エラー:', error);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  };

  // ユーザープロファイル情報を取得
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoadingProfile(true);
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `プロファイル取得エラー: ${response.statusText}`;
          
          try {
            // JSONとしてパースを試みる
            const errorData = JSON.parse(errorText);
            if (errorData.error) {
              errorMessage = `プロファイル取得エラー: ${errorData.error}`;
            }
          } catch (e) {
            // テキストとして処理
            console.warn('エラーレスポンスのパース失敗:', e);
          }
          
          console.error(errorMessage, { status: response.status, body: errorText });
          setErrorMessage(errorMessage);
          return;
        }
        
        const data = await response.json();
        if (data.success) {
          if (data.data?.profile) {
            setUserProfile(data.data.profile);
            console.log('プロファイル読み込み成功:', data.data.profile);
          } else if (data.data?.userExists === false) {
            console.log('プロフィールが見つかりません。新規ユーザーと判断します。');
            // ユーザーが見つからない場合も続行（基本プロフィールで対応）
          }
        } else {
          console.error('プロファイル取得API失敗:', data.error || data.message);
          setErrorMessage(data.error || data.message || 'プロファイル情報の取得に失敗しました');
        }
      } catch (error) {
        console.error('プロファイル取得エラー:', error);
        setErrorMessage(error instanceof Error ? error.message : 'プロファイル情報の取得中にエラーが発生しました');
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    fetchUserProfile();
  }, [isAuthenticated]);

  // メニュー選択セクションのレンダリング
  const renderMenuSelection = () => {
    if (!selectedTimeSlot) return null;

    // 予約済みメニューがある場合の表示
    if (isLoadingReservedMenus) {
      return (
        <div className="py-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">予約済みメニューを確認中...</p>
        </div>
      );
    }

    if (hasReservedMenu) {
      // 選択した時間帯に合致する予約済みメニューをフィルタリング
      const availableMenus = reservedMenus.filter(menu => menu.availability === selectedTimeSlot.mealType);
      
      if (availableMenus.length === 0) {
        return (
          <div className="py-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    選択した時間帯に予約可能なメニューがありません。別の時間帯を選択してください。
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      return (
        <div className="py-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  この日は既に予約されているメニューがあります。柊人ママは同じ日に複数のメニューを作ることができないため、同じメニューのみ選択可能です。
                </p>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">予約可能なメニュー</h3>
          <div className="grid grid-cols-1 gap-4">
            {availableMenus.map(menu => (
              <div
                key={menu.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                  selectedMenuItem?.id === menu.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
                onClick={() => handleMenuItemSelect(menu)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{menu.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {(menu as MenuItem).reservedBy ? `予約者: ${(menu as MenuItem).reservedBy}` : ''}
                    </p>
                  </div>
                  {selectedMenuItem?.id === menu.id && (
                    <div className="bg-blue-500 text-white rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 通常のメニュー選択（予約済みメニューがない場合）
    return (
      <div className="space-y-6">
        {/* ユーザープロファイル情報の表示 */}
        {userProfile && (userProfile.allergies || userProfile.dislikes) && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">食事に関する注意事項</AlertTitle>
            <AlertDescription className="text-amber-700">
              {userProfile.allergies && (
                <div className="mt-1">
                  <span className="font-semibold">アレルギー:</span> {userProfile.allergies}
                </div>
              )}
              {userProfile.dislikes && (
                <div className="mt-1">
                  <span className="font-semibold">苦手な食べ物:</span> {userProfile.dislikes}
                </div>
              )}
              <div className="mt-2 text-xs">
                <span className="font-semibold">※</span> 設定は
                <button 
                  onClick={() => router.push('/profile/details')}
                  className="text-blue-600 underline ml-1"
                >
                  プロフィール設定
                </button>
                から変更できます
              </div>
            </AlertDescription>
          </Alert>
        )}

        <h3 className="text-lg font-semibold text-gray-800">メニューを選択</h3>
        <div className="grid grid-cols-1 gap-4">
          {menuItems.map(menu => (
            <div
              key={menu.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${
                selectedMenuItem?.id === menu.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
              onClick={() => handleMenuItemSelect(menu)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{menu.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{menu.description}</p>
                  {menu.tags && menu.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {menu.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {selectedMenuItem?.id === menu.id && (
                  <div className="bg-blue-500 text-white rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
        
        {renderMenuSelection()}
        
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