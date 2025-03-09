export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"></div>
      <span className="sr-only">読み込み中...</span>
    </div>
  );
} 