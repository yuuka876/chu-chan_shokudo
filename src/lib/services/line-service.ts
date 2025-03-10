/**
 * LINE Messaging APIを使用してメッセージを送信するためのサービス
 */

import { MenuItem } from '@/types/menu';

// Reservation型の定義
export interface Reservation {
  id: string;
  menu: {
    menuNo: string;
    menuName: string;
    provideDate: Date | string;
  };
  user: {
    userName: string;
  };
  reservationTime: string;
}

// LINE Messaging APIのエンドポイント
const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message/push';
const LINE_REPLY_API = 'https://api.line.me/v2/bot/message/reply';

// 環境変数から取得するか、直接設定する
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || 'a61bc3a02f37401bc3e76a235588c905';
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '3ATEVHVRENFgCAu+HWty3SDCQvGR1oRvF6u2yTyVUWoxSFnutxfSfICEIBChr8iJGqmFd0V4YWA4qTa/fLx5nGH+yWv27of4C5RbcmPF8tf6pv/sUAc0DtXA8x3p/DWzbIQzm3OlbTHWL7jD8TM+egdB04t89/1O/w1cDnyilFU=';
const LINE_USER_ID = process.env.LINE_USER_ID || 'Ub9df7c953300b31d6338c5f6f93abb77';

// アプリのURL
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * テキストメッセージを送信する
 * @param text 送信するテキスト
 * @param userId 送信先のユーザーID（指定がない場合は環境変数のユーザーIDを使用）
 * @returns レスポンス
 */
