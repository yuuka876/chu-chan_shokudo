import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// 提案メニューの型定義
interface SuggestedMenu {
  title: string;
  description: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  ingredients: string[];
}

// POST: AIによるメニュー提案を取得
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    // 管理者かどうかのチェック
    if (!userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    
    // TODO: 実際のアプリでは、ここで管理者権限をチェックする
    
    const body = await req.json();
    const { 
      mealType = 'lunch',  // breakfast, lunch, dinner
      cuisineType,         // japanese, western, chinese, etc.
      theme,               // seasonal, healthy, budget, etc.
      restrictions = []    // vegetarian, gluten-free, etc.
    } = body;
    
    // TODO: 実際のアプリでは、AIサービスを呼び出してメニューを生成
    // ここではサンプルデータを返す
    
    // サンプルのメニュー提案
    const sampleSuggestions: SuggestedMenu[] = [
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
      },
      {
        title: "季節の野菜カレー",
        description: "15種類のスパイスと季節の野菜を使った、体に優しいカレーです。玄米ごはんと一緒にどうぞ。",
        price: 1100,
        calories: 580,
        protein: 18,
        carbs: 75,
        fat: 12,
        tags: ["ヴィーガン対応可", "グルテンフリー", "スパイシー"],
        ingredients: ["玄米", "じゃがいも", "人参", "かぼちゃ", "なす", "トマト", "スパイス15種"]
      }
    ];
    
    return NextResponse.json({
      suggestions: sampleSuggestions,
      message: "メニュー提案が生成されました。実際のアプリでは、AIによる本格的な提案が行われます。"
    });
  } catch (error) {
    console.error('メニュー提案エラー:', error);
    return NextResponse.json(
      { error: 'メニュー提案の生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
