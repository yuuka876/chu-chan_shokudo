import { PrismaClient } from '@prisma/client';

// PrismaClientのグローバルインスタンスがある場合は再利用
// これにより開発中のホットリロードで接続が多数作成されるのを防ぐ
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// グローバルまたは新しいPrismaClientインスタンスを取得
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 開発環境の場合のみ、グローバルにPrismaを保存
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