export async function sendTextMessage(text: string, userId: string = LINE_USER_ID) {
  try {
    const response = await fetch(LINE_MESSAGING_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'text',
            text: text
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE APIエラー:', errorData);
      throw new Error(`LINE APIエラー: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('LINEメッセージ送信エラー:', error);
    throw error;
  }
}

/**
 * 予約確認メッセージを送信する
 * @param userName ユーザー名
 * @param date 予約日
 * @param time 予約時間
 * @param menuName メニュー名
 * @param userId 送信先のユーザーID（指定がない場合は環境変数のユーザーIDを使用）
 * @returns レスポンス
 */
export async function sendReservationConfirmation(
  userName: string,
  date: string,
  time: string,
  menuName: string,
  userId: string = LINE_USER_ID
) {
  const message = `${userName}様、ご予約ありがとうございます。\n\n日時: ${date} ${time}\nメニュー: ${menuName}\n\nご予約を承りました。当日のご来店をお待ちしております。`;
  return sendTextMessage(message, userId);
}

/**
 * 予約リマインダーメッセージを送信する
 * @param userName ユーザー名
 * @param date 予約日
 * @param time 予約時間
 * @param menuName メニュー名
 * @param userId 送信先のユーザーID（指定がない場合は環境変数のユーザーIDを使用）
 * @returns レスポンス
 */
export async function sendReservationReminder(
  userName: string,
  date: string,
  time: string,
  menuName: string,
  userId: string = LINE_USER_ID
) {
  const message = `${userName}様、明日のご予約のリマインダーです。\n\n日時: ${date} ${time}\nメニュー: ${menuName}\n\nお気をつけてお越しください。ご来店をお待ちしております。`;
  return sendTextMessage(message, userId);
}

/**
 * 予約キャンセル確認メッセージを送信する
 * @param userName ユーザー名
 * @param date 予約日
 * @param time 予約時間
 * @param menuName メニュー名
 * @param userId 送信先のユーザーID（指定がない場合は環境変数のユーザーIDを使用）
 * @returns レスポンス
 */
export async function sendCancellationConfirmation(
  userName: string,
  date: string,
  time: string,
  menuName: string,
  userId: string = LINE_USER_ID
) {
  const message = `${userName}様、以下のご予約をキャンセルしました。\n\n日時: ${date} ${time}\nメニュー: ${menuName}\n\nまたのご利用をお待ちしております。`;
  return sendTextMessage(message, userId);
}

/**
 * 予約ボタン付きメッセージを送信する
 * @param userId 送信先のユーザーID
 * @returns レスポンス
 */
export async function sendReservationButton(userId: string) {
  try {
    const response = await fetch(LINE_MESSAGING_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'template',
            altText: '食事の予約',
            template: {
              type: 'buttons',
              thumbnailImageUrl: `${APP_URL}/images/food.jpg`,
              title: 'しゅうちゃん食堂',
              text: '食事の予約をしますか？',
              actions: [
                {
                  type: 'uri',
                  label: '予約する',
                  uri: `${APP_URL}?lineUserId=${userId}`
                },
                {
                  type: 'uri',
                  label: '予約確認',
                  uri: `${APP_URL}/reservations?lineUserId=${userId}`
                }
              ]
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE APIエラー:', errorData);
      throw new Error(`LINE APIエラー: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('LINEメッセージ送信エラー:', error);
    throw error;
  }
}

/**
 * メニュー情報をフレックスメッセージで送信する
 * @param menus メニュー情報の配列
 * @param date 日付
 * @param userId 送信先のユーザーID
 * @returns レスポンス
 */
export async function sendMenuFlexMessage(menus: MenuItem[], date: string, userId: string) {
  try {
    // メニューがない場合はテキストメッセージを送信
    if (menus.length === 0) {
      return sendTextMessage(`${date}のメニューはまだ登録されていません。`, userId);
    }

    // フレックスメッセージの内容を構築
    const contents = menus.map(menu => ({
      type: 'bubble',
      hero: {
        type: 'image',
        url: menu.image || `${APP_URL}/images/default-food.jpg`,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover'
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: menu.menuName,
            weight: 'bold',
            size: 'xl',
            wrap: true
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'baseline',
                spacing: 'sm',
                contents: [
                  {
                    type: 'text',
                    text: '提供日時',
                    color: '#aaaaaa',
                    size: 'sm',
                    flex: 3
                  },
                  {
                    type: 'text',
                    text: date,
                    wrap: true,
                    color: '#666666',
                    size: 'sm',
                    flex: 5
                  }
                ]
              }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '予約する',
              uri: `${APP_URL}?lineUserId=${userId}&menuId=${menu.menuNo}`
            }
          }
        ],
        flex: 0
      }
    }));

    // カルーセルメッセージを送信
    const response = await fetch(LINE_MESSAGING_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'flex',
            altText: `${date}のメニュー`,
            contents: {
              type: 'carousel',
              contents: contents
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE APIエラー:', errorData);
      throw new Error(`LINE APIエラー: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('LINEメッセージ送信エラー:', error);
    // エラーが発生した場合は通常のテキストメッセージを送信
    return sendTextMessage(`${date}のメニュー情報を取得できませんでした。`, userId);
  }
}

/**
 * 予約確認メッセージをリッチメッセージで送信する
 * @param reservation 予約情報
 * @param userId 送信先のユーザーID
 * @returns レスポンス
 */
export async function sendReservationConfirmationRich(reservation: Reservation, userId: string) {
  try {
    const response = await fetch(LINE_MESSAGING_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'flex',
            altText: '予約確認',
            contents: {
              type: 'bubble',
              header: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: '予約確認',
                    weight: 'bold',
                    size: 'xl',
                    color: '#ffffff'
                  }
                ],
                backgroundColor: '#27ACB2'
              },
              body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: 'メニュー',
                        size: 'sm',
                        color: '#8C8C8C',
                        flex: 1
                      },
                      {
                        type: 'text',
                        text: reservation.menu.menuName,
                        size: 'sm',
                        color: '#111111',
                        flex: 2
                      }
                    ]
                  },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: '日付',
                        size: 'sm',
                        color: '#8C8C8C',
                        flex: 1
                      },
                      {
                        type: 'text',
                        text: new Date(reservation.menu.provideDate).toLocaleDateString('ja-JP'),
                        size: 'sm',
                        color: '#111111',
                        flex: 2
                      }
                    ],
                    margin: 'md'
                  },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: '時間',
                        size: 'sm',
                        color: '#8C8C8C',
                        flex: 1
                      },
                      {
                        type: 'text',
                        text: reservation.reservationTime,
                        size: 'sm',
                        color: '#111111',
                        flex: 2
                      }
                    ],
                    margin: 'md'
                  }
                ]
              },
              footer: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'button',
                    style: 'primary',
                    action: {
                      type: 'uri',
                      label: '予約詳細',
                      uri: `${APP_URL}/reservations?lineUserId=${userId}`
                    }
                  },
                  {
                    type: 'button',
                    style: 'secondary',
                    action: {
                      type: 'uri',
                      label: 'キャンセル',
                      uri: `${APP_URL}/reservations/cancel?id=${reservation.id}&lineUserId=${userId}`
                    },
                    margin: 'md'
                  }
                ]
              }
            }
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LINE APIエラー:', errorData);
      throw new Error(`LINE APIエラー: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('LINEメッセージ送信エラー:', error);
    // エラーが発生した場合は通常のテキストメッセージを送信
    return sendReservationConfirmation(
      reservation.user.userName,
      new Date(reservation.menu.provideDate).toLocaleDateString('ja-JP'),
      reservation.reservationTime,
      reservation.menu.menuName,
      userId
    );
  }
}
