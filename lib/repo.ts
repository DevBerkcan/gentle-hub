import "server-only";
import type { Application, ApplicationInput } from "@/types";
import type { VaultBlob } from "@/lib/vault";
import { pool } from "@/lib/db";

export type StoredVault = { blob: VaultBlob; updatedAt: string; updatedBy: string | null };

type ApplicationRow = {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string | null;
  category: Application["category"];
  environment: Application["environment"] | null;
  notes: string;
  updated_at: Date;
  updated_by: string | null;
};

function toApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    url: row.url,
    icon: row.icon ?? undefined,
    category: row.category,
    environment: row.environment ?? undefined,
    notes: row.notes,
    updatedAt: row.updated_at.toISOString(),
    updatedBy: row.updated_by,
  };
}

export async function listApplications(): Promise<Application[]> {
  const { rows } = await pool.query<ApplicationRow>(
    "select * from applications order by lower(name), id"
  );
  return rows.map(toApplication);
}

export async function insertApplication(id: string, input: ApplicationInput, by: string): Promise<void> {
  await pool.query(
    `insert into applications (id, name, description, url, icon, category, environment, updated_by)
     values ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, input.name, input.description, input.url, input.icon ?? null, input.category, input.environment ?? null, by]
  );
}

/** Returns false when the application does not exist. */
export async function updateApplication(id: string, input: ApplicationInput, by: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    `update applications
        set name = $2, description = $3, url = $4, icon = $5, category = $6, environment = $7,
            updated_at = now(), updated_by = $8
      where id = $1`,
    [id, input.name, input.description, input.url, input.icon ?? null, input.category, input.environment ?? null, by]
  );
  return rowCount === 1;
}

export async function updateNotes(id: string, notes: string, by: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    "update applications set notes = $2, updated_at = now(), updated_by = $3 where id = $1",
    [id, notes, by]
  );
  return rowCount === 1;
}

/** Deletes the application; favorites go with it via ON DELETE CASCADE. */
export async function deleteApplication(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("delete from applications where id = $1", [id]);
  return rowCount === 1;
}

export async function listFavoriteIds(userId: string): Promise<string[]> {
  const { rows } = await pool.query<{ application_id: string }>(
    "select application_id from favorites where user_id = $1 order by created_at",
    [userId]
  );
  return rows.map((row) => row.application_id);
}

export async function setFavorite(userId: string, applicationId: string, favorite: boolean): Promise<void> {
  if (favorite) {
    await pool.query(
      `insert into favorites (user_id, application_id) values ($1, $2) on conflict do nothing`,
      [userId, applicationId]
    );
  } else {
    await pool.query("delete from favorites where user_id = $1 and application_id = $2", [userId, applicationId]);
  }
}

export async function getVault(): Promise<StoredVault | null> {
  const { rows } = await pool.query<{ blob: VaultBlob; updated_at: Date; updated_by: string | null }>(
    "select blob, updated_at, updated_by from vault where id = 1"
  );
  const row = rows[0];
  return row ? { blob: row.blob, updatedAt: row.updated_at.toISOString(), updatedBy: row.updated_by } : null;
}

/**
 * Stores the encrypted vault with optimistic concurrency: the write only
 * succeeds if nobody changed it since `expectedUpdatedAt` (null = must not exist yet).
 * Returns the new timestamp, or null on conflict.
 */
export async function saveVault(
  blob: VaultBlob,
  expectedUpdatedAt: string | null,
  by: string
): Promise<string | null> {
  const { rows } =
    expectedUpdatedAt === null
      ? await pool.query<{ updated_at: Date }>(
          `insert into vault (id, blob, updated_by) values (1, $1, $2)
           on conflict (id) do nothing returning updated_at`,
          [JSON.stringify(blob), by]
        )
      : await pool.query<{ updated_at: Date }>(
          `update vault set blob = $1, updated_at = now(), updated_by = $2
            where id = 1 and date_trunc('milliseconds', updated_at) = $3::timestamptz
            returning updated_at`,
          [JSON.stringify(blob), by, expectedUpdatedAt]
        );
  return rows[0] ? rows[0].updated_at.toISOString() : null;
}
