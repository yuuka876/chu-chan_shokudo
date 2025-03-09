import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 既存のデータを削除（オプション）
  await prisma.uSER_TBL.deleteMany({});

  console.log('既存のデータを削除しました');

  // サンプルユーザーデータを作成
  const users = [
    {
      userName: '山田太郎',
      isAdmin: true,
      lineUserName: 'taro_yamada'
    },
    {
      userName: '佐藤花子',
      isAdmin: false,
      lineUserName: 'hanako_sato'
    },
    {
      userName: '鈴木一郎',
      isAdmin: false,
      lineUserName: null
    }
  ];

  for (const user of users) {
    const createdUser = await prisma.uSER_TBL.create({
      data: user
    });
    console.log(`ユーザーを作成しました: ${createdUser.userName}`);
  }

  // 全ユーザーデータを表示
  const allUsers = await prisma.uSER_TBL.findMany();
  console.log('全ユーザーデータ:');
  console.log(JSON.stringify(allUsers, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 