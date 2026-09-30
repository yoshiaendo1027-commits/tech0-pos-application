import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/products/${encodeURIComponent(code)}`,
      { cache: "no-store" }
    );
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.detail ?? "商品の取得に失敗しました" },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { message: "サーバーに接続できません" },
      { status: 502 }
    );
  }
}