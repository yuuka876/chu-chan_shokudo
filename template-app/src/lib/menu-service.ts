// 食堂メニューの型定義
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  calories: number;
  tags: string[];
  availability: 'breakfast' | 'lunch' | 'dinner';
}

// 予約可能な時間帯
export interface TimeSlot {
  id: string;
  time: string;
  label: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  available: boolean;
}

// サンプルメニューデータ
const menuItems: MenuItem[] = [
  {
    id: 'b1',
    name: '和風朝食セット',
    description: '焼き魚、ご飯、味噌汁、小鉢が付いた朝食セット',
    price: 550,
    image: '/images/japanese-breakfast.jpg',
    calories: 450,
    tags: ['和食', '朝食', '定番'],
    availability: 'breakfast'
  },
  {
    id: 'b2',
    name: 'ヨーグルトボウル',
    description: 'グラノーラとフルーツを添えたヨーグルト',
    price: 480,
    image: '/images/yogurt-bowl.jpg',
    calories: 320,
    tags: ['洋食', '朝食', 'ヘルシー'],
    availability: 'breakfast'
  },
  {
    id: 'l1',
    name: '日替わりランチ',
    description: '本日のメインディッシュにサラダ、スープ、ご飯が付いたセット',
    price: 780,
    image: '/images/daily-lunch.jpg',
    calories: 650,
    tags: ['ランチ', '日替わり'],
    availability: 'lunch'
  },
  {
    id: 'l2',
    name: 'ビーフカレー',
    description: '特製スパイスで仕上げた牛肉カレー',
    price: 850,
    image: '/images/beef-curry.jpg',
    calories: 720,
    tags: ['カレー', 'ランチ', '人気'],
    availability: 'lunch'
  },
  {
    id: 'l3',
    name: 'チキンサラダボウル',
    description: '新鮮野菜とグリルチキンのサラダボウル',
    price: 720,
    image: '/images/chicken-salad.jpg',
    calories: 420,
    tags: ['サラダ', 'ランチ', 'ヘルシー'],
    availability: 'lunch'
  },
  {
    id: 'd1',
    name: 'ハンバーグステーキ',
    description: 'デミグラスソースのハンバーグステーキ、付け合わせ野菜付き',
    price: 980,
    image: '/images/hamburg.jpg',
    calories: 780,
    tags: ['洋食', 'ディナー', '人気'],
    availability: 'dinner'
  },
  {
    id: 'd2',
    name: '魚介パスタ',
    description: '新鮮な魚介を使ったトマトソースのパスタ',
    price: 950,
    image: '/images/seafood-pasta.jpg',
    calories: 650,
    tags: ['パスタ', 'ディナー', '魚介'],
    availability: 'dinner'
  }
];

// 予約可能な時間帯データ
const timeSlots: TimeSlot[] = [
  { id: 'ts1', time: '07:30', label: '朝食 7:30', mealType: 'breakfast', available: true },
  { id: 'ts2', time: '08:00', label: '朝食 8:00', mealType: 'breakfast', available: true },
  { id: 'ts3', time: '08:30', label: '朝食 8:30', mealType: 'breakfast', available: true },
  { id: 'ts4', time: '12:00', label: 'ランチ 12:00', mealType: 'lunch', available: true },
  { id: 'ts5', time: '12:30', label: 'ランチ 12:30', mealType: 'lunch', available: true },
  { id: 'ts6', time: '13:00', label: 'ランチ 13:00', mealType: 'lunch', available: true },
  { id: 'ts7', time: '13:30', label: 'ランチ 13:30', mealType: 'lunch', available: true },
  { id: 'ts8', time: '18:00', label: 'ディナー 18:00', mealType: 'dinner', available: true },
  { id: 'ts9', time: '18:30', label: 'ディナー 18:30', mealType: 'dinner', available: true },
  { id: 'ts10', time: '19:00', label: 'ディナー 19:00', mealType: 'dinner', available: true },
  { id: 'ts11', time: '19:30', label: 'ディナー 19:30', mealType: 'dinner', available: true }
];

// 日付をYYYY-MM-DD形式にフォーマット
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 食堂メニューサービス
export const menuService = {
  // 特定の日付とカテゴリーに対するメニューを取得
  getMenuItems: (date: Date, mealType?: 'breakfast' | 'lunch' | 'dinner'): MenuItem[] => {
    // 本来はAPIからデータを取得し、日付によって異なるメニューを返す
    // ここではサンプルデータを返す
    if (mealType) {
      return menuItems.filter(item => item.availability === mealType);
    }
    return menuItems;
  },

  // 特定の日付で予約可能な時間帯を取得
  getAvailableTimeSlots: (date: Date): TimeSlot[] => {
    const dateString = formatDate(date);
    const today = formatDate(new Date());
    
    // 当日以前の日付は予約不可
    if (dateString < today) {
      return timeSlots.map(slot => ({ ...slot, available: false }));
    }
    
    // 週末は朝食なし
    const day = date.getDay();
    if (day === 0 || day === 6) {
      return timeSlots.map(slot => ({
        ...slot,
        available: slot.mealType !== 'breakfast'
      }));
    }
    
    // その他のランダム要素（本来はデータベースから取得）
    return timeSlots.map(slot => ({
      ...slot,
      available: Math.random() > 0.3 // 70%の確率で予約可能
    }));
  }
}; 