export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">会社概要</h1>
      <p className="mb-4">
        このページはルートグループ内にあります。ルートグループ（括弧で囲まれたディレクトリ）は
        URLパスには影響せず、ルートを論理的にグループ化するために使用されます。
      </p>
      <p className="mb-6">
        このページのURLは <code>/about</code> であり、<code>/(group)/about</code> ではありません。
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