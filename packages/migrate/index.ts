import { SQL } from "bun";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

interface MigrationRecord {
  filename: string;
  id: number;
  applied_at: string;
}

async function ensureMigrationsTable(db: SQL): Promise<void> {
  await db`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         SERIAL PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP   NOT NULL DEFAULT NOW()
    )
  `;
}

async function getAppliedMigrations(db: SQL): Promise<Set<string>> {
  const rows = await db<MigrationRecord[]>`
    SELECT filename FROM _migrations ORDER BY id ASC
  `;
  return new Set(rows.map((r: MigrationRecord): string => r.filename));
}

async function runMigration(
  db: SQL,
  migrationsDir: string,
  filename: string,
): Promise<void> {
  const filepath: string = join(migrationsDir, filename);
  const sql: string = await readFile(filepath, "utf-8");

  await db.begin(async (tx: SQL): Promise<void> => {
    await tx.unsafe(sql);

    await tx`
      INSERT INTO _migrations (filename) VALUES (${filename})
    `;
  });
}

async function migrate(db: SQL, migrationsDir: string): Promise<void> {
  console.log("🔄 Running migrations...");

  await ensureMigrationsTable(db);

  const applied = await getAppliedMigrations(db);
  const files: string[] = await readdir(migrationsDir);

  const pending = files
    .filter((f: string): boolean => f.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b))
    .filter((f: string): boolean => !applied.has(f));

  if (pending.length === 0) {
    console.log("✅ No pending migrations.");
    return;
  }

  for (const filename of pending) {
    try {
      console.log(`  ▶ Applying: ${filename}`);
      await runMigration(db, migrationsDir, filename);
      console.log(`  ✔ Done: ${filename}`);
    } catch (err) {
      console.error(`  ✖ Failed: ${filename}`);
      throw err;
    }
  }

  console.log(`✅ ${pending.length} migration(s) applied.`);
}

export { migrate };
export type { MigrationRecord };
