import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  createSessionToken,
  isRateLimited,
  recordFailedAttempt,
  resetAttempts,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/admin-auth";

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    console.error("[admin] ADMIN_PASSWORD or ADMIN_SESSION_SECRET is not configured");
    return NextResponse.json({ error: "Server is not configured" }, { status: 500 });
  }

  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    if (typeof body.password === "string") password = body.password;
  } catch {
    password = "";
  }

  const ok = await verifyPassword(password);
  if (!ok) {
    recordFailedAttempt(ip);
    // Deliberate delay raises the cost of brute-force attempts. The response
    // body is generic and reveals nothing about why the attempt failed.
    await delay(200 + Math.floor(Math.random() * 300));
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  resetAttempts(ip);
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
