import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIR = path.join(ROOT, "migrations");
const FORBIDDEN = /\b(DROP\s+(TABLE|DATABASE|SCHEMA|COLUMN)|TRUNCATE|DELETE\s+FROM)\b/i;

function connectionString() {
  const envPath = path.join(ROOT, ".env.local");
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv) return fromEnv;
  if (!fs.existsSync(envPath))
    throw new Error("No DATABASE_URL and no .env.local to read it from.");
  const match = fs.readFileSync(envPath, "utf8").match(/^DATABASE_URL\s*=\s*(.+)$/m);
  if (!match) throw new Error("No DATABASE_URL in .env.local.");
  return match[1].trim().replace(/^["']|["']$/g, "");
}

function statements(sqlText) {
  const out = [];
  let buf = "";
  let i = 0;

  while (i < sqlText.length) {
    const rest = sqlText.slice(i);

    if (rest.startsWith("--")) {
      const nl = sqlText.indexOf("\n", i);
      i = nl === -1 ? sqlText.length : nl;
      continue;
    }

    if (rest.startsWith("/*")) {
      const close = sqlText.indexOf("*/", i + 2);
      i = close === -1 ? sqlText.length : close + 2;
      continue;
    }

    const dollar = rest.match(/^\$[A-Za-z_]*\$/);
    if (dollar) {
      const tag = dollar[0];
      const close = sqlText.indexOf(tag, i + tag.length);
      const end = close === -1 ? sqlText.length : close + tag.length;
      buf += sqlText.slice(i, end);
      i = end;
      continue;
    }

    if (rest[0] === "'") {
      let j = i + 1;
      while (j < sqlText.length) {
        if (sqlText[j] === "'" && sqlText[j + 1] === "'") j += 2;
        else if (sqlText[j] === "'") break;
        else j += 1;
      }
      buf += sqlText.slice(i, j + 1);
      i = j + 1;
      continue;
    }

    if (rest[0] === ";") {
      if (buf.trim()) out.push(buf.trim());
      buf = "";
      i += 1;
      continue;
    }

    buf += sqlText[i];
    i += 1;
  }

  if (buf.trim()) out.push(buf.trim());
  return out;
}
function declares(sqlText) {
  const cols = [];
  const re = /ALTER TABLE\s+(\w+)([\s\S]*?);/gi;
  let m;
  while ((m = re.exec(sqlText))) {
    const table = m[1];
    for (const c of m[2].matchAll(/ADD COLUMN IF NOT EXISTS\s+(\w+)/gi)) {
      cols.push({ table, column: c[1] });
    }
  }
  return cols;
}

function resolveFile(name) {
  const direct = path.join(DIR, name.endsWith(".sql") ? name : `${name}.sql`);
  if (fs.existsSync(direct)) return direct;
  const suffixed = path.join(DIR, `${name}_migration.sql`);
  if (fs.existsSync(suffixed)) return suffixed;
  throw new Error(`No migration matching "${name}" in migrations/.`);
}

async function appliedState(sql, file) {
  const cols = declares(fs.readFileSync(file, "utf8"));
  if (cols.length === 0) return "unknown (adds no columns)";
  let present = 0;
  for (const { table, column } of cols) {
    const rows = await sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = ${table} AND column_name = ${column} LIMIT 1`;
    if (rows.length) present += 1;
  }
  if (present === cols.length) return "applied";
  if (present === 0) return "pending";
  return `partial (${present}/${cols.length})`;
}

async function apply(sql, file) {
  const text = fs.readFileSync(file, "utf8");
  const parts = statements(text);
  const blocked = parts.find((s) => FORBIDDEN.test(s));
  if (blocked) {
    throw new Error(`Refusing ${path.basename(file)}: it contains "${blocked.slice(0, 60)}…"`);
  }
  for (const statement of parts) {
    await sql.query(statement);
  }
  return parts.length;
}

const args = process.argv.slice(2);
const sql = neon(connectionString());
const files = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (args.length === 0 || args[0] === "--list") {
  for (const f of files) {
    const state = await appliedState(sql, path.join(DIR, f));
    console.log(`${state.padEnd(22)} ${f}`);
  }
  process.exit(0);
}

const targets =
  args[0] === "--pending"
    ? (
        await Promise.all(
          files.map(async (f) => {
            const state = await appliedState(sql, path.join(DIR, f));
            return state === "pending" || state.startsWith("partial") ? path.join(DIR, f) : null;
          })
        )
      ).filter(Boolean)
    : args.map(resolveFile);

if (targets.length === 0) {
  console.log("Nothing pending.");
  process.exit(0);
}

for (const file of targets) {
  const count = await apply(sql, file);
  const state = await appliedState(sql, file);
  console.log(`${path.basename(file)}: ran ${count} statements -> ${state}`);
}
