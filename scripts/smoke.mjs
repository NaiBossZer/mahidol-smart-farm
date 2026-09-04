import { existsSync, readFileSync } from "node:fs";
const files = ["index.html", "src/main.tsx", "vite.config.ts", "package.json"];
let failed = 0;
for (const file of files) { const ok = existsSync(file); console.log(`${ok ? "PASS" : "FAIL"} ${file}`); if (!ok) failed++; }
const packageText = readFileSync("package.json", "utf8");
for (const forbidden of ["@tanstack/react-start", "@tanstack/react-router", "@lovable.dev/vite-tanstack-config", "nitro"]) { const ok = !packageText.includes(forbidden); console.log(`${ok ? "PASS" : "FAIL"} no ${forbidden}`); if (!ok) failed++; }
console.log(`Smoke test: ${failed ? "FAIL" : "PASS"}`);
process.exitCode = failed ? 1 : 0;
