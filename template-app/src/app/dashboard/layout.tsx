export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4">
        <nav className="space-y-2">
          <a href="/dashboard" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            ダッシュボード
          </a>
          <a href="/dashboard/settings" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            設定
          </a>
          <a href="/dashboard/profile" className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
            プロフィール
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
} 