import CalendarView from '@/components/calendar/calendar-view';

export default function AdminCalendarPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">カレンダー管理</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <CalendarView className="admin-calendar" onDateSelect={(date) => console.log('管理者が選択した日付:', date)} />
      </div>
    </div>
  );
}
