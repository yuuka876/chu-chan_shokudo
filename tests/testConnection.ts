const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('データベース接続テストを開始します...');
    
    // 1. 基本的な接続テスト
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('1. 基本接続テスト成功:', result);

    // 2. ユーザーテーブルのデータ取得
    const users = await prisma.uSER_TBL.findMany({
      take: 3,
    });
    console.log('2. ユーザーデータ取得成功:', users.length, '件のデータを取得');
    users.forEach(user => {
      console.log(`   - ${user.userName} (ID: ${user.userId}, 管理者: ${user.isAdmin ? 'はい' : 'いいえ'})`);
    });

    // 3. メニューテーブルのデータ取得
    const menus = await prisma.mENU_TBL.findMany({
      take: 3,
    });
    console.log('3. メニューデータ取得成功:', menus.length, '件のデータを取得');
    menus.forEach(menu => {
      console.log(`   - ${menu.menuName} (No: ${menu.menuNo}, 提供日: ${menu.provideDate.toLocaleDateString()})`);
    });

    // 4. 予約テーブルのデータ取得（ユーザー情報とメニュー情報を含む）
    const reservations = await prisma.rESERVATION_TBL.findMany({
      include: {
        user: true,
        menu: true,
      },
      take: 3,
    });
    console.log('4. 予約データ取得成功:', reservations.length, '件のデータを取得');
    reservations.forEach(reservation => {
      console.log(`   - 予約ID: ${reservation.id}`);
      console.log(`     ユーザー: ${reservation.user.userName}`);
      console.log(`     メニュー: ${reservation.menu.menuName}`);
      console.log(`     予約時間: ${reservation.reservationTime}`);
    });

    // 5. トランザクションテスト
    console.log('5. トランザクションテスト開始...');
    const testResult = await prisma.$transaction(async (tx) => {
      // テスト用のユーザーを作成
      const testUser = await tx.uSER_TBL.create({
        data: {
          userId: `test-user-${Date.now()}`,
          userName: 'テストユーザー',
          isAdmin: false,
        },
      });
      console.log(`   - テストユーザー作成: ${testUser.userName} (ID: ${testUser.userId})`);
      
      // 作成したユーザーを削除
      await tx.uSER_TBL.delete({
        where: {
          userId: testUser.userId,
        },
      });
      console.log('   - テストユーザー削除完了');
      
      return 'トランザクションテスト成功';
    });
    console.log(`   - ${testResult}`);

    console.log('すべてのテストが正常に完了しました！');

  } catch (error) {
    console.error('データベース接続エラー:', error);
  } finally {
    await prisma.$disconnect();
    console.log('データベース接続を終了しました。');
  }
}

main(); 