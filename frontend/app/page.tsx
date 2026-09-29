"use client";

import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <main className="p-8">
      <p className="text-2xl">カウント：{count}</p>
      <button
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white"
        onClick={() => setCount(count + 1)}
      >
        +1
      </button>
    </main>
  );
}
