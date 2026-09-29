'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  // 担当者ID入力欄の値
  const [staffId, setStaffId] = useState('');

  // パスワード入力欄の値
  const [password, setPassword] = useState('');

  // ログイン結果（成功・失敗のメッセージ）
  const [loginMessage, setLoginMessage] = useState('');

  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ staff_code: staffId, password: password }),
      });
      const data = await response.json();

      if (response.ok) {
        router.push('/pos'); // 成功：POS画面へ移動
      } else {
        setLoginMessage(data.message); // 失敗：エラーを表示
      }
    } catch (error) {
      console.error('Error:', error);
      setLoginMessage('通信エラーが発生しました。もう一度お試しください');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-xl font-semibold">
          ヨネダコーヒーPOSシステム
        </h1>

        <label className="block text-sm">担当者ID</label>
        <input
          type="text"
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          className="mb-4 mt-1 w-full rounded border px-3 py-2"
        />

        <label className="block text-sm">パスワード</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 mt-1 w-full rounded border px-3 py-2"
        />

        {loginMessage && (
          <p className="mb-4 text-sm text-red-600">{loginMessage}</p>
        )}

        <button
          onClick={handleLogin}
          className="w-full rounded bg-blue-600 py-2 text-white"
        >
          ログイン
        </button>
      </div>
    </main>
  );
}