'use client';
import { useState } from 'react';

type Product = {
  code: string;
  name: string;
  price: number;
};

// ★③-1：購入リストの1行分の型
type CartItem = {
  id: string; // 行を区別する番号（同じ商品が2行になるため必要）
  code: string;
  name: string;
  price: number;
  quantity: number;
};



// ダミー：あとで tax_rates（税率マスタ）から取得する
const TAX_RATE_PERCENT = 10;

export default function PosPage() {
  const [productCode, setProductCode] = useState('');
  const [message, setMessage] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  // ★③-2：購入リストを覚える箱（最初は空）
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
    // ★⑤-1：合計ポップアップを出すかどうか
  const [showTotal, setShowTotal] = useState(false);

 const handleSearch = async () => {
  if (productCode === '') {
    setFoundProduct(null);
    setMessage('商品コードを入力してください');
    return;
  }

  try {
    const res = await fetch(`/api/products/${encodeURIComponent(productCode)}`);
    const data = await res.json();

    if (res.ok) {
      setFoundProduct({
        code: data.product_code,
        name: data.name,
        price: data.price,
      });
      setMessage('');
    } else {
      setFoundProduct(null);
      setMessage(data.message);
    }
  } catch {
    setFoundProduct(null);
    setMessage('通信エラーが発生しました');
  }
};  

  // ★③-3：「購入リストへ追加」を押した時にやること
  const handleAdd = () => {
    if (!foundProduct) {
      setMessage('先に商品を検索してください');
      return;
    }



    const newItem: CartItem = {
      id: crypto.randomUUID(),
      code: foundProduct.code,
      name: foundProduct.name,
      price: foundProduct.price,
      quantity: 1,
    };

    setCartItems([...cartItems, newItem]);

    // 次の商品を登録できるよう、入力と表示をクリアする
    setProductCode('');
    setFoundProduct(null);
    setMessage('');
  };

  // ★⑤-2a：「購入確定」を押した時（あとでここにAPI呼び出しが入る）
  const handleConfirm = () => {
    if (cartItems.length === 0) {
      setMessage('購入リストが空です');
      return;
    }
    setShowTotal(true);
  };
 
  // ★⑤-2b：ポップアップを閉じた時（画面をすべてクリアする）
  const handleClose = () => {
    setShowTotal(false);
    setCartItems([]);
    setProductCode('');
    setFoundProduct(null);
    setMessage('');
  };

  // ★④-2：合計の計算（useState にせず、毎回 cartItems から計算する）
  const totalWithoutTax = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxAmount = Math.floor((totalWithoutTax * TAX_RATE_PERCENT) / 100);
  const totalWithTax = totalWithoutTax + taxAmount;

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
          <button onClick={handleSearch} className="rounded border px-4 py-2">
            検索
          </button>
        </div>
        <p>商品名称：{foundProduct ? foundProduct.name : ''}</p>
        <p>商品単価：{foundProduct ? `${foundProduct.price}円` : ''}</p>
        {message && <p className="text-sm text-red-600">{message}</p>}

        {/* ★③-4：ボタンと handleAdd をつなぐ */}
        <button
          onClick={handleAdd}
          className="mt-2 rounded bg-blue-600 px-4 py-2 text-white"
        >
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
          {/* ★③-5：cartItems の中身から、行を自動で作る */}
          {cartItems.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-2">{item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
              <td>{item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-4 text-right text-sm">
       <p>合計（税抜）：{totalWithoutTax}円</p>
       <p>消費税：{taxAmount}円</p>
       <p className="text-base font-semibold">合計（税込）：{totalWithTax}円</p>
     </div>

      {/* 購入確定 */}
      <button 
        onClick={handleConfirm} 
        className="w-full rounded bg-blue-600 py-3 text-white"
      >
        購入確定
      </button>

      {/* ★⑤-4：合計金額のポップアップ */}
      {showTotal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded bg-white p-6 text-center">
            <p className="mb-4 text-lg font-semibold">合計金額</p>
            <p>{totalWithTax}円（税込）</p>
            <p className="mb-6">{totalWithoutTax}円（税抜）</p>
            <button
              onClick={handleClose}
              className="w-full rounded bg-blue-600 py-2 text-white"
            >
              閉じる
            </button>
          </div>
        </div>
      )}


    </main>
  );
}