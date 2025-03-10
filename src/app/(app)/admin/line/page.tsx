'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LineTestPage() {
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('メッセージを入力してください');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/line/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: userId.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'メッセージの送信に失敗しました');
      }

      toast.success('メッセージを送信しました');
      setMessage('');
    } catch (error) {
      console.error('LINE送信エラー:', error);
      toast.error(error instanceof Error ? error.message : 'メッセージの送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestReservation = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/line/notify/reservation-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '予約テストメッセージの送信に失敗しました');
      }

      toast.success('予約テストメッセージを送信しました');
    } catch (error) {
      console.error('LINE予約テスト送信エラー:', error);
      toast.error(error instanceof Error ? error.message : '予約テストメッセージの送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">LINE連携テスト</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>メッセージ送信テスト</CardTitle>
            <CardDescription>
              LINEにテストメッセージを送信します。ユーザーIDを空にすると、デフォルトのユーザーに送信されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="userId">ユーザーID（オプション）</Label>
                <Input
                  id="userId"
                  placeholder="例: Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">メッセージ</Label>
                <Textarea
                  id="message"
                  placeholder="送信するメッセージを入力してください"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setMessage('')} disabled={loading}>
              クリア
            </Button>
            <Button onClick={handleSendMessage} disabled={loading || !message.trim()}>
              {loading ? '送信中...' : 'メッセージを送信'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>予約確認テスト</CardTitle>
            <CardDescription>
              予約確認のテストメッセージを送信します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              テスト用の予約情報（名前：テストユーザー、日付：明日、時間：18:00、人数：2名）で予約確認メッセージを送信します。
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSendTestReservation} disabled={loading} className="ml-auto">
              {loading ? '送信中...' : '予約テストメッセージを送信'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 