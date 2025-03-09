export default function DynamicPage({
  params,
}: {
  params: { dynamic: string };
}) {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">動的ページ: {params.dynamic}</h1>
      <p className="mb-4">
        このページは動的ルートを使用しています。URLパラメータは <code>{params.dynamic}</code> です。
      </p>
      <div className="mt-8">
        <a
          href="/"
          className="rounded-full border border-solid border-transparent bg-foreground text-background px-4 py-2 hover:bg-[#383838]"
        >
          ホームに戻る
        </a>
      </div>
    </div>
  );
} 