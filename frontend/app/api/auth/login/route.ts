import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { staff_code, password } = body;

  // ダミー：決め打ちのIDとパスワード（あとでFastAPIでの照合に置き換える）
  if (staff_code === "S001" && password === "test1234") {
    return NextResponse.json({
      message: "ログインしました",
      staff: { staff_code: "S001", name: "テスト太郎" },
    });
  }

  return NextResponse.json(
    { message: "担当者IDまたはパスワードが違います" },
    { status: 401 }
  );
}