/**
 * One-off script to test Supabase credentials from .env.
 * Run: npx tsx scripts/test-supabase-credentials.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "files";

function main() {
  console.log("Testing Supabase credentials...\n");

  if (!url) {
    console.error("FAIL: SUPABASE_URL is missing");
    process.exit(1);
  }
  console.log("SUPABASE_URL: set (length", url.length, ")");

  if (!serviceRoleKey) {
    console.error("FAIL: SUPABASE_SERVICE_ROLE_KEY is missing");
    process.exit(1);
  }
  console.log(
    "SUPABASE_SERVICE_ROLE_KEY: set (length",
    serviceRoleKey.length,
    ")",
  );

  console.log("SUPABASE_STORAGE_BUCKET:", bucket || "(using default 'files')");
  console.log("");

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  (async () => {
    try {
      // 0) Raw reachability check (to see exact failure)
      console.log("Checking reachability to", url, "...");
      try {
        const res = await fetch(`${url}/rest/v1/`, {
          method: "HEAD",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        });
        console.log("Reachability: HTTP", res.status, res.statusText);
        if (res.status === 200)
          console.log("OK: Supabase project is reachable.\n");
      } catch (reachErr: unknown) {
        const e = reachErr as Error & { cause?: unknown };
        console.error("Reachability FAIL:", e.message);
        if (e.cause) console.error("  cause:", e.cause);
        console.error("\nPossible causes:");
        console.error(
          "  - Project paused (Supabase Dashboard → your project → Resume if paused)",
        );
        console.error("  - Network/firewall blocking supabase.co");
        console.error("  - VPN or DNS issues");
        process.exit(1);
      }

      // 1) List buckets (validates URL + service role)
      const { data: buckets, error: bucketsError } =
        await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error("FAIL listing buckets:", bucketsError.message);
        const err = bucketsError as Error & { cause?: unknown };
        if (err.cause) console.error("  cause:", err.cause);
        process.exit(1);
      }
      console.log("OK: Listed", buckets?.length ?? 0, "bucket(s)");
      const bucketNames = (buckets ?? []).map((b) => b.name);
      if (!bucketNames.includes(bucket)) {
        console.error(
          "FAIL: Bucket '" + bucket + "' not found. Available:",
          bucketNames.join(", ") || "(none)",
        );
        process.exit(1);
      }
      console.log("OK: Bucket '" + bucket + "' exists");

      // 2) List root of bucket (validates bucket access)
      const { data: files, error: listError } = await supabase.storage
        .from(bucket)
        .list("", { limit: 5 });
      if (listError) {
        console.error("FAIL listing bucket root:", listError.message);
        process.exit(1);
      }
      console.log(
        "OK: Can list bucket root (items:",
        (files ?? []).length,
        ")",
      );

      console.log(
        "\nAll checks passed. Credentials and bucket access are valid.",
      );
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("FAIL:", e.message);
      if (e.cause) console.error("  cause:", e.cause);
      process.exit(1);
    }
  })();
}

main();
