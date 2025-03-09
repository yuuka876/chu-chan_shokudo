import { PrismaClient } from '@prisma/client';

// PrismaClientのシングルトンインスタンスを作成
// 開発環境では頻繁な再読み込みによる複数接続を防ぐ
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 日付とメニュー番号からメニューNo(yyyymmdd0001形式)を生成する関数
export const generateMenuNo = (date: Date, menuNum: number) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const menuId = String(menuNum).padStart(4, '0');
  return `${year}${month}${day}${menuId}`;
};

// 予約を作成する関数
export const createReservation = async (
  userId: string,
  menuNo: string,
  reservationTime: string
) => {
  try {
    console.log('Prismaを使用して予約を作成します:', { userId, menuNo, reservationTime });
    
    // ユーザーの存在チェック
    const user = await prisma.uSER_TBL.findUnique({
      where: { userId }
    });
    
    if (!user) {
      console.error('ユーザーが存在しません:', userId);
      // ユーザーが存在しない場合、自動作成する（本番環境では適切な認証と組み合わせること）
      await prisma.uSER_TBL.create({
        data: {
          userId,
          userName: 'ゲストユーザー', // 仮のユーザー名
          isAdmin: false,
        }
      });
      console.log('新しいユーザーを作成しました:', userId);
    }
    
    // 予約を作成
    const reservation = await prisma.rESERVATION_TBL.create({
      data: {
        userId,
        menuNo,
        reservationTime,
      },
    });
    
    console.log('予約作成成功:', reservation);
    return { success: true, reservation };
  } catch (error) {
    console.error('予約作成エラー詳細:', error);
    
    // エラーオブジェクトを安全に変換
    let errorDetails;
    if (error instanceof Error) {
      errorDetails = {
        message: error.message,
        name: error.name,
        stack: error.stack
      };
    } else {
      errorDetails = String(error);
    }
    
    return { success: false, error: errorDetails };
  }
};

// ユーザーIDによる予約リストの取得
export const getReservationsByUserId = async (userId: string) => {
  try {
    const reservations = await prisma.rESERVATION_TBL.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { success: true, reservations };
  } catch (error) {
    console.error('予約取得エラー:', error);
    return { success: false, error };
  }
};

// メニュー番号による予約リストの取得
export const getReservationsByMenuNo = async (menuNo: string) => {
  try {
    const reservations = await prisma.rESERVATION_TBL.findMany({
      where: {
        menuNo,
      },
      include: {
        user: true,
      },
    });
    return { success: true, reservations };
  } catch (error) {
    console.error('予約取得エラー:', error);
    return { success: false, error };
  }
};

// 予約の削除
export const deleteReservation = async (id: string) => {
  try {
    await prisma.rESERVATION_TBL.delete({
      where: {
        id,
      },
    });
    return { success: true };
  } catch (error) {
    console.error('予約削除エラー:', error);
    return { success: false, error };
  }
}; 