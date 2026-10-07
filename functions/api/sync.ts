// Cloudflare Pages Function: /api/sync
// Runs natively on Cloudflare Workers Edge (Serverless)

interface Env {
  DB?: {
    prepare: (query: string) => {
      bind: (...params: any[]) => {
        run: () => Promise<any>;
        first: <T = any>() => Promise<T | null>;
        all: <T = any>() => Promise<{ results: T[] }>;
      };
      first: <T = any>() => Promise<T | null>;
      all: <T = any>() => Promise<{ results: T[] }>;
    };
  };
  AccID?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  DBID?: string;
  CLOUDFLARE_D1_DATABASE_ID?: string;
  DBAPIToken?: string;
  CLOUDFLARE_API_TOKEN?: string;
}

export const onRequestGet = async (context: { env: Env }) => {
  const env = context.env;

  // 1. Nếu đã gán native D1 binding (tên biến 'DB' trong Cloudflare Pages Settings)
  if (env.DB) {
    try {
      const row = await env.DB.prepare(
        "SELECT data, updated_at FROM app_state WHERE key = 'buildnknow_state' LIMIT 1;"
      ).first<{ data: string; updated_at: number }>();

      if (!row) {
        return Response.json({
          success: true,
          configured: true,
          data: null,
          updatedAt: 0,
        });
      }

      return Response.json({
        success: true,
        configured: true,
        data: JSON.parse(row.data),
        updatedAt: row.updated_at,
      });
    } catch (err: any) {
      return Response.json(
        { success: false, error: err.message || "Failed to query native D1" },
        { status: 500 }
      );
    }
  }

  // 2. Fallback sang Cloudflare D1 REST API (dùng biến môi trường)
  const accountId = (env.AccID || env.CLOUDFLARE_ACCOUNT_ID || "").trim();
  const dbId = (env.DBID || env.CLOUDFLARE_D1_DATABASE_ID || "").trim();
  const token = (env.DBAPIToken || env.CLOUDFLARE_API_TOKEN || "").trim();

  if (!accountId || !dbId || !token) {
    return Response.json({
      success: true,
      configured: false,
      message: "D1 database is not configured in Cloudflare Pages.",
      data: null,
      updatedAt: 0,
    });
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: "SELECT data, updated_at FROM app_state WHERE key = 'buildnknow_state' LIMIT 1;",
        }),
      }
    );

    const json: any = await res.json();
    const row = json.result?.[0]?.results?.[0];

    if (!row) {
      return Response.json({
        success: true,
        configured: true,
        data: null,
        updatedAt: 0,
      });
    }

    return Response.json({
      success: true,
      configured: true,
      data: JSON.parse(row.data),
      updatedAt: row.updated_at,
    });
  } catch (err: any) {
    return Response.json(
      { success: false, error: err.message || "Failed to query D1 via REST API" },
      { status: 500 }
    );
  }
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const env = context.env;

  try {
    const body: any = await context.request.json();
    const { projects, activeProjectId, deletedProjectIds, updatedAt } = body;

    if (!Array.isArray(projects)) {
      return Response.json(
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

    // 1. Nếu có native D1 binding
    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO app_state (key, data, updated_at)
         VALUES ('buildnknow_state', ?, ?)
         ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at;`
      )
        .bind(payloadToStore, timestamp)
        .run();

      return Response.json({ success: true, updatedAt: timestamp });
    }

    // 2. Fallback sang Cloudflare D1 REST API
    const accountId = (env.AccID || env.CLOUDFLARE_ACCOUNT_ID || "").trim();
    const dbId = (env.DBID || env.CLOUDFLARE_D1_DATABASE_ID || "").trim();
    const token = (env.DBAPIToken || env.CLOUDFLARE_API_TOKEN || "").trim();

    if (!accountId || !dbId || !token) {
      return Response.json(
        { success: false, error: "D1 database is not configured in Cloudflare Pages." },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: `INSERT INTO app_state (key, data, updated_at)
                VALUES ('buildnknow_state', ?, ?)
                ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at;`,
          params: [payloadToStore, timestamp],
        }),
      }
    );

    const json: any = await res.json();
    if (!json.success) {
      const errMsg = json.errors?.map((e: any) => e.message).join(", ") || "D1 write failed";
      return Response.json({ success: false, error: errMsg }, { status: 500 });
    }

    return Response.json({ success: true, updatedAt: timestamp });
  } catch (err: any) {
    return Response.json(
      { success: false, error: err.message || "Invalid request payload" },
      { status: 400 }
    );
  }
};
