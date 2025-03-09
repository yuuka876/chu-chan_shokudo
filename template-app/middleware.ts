// このファイルは非推奨です。src/middleware.tsを使用してください。
// Clerk認証は、Next.jsの標準構成に従って、src/middleware.tsに移動しました。
// このファイルは将来削除される予定です。

import { NextResponse } from 'next/server';

export default function middleware() {
  console.warn('非推奨のmiddleware.tsが呼び出されました。src/middleware.tsを使用してください。');
  return NextResponse.next();
}

export const config = {
  matcher: [],
}; 