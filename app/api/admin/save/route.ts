import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { HIDDEN_TOOLS_TAG } from "@/lib/visibility";

/** Extract the Edge Config id (ecfg_…) from the EDGE_CONFIG connection string. */
function edgeConfigId(): string | null {
  const conn = process.env.EDGE_CONFIG ?? "";
  const match = conn.match(/(ecfg_[A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  // Require a valid Google (Auth.js) session, gated by the email allowlist.
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let hidden: string[] = [];
  try {
    const body = (await req.json()) as { hidden?: unknown };
    if (Array.isArray(body.hidden)) {
      hidden = body.hidden.filter((s): s is string => typeof s === "string");
    }
  } catch {
    hidden = [];
  }

  const configId = edgeConfigId();
  const accessToken = process.env.VERCEL_ACCESS_TOKEN;
  if (!configId || !accessToken) {
    console.error("[admin] EDGE_CONFIG id or VERCEL_ACCESS_TOKEN missing — cannot write");
    return NextResponse.json({ error: "Storage is not configured" }, { status: 500 });
  }

  const teamId = process.env.VERCEL_TEAM_ID;
  const url = `https://api.vercel.com/v1/edge-config/${configId}/items${teamId ? `?teamId=${teamId}` : ""}`;

  try {
    const resp = await fetch(url, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ operation: "upsert", key: "hiddenTools", value: hidden }] }),
    });
    if (!resp.ok) {
      console.error("[admin] Edge Config write failed with status", resp.status);
      return NextResponse.json({ error: "Write failed" }, { status: 502 });
    }
  } catch {
    console.error("[admin] Edge Config write threw a network error");
    return NextResponse.json({ error: "Write failed" }, { status: 502 });
  }

  // Invalidate the cached visibility list everywhere, then regenerate pages.
  revalidateTag(HIDDEN_TOOLS_TAG);
  revalidatePath("/", "layout");

  // Audit log: timestamp + count only. Never log IP or session details.
  console.info(`[admin] hiddenTools updated: ${hidden.length} hidden at ${new Date().toISOString()}`);
  return NextResponse.json({ ok: true, hidden });
}
