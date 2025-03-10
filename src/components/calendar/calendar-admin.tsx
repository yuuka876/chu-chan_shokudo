'use client';

import { useState, useEffect } from 'react';
import CalendarView from './calendar-view';
import { MenuItem } from '@/lib/services/menu-service';
import { toast } from 'sonner';

interface CalendarAdminProps {
  onDateSelect?: (date: Date) => void;
}

interface DateSettings {
  date: string; // YYYY-MM-DD形式
  isHoliday: boolean;
  menuIds: string[];
  startTime?: string;
  endTime?: string;
}

export default function CalendarAdmin({ onDateSelect }: CalendarAdminProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateSettings, setDateSettings] = useState<DateSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableMenus, setAvailableMenus] = useState<MenuItem[]>([]);
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [isHoliday, setIsHoliday] = useState(false);
  const [startTime, setStartTime] = useState('07:30');
  const [endTime, setEndTime] = useState('20:00');

  // 日付選択時の処理
  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    
    if (onDateSelect) {
      onDateSelect(date);
    }
    
    // 選択した日付の設定を取得
    await fetchDateSettings(date);
    
    // 利用可能なメニューを取得
    await fetchAvailableMenus();
  };

  // 選択した日付の設定を取得
  const fetchDateSettings = async (date: Date) => {
    try {
      setIsLoading(true);
      const dateString = formatDate(date);
      
      // APIから日付の設定を取得
      const response = await fetch(`/api/business-hours/${dateString}`);
      
      if (response.ok) {
        const data = await response.json();
        setDateSettings(data.settings);
        
        // 設定があれば、フォームに反映
        if (data.settings) {
          setIsHoliday(data.settings.isHoliday);
          setStartTime(data.settings.startTime || '07:30');
          setEndTime(data.settings.endTime || '20:00');
          setSelectedMenuIds(data.settings.menuIds || []);
        } else {
          // 設定がなければ、デフォルト値をセット
          setIsHoliday(false);
          setStartTime('07:30');
          setEndTime('20:00');
          setSelectedMenuIds([]);
        }
      } else {
        // エラーの場合はデフォルト値をセット
        setDateSettings(null);
        setIsHoliday(false);
        setStartTime('07:30');
        setEndTime('20:00');
        setSelectedMenuIds([]);
      }
    } catch (error) {
      console.error('日付設定取得エラー:', error);
      toast.error('日付設定の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 利用可能なメニューを取得
  const fetchAvailableMenus = async () => {
    try {
      const response = await fetch('/api/menus');
      if (response.ok) {
        const data = await response.json();
        setAvailableMenus(data.menus || []);
      } else {
        setAvailableMenus([]);
      }
    } catch (error) {
      console.error('メニュー取得エラー:', error);
      toast.error('メニューの取得に失敗しました');
    }
  };

  // 日付の設定を保存
  const handleSaveSettings = async () => {
    if (!selectedDate) return;
    
    try {
      setIsLoading(true);
      const dateString = formatDate(selectedDate);
      
      const settings: DateSettings = {
        date: dateString,
        isHoliday,
        menuIds: selectedMenuIds,
        startTime,
        endTime
      };
      
      // APIに日付の設定を保存
      const response = await fetch(`/api/business-hours/${dateString}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        toast.success('日付設定を保存しました');
        setDateSettings(settings);
      } else {
        const error = await response.json();
        throw new Error(error.message || '保存に失敗しました');
      }
    } catch (error) {
      console.error('日付設定保存エラー:', error);
      toast.error('日付設定の保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // メニュー選択の切り替え
  const toggleMenuSelection = (menuId: string) => {
    if (selectedMenuIds.includes(menuId)) {
      setSelectedMenuIds(selectedMenuIds.filter(id => id !== menuId));
    } else {
      setSelectedMenuIds([...selectedMenuIds, menuId]);
    }
  };

  // 日付をYYYY-MM-DD形式にフォーマット
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // 提供時間帯の日本語表示
  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'breakfast': return '朝食';
      case 'lunch': return '昼食';
      case 'dinner': return '夕食';
      default: return availability;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* カレンダー */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">カレンダー</h2>
          <CalendarView onDateSelect={handleDateSelect} className="admin-calendar" />
        </div>
        
        {/* 日付設定 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            {selectedDate 
              ? `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日の設定` 
              : '日付を選択してください'}
          </h2>
          
          {selectedDate ? (
            <div className="space-y-4">
              {/* 営業・休業設定 */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isHoliday}
                    onChange={(e) => setIsHoliday(e.target.checked)}
                    className="rounded"
                  />
                  <span>休業日に設定</span>
                </label>
              </div>
              
              {/* 営業時間設定 */}
              {!isHoliday && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      開始時間
                    </label>
                    <input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      終了時間
                    </label>
                    <input
                      type="time"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}
              
              {/* メニュー選択 */}
              {!isHoliday && (
                <div>
                  <h3 className="text-md font-medium mb-2">提供メニュー</h3>
                  
                  {availableMenus.length === 0 ? (
                    <p className="text-gray-500">利用可能なメニューがありません</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto p-2">
                      {availableMenus.map((menu) => (
                        <label key={menu.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                          <input
                            type="checkbox"
                            checked={selectedMenuIds.includes(menu.id)}
                            onChange={() => toggleMenuSelection(menu.id)}
                            className="rounded"
                          />
                          <div>
                            <div className="font-medium">{menu.name}</div>
                            <div className="text-sm text-gray-500">
                              {getAvailabilityLabel(menu.availability)} - {menu.price}円
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* 保存ボタン */}
              <div className="pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {isLoading ? '保存中...' : '設定を保存'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-10">
              カレンダーから日付を選択してください
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 