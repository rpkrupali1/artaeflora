import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/admin/inquiries?type=PAINTING|EVENT|CLASS|GENERAL&handled=true|false

export async function GET(req: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const params = req.nextUrl.searchParams;
  const type = params.get("type") ?? undefined;
  const handled = params.get("handled");

  const inquiries = await db.inquiry.findMany({
    where: {
      ...(type ? { type } : {}),
      ...(handled !== null ? { handled: handled === "true" } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ count: inquiries.length, inquiries });
}
