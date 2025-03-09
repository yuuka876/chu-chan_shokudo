export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4">統計</h2>
          <p className="text-3xl font-bold">128</p>
          <p className="text-sm text-gray-500">総訪問者数</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4">アクティビティ</h2>
          <p className="text-3xl font-bold">24</p>
          <p className="text-sm text-gray-500">今日のアクション</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="font-semibold mb-4">タスク</h2>
          <p className="text-3xl font-bold">8</p>
          <p className="text-sm text-gray-500">完了待ち</p>
        </div>
      </div>
    </div>
  );
}
