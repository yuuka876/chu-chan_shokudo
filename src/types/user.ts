// ユーザー情報の型定義
export interface User {
  userId: string;
  userName: string;
  isAdmin: boolean;
  lineUserName: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ユーザープロフィールの型定義
export interface UserProfile {
  allergies?: string;
  preferences?: string;
  dislikes?: string;
  notes?: string;
} 