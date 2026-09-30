'use client';
import { useState } from 'react';

type Product = {
  code: string;
  name: string;
  price: number;
};

type CartItem = {
  id: string; // 行を区別する番号（同じ商品が2行になるため必要）
  code: string;
  name: string;
  price: number;
  quantity: number;
};

// お客様の状態：会員 か 非会員（未選択の間は null）
type Customer =
  | { type: 'member'; code: string; name: string }
  | { type: 'guest' };

// サーバーが返した購入結果の型
type TransactionResult = {
  transactionId: number;
  totalWithoutTax: number;
  taxAmount: number;
  totalWithTax: number;
};

// ダミー：ログインがまだダミーのため、担当者は固定。あとでログイン情報から取る
const STAFF_CODE = 'S001';

// 画面表示用の税率。確定した金額は、サーバーが税率マスタから計算する
const TAX_RATE_PERCENT = 10;

export default function PosPage() {
  const [productCode, setProductCode] = useState('');
  const [message, setMessage] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showTotal, setShowTotal] = useState(false);
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 会員まわり：入力中の会員ID、確定したお客様、会員側のメッセージ
  const [memberCodeInput, setMemberCodeInput] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [memberMessage, setMemberMessage] = useState('');

  // 「会員ID読み込み」を押した時：APIで会員を探す
  const handleLoadMember = async () => {
    if (memberCodeInput === '') {
      setMemberMessage('会員IDを入力してください');
      return;
    }

    try {
      const res = await fetch(
        `/api/members/${encodeURIComponent(memberCodeInput)}`
      );
      const data = await res.json();

      if (res.ok) {
        setCustomer({ type: 'member', code: data.member_code, name: data.name });
        setMemberMessage('');
      } else if (res.status === 404) {
        setCustomer(null);
        setMemberMessage(`${data.message}（非会員として続行できます）`);
      } else {
        setCustomer(null);
        setMemberMessage(data.message);
      }
    } catch {
      setCustomer(null);
      setMemberMessage('通信エラーが発生しました');
    }
  };

  // 「お客様ID読み込み」を押した時：非会員として進める
  const handleGuest = () => {
    setCustomer({ type: 'guest' });
    setMemberCodeInput('');
    setMemberMessage('');
  };

  // 「検索」を押した時：APIで商品を探す
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

  // 「購入リストへ追加」を押した時
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

  // 「購入確定」を押した時：サーバーに保存して、返ってきた合計を表示する
  const handleConfirm = async () => {
    if (isSubmitting) return; // 二重送信の防止
    if (cartItems.length === 0) {
      setMessage('購入リストが空です');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staff_code: STAFF_CODE,
          // 会員の時だけ送る（undefined は JSON に含まれない）
          member_code: customer?.type === 'member' ? customer.code : undefined,
          items: cartItems.map((item) => ({
            product_code: item.code,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setResult({
          transactionId: data.transaction_id,
          totalWithoutTax: data.total_without_tax,
          taxAmount: data.tax_amount,
          totalWithTax: data.total_with_tax,
        });
        setMessage('');
        setShowTotal(true);
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage('通信エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ポップアップを閉じた時：画面をすべてクリアして、次の会員ID登録から再開する
  const handleClose = () => {
    setShowTotal(false);
    setResult(null);
    setCartItems([]);
    setProductCode('');
    setFoundProduct(null);
    setMessage('');
    setMemberCodeInput('');
    setCustomer(null);
    setMemberMessage('');
  };

  // 画面表示用の合計（useState にせず、毎回 cartItems から計算する）
  const totalWithoutTax = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const taxAmount = Math.floor((totalWithoutTax * TAX_RATE_PERCENT) / 100);
  const totalWithTax = totalWithoutTax + taxAmount;

  // 画面上部の表示（customer の状態から、毎回作る）
  const memberIdLabel =
    customer === null
      ? '（未入力）'
      : customer.type === 'member'
        ? customer.code
        : '（会員なし）';
  const customerNameLabel =
    customer === null
      ? ''
      : customer.type === 'member'
        ? customer.name
        : '非会員のお客様';

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* 上部：日付・担当者・会員 */}
      <div className="mb-4 flex justify-between text-sm">
        <div>
          <p>会員ID：{memberIdLabel}</p>
          <p>お客様名：{customerNameLabel}</p>
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
          value={memberCodeInput}
          onChange={(e) => setMemberCodeInput(e.target.value)}
          placeholder="会員ID"
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          onClick={handleLoadMember}
          className="rounded border px-4 py-2"
        >
          会員ID読み込み
        </button>
        <button onClick={handleGuest} className="rounded border px-4 py-2">
          お客様ID読み込み
        </button>
      </div>
      {memberMessage && (
        <p className="-mt-2 mb-4 text-sm text-red-600">{memberMessage}</p>
      )}

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

      {/* 合計（画面表示用） */}
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

      {/* 合計金額のポップアップ（サーバーが返した値を表示する） */}
      {showTotal && result && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded bg-white p-6 text-center">
            <p className="mb-1 text-xs text-zinc-500">
              取引番号：{result.transactionId}
            </p>
            <p className="mb-4 text-lg font-semibold">合計金額</p>
            <p>{result.totalWithTax}円（税込）</p>
            <p className="mb-6">{result.totalWithoutTax}円（税抜）</p>
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