export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">しゅうちゃん食堂について</h1>
      
      <div className="prose prose-lg dark:prose-invert">
        <p className="lead">
          しゅうちゃん食堂は、地域に根ざした家庭的な食事を提供するレストランです。
          新鮮な食材と心のこもった調理で、お客様に「おうちのような」温かさを感じていただけるよう努めています。
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">私たちの想い</h2>
        <p>
          毎日忙しく過ごす現代人に、ほっと一息つける場所を提供したい。
          そんな想いから、2020年にしゅうちゃん食堂は誕生しました。
          地元の食材を使い、添加物を極力抑えた健康的な料理で、
          お客様の健康と幸せをサポートします。
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">お食事について</h2>
        <p>
          家庭料理を中心としたメニューをご用意しています。
          日替わりランチや季節の特別メニューなど、
          いつ来ても新しい発見があるお店です。
          アレルギー対応やベジタリアンメニューもございますので、
          お気軽にスタッフまでお申し付けください。
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">営業時間</h2>
        <ul className="list-disc pl-6">
          <li>ランチ: 11:30〜14:00 (L.O. 13:30)</li>
          <li>ディナー: 17:30〜21:00 (L.O. 20:30)</li>
          <li>定休日: 毎週水曜日、第3火曜日</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">アクセス</h2>
        <p>
          〒123-4567<br />
          東京都○○区△△町1-2-3<br />
          TEL: 03-1234-5678<br />
          最寄り駅: ○○線△△駅 徒歩5分
        </p>
        
        <div className="mt-8">
          <a 
            href="/calendar" 
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            ご予約はこちら
          </a>
        </div>
      </div>
    </div>
  );
}
