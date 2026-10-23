import { ESLint } from "eslint";

const eslint = new ESLint();
const results = await eslint.lintFiles(["src"]);
const hits = [];

for (const result of results) {
  for (const message of result.messages) {
    if (message.fatal || message.ruleId === "no-console") {
      const place = `${result.filePath}:${message.line ?? 1}:${message.column ?? 1}`;
      hits.push(`${place}  ${message.message}`);
    }
  }
}

if (hits.length > 0) {
  console.error(hits.join("\n"));
  console.error(`\n${hits.length} console or parse error(s) in src.`);
  process.exit(1);
}
