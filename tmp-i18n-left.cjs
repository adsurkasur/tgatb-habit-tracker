const fs=require('fs');
const path=require('path');
const ts=require('typescript');
const ROOT=process.cwd();
const TARGET_DIRS=['app','components'];
const IGNORED=[/^app\/terms-of-service\//,/^app\/privacy-policy\//,/^components\/ui\//,/^app\/providers\.tsx$/,/^app\/layout\.tsx$/,/^app\/globals\.css\.d\.ts$/];
function walk(dir,out=[]){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p,out);else if(e.name.endsWith('.tsx'))out.push(p);}return out;}
const norm=s=>s.replace(/\s+/g,' ').trim();
const cand=t=>t.length>=3&&/[A-Za-z]/.test(t)&&!/^[\d\s\W_]+$/.test(t);
const by=[];
for(const d of TARGET_DIRS){for(const f of walk(path.join(ROOT,d))){const rel=path.relative(ROOT,f).replace(/\\/g,'/');if(IGNORED.some(r=>r.test(rel)))continue;const src=fs.readFileSync(f,'utf8');const sf=ts.createSourceFile(f,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let c=0;function visit(n){if(ts.isJsxText(n)){const t=norm(n.text||'');if(cand(t))c++;}ts.forEachChild(n,visit);}visit(sf);if(c>0)by.push([rel,c]);}}
by.sort((a,b)=>b[1]-a[1]);
console.log(by.map(x=>x[1]+'\t'+x[0]).join('\n'));
