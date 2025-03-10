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
  isReserved?: boolean;
  reservedBy?: string;
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

import { PrismaClient } from '@prisma/client';
import { formatDateJP } from '@/lib/utils';
import { MenuItem, TimeSlot, MealType } from '@/types/menu';

// PrismaClientのシングルトンインスタンスを作成
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 食堂メニューサービス
export const menuService = {
  // 特定の日付とカテゴリーに対するメニューを取得
  getMenuItems: async (date: Date, mealType?: 'breakfast' | 'lunch' | 'dinner'): Promise<MenuItem[]> => {
    try {
      // データベースからメニューを取得
      const dateString = formatDate(date);
      
      // データベースからメニューを検索
      const dbMenus = await prisma.mENU_TBL.findMany({
        where: {
          provideDate: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999))
          }
        }
      });
      
      // データベースにメニューがある場合はそれを返す
      if (dbMenus.length > 0) {
        // メニューをMenuItem形式に変換
        const menus = dbMenus.map(menu => ({
          id: menu.menuNo,
          name: menu.menuName,
          description: `${formatDateJP(menu.provideDate)}のメニュー`,
          price: 0, // データベースに価格がない場合は0
          calories: 0, // データベースにカロリーがない場合は0
          tags: [],
          availability: getMealTypeFromTime(menu.provideDate) as 'breakfast' | 'lunch' | 'dinner',
          isReserved: menu.isReserved
        }));
        
        // 予約済みメニューがあるかチェック
        const reservedMenus = menus.filter(menu => menu.isReserved);
        
        // 予約済みメニューがある場合は、それだけを返す（メニュー固定機能）
        if (reservedMenus.length > 0) {
          // 指定された食事タイプでフィルタリング
          if (mealType) {
            return reservedMenus.filter(menu => menu.availability === mealType);
          }
          return reservedMenus;
        }
        
        // 予約済みメニューがない場合は、すべてのメニューを返す
        // 指定された食事タイプでフィルタリング
        if (mealType) {
          return menus.filter(menu => menu.availability === mealType);
        }
        
        return menus;
      }
      
      // データベースにメニューがない場合はサンプルデータを返す
      if (mealType) {
        return menuItems.filter(item => item.availability === mealType);
      }
      return menuItems;
    } catch (error) {
      console.error('メニュー取得エラー:', error);
      return [];
    }
  },

  // 特定の日付で予約可能な時間帯を取得
  getAvailableTimeSlots: async (date: Date): Promise<TimeSlot[]> => {
    try {
      const dateString = formatDate(date);
      const today = formatDate(new Date());
      
      // 当日以前の日付は予約不可
      if (dateString < today) {
        return timeSlots.map(slot => ({ ...slot, available: false }));
      }
      
      // 営業カレンダーを確認
      const businessDay = await prisma.bUSENESS_CARENDER_TBL.findUnique({
        where: {
          date: new Date(dateString)
        }
      });
      
      // 営業日でない場合は全て予約不可
      if (businessDay && businessDay.isHoliday) {
        return timeSlots.map(slot => ({ ...slot, available: false }));
      }
      
      // 営業時間を確認
      if (businessDay) {
        const startTime = businessDay.startTime;
        const endTime = businessDay.endTime;
        
        // 営業時間内の時間帯のみ予約可能
        return timeSlots.map(slot => ({
          ...slot,
          available: slot.time >= startTime && slot.time <= endTime
        }));
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
    } catch (error) {
      console.error('時間帯取得エラー:', error);
      return timeSlots;
    }
  },

  // 特定の日付の予約済みメニューを取得
  getReservedMenusForDate: async (date: Date): Promise<MenuItem[]> => {
    try {
      const dateString = formatDate(date);
      
      // 指定された日付の予約済みメニューを取得
      const reservedMenus = await prisma.mENU_TBL.findMany({
        where: {
          provideDate: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999))
          },
          isReserved: true
        },
        include: {
          reservations: {
            include: {
              user: true
            }
          }
        }
      });
      
      // メニューをMenuItem形式に変換
      return reservedMenus.map(menu => ({
        id: menu.menuNo,
        name: menu.menuName,
        description: `${formatDateJP(menu.provideDate)}のメニュー`,
        price: 0,
        calories: 0,
        tags: [],
        availability: getMealTypeFromTime(menu.provideDate) as 'breakfast' | 'lunch' | 'dinner',
        isReserved: true,
        reservedBy: menu.reservations.length > 0 ? menu.reservations[0].user.userName : '不明'
      }));
    } catch (error) {
      console.error('予約済みメニュー取得エラー:', error);
      return [];
    }
  },

  // 全てのメニューを取得
  getAllMenus: async (): Promise<MenuItem[]> => {
    try {
      // データベースから全てのメニューを取得
      const dbMenus = await prisma.mENU_TBL.findMany();
      
      // データベースにメニューがある場合はそれを返す
      if (dbMenus.length > 0) {
        // メニューをMenuItem形式に変換
        return dbMenus.map(menu => ({
          id: menu.menuNo,
          name: menu.menuName,
          description: `${formatDateJP(menu.provideDate)}のメニュー`,
          price: 0,
          calories: 0,
          tags: [],
          availability: getMealTypeFromTime(menu.provideDate) as 'breakfast' | 'lunch' | 'dinner',
          isReserved: menu.isReserved
        }));
      }
      
      // データベースにメニューがない場合はサンプルデータを返す
      return menuItems;
    } catch (error) {
      console.error('メニュー取得エラー:', error);
      return [];
    }
  },

  // メニューをIDで取得
  getMenuById: async (id: string): Promise<MenuItem | null> => {
    try {
      // データベースからIDでメニューを取得
      const menu = await prisma.mENU_TBL.findUnique({
        where: {
          menuNo: id
        }
      });
      
      // メニューが見つかった場合
      if (menu) {
        return {
          id: menu.menuNo,
          name: menu.menuName,
          description: `${formatDateJP(menu.provideDate)}のメニュー`,
          price: 0,
          calories: 0,
          tags: [],
          availability: getMealTypeFromTime(menu.provideDate) as 'breakfast' | 'lunch' | 'dinner',
          isReserved: menu.isReserved
        };
      }
      
      // データベースにメニューがない場合はサンプルデータから検索
      const sampleMenu = menuItems.find(item => item.id === id);
      return sampleMenu || null;
    } catch (error) {
      console.error('メニュー取得エラー:', error);
      return null;
    }
  },

  // メニューを作成
  createMenu: async (menu: { menuName: string, provideDate: Date }): Promise<MenuItem> => {
    try {
      // メニュー番号を生成
      const menuNo = `menu_${Date.now()}`;
      
      // データベースにメニューを作成
      const newMenu = await prisma.mENU_TBL.create({
        data: {
          menuNo,
          menuName: menu.menuName,
          provideDate: menu.provideDate,
          isReserved: false
        }
      });
      
      return newMenu;
    } catch (error) {
      console.error('メニュー作成エラー:', error);
      throw error;
    }
  },

  // メニューを更新
  updateMenu: async (id: string, menu: { menuName?: string, provideDate?: Date, isReserved?: boolean }): Promise<MenuItem> => {
    try {
      // データベースのメニューを更新
      const updatedMenu = await prisma.mENU_TBL.update({
        where: {
          menuNo: id
        },
        data: menu
      });
      
      return updatedMenu;
    } catch (error) {
      console.error('メニュー更新エラー:', error);
      return null;
    }
  },

  // メニューを削除
  deleteMenu: async (id: string): Promise<boolean> => {
    try {
      // データベースからメニューを削除
      await prisma.mENU_TBL.delete({
        where: {
          menuNo: id
        }
      });
      
      return true;
    } catch (error) {
      console.error('メニュー削除エラー:', error);
      return false;
    }
  },

  // 予約を作成
  createReservation: async (menuId: string, userId: string, reservationTime: string): Promise<Record<string, unknown>> => {
    try {
      // メニューを取得
      const menu = await prisma.mENU_TBL.findUnique({
        where: {
          menuNo: menuId
        }
      });
      
      if (!menu) {
        throw new Error('メニューが見つかりません');
      }
      
      // 同じ日に既に予約されているメニューがあるか確認
      const date = menu.provideDate;
      const existingReservations = await prisma.rESERVATION_TBL.findMany({
        where: {
          menu: {
            provideDate: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999))
            }
          }
        },
        include: {
          menu: true
        }
      });
      
      // 同じ日に既に予約されているメニューがある場合
      if (existingReservations.length > 0) {
        // 既に予約されているメニューと異なるメニューを予約しようとしている場合
        const existingMenuId = existingReservations[0].menuNo;
        if (existingMenuId !== menuId) {
          throw new Error('同じ日に既に予約されているメニューがあります。同じメニューのみ予約可能です。');
        }
      }
      
      // トランザクションを使用して予約を作成し、メニューを予約済みに更新
      const reservation = await prisma.$transaction(async (prisma) => {
        // 予約を作成
        const newReservation = await prisma.rESERVATION_TBL.create({
          data: {
            menuNo: menuId,
            userId,
            reservationTime
          }
        });
        
        // メニューを予約済みに更新
        await prisma.mENU_TBL.update({
          where: {
            menuNo: menuId
          },
          data: {
            isReserved: true
          }
        });
        
        return newReservation;
      });
      
      return reservation;
    } catch (error) {
      console.error('予約作成エラー:', error);
      throw error;
    }
  },

  // 予約をキャンセル
  cancelReservation: async (reservationId: string): Promise<boolean> => {
    try {
      // 予約を取得
      const reservation = await prisma.rESERVATION_TBL.findUnique({
        where: {
          id: reservationId
        },
        include: {
          menu: true
        }
      });
      
      if (!reservation) {
        throw new Error('予約が見つかりません');
      }
      
      // 同じメニューの他の予約を確認
      const otherReservations = await prisma.rESERVATION_TBL.findMany({
        where: {
          menuNo: reservation.menuNo,
          id: {
            not: reservationId
          }
        }
      });
      
      // トランザクションを使用して予約を削除
      await prisma.$transaction(async (prisma) => {
        // 予約を削除
        await prisma.rESERVATION_TBL.delete({
          where: {
            id: reservationId
          }
        });
        
        // 他に予約がない場合はメニューを予約可能に戻す
        if (otherReservations.length === 0) {
          await prisma.mENU_TBL.update({
            where: {
              menuNo: reservation.menuNo
            },
            data: {
              isReserved: false
            }
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error('予約キャンセルエラー:', error);
      return false;
    }
  },

  // ユーザーの予約を取得
  getUserReservations: async (userId: string): Promise<Record<string, unknown>[]> => {
    try {
      // ユーザーの予約を取得
      const reservations = await prisma.rESERVATION_TBL.findMany({
        where: {
          userId
        },
        include: {
          menu: true,
          user: true
        },
        orderBy: {
          menu: {
            provideDate: 'asc'
          }
        }
      });
      
      return reservations;
    } catch (error) {
      console.error('予約取得エラー:', error);
      return [];
    }
  }
};

// 時間から食事タイプを取得するヘルパー関数
function getMealTypeFromTime(date: Date): string {
  const hour = date.getHours();
  
  if (hour < 10) {
    return 'breakfast';
  } else if (hour < 15) {
    return 'lunch';
  } else {
    return 'dinner';
  }
} 