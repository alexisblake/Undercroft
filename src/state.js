/* Game state and saving (account save when available, else this browser). */
"use strict";
/* ---------- STATE ---------- */
const heroState=()=>({level:1,xp:0,pending:0,runs:0,wins:0,best:0,perks:{}});
function freshMeta(){const m={v:2,runs:0,wins:0,savedAt:0,depth:1,clears:0,heroes:{}};Object.keys(HEROES).forEach(k=>m.heroes[k]=heroState());return m;}
let meta=freshMeta();
const need=l=>12+(l-1)*8;
const hs=id=>meta.heroes[id]||(meta.heroes[id]=heroState());
const renown=()=>Object.keys(HEROES).reduce((a,k)=>a+hs(k).level-1,0);
const unlocked=id=>renown()>=HEROES[id].renown;
let S={screen:'home',tab:'play'}, run=null;

/* ---------- SAVING: account save when available, else this browser ---------- */
const SAVE_KEY='undercroft-save-v2', OLD_KEY='undercroft-save-v1';
let cloud=null;
function applySave(d){
  if(!d||typeof d!=='object')return;
  if(d.v===2){
    meta.runs=d.runs||0;meta.wins=d.wins||0;meta.savedAt=d.savedAt||0;meta.depth=Math.max(d.depth||1,d.nave?2:1);meta.clears=d.clears||0;
    Object.keys(HEROES).forEach(k=>{const src=(d.heroes||{})[k];const h=heroState();if(src){Object.assign(h,src);h.perks=Object.assign({},src.perks||{});}meta.heroes[k]=h;});
  }else if(d.level){ /* v1 save: one shared level. Hand it to the Runaway. */
    const h=hs('runaway'),p=d.perks||{},map={maxhp:'tougher',sharpen:'sharpen',fortify:'fortify',ember:'hearth',thorn:'hedge',healer:'medic'};
    h.level=d.level;h.xp=d.xp||0;h.pending=d.pending||0;
    Object.keys(map).forEach(k=>{if(p[k])h.perks[map[k]]=p[k];});
    meta.runs=d.runs||0;meta.wins=d.wins||0;meta.savedAt=d.savedAt||0;
  }
}
function save(){
  meta.savedAt=Date.now();
  const d=JSON.parse(JSON.stringify(meta));
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(d));}catch(e){}
  if(cloud&&!cloud.ro)cloud.ref.set(d).catch(err=>{if(err&&err.code==='invalid_argument'){cloud.ro=true;S.saveMode='local';}});
}
function loadLocal(){
  try{
    const r=localStorage.getItem(SAVE_KEY)||localStorage.getItem(OLD_KEY);
    if(r){applySave(JSON.parse(r));S.saveMode='local';}
  }catch(e){}
}
async function initCloud(){
  try{
    if(!window.claude||typeof window.claude.use!=='function')return;
    const [db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);
    if(!db||!user)return;
    const id=await user.id();if(!id)return;
    if((await user.can('data.write'))===false)return;
    const ref=db.doc('data/users/'+id+'/save');
    cloud={ref,ro:false};
    const snap=await ref.get();
    if(snap.exists){const d=snap.data();if((d.savedAt||0)>(meta.savedAt||0))applySave(d);if(d.v!==2)save();}
    else if(meta.runs>0){save();}
    S.saveMode='cloud';
    if(S.screen==='home'||S.screen==='end')render();
  }catch(e){}
}

