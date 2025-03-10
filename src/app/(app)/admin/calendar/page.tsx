'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { formatDateJP, formatDateWithDayJP } from '@/lib/utils';
import { BusinessHours } from '@/types/calendar';

export default function AdminCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [businessDays, setBusinessDays] = useState<BusinessHours[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 営業時間の設定
  const [isHoliday, setIsHoliday] = useState(false);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');

  // 月が変わったら、その月の営業日データを取得
  useEffect(() => {
    fetchBusinessDays();
  }, [currentMonth]);

  // 営業日データを取得
  const fetchBusinessDays = async () => {
    try {
      setIsLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      
      const response = await fetch(`/api/business-hours?year=${year}&month=${month}`);
      if (!response.ok) {
        throw new Error('営業日の取得に失敗しました');
      }
      
      const data = await response.json();
      setBusinessDays(data.businessHours || []);
    } catch (error) {
      console.error('営業日取得エラー:', error);
      toast.error('営業日の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 日付を選択したときの処理
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // 選択した日付の営業日データを取得
    const formattedDate = formatDate(date);
    const businessDay = businessDays.find(day => {
      const dayDate = new Date(day.date);
      return formatDate(dayDate) === formattedDate;
    });
    
    if (businessDay) {
      setIsHoliday(businessDay.isHoliday);
      setStartTime(businessDay.startTime);
      setEndTime(businessDay.endTime);
    } else {
      // デフォルト値を設定
      setIsHoliday(false);
      setStartTime('08:00');
      setEndTime('20:00');
    }
  };

  // 前月へ
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  // 翌月へ
  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // 営業日設定を保存
  const handleSaveBusinessDay = async () => {
    if (!selectedDate) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/business-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          isHoliday,
          startTime,
          endTime
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '営業日の設定に失敗しました');
      }
      
      toast.success('営業日を設定しました');
      
      // 営業日データを再取得
      fetchBusinessDays();
    } catch (error) {
      console.error('営業日設定エラー:', error);
      toast.error(error instanceof Error ? error.message : '営業日の設定に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 日付をYYYY-MM-DD形式に変換
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // カレンダーの日付を生成
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // 月の最初の日
    const firstDayOfMonth = new Date(year, month, 1);
    // 月の最後の日
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // 月の日数
    const daysInMonth = lastDayOfMonth.getDate();
    
    // 最初の日の曜日（0: 日曜日, 1: 月曜日, ...)
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    const days = [];
    
    // 前月の日を追加
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      const date = new Date(year, month - 1, prevMonthLastDay - startingDayOfWeek + i + 1);
      days.push({
        date,
        isCurrentMonth: false,
        isHoliday: isDateHoliday(date)
      });
    }
    
    // 今月の日を追加
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isHoliday: isDateHoliday(date)
      });
    }
    
    // 次月の日を追加して6行にする
    const totalDaysToShow = 42; // 6行 × 7列
    const remainingDays = totalDaysToShow - days.length;
    
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isHoliday: isDateHoliday(date)
      });
    }
    
    return days;
  };

  // 日付が休日かどうかを判定
  const isDateHoliday = (date: Date): boolean => {
    const formattedDate = formatDate(date);
    const businessDay = businessDays.find(day => {
      // 日付文字列を比較する
      const dayDate = new Date(day.date);
      return formatDate(dayDate) === formattedDate;
    });
    return businessDay ? businessDay.isHoliday : false;
  };

  // 日本語の曜日
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  
  // カレンダーの日付
  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">カレンダー管理</h1>
      <p className="text-gray-600">
        カレンダーから日付を選択して、営業時間や休日を設定できます。
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* カレンダー */}
        <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <h2 className="text-xl font-semibold">
              {currentMonth.getFullYear()}年 {currentMonth.getMonth() + 1}月
            </h2>
            
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* 曜日の表示 */}
              {weekdays.map((day, index) => (
                <div
                  key={index}
                  className={`text-center py-2 font-semibold ${
                    index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
                  }`}
                >
                  {day}
                </div>
              ))}
              
              {/* 日付の表示 */}
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  onClick={() => day.isCurrentMonth && handleDateSelect(day.date)}
                  className={`
                    relative h-14 p-1 text-center cursor-pointer border
                    ${!day.isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
                    ${day.isHoliday ? 'bg-red-50 border-red-200' : ''}
                    ${selectedDate && day.date.toDateString() === selectedDate.toDateString()
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'}
                    ${(index % 7 === 0) ? 'text-red-500' : ''}
                    ${(index % 7 === 6) ? 'text-blue-500' : ''}
                  `}
                >
                  <div className="text-sm">{day.date.getDate()}</div>
                  {day.isHoliday && (
                    <div className="absolute bottom-1 left-0 right-0 text-xs text-red-500">休</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 営業日設定フォーム */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">営業日設定</h3>
          
          {selectedDate ? (
            <div className="space-y-4">
              <p className="font-medium">{formatDateWithDayJP(selectedDate)}</p>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isHoliday}
                    onChange={(e) => setIsHoliday(e.target.checked)}
                    className="rounded text-blue-500 focus:ring-blue-500"
                  />
                  <span>休日にする</span>
                </label>
              </div>
              
              {!isHoliday && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      開始時間
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      終了時間
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </>
              )}
              
              <button
                onClick={handleSaveBusinessDay}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isSubmitting ? '保存中...' : '保存'}
              </button>
            </div>
          ) : (
            <p className="text-gray-500">カレンダーから日付を選択してください</p>
          )}
        </div>
      </div>
    </div>
  );
}
