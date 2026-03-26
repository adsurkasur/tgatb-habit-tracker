const fs=require('fs');
const ts=require('typescript');
const file='app/[locale]/terms-of-service/page.tsx';
const src=fs.readFileSync(file,'utf8');
const sf=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const norm=s=>s.replace(/\s+/g,' ').trim();
function cand(t){return t.length>=3&&/[A-Za-z]/.test(t)&&!/^[\d\s\W_]+$/.test(t);}
function walk(n){if(ts.isJsxText(n)){const t=norm(n.text||'');if(cand(t))console.log(JSON.stringify(t));}ts.forEachChild(n,walk);}walk(sf);
