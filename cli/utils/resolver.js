import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
import { mkdirp } from "mkdirp";
const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..", ".."); const CONFIG_DIR = path.join(ROOT, "cli", "config");
const TEMPLATES_DIR = path.join(ROOT, "cli", "templates");
function loadJSON(p){ return JSON.parse(fs.readFileSync(p,"utf-8")); }
function applyTokens(str,t){ return str.replace(/{(\w+)}/g,(_,k)=> (t[k]??`{${k}}`)); }
function writeFile(dest, content){ mkdirp.sync(path.dirname(dest)); fs.writeFileSync(dest, content); }
function copyRef(dest, ref){ const rel = ref.replace(/^TEMPLATE_REF::/,""); const abs = path.join(TEMPLATES_DIR, rel); writeFile(dest, fs.readFileSync(abs, "utf-8")); }
function parseArgs(){ return Object.fromEntries(process.argv.slice(2).map(a=>{const m=a.replace(/^--/,"").split("="); return [m[0], m[1] ?? true];})); }
function main(){
  const args = parseArgs();
  const language = args.language, framework = args.framework, serviceName = args.serviceName, domain = args.domain;
  if(!language||!framework||!serviceName||!domain){ console.error("Missing args"); process.exit(1); }
  const registry = loadJSON(path.join(CONFIG_DIR, "stack-registry.json"));
  const fw = registry.languages?.[language]?.frameworks?.[framework];
  if(!fw){ console.error(`framework not found: ${language}/${framework}`); process.exit(1); }
  const tokens = { serviceName, domain, port: (fw.deployment?.defaultPort ?? 8000) };
  const base = (registry.conventions?.domainLayout?.basePattern || "{domain}").replace("{domain}", domain);
  // ensure required domain subdirs
  for(const sub of (registry.conventions?.domainLayout?.requiredSubdirs || ["src","docs","tests","deploy"])) {
    mkdirp.sync(path.join(ROOT, base, sub));
  }
  for(const f of fw.scaffold.folders||[]){ mkdirp.sync(path.join(ROOT, base, applyTokens(f, tokens))); }
  for(const [destT, srcRef] of Object.entries(fw.scaffold.files||{})){
    const dest = path.join(ROOT, base, applyTokens(destT, tokens));
    if(String(srcRef).startsWith("TEMPLATE_REF::")) { copyRef(dest, String(srcRef)); } else { writeFile(dest, applyTokens(String(srcRef), tokens)); }
  }
  // basic CI workflow
  mkdirp.sync(path.join(ROOT, ".github", "workflows"));
  fs.writeFileSync(path.join(ROOT, ".github", "workflows", "monorepo-ci.yml"), MONO_CI, "utf-8");
  console.log(`Scaffolded ${language}/${framework} → ${base}/${serviceName}`);
}
const MONO_CI = `name: Monorepo CI
on: [pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: bash scripts/validate-domain-layout.sh
      - run: bash scripts/validate-best-practices.sh
`;
main();
