export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4">
        <nav className="space-y-2">
          <a href="/" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            ダッシュボード
          </a>
          <a href="/menu" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            メニュー
          </a>
          <a href="/calendar" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            予約カレンダー
          </a>
          <a href="/admin/menu" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            メニュー管理
          </a>
          <a href="/admin/calendar" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            カレンダー管理
          </a>
          <a href="/admin/reservations" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            予約管理
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
