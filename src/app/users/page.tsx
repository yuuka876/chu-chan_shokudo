'use client';

import { useState, useEffect } from 'react';
import { User, userService } from '@/lib/services/user-service';
import Link from 'next/link';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const data = await userService.getAllUsers();
        setUsers(data);
        setError(null);
      } catch (err) {
        setError('ユーザーデータの読み込み中にエラーが発生しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">ユーザー一覧</h1>

      {loading ? (
        <p>読み込み中...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">ユーザーID</th>
                  <th className="py-2 px-4 text-left">ユーザー名</th>
                  <th className="py-2 px-4 text-left">管理者</th>
                  <th className="py-2 px-4 text-left">LINEユーザー名</th>
                  <th className="py-2 px-4 text-left">作成日</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-center">
                      ユーザーがいません
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.userId} className="border-t">
                      <td className="py-2 px-4 truncate max-w-[150px]">{user.userId}</td>
                      <td className="py-2 px-4">{user.userName}</td>
                      <td className="py-2 px-4">
                        {user.isAdmin ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            管理者
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            一般
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4">{user.lineUserName || '-'}</td>
                      <td className="py-2 px-4">
                        {user.createdAt instanceof Date
                          ? user.createdAt.toLocaleDateString('ja-JP')
                          : new Date(user.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 