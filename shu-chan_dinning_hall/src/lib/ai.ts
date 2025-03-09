// AIサービスのインターフェース
export interface AiService {
  generateMenuSuggestions(options: MenuSuggestionOptions): Promise<MenuSuggestion[]>;
  analyzeMenuPopularity(menuData: MenuData[]): Promise<MenuPopularityAnalysis>;
}

// メニュー提案のオプション
export interface MenuSuggestionOptions {
  mealType?: 'breakfast' | 'lunch' | 'dinner';
  cuisineType?: string;
  theme?: string;
  restrictions?: string[];
  budget?: number;
  season?: string;
  numberOfSuggestions?: number;
}

// メニュー提案の結果
export interface MenuSuggestion {
  title: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  ingredients: string[];
  imagePrompt?: string; // 画像生成用のプロンプト
}

// メニューの人気分析用データ
export interface MenuData {
  id: string;
  title: string;
  price: number;
  orderCount: number;
  rating: number;
  reviewCount: number;
  timeSlot: string;
  date: string;
}

// メニューの人気分析結果
export interface MenuPopularityAnalysis {
  popularItems: {
    menuId: string;
    title: string;
    score: number;
    reason: string;
  }[];
  recommendations: {
    type: string;
    description: string;
  }[];
  trends: {
    name: string;
    value: number;
    change: number;
  }[];
}

// ダミーのAI実装（実際のアプリでは外部AIサービスと連携）
class DummyAiService implements AiService {
  async generateMenuSuggestions(options: MenuSuggestionOptions): Promise<MenuSuggestion[]> {
    // 本来はAI APIを呼び出して生成するが、ここではサンプルデータを返す
    const sampleSuggestions: MenuSuggestion[] = [
      {
        title: "彩り野菜の豆腐ハンバーグ",
        description: "国産大豆の豆腐と国産牛肉を使った、ヘルシーなハンバーグです。季節の野菜を添えてご提供します。",
        price: 1200,
        calories: 450,
        protein: 28,
        carbs: 20,
        fat: 15,
        tags: ["ヘルシー", "高タンパク", "低カロリー"],
        ingredients: ["豆腐", "牛肉", "玉ねぎ", "人参", "オクラ", "パプリカ"]
      },
      {
        title: "サーモンとアボカドのサラダボウル",
        description: "新鮮なサーモンとアボカドに、キヌアやスーパーフードを加えた栄養満点のサラダボウルです。",
        price: 1350,
        calories: 520,
        protein: 24,
        carbs: 32,
        fat: 18,
        tags: ["高タンパク", "オメガ3", "スーパーフード"],
        ingredients: ["サーモン", "アボカド", "キヌア", "ベビーリーフ", "チアシード", "オリーブオイル"]
      }
    ];
    
    return sampleSuggestions.slice(0, options.numberOfSuggestions || 2);
  }
  
  async analyzeMenuPopularity(menuData: MenuData[]): Promise<MenuPopularityAnalysis> {
    // 本来はAI APIを呼び出して分析するが、ここではサンプルデータを返す
    return {
      popularItems: [
        {
          menuId: "1",
          title: "サーモンとアボカドのサラダボウル",
          score: 0.92,
          reason: "高評価と高い注文率が続いています。健康志向の顧客に特に人気です。"
        }
      ],
      recommendations: [
        {
          type: "価格調整",
          description: "「彩り野菜の豆腐ハンバーグ」の価格を10%引き上げても需要に影響はないと予測されます。"
        },
        {
          type: "新メニュー",
          description: "現在のトレンドから、スーパーフードを使った朝食メニューの追加が推奨されます。"
        }
      ],
      trends: [
        {
          name: "健康志向",
          value: 0.85,
          change: 0.12
        },
        {
          name: "低カロリー",
          value: 0.73,
          change: 0.09
        }
      ]
    };
  }
}

// AIサービスのインスタンスをエクスポート
export const aiService: AiService = new DummyAiService();
