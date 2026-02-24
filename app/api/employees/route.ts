import { createServerSupabaseClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return prisma.user.findUnique({ where: { email: user.email! } });
}

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const employees = await prisma.employee.findMany({
    where: { adminId: admin.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ employees });
}

export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.bulk && Array.isArray(body.employees)) {
    const created = await prisma.employee.createMany({
      data: body.employees.map((e: { employeeCode: string; name: string }) => ({
        adminId: admin.id,
        employeeCode: e.employeeCode.trim(),
        name: e.name.trim(),
      })),
      skipDuplicates: true,
    });
    return NextResponse.json({ count: created.count });
  }

  const { employeeCode, name } = body;
  if (!employeeCode || !name) {
    return NextResponse.json({ error: "employeeCode and name required" }, { status: 400 });
  }

  const employee = await prisma.employee.create({
    data: { adminId: admin.id, employeeCode: employeeCode.trim(), name: name.trim() },
  });

  return NextResponse.json({ employee });
}

export async function DELETE(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  await prisma.employee.delete({ where: { id, adminId: admin.id } });
  return NextResponse.json({ ok: true });
}
