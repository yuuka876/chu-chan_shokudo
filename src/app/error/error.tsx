'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーをログに記録するなどの処理
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">エラーが発生しました</h1>
      <p className="mb-6">申し訳ありませんが、問題が発生しました。</p>
      <button
        onClick={() => reset()}
        className="rounded-full border border-solid border-transparent bg-foreground text-background px-4 py-2 hover:bg-[#383838]"
      >
        やり直す
      </button>
    </div>
  );
} 