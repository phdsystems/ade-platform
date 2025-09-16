import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('ade.scaffoldPreview', async () => {
    try {
      const cfg = vscode.workspace.getConfiguration();
      const bin = cfg.get<string>('ade.coreBinaryPath', 'ade-core');
      const language = await qp('Language', ['python','node','go']);
      const fw = await qp('Framework', language==='python' ? ['fastapi'] : language==='node' ? ['express'] : ['fiber']);
      const service = await input('Service name');
      const domain = await input('Domain (e.g. finance)');
      const ws = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
      const args = ['scaffold', `--language=${language}`, `--framework=${fw}`, `--service=${service}`, `--domain=${domain}`, `--registry=${path.join(ws,'cli','config','stack-registry.json')}`, '--preview'];
      const out = await run(bin, args, { cwd: ws });
      const data = JSON.parse(out);
      const panel = vscode.window.createWebviewPanel('phdPreview', `Preview: ${domain}/${service}`, vscode.ViewColumn.Active, { enableScripts: true });
      panel.webview.html = `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
    } catch (e:any) { vscode.window.showErrorMessage(String(e?.message || e)); }
  });
  context.subscriptions.push(disposable);
}
async function qp(placeHolder:string, items:string[]): Promise<string> {
  const pick = await vscode.window.showQuickPick(items, { placeHolder }); if (!pick) throw new Error(`Select ${placeHolder}`); return pick;
}
async function input(prompt:string): Promise<string> {
  const v = await vscode.window.showInputBox({ prompt }); if(!v) throw new Error(`${prompt} required`); return v;
}
function run(cmd:string, args:string[], opts:{cwd:string}):Promise<string>{
  return new Promise((resolve,reject)=>{
    const p = spawn(cmd,args,{cwd:opts.cwd,shell:process.platform==='win32'});
    let stdout=''; let stderr='';
    p.stdout.on('data',d=>stdout+=d.toString());
    p.stderr.on('data',d=>stderr+=d.toString());
    p.on('close',c=> c===0 ? resolve(stdout) : reject(new Error(stderr||`exit ${c}`)));
    p.on('error',reject);
  });
}
function escapeHtml(s:string){ return s.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch] as string)); }
