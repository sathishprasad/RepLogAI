import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.notionDatabaseConfig.deleteMany({ where: { userId: dbUser.id } });
  await prisma.notionConnection.deleteMany({ where: { userId: dbUser.id } });
  await prisma.user.update({
    where: { id: dbUser.id },
    data: { onboardingComplete: false },
  });

  return NextResponse.json({ success: true });
}
