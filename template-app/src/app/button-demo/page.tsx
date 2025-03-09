'use client';

import AnimatedButton from '@/components/AnimatedButton';
import PulseButton from '@/components/PulseButton';

export default function ButtonDemo() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold mb-6">ボタンアニメーションデモ</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-medium mb-2">基本的な拡大/縮小ボタン</h2>
          <AnimatedButton>
            ホバーして拡大
          </AnimatedButton>
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-2">カスタムスタイル</h2>
          <AnimatedButton 
            className="bg-green-500 hover:bg-green-600"
            onClick={() => alert('クリックされました！')}
          >
            クリックしてみてください
          </AnimatedButton>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-2">パルスアニメーションボタン</h2>
          <PulseButton>
            常にパルス効果・ホバーで拡大
          </PulseButton>
        </div>
      </div>
    </div>
  );
} 