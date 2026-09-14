import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete("invity_session");

  return NextResponse.json(
    { message: "Déconnexion réussie." },
    { status: 200 }
  );
}