const fs=require('fs');
const N=8;
const cols=(tag,w=120)=>Array.from({length:N},(_,i)=>`<${tag} label="C${i}" width="${w}px"/>`).join('');
const cells=(tag,r,extra)=>Array.from({length:N},(_,i)=>`<${tag}>r${r}c${i}</${tag}>`).join('');
const rowsG=(n,nest)=>Array.from({length:n},(_,r)=>`<row>${cells('label',r).replace(/<label>/g,'<label>')}</row>`).join('');
function grid(cls,frozen,opts={}){
  const head=`${opts.aux?`<auxhead><auxheader label="AUX" colspan="3"/><auxheader label="REST" colspan="5"/></auxhead>`:''}`;
  let body='';
  if(opts.group){body=`<group label="G1"/>${rowsG(2)}<group label="G2"/>${rowsG(2)}`}
  else if(opts.colspan){body=`<row><label>wide</label><label>x</label>${Array.from({length:N-2},(_,i)=>`<label>c${i+2}</label>`).join('')}</row>`.replace('<label>wide</label><label>x</label>',`<cell colspan="2"><label>colspan2</label></cell>`)+rowsG(3)}
  else if(opts.nested){body=`<row><cell><grid width="100px"><columns><column label="n"/></columns><rows><row><label>nested</label></row></rows></grid></cell>${Array.from({length:N-1},(_,i)=>`<label>c${i+1}</label>`).join('')}</row>`+rowsG(3)}
  else body=rowsG(5);
  return `<div sclass="b3 ${cls}" style="margin:20px"><grid sclass="${cls}" width="460px">${frozen}<columns>${head?'':''}${cols('column')}</columns>${opts.aux?'':''}<rows>${body}</rows></grid></div>`;
}
// auxhead must come after columns in ZK: <columns/><auxhead/>
function gridAux(cls,frozen){return `<div sclass="b3" style="margin:20px"><grid sclass="${cls}" width="460px">${frozen}<columns>${cols('column')}</columns><auxhead><auxheader label="AUX" colspan="3"/><auxheader label="REST" colspan="5"/></auxhead><rows>${rowsG(5)}</rows></grid></div>`}
function listbox(cls,frozen,check){return `<div style="margin:20px"><listbox sclass="${cls}" width="460px"${check?' checkmark="true" multiple="true"':''}>${frozen}<listhead>${cols('listheader')}</listhead>${Array.from({length:4},(_,r)=>`<listitem>${cells('listcell',r)}</listitem>`).join('')}</listbox></div>`}
function tree(cls,frozen){return `<div style="margin:20px"><tree sclass="${cls}" width="460px">${frozen}<treecols>${cols('treecol')}</treecols><treechildren>${Array.from({length:4},(_,r)=>`<treeitem><treerow>${cells('treecell',r)}</treerow></treeitem>`).join('')}</treechildren></tree></div>`}
const f=(n,s)=>`<frozen columns="${n}"${s!=null?` start="${s}"`:''}/>`;
const parts=[
 grid('t-g-f1',f(1)), grid('t-g-f3',f(3)), grid('t-g-grp',f(2),{group:1}), gridAux('t-g-aux',f(2)),
 grid('t-g-start1',f(2,1)), grid('t-g-colspan',f(2),{colspan:1}), grid('t-g-nested',f(2),{nested:1}), grid('t-g-none',''),
 listbox('t-lb-check',f(2),true), listbox('t-lb-f2',f(2)), listbox('t-lb-none',''),
 tree('t-tr-f2',f(2)), tree('t-tr-none','')
];
fs.writeFileSync('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/src/main/webapp/web/zz-b3-tmp.zul',`<?page title="b3 tmp"?>\n<zk>\n<div>\n${parts.join('\n')}\n</div>\n</zk>\n`);
