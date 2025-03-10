// 食堂メニューの型定義
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  calories: number;
  tags: string[];
  availability: MealType;
  isReserved?: boolean;
  reservedBy?: string;
  provideDate?: Date;
  menuName?: string;
  menuNo?: string;
}

// 食事の種類
export type MealType = 'breakfast' | 'lunch' | 'dinner';

// 予約可能な時間帯
export interface TimeSlot {
  id: string;
  time: string;
  label: string;
  mealType: MealType;
  available: boolean;
}

// メニュー管理フォームのプロパティ
export interface MenuAdminFormProps {
  onSave?: (menu: MenuItem) => void;
  onDelete?: (menuId: string) => void;
  initialMenu?: MenuItem;
}

// APIレスポンスの型定義
export interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  details?: Record<string, unknown>;
  reservation?: Record<string, unknown>;
} 