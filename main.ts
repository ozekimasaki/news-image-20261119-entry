import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The poster image ships beside this script. Resolve its location from the
// script's own path, so the program works from any working directory.
const here: string = dirname(fileURLToPath(import.meta.url));
const source: string = join(here, "entry.png");

if (!existsSync(source)) {
  throw new Error(`entry.png not found next to main.ts: ${source}`);
}

// The grader sets MAKEFUN_OUTPUT_DIR; fall back to /output when it is absent.
const outDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const target: string = join(outDir, "entry.png");

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);

// A partial or truncated copy must never pass silently: the bytes on disk
// have to match the shipped image exactly, or the run fails loudly. A size
// check alone could miss a same-length corruption, so compare digests.
const digest = (path: string): string =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
const wanted: string = digest(source);
const got: string = digest(target);
if (got !== wanted) {
  throw new Error(
    `copied entry.png digest ${got} does not match source ${wanted}; aborting`,
  );
}

console.log(`wrote ${target} (${statSync(target).size} bytes, sha256 ${got})`);
