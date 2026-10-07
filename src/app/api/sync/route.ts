import { NextResponse } from "next/server";
import { executeD1Query, getD1Config } from "@/lib/cloudflare-d1";

export const dynamic = "force-dynamic";

interface AppStateRow {
  data: string;
  updated_at: number;
}

export async function GET() {
  const { isConfigured } = getD1Config();

  if (!isConfigured) {
    return NextResponse.json({
      success: true,
      configured: false,
      message: "Cloudflare D1 is not configured in environment variables.",
      data: null,
      updatedAt: 0,
    });
  }

  const result = await executeD1Query<AppStateRow>(
    "SELECT data, updated_at FROM app_state WHERE key = 'buildnknow_state' LIMIT 1;"
  );

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        configured: true,
        error: result.error || "Failed to query Cloudflare D1",
      },
      { status: 500 }
    );
  }

  const row = result.data?.[0];
  if (!row) {
    return NextResponse.json({
      success: true,
      configured: true,
      data: null,
      updatedAt: 0,
    });
  }

  try {
    const parsedData = JSON.parse(row.data);
    return NextResponse.json({
      success: true,
      configured: true,
      data: parsedData,
      updatedAt: row.updated_at,
    });
  } catch {
    return NextResponse.json({
      success: true,
      configured: true,
      data: null,
      updatedAt: row.updated_at,
    });
  }
}

export async function POST(request: Request) {
  const { isConfigured } = getD1Config();

  if (!isConfigured) {
    return NextResponse.json(
      {
        success: false,
        configured: false,
        error: "Cloudflare D1 is not configured in environment variables.",
      },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { projects, activeProjectId, deletedProjectIds, updatedAt } = body;

    if (!Array.isArray(projects)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: projects must be an array" },
        { status: 400 }
      );
    }

    const timestamp = typeof updatedAt === "number" && updatedAt > 0 ? updatedAt : Date.now();
    const payloadToStore = JSON.stringify({
      projects,
      activeProjectId: activeProjectId || null,
      deletedProjectIds: Array.isArray(deletedProjectIds) ? deletedProjectIds : [],
    });

    const result = await executeD1Query(
      `INSERT INTO app_state (key, data, updated_at)
       VALUES ('buildnknow_state', ?, ?)
       ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at;`,
      [payloadToStore, timestamp]
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to save state to Cloudflare D1",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedAt: timestamp,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: `Invalid request: ${message}` },
      { status: 400 }
    );
  }
}
