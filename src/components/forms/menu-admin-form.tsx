'use client';

import { useState, useEffect } from 'react';
import { MenuItem, MenuAdminFormProps } from '@/types/menu';
import { formatDateJP } from '@/lib/utils';

export default function MenuAdminForm({ onSave, onDelete, initialMenu }: MenuAdminFormProps) {
  const [menu, setMenu] = useState<MenuItem>({
    id: initialMenu?.id || '',
    name: initialMenu?.name || '',
    description: initialMenu?.description || '',
    price: initialMenu?.price || 0,
    calories: initialMenu?.calories || 0,
    tags: initialMenu?.tags || [],
    availability: initialMenu?.availability || 'lunch',
    image: initialMenu?.image || '',
    provideDate: initialMenu?.provideDate ? new Date(initialMenu.provideDate) : new Date(),
  });

  const [tagInput, setTagInput] = useState('');
  const [isEditing, setIsEditing] = useState(!!initialMenu);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSimpleMode, setIsSimpleMode] = useState(true); // 簡易モード（家庭用）

  // 入力フィールドの変更を処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'calories') {
      setMenu({ ...menu, [name]: parseInt(value) || 0 });
    } else {
      setMenu({ ...menu, [name]: value });
    }
  };

  // 日付の変更を処理
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      setMenu({ ...menu, provideDate: new Date(dateValue) });
    }
  };

  // タグの追加
  const handleAddTag = () => {
    if (tagInput.trim() && !menu.tags.includes(tagInput.trim())) {
      setMenu({
        ...menu,
        tags: [...menu.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  // タグの削除
  const handleRemoveTag = (tagToRemove: string) => {
    setMenu({
      ...menu,
      tags: menu.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // フォームの検証
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!menu.name.trim()) {
      newErrors.name = 'メニュー名は必須です';
    }
    
    if (!isSimpleMode && !menu.description.trim()) {
      newErrors.description = '説明は必須です';
    }
    
    if (!isSimpleMode && menu.price < 0) {
      newErrors.price = '価格は0以上の値を入力してください';
    }
    
    if (!isSimpleMode && menu.calories < 0) {
      newErrors.calories = 'カロリーは0以上の値を入力してください';
    }
    
    if (!menu.provideDate) {
      newErrors.provideDate = '提供日は必須です';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // フォームの送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // 簡易モードの場合は、説明を自動生成
    if (isSimpleMode) {
      menu.description = `${formatDateJP(menu.provideDate)}の${getAvailabilityLabel(menu.availability)}メニュー`;
    }
    
    // IDがない場合は新規作成として扱い、IDを生成
    const submittedMenu = {
      ...menu,
      id: menu.id || `menu_${Date.now()}`
    };
    
    if (onSave) {
      onSave(submittedMenu);
    }
    
    // 新規作成の場合はフォームをリセット
    if (!isEditing) {
      setMenu({
        id: '',
        name: '',
        description: '',
        price: 0,
        calories: 0,
        tags: [],
        availability: 'lunch',
        image: '',
        provideDate: new Date(),
      });
    }
  };

  // メニューの削除
  const handleDelete = () => {
    if (window.confirm('このメニューを削除してもよろしいですか？')) {
      if (onDelete && menu.id) {
        onDelete(menu.id);
      }
    }
  };

  // 提供時間帯の日本語表示
  const getAvailabilityLabel = (availability: string): string => {
    switch (availability) {
      case 'breakfast': return '朝食';
      case 'lunch': return '昼食';
      case 'dinner': return '夕食';
      default: return availability;
    }
  };

  // 日付をYYYY-MM-DD形式に変換
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="simpleMode"
            checked={isSimpleMode}
            onChange={() => setIsSimpleMode(!isSimpleMode)}
            className="mr-2"
          />
          <label htmlFor="simpleMode" className="text-sm font-medium text-gray-700">
            簡易モード（家庭用）
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          メニュー名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={menu.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="provideDate" className="block text-sm font-medium text-gray-700 mb-1">
            提供日 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="provideDate"
            name="provideDate"
            value={formatDateForInput(menu.provideDate)}
            onChange={handleDateChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.provideDate ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.provideDate && <p className="mt-1 text-sm text-red-500">{errors.provideDate}</p>}
        </div>

        <div>
          <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
            提供時間帯 <span className="text-red-500">*</span>
          </label>
          <select
            id="availability"
            name="availability"
            value={menu.availability}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="breakfast">朝食</option>
            <option value="lunch">昼食</option>
            <option value="dinner">夕食</option>
          </select>
        </div>
      </div>

      {!isSimpleMode && (
        <>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={menu.description}
              onChange={handleChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                価格 (円)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={menu.price}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
                カロリー (kcal)
              </label>
              <input
                type="number"
                id="calories"
                name="calories"
                value={menu.calories}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md ${errors.calories ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.calories && <p className="mt-1 text-sm text-red-500">{errors.calories}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              画像URL
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={menu.image || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タグ
            </label>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                placeholder="タグを入力"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
              >
                追加
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {menu.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end space-x-3">
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            削除
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {isEditing ? '更新' : '作成'}
        </button>
      </div>
    </form>
  );
} 