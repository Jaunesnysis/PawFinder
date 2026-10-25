import { ESLint } from "eslint";

const eslint = new ESLint({
  overrideConfigFile: "eslint.complexity.config.mjs",
});
const results = await eslint.lintFiles(["src/**/*.js", "server.js"]);

const rows = new Map();
for (const file of results) {
  const path = file.filePath
    .replace(process.cwd() + "/", "")
    .replaceAll("\\", "/");
  for (const m of file.messages) {
    const key = `${path}:${m.line}`;
    const row = rows.get(key) ?? {
      location: key,
      fn: "",
      cyclomatic: 0,
      cognitive: 0,
    };
    if (m.ruleId === "complexity") {
      row.cyclomatic = Number(m.message.match(/complexity of (\d+)/)?.[1] ?? 0);
      row.fn = m.message.split(" has a complexity")[0];
    } else if (m.ruleId === "sonarjs/cognitive-complexity") {
      row.cognitive = Number(m.message.match(/from (\d+) to/)?.[1] ?? 0);
    }
    rows.set(key, row);
  }
}

const min = Number(process.argv[2] ?? 1);
const sorted = [...rows.values()]
  .filter((r) => r.cyclomatic >= min || r.cognitive >= min)
  .sort((a, b) => b.cyclomatic - a.cyclomatic || b.cognitive - a.cognitive);

console.table(sorted);
