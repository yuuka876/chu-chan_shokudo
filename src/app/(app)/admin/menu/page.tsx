'use client';

// メニュー管理画面
// メニューの作成、編集、削除、一覧表示を行う

import { useState, useEffect } from 'react';
import MenuAdminForm from '@/components/forms/menu-admin-form';
import { MenuItem } from '@/lib/services/menu-service';
import { toast } from 'sonner';

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // メニュー一覧を取得
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/menus');
        if (!response.ok) {
          throw new Error('メニューの取得に失敗しました');
        }
        const data = await response.json();
        setMenus(data.menus || []);
      } catch (error) {
        console.error('メニュー取得エラー:', error);
        toast.error('メニューの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
  }, []);

  // メニューの保存（新規作成または更新）
  const handleSaveMenu = async (menu: MenuItem) => {
    try {
      const isNewMenu = !menu.id || menu.id === '';
      const method = isNewMenu ? 'POST' : 'PUT';
      const url = isNewMenu ? '/api/menus' : `/api/menus/${menu.id}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(menu),
      });

      if (!response.ok) {
        throw new Error('メニューの保存に失敗しました');
      }

      const savedMenu = await response.json();

      if (isNewMenu) {
        setMenus([...menus, savedMenu.menu]);
        toast.success('メニューを新規作成しました');
      } else {
        setMenus(menus.map(m => m.id === menu.id ? savedMenu.menu : m));
        toast.success('メニューを更新しました');
      }

      // 編集モードをリセット
      setSelectedMenu(null);
      setIsCreating(false);
    } catch (error) {
      console.error('メニュー保存エラー:', error);
      toast.error('メニューの保存に失敗しました');
    }
  };

  // メニューの削除
  const handleDeleteMenu = async (menuId: string) => {
    try {
      const response = await fetch(`/api/menus/${menuId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('メニューの削除に失敗しました');
      }

      setMenus(menus.filter(menu => menu.id !== menuId));
      setSelectedMenu(null);
      toast.success('メニューを削除しました');
    } catch (error) {
      console.error('メニュー削除エラー:', error);
      toast.error('メニューの削除に失敗しました');
    }
  };

  // メニューの編集
  const handleEditMenu = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setIsCreating(false);
  };

  // 新規作成モードに切り替え
  const handleCreateNew = () => {
    setSelectedMenu(null);
    setIsCreating(true);
  };

  // 編集モードをキャンセル
  const handleCancelEdit = () => {
    setSelectedMenu(null);
    setIsCreating(false);
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">メニュー管理</h1>
        {!isCreating && !selectedMenu && (
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            新規メニュー作成
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p>読み込み中...</p>
        </div>
      ) : (
        <>
          {/* 編集フォームまたは新規作成フォーム */}
          {(selectedMenu || isCreating) && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {selectedMenu ? 'メニュー編集' : '新規メニュー作成'}
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <MenuAdminForm
                initialMenu={selectedMenu || undefined}
                onSave={handleSaveMenu}
                onDelete={handleDeleteMenu}
              />
            </div>
          )}

          {/* メニュー一覧 */}
          {!isCreating && !selectedMenu && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">メニュー一覧</h2>
              
              {menus.length === 0 ? (
                <p className="text-center py-4 text-gray-500">
                  メニューがありません。新規メニューを作成してください。
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="py-2 px-4 text-left">ID</th>
                        <th className="py-2 px-4 text-left">名前</th>
                        <th className="py-2 px-4 text-left">提供時間帯</th>
                        <th className="py-2 px-4 text-left">価格</th>
                        <th className="py-2 px-4 text-left">カロリー</th>
                        <th className="py-2 px-4 text-left">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menus.map((menu) => (
                        <tr key={menu.id} className="border-b">
                          <td className="py-2 px-4">{menu.id}</td>
                          <td className="py-2 px-4">{menu.name}</td>
                          <td className="py-2 px-4">{getAvailabilityLabel(menu.availability)}</td>
                          <td className="py-2 px-4">{menu.price}円</td>
                          <td className="py-2 px-4">{menu.calories}kcal</td>
                          <td className="py-2 px-4">
                            <button
                              onClick={() => handleEditMenu(menu)}
                              className="text-blue-500 hover:text-blue-700 mr-2"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDeleteMenu(menu.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              削除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
