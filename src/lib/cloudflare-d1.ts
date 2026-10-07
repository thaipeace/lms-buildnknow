function cleanEnv(val: string | undefined): string {
  if (!val) return "";
  return val.trim().replace(/^['"](.*)['"]$/, "$1").trim();
}

export function getD1Config() {
  const accountId = cleanEnv(
    process.env.CLOUDFLARE_ACCOUNT_ID || process.env.AccID || process.env.acc_id
  );
  const databaseId = cleanEnv(
    process.env.CLOUDFLARE_D1_DATABASE_ID || process.env.DBID || process.env.db_id
  );
  const apiToken = cleanEnv(
    process.env.CLOUDFLARE_API_TOKEN || process.env.DBAPIToken || process.env.db_api_token
  );

  const isConfigured = Boolean(accountId && databaseId && apiToken);
  return { accountId, databaseId, apiToken, isConfigured };
}

export interface D1QueryResponse<T = Record<string, unknown>> {
  result?: Array<{
    results?: T[];
    success?: boolean;
    meta?: Record<string, unknown>;
  }>;
  success: boolean;
  errors?: Array<{ code: number; message: string }>;
  messages?: string[];
}

export async function executeD1Query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null)[] = []
): Promise<{ success: boolean; data?: T[]; error?: string }> {
  const { accountId, databaseId, apiToken, isConfigured } = getD1Config();

  if (!isConfigured) {
    return {
      success: false,
      error: "Cloudflare D1 credentials are not fully configured in environment variables.",
    };
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql, params }),
        // Cloudflare API shouldn't be statically cached by Next.js
        cache: "no-store",
      }
    );

    const json = (await response.json()) as D1QueryResponse<T>;

    if (!response.ok || !json.success) {
      const errMsg =
        json.errors?.map((e) => e.message).join(", ") ||
        `Cloudflare D1 HTTP ${response.status}: ${response.statusText}`;
      return { success: false, error: errMsg };
    }

    const firstResult = json.result?.[0];
    return {
      success: true,
      data: (firstResult?.results as T[]) || [],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
