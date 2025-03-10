import { PrismaClient } from '@prisma/client';

// PrismaClientのグローバルインスタンスがある場合は再利用
// これにより開発中のホットリロードで接続が多数作成されるのを防ぐ
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// データベース接続エラー回復のための再試行設定
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

// データベース接続を試行する関数
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  // 接続テスト用のミドルウェアを追加
  client.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (error) {
      console.error(`Prismaエラー [${params.model}.${params.action}]:`, error);
      throw error;
    }
  });

  return client;
};

// グローバルまたは新しいPrismaClientインスタンスを取得
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// 開発環境の場合のみ、グローバルにPrismaを保存
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 接続テスト用の関数
export const testDatabaseConnection = async () => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      // 単純なクエリで接続をテスト
      await prisma.$queryRaw`SELECT 1 as connection_test`;
      console.log('データベース接続テスト: 成功');
      return true;
    } catch (error) {
      retries++;
      console.error(`データベース接続テスト: 失敗 (${retries}/${MAX_RETRIES})`, error);
      
      if (retries >= MAX_RETRIES) {
        console.error('データベース接続: 最大再試行回数に達しました');
        return false;
      }
      
      // 次の試行前に少し待機
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
  
  return false;
};

export default prisma;
