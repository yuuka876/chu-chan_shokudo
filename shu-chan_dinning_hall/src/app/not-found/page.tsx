export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">404 - ページが見つかりません</h1>
      <p className="mb-6">お探しのページは存在しないか、移動された可能性があります。</p>
      <a
        href="/"
        className="rounded-full border border-solid border-transparent bg-foreground text-background px-4 py-2 hover:bg-[#383838]"
      >
        ホームに戻る
      </a>
    </div>
  );
} 