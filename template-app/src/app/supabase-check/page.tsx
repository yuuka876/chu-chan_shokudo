'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseCheckPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [tables, setTables] = useState<string[]>([]);
  const [envVariables, setEnvVariables] = useState({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '未設定',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '設定済み' : '未設定'
  });

  useEffect(() => {
    async function checkConnection() {
      try {
        // 最もシンプルな接続テスト - バージョン情報を取得
        const { data, error } = await supabase.rpc('get_postgres_version');
        
        if (error) {
          console.error('接続エラー:', error);
          setConnectionStatus('error');
          setErrorMessage(`Supabase接続エラー: ${error.message}`);
          return;
        }
        
        console.log('PostgreSQL Version:', data);
        
        // テーブル一覧を取得
        const { data: tableData, error: tableError } = await supabase
          .from('pg_catalog.pg_tables')
          .select('tablename')
          .eq('schemaname', 'public')
          .order('tablename');
        
        if (tableError) {
          console.error('テーブル一覧取得エラー:', tableError);
          setErrorMessage(`テーブル一覧取得エラー: ${tableError.message}`);
        } else {
          setTables(tableData?.map(t => t.tablename) || []);
        }
        
        setConnectionStatus('success');
      } catch (e) {
        console.error('Supabase接続チェック中の例外:', e);
        setConnectionStatus('error');
        setErrorMessage(`例外が発生しました: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    checkConnection();
  }, []);

  // テーブル作成のSQL
  const createTableSQL = `
CREATE TABLE IF NOT EXISTS user_tbl (
  "userId" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userName" TEXT NOT NULL,
  "isAdmin" BOOLEAN NOT NULL DEFAULT false,
  "lineUserName" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- サンプルデータ (既存データがない場合のみ挿入)
INSERT INTO user_tbl ("userName", "isAdmin", "lineUserName")
SELECT '山田太郎', true, 'taro_yamada'
WHERE NOT EXISTS (SELECT 1 FROM user_tbl WHERE "userName" = '山田太郎');

INSERT INTO user_tbl ("userName", "isAdmin", "lineUserName")
SELECT '佐藤花子', false, 'hanako_sato'
WHERE NOT EXISTS (SELECT 1 FROM user_tbl WHERE "userName" = '佐藤花子');

INSERT INTO user_tbl ("userName", "isAdmin", "lineUserName")
SELECT '鈴木一郎', false, null
WHERE NOT EXISTS (SELECT 1 FROM user_tbl WHERE "userName" = '鈴木一郎');
`;

  // user_tblテーブルを作成する関数
  const createUserTable = async () => {
    try {
      // 直接SQL実行 (RLSの制限によっては失敗する可能性があります)
      const { error } = await supabase.rpc('execute_sql', { 
        sql_query: createTableSQL 
      });
      
      if (error) {
        alert(`テーブル作成エラー: ${error.message}`);
        return;
      }
      
      alert('user_tblテーブルが作成されました。ページを再読み込みしてください。');
      window.location.reload();
    } catch (e) {
      alert(`テーブル作成中にエラーが発生しました: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Supabase接続チェック</h1>

      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">環境変数</h2>
        <div className="bg-gray-100 p-4 rounded">
          <div className="mb-2">
            <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL: </span>
            {envVariables.url}
          </div>
          <div>
            <span className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY: </span>
            {envVariables.anonKey}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium mb-2">接続ステータス</h2>
        {connectionStatus === 'checking' ? (
          <p>接続を確認中...</p>
        ) : connectionStatus === 'success' ? (
          <div className="bg-green-100 text-green-800 p-4 rounded">
            Supabase接続成功！
          </div>
        ) : (
          <div className="bg-red-100 text-red-800 p-4 rounded">
            <p>Supabase接続エラー</p>
            <p className="text-sm mt-2">{errorMessage}</p>
            <div className="mt-4">
              <p className="font-medium mb-2">考えられる原因:</p>
              <ul className="list-disc pl-5">
                <li>環境変数が正しく設定されていない</li>
                <li>Supabaseプロジェクトが存在しない</li>
                <li>ネットワーク接続に問題がある</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {connectionStatus === 'success' && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-2">テーブル一覧</h2>
          {tables.length > 0 ? (
            <ul className="bg-gray-100 p-4 rounded">
              {tables.map(table => (
                <li key={table} className={table === 'user_tbl' ? 'text-green-600 font-bold' : ''}>
                  {table} {table === 'user_tbl' && '✓'}
                </li>
              ))}
            </ul>
          ) : (
            <p>テーブルが見つかりません</p>
          )}

          {!tables.includes('user_tbl') && (
            <div className="mt-4">
              <p className="text-yellow-600 mb-2">user_tblテーブルが見つかりません。</p>
              <p className="mb-4">
                以下のいずれかの方法でテーブルを作成してください：
              </p>
              
              <div className="mb-6">
                <h3 className="font-medium mb-2">方法1: 自動作成を試みる</h3>
                <p className="mb-2 text-sm text-gray-600">※ 権限によっては失敗する場合があります</p>
                <button
                  onClick={createUserTable}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  テーブルを自動作成
                </button>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">方法2: SQLをコピーしてダッシュボードで実行</h3>
                <p className="mb-2 text-sm">
                  Supabaseダッシュボードの「SQL Editor」で以下のSQLを実行してください:
                </p>
                <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto mb-4 text-sm">
                  {createTableSQL}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 