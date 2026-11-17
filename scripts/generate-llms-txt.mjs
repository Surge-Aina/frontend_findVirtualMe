import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveBackendApiFromProcess } from "../src/config/backendApi.js";
import { buildLlmsTxt } from "../src/config/llmsTxtContent.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const host = resolveBackendApiFromProcess();
writeFileSync(join(root, "public/llms.txt"), buildLlmsTxt(host), "utf8");