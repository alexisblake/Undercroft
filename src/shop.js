/* The shop. */
"use strict";
/* ---------- SHOP: spend Embers now, or bank them as XP ---------- */
function makeShop(){
  const p=rnd(Object.keys(PATRONS));
  const pm=v=>hasP('tight')?Math.ceil(v*1.5):v;
  const items=lootPick(3).map(k=>({id:k,cost:pm(CARDS[k].r==='r'?8:5)}));
  items.push({id:rnd(PATRONS[p].cards),cost:pm(9)});
  if((run.ultGot||0)<ULT_MAX&&Math.random()<.25)items.push({id:rnd(ULTS),cost:pm(14),ult:1});
  const tk=shuffle(Object.keys(TRINKETS).filter(k=>!run.trinkets.includes(k))).slice(0,2).map(k=>({id:k,cost:pm(TRINKET_COST)}));
  return {items,trinkets:tk,purge:pm(6),heal:pm(5),healAmt:8,forge:pm(6),purged:0,healed:0,forged:0};
}
function hasT(k){return run&&run.trinkets.includes(k);}
function healDoor(){const v=HEAL_DOOR+run.healBonus+(hasT('kettle')?3:0);return hasP('lean')?Math.ceil(v/2):v;}
function heldPatrons(){return new Set(run.deck.map(k=>CARDS[k]).filter(c=>c.t==='boon'&&c.p!=='duo').map(c=>c.p));}
function availDuos(p){const h=heldPatrons();return DUO.filter(k=>{const pr=CARDS[k].pair;return (!p||pr.includes(p))&&pr.every(x=>h.has(x))&&!run.deck.includes(k)&&!run.deck.includes(k+'+');});}
function buyT(i){const it=run.shop.trinkets[i];if(!it||it.sold||run.embers<it.cost||run.trinkets.length>=TRINKET_SLOTS)return;spend(it.cost);it.sold=1;run.trinkets.push(it.id);log('Took the '+TRINKETS[it.id].n+'.');render();}
function spend(n){run.embers-=n;run.spent+=n;}
function buy(i){const it=run.shop.items[i];if(!it||it.sold||run.embers<it.cost)return;if(it.ult){if((run.ultGot||0)>=ULT_MAX)return;run.ultGot=(run.ultGot||0)+1;}spend(it.cost);it.sold=1;run.deck.push(it.id);log('Bought '+CARDS[it.id].n+'.');render();}
function buyHeal(){const s=run.shop;if(s.healed||run.embers<s.heal)return;spend(s.heal);s.healed=1;const h=Math.min(s.healAmt,run.max-run.hp);run.hp+=h;log('Healed '+h+'.');render();}
function buyPurge(){const s=run.shop;if(s.purged||run.embers<s.purge)return;spend(s.purge);s.purged=1;run.reward={type:'purge',back:'shop'};S.screen='reward';render();}
function rollReward(){
  const t=rnd(['card','card','boon','boon','heal','purge','embers']);
  return t==='boon'?{type:'boon',p:rnd(Object.keys(PATRONS))}:{type:t};
}
function toDoors(){
  const next=PLAN[run.chamber];
  if(next==='B')run.doors=[{kind:'fight',tag:'B'}];
  else if(next==='m')run.doors=[{kind:'fight',tag:'m'}];
  else{
    const a=rollReward();let b=rollReward(),g=0;
    while(g++<20&&b.type===a.type&&b.p===a.p)b=rollReward();
    const ds=[{kind:'fight',reward:a},{kind:'fight',reward:b}];
    const roll=Math.random(),side=Math.random()<.5?0:1,other=1-side;
    if(run.chamber===4)ds[side]={kind:'shop'};
    else if(run.chamber>=2&&roll<.18)ds[side]={kind:'shop'};
    else if(roll<.27)ds[side]={kind:'well'};
    else if(roll<.47)ds[side]={kind:'event',ev:rnd(Object.keys(EVENTS))};
    if(run.chamber>=2&&run.chamber!==4&&ds[other].kind==='fight'&&Math.random()<.22)ds[other]={kind:'fight',elite:1};
    run.doors=ds;
  }
  run.doors.forEach(d=>{if(d.kind==='fight')d.mon=rnd(pool()[next]);});
  S.threshold=0;
  S.screen='doors';render();
}
function end(won){
  const h=hs(run.hero),r0=renown(),lv0=h.level;
  run.ultLeft=run.deck.filter(k=>CARDS[k].ult).length;run.embers+=run.ultLeft*5;
  run.xp=Math.round(run.embers*(1+run.heat*0.1));h.xp+=run.xp;
  if(won&&run.layer===4&&run.heat>0){const prev=h.heatBest||0;if(run.heat>prev){h.heatBest=run.heat;run.heatRecord=prev;run.newLooks=HEAT_LOOKS.filter(L=>L.req>prev&&L.req<=run.heat).map(L=>L.n);}}
  if(won){meta.wins++;h.wins++;}
  h.best=Math.max(h.best,(run.layer-1)*8+run.chamber-(won?0:1));
  while(h.xp>=need(h.level)){h.xp-=need(h.level);h.level++;h.pending++;}
  run.won=won;run.levels=h.level-lv0;
  h.wxp=Object.assign({},h.wxp||{});const Wp=WEAPONS[run.hero].find(w=>w.id===run.weapon),t0=tierOf(h.wxp[run.weapon]||0);
  h.wxp[run.weapon]=(h.wxp[run.weapon]||0)+run.xp;const t1=tierOf(h.wxp[run.weapon]);
  run.evolved=t1>t0?[Wp.forms[t0],Wp.forms[t1],t1===3?Wp.pass:null]:null;run.wgain=run.xp;
  run.newWeapons=WEAPONS[run.hero].filter((w,i)=>WUNLOCK[i]>lv0&&WUNLOCK[i]<=h.level).map(w=>w.forms[0]);
  run.unlocked=Object.values(HEROES).filter(x=>x.renown>r0&&x.renown<=renown()).map(x=>x.n);
  S.screen='end';S.perkOpts=null;save();render();
}
function perkChoices(){
  if(!S.perkOpts){const H=HEROES[run.hero],h=hs(run.hero);
    const av=Object.keys(H.perks).filter(k=>(h.perks[k]||0)<H.perks[k].max);
    S.perkOpts=shuffle(av).slice(0,3);}
  return S.perkOpts;
}
function takePerk(k){const h=hs(run.hero);h.perks[k]=(h.perks[k]||0)+1;h.pending--;S.perkOpts=null;save();render();}

