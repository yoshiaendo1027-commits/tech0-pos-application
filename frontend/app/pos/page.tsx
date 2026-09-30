'use client';
import { useState } from 'react';

// ★追加1：商品の型と、商品名簿（ダミー）
type Product = {
  code: string;
  name: string;
  price: number;
};

const DUMMY_PRODUCTS: Product[] = [
  { code: '1001', name: 'ブレンドコーヒー', price: 400 },
  { code: '1002', name: 'カフェラテ', price: 450 },
  { code: '1003', name: 'ホットコーラ', price: 500 },
];

export default function PosPage() {
  const [productCode, setProductCode] = useState('');

  const [message, setMessage] = useState('');

  // ★追加2：見つかった商品を覚える箱（最初は何もなし）
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);

  // ★追加3：検索ボタンを押した時にやること
  const handleSearch = () => {
  const product = DUMMY_PRODUCTS.find((p) => p.code === productCode);

  if (product) {
    setFoundProduct(product);
    setMessage('');
  } else {
    setFoundProduct(null);
    setMessage('商品がマスタ未登録です');
  }
};

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* 上部：日付・担当者・会員 */}
      <div className="mb-4 flex justify-between text-sm">
        <div>
          <p>会員ID：（未入力）</p>
          <p>お客様名：</p>
        </div>
        <div className="text-right">
          <p>2026/09/30 12:00:00</p>
          <p>レジ担当：S001 テスト太郎</p>
        </div>
      </div>

      {/* 会員ID入力 */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="会員ID"
          className="flex-1 rounded border px-3 py-2"
        />
        <button className="rounded border px-4 py-2">会員ID読み込み</button>
        <button className="rounded border px-4 py-2">お客様ID読み込み</button>
      </div>

      {/* 商品検索 */}
      <div className="mb-4 rounded border p-4">
        <div className="mb-2 flex gap-2">
          <input
            type="text"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            placeholder="商品コード"
            className="flex-1 rounded border px-3 py-2"
          />
          {/* ★追加4-a：ボタンと handleSearch をつなぐ */}
          <button onClick={handleSearch} className="rounded border px-4 py-2">
            検索
          </button>
        </div>
        {/* ★追加4-b：トレイの中身を画面に出す */}
        <p>商品名称：{foundProduct ? foundProduct.name : ''}</p>
        <p>商品単価：{foundProduct ? `${foundProduct.price}円` : ''}</p>
        {message && <p className="text-sm text-red-600">{message}</p>}
        <button className="mt-2 rounded bg-blue-600 px-4 py-2 text-white">
          購入リストへ追加
        </button>
      </div>

      {/* 購入リスト */}
      <table className="mb-4 w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">名称</th>
            <th>数量</th>
            <th>単価</th>
            <th>小計</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="py-2">ブレンドコーヒー</td>
            <td>2</td>
            <td>400</td>
            <td>800</td>
          </tr>
        </tbody>
      </table>

      {/* 購入確定 */}
      <button className="w-full rounded bg-blue-600 py-3 text-white">
        購入確定
      </button>
    </main>
  );
}