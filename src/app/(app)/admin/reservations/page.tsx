import { useState } from 'react';

export default function AdminReservationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">予約管理</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">予約検索</h2>
        <div className="flex gap-4 mb-4">
          <input 
            type="date" 
            className="px-3 py-2 border rounded" 
            placeholder="日付で検索" 
          />
          <input 
            type="text" 
            className="flex-1 px-3 py-2 border rounded" 
            placeholder="名前やメールで検索" 
          />
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            検索
          </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">予約一覧</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="py-2 px-4 text-left">予約ID</th>
                <th className="py-2 px-4 text-left">日付</th>
                <th className="py-2 px-4 text-left">時間</th>
                <th className="py-2 px-4 text-left">名前</th>
                <th className="py-2 px-4 text-left">人数</th>
                <th className="py-2 px-4 text-left">ステータス</th>
                <th className="py-2 px-4 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {/* サンプルデータ */}
              <tr className="border-b">
                <td className="py-2 px-4">R001</td>
                <td className="py-2 px-4">2023/09/15</td>
                <td className="py-2 px-4">12:00-13:00</td>
                <td className="py-2 px-4">山田太郎</td>
                <td className="py-2 px-4">4</td>
                <td className="py-2 px-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">確定</span>
                </td>
                <td className="py-2 px-4">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">詳細</button>
                  <button className="text-red-500 hover:text-red-700">キャンセル</button>
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-4">R002</td>
                <td className="py-2 px-4">2023/09/16</td>
                <td className="py-2 px-4">18:00-19:30</td>
                <td className="py-2 px-4">佐藤花子</td>
                <td className="py-2 px-4">2</td>
                <td className="py-2 px-4">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">保留</span>
                </td>
                <td className="py-2 px-4">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">詳細</button>
                  <button className="text-red-500 hover:text-red-700">キャンセル</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
