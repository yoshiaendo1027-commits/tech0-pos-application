export default function PosPage() {
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
            placeholder="商品コード"
            className="flex-1 rounded border px-3 py-2"
          />
          <button className="rounded border px-4 py-2">検索</button>
        </div>
        <p>商品名称：ブレンドコーヒー</p>
        <p>商品単価：400円</p>
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