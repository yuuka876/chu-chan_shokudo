import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ユーザーデータのシード
  const users = [
    {
      userId: 'user-takano',
      userName: 'たかの',
      isAdmin: false,
      lineUserName: 'takano_line',
    },
    {
      userId: 'user-hasunuma',
      userName: 'はすぬま',
      isAdmin: false,
      lineUserName: 'hasunuma_line',
    },
    {
      userId: 'user-mama',
      userName: '柊人ママ',
      isAdmin: true,
      lineUserName: 'mama_line',
    },
  ];

  // メニューデータのシード
  const menus = [
    {
      menuNo: '20240315001',
      menuName: 'ぶり大根',
      provideDate: new Date('2024-03-15'),
      isReserved: true,
    },
    {
      menuNo: '20240316001',
      menuName: '海鮮丼',
      provideDate: new Date('2024-03-16'),
      isReserved: false,
    },
    {
      menuNo: '20240317001',
      menuName: 'ハンバーグ',
      provideDate: new Date('2024-03-17'),
      isReserved: false,
    },
  ];

  // 営業カレンダーデータのシード
  const businessCalendar = [
    {
      date: new Date('2024-03-15'),
      startTime: '18:00',
      endTime: '20:00',
      isHoliday: false,
    },
    {
      date: new Date('2024-03-16'),
      startTime: '17:30',
      endTime: '19:30',
      isHoliday: false,
    },
    {
      date: new Date('2024-03-17'),
      startTime: '00:00',
      endTime: '00:00',
      isHoliday: true,
    },
  ];

  // 予約データのシード
  const reservations = [
    {
      menuNo: '20240315001',
      userId: 'user-takano',
      reservationTime: '19:00',
    },
  ];

  // データをクリアする
  await prisma.rESERVATION_TBL.deleteMany({});
  await prisma.mENU_TBL.deleteMany({});
  await prisma.bUSENESS_CARENDER_TBL.deleteMany({});
  await prisma.uSER_TBL.deleteMany({});

  // データを挿入する
  for (const user of users) {
    await prisma.uSER_TBL.create({
      data: user,
    });
  }

  for (const menu of menus) {
    await prisma.mENU_TBL.create({
      data: menu,
    });
  }

  for (const calendar of businessCalendar) {
    await prisma.bUSENESS_CARENDER_TBL.create({
      data: calendar,
    });
  }

  for (const reservation of reservations) {
    await prisma.rESERVATION_TBL.create({
      data: reservation,
    });
  }

  console.log('シードデータが追加されました');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 
  }); 