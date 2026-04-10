import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Not implemented. OpenAI chat integration coming soon." },
    { status: 501 }
  );
}
