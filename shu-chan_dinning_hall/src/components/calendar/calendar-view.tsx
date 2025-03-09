'use client';

import { useState } from 'react';

interface CalendarProps {
  className?: string;
  onDateSelect?: (date: Date) => void;
}

// 日本語の曜日と月の名前
const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
const months = [
  '1月', '2月', '3月', '4月', '5月', '6月',
  '7月', '8月', '9月', '10月', '11月', '12月'
];

export default function Calendar({ className = '', onDateSelect }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // 現在の年と月を取得
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // 今月の最初の日
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  // 今月の最後の日
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  
  // 今月の日数
  const daysInMonth = lastDayOfMonth.getDate();
  
  // 最初の日の曜日（0: 日曜日, 1: 月曜日, ...)
  const startingDayOfWeek = firstDayOfMonth.getDay();
  
  // 前月と次月の設定
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null); // 月を変更したら選択をリセット
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null); // 月を変更したら選択をリセット
  };
  
  // 日付クリックのハンドラー
  const handleDateClick = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return; // 当月以外の日付はクリック不可
    
    const selectedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(selectedDate);
    
    if (onDateSelect) {
      onDateSelect(selectedDate);
    }
  };
  
  // カレンダーの日付を生成
  const generateCalendarDays = () => {
    const days = [];
    
    // 前月の日を追加
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
      days.push({
        day: prevMonthLastDay - startingDayOfWeek + i + 1,
        isCurrentMonth: false,
        isToday: false,
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - startingDayOfWeek + i + 1)
      });
    }
    
    // 今月の日を追加
    const today = new Date();
    const isCurrentMonthAndYear = today.getMonth() === currentMonth && 
                                today.getFullYear() === currentYear;
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: isCurrentMonthAndYear && today.getDate() === i,
        isSelected: selectedDate && date.getDate() === selectedDate.getDate() && 
                    date.getMonth() === selectedDate.getMonth() && 
                    date.getFullYear() === selectedDate.getFullYear(),
        date: date
      });
    }
    
    // 次月の日を追加して6行にする
    const totalDaysToShow = 42; // 6行 × 7列
    const remainingDays = totalDaysToShow - days.length;
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        isToday: false,
        date: new Date(currentYear, currentMonth + 1, i)
      });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  return (
    <div className={`w-full mx-auto bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="bg-blue-600 text-white p-6">
        <div className="flex justify-between items-center">
          <button 
            onClick={goToPreviousMonth}
            className="text-white focus:outline-none hover:bg-blue-700 p-2 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-2xl font-bold">
            {currentYear}年 {months[currentMonth]}
          </h2>
          
          <button 
            onClick={goToNextMonth}
            className="text-white focus:outline-none hover:bg-blue-700 p-2 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((day, index) => (
            <div 
              key={index} 
              className={`text-center py-3 text-base font-bold
                ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'}
              `}
            >
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => (
            <div 
              key={index}
              onClick={() => handleDateClick(day.day, day.isCurrentMonth)}
              className={`
                relative py-4 text-center text-lg cursor-pointer transition-colors duration-200 flex items-center justify-center
                ${!day.isCurrentMonth ? 'text-gray-400 cursor-default' : ''}
                ${day.isToday ? 'bg-blue-100 font-bold' : ''}
                ${day.isSelected ? 'bg-blue-500 text-white' : ''}
                ${(day.isCurrentMonth && !day.isToday && !day.isSelected) ? 'hover:bg-gray-100' : ''}
                ${(index % 7 === 0) && day.isCurrentMonth && !day.isSelected ? 'text-red-500' : ''}
                ${(index % 7 === 6) && day.isCurrentMonth && !day.isSelected ? 'text-blue-500' : ''}
              `}
            >
              {day.day}
              {day.isCurrentMonth && (
                <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                  <div className={`h-1 w-1 rounded-full ${day.isSelected ? 'bg-white' : 'bg-gray-300'}`}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 