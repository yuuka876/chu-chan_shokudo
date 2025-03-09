import { PrismaClient } from '@prisma/client';

// Prismaクライアントのインスタンス（シングルトン）
const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export interface User {
  userId: string;
  userName: string;
  isAdmin: boolean;
  lineUserName: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export const userService = {
  // ユーザー一覧を取得
  async getAllUsers(): Promise<User[]> {
    console.log('Fetching all users from API...');
    
    try {
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const users = await response.json();
      console.log('Users fetched successfully:', users);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  // 特定のユーザーを取得
  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      return null;
    }
  },

  // ユーザーを作成
  async createUser(user: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  // ユーザーを更新
  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating user with ID ${userId}:`, error);
      return null;
    }
  },

  // ユーザーを削除
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      
      return response.ok;
    } catch (error) {
      console.error(`Error deleting user with ID ${userId}:`, error);
      return false;
    }
  }
}; 