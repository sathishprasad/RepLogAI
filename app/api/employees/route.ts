import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/demo";
export const dynamic = 'force-dynamic';

async function getAdmin() {
  const auth = await getAuthenticatedUser();
  if (!auth) return null;
  return prisma.user.findUnique({
    where: { id: auth.user.id },
    include: { stripeCustomer: true },
  });
}

function getMaxReps(plan: string): number {
  if (plan === "SCALE") return 999;
  if (plan === "PRO") return 10;
  return 3;
}

export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const employees = await prisma.employee.findMany({
    where: { adminId: admin.id },
    orderBy: { createdAt: "desc" },
  });

  const plan = admin.stripeCustomer?.plan || "FREE";
  const maxReps = getMaxReps(plan);

  return NextResponse.json({ employees, maxReps, plan });
}

export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = admin.stripeCustomer?.plan || "FREE";
  const maxReps = getMaxReps(plan);

  const currentCount = await prisma.employee.count({ where: { adminId: admin.id } });

  const body = await request.json();

  if (body.bulk && Array.isArray(body.employees)) {
    const newCount = body.employees.length;
    if (currentCount + newCount > maxReps) {
      return NextResponse.json({
        error: `Rep limit reached. Your ${plan === "FREE" ? "Free" : plan} plan allows up to ${maxReps} reps. You have ${currentCount}. ${plan === "FREE" ? "Upgrade to Pro for up to 10 reps." : plan === "PRO" ? "Upgrade to Scale for unlimited reps." : ""}`,
        maxReps,
        currentCount,
      }, { status: 403 });
    }

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

  if (currentCount >= maxReps) {
    return NextResponse.json({
      error: `Rep limit reached (${currentCount}/${maxReps}). ${plan === "FREE" ? "Upgrade to Pro for up to 10 reps." : plan === "PRO" ? "Upgrade to Scale for unlimited reps." : ""}`,
      maxReps,
      currentCount,
    }, { status: 403 });
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
