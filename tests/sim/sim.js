/* Undercroft balance simulator. Loaded after the real game scripts (everything but input.js and boot.js), so it
   always plays by the current rules. A greedy bot plays whole runs; run_sim.py collects the results.
   The bot plans each card by trying every play order on a copy of the fight, then scores the enemy's reply. */
"use strict";
/* ---------- Seeded randomness, so a run set can be repeated exactly ---------- */
function seedRng(s){s=s>>>0;Math.random=function(){s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}

/* ---------- Headless hooks: no drawing, no saving, and a dry-run mode for planning ---------- */
let EVAL=0,EV_DEAD=0,EV_LOST=0;
const realWin=win,realLose=loseFight;
win=function(){if(EVAL){EV_DEAD=1;return;}return realWin();};
loseFight=function(){if(EVAL){EV_LOST=1;return;}return realLose();};
render=function(){};
save=function(){};

/* ---------- How good a card is, for picking rewards, shop buys, upgrades and purges ---------- */
function cval(k){
  const c=CARDS[k];if(!c)return 0;if(c.t==='curse')return -10;
  const hits=c.hits||1;let v=0;
  if(c.dmg)v+=c.dmg*hits;
  if(c.bs)v+=(c.bs[0]+c.bs[1]*2)/3;
  if(c.fin)v+=(c.fin[0]+c.fin[1])/2;
  if(c.ifa)v+=(c.ifa[0]+c.ifa[1]*2)/3;
  if(c.tb)v+=c.tb[0]+c.tb[1]*1.5;
  if(c.slam!=null)v+=5+c.slam;
  if(c.stoke)v+=c.stoke*2.5;
  if(c.blk)v+=c.blk*0.8;
  if(c.grow)v+=(c.grow[0]+c.grow[1]*1.5)*0.8;
  if(c.heal)v+=c.heal*(c.consume?1.5:0.6);
  if(c.str)v+=c.str*3;
  if(c.thorns)v+=c.thorns*2.5;
  if(c.burn)v+=c.burn*1.5;
  if(c.weak)v+=c.weak*1.5;
  if(c.exp)v+=c.exp*1.5;
  if(c.draw)v+=c.draw*2;
  if(c.extra)v+=c.extra*3;
  if(c.stun)v+=5;
  if(c.ctr)v+=c.ctr*0.5;
  if(c.focus)v+=4;
  if(c.fan)v+=4;
  if(c.hedge||c.fever||c.iron||c.press)v+=2;
  if(c.forge||c.vines)v+=3;
  if(c.steal)v+=c.steal;
  const cost=c.cost==null?1:c.cost;v=cost===0?v+2:v/cost;
  if(c.ret)v+=1;
  return v;
}
const playable=()=>run.deck.filter(k=>!isCurse(k));
const deckAvg=()=>{const d=playable();return d.reduce((a,k)=>a+cval(k),0)/Math.max(1,d.length);};
const worstIdx=()=>{let w=-1,wv=1e9;run.deck.forEach((k,i)=>{const v=cval(k);if(v<wv){wv=v;w=i;}});return w;};
const bestBy=(arr,f)=>arr.reduce((b,x)=>(b==null||f(x)>f(b))?x:b,null);
const TRINKET_PREF=['whet','mail','kettle','tinder','coin','map'];

/* ---------- Fights: plan the best card to play next ---------- */
const bigFight=m=>!!(m.boss||m.mini||m.elite);
/* Floor 4 Glamour hides the intent on even turns: then the bot weighs every move the enemy might make. */
const hidden=s=>s.layer===4&&s.fight.turn%2===0;
function leafScore(s,path,E0,H0){
  const m=s.fight.m;
  if(!hidden(s)||s._dead||s._lost)return leafScore1(s,path,E0,H0,m.i[m.idx%m.i.length]);
  return m.i.reduce((a,it)=>a+leafScore1(s,path,E0,H0,it),0)/m.i.length;
}
function leafScore1(s,path,E0,H0,intent){
  const f=s.fight,m=f.m;
  let pen=0;
  for(const id of path){const c=CARDS[id];if(c.consume&&!bigFight(m)&&s.hp>s.max*0.4)pen+=c.ult?12:6;}
  if(s._lost)return -1e6;
  if(s._dead)return 1e5+s.hp*10-pen;
  /* Predict the enemy's turn, in the same order endTurn() resolves it. */
  let hp=s.hp,ehp=m.hp,blk=f.blk;
  hp-=f.hand.reduce((a,k)=>a+(CARDS[k].sting||0),0);
  let [k,v]=intent;
  if(m.stun)k='none';
  if(k==='m'){const L=f.last;if(L&&L.dmg>0){k='a';v=L.dmg;}else if(L&&L.blk>0){k='b';v=L.blk;}else k='a';}
  if(k==='x'){k='a';v=4;}
  if(k==='a'){
    const d=atkVal(m,v),n=m.hits||1;
    for(let h=0;h<n;h++){const a=Math.min(blk,d);blk-=a;hp-=d-a;if(f.thorns)ehp-=f.thorns+(f.iron?f.str:0);}
    if(f.ctr)ehp-=f.ctr;
  }else if(k==='b'){if(s.wp.gbDmg)ehp-=Math.min(v,s.wp.gbreak||0);}
  else if(k==='h')ehp=Math.min(m.max,ehp+v);
  if(m.burn>0)ehp-=m.burn*(f.fever&&m.exp>0?2:1);
  if(s.layer===3&&f.turn%3===0){hp-=3;ehp-=3;}
  if(hp<=0)return -1e5+hp-pen;
  if(ehp<=0)return 5e4+hp*10-pen;
  const wh=1.3+2*(1-hp/s.max);
  let sc=(E0-ehp)-(H0-hp)*wh-pen;
  const long=ehp>8?1:0.3;
  sc+=f.str*2.5*long+f.thorns*1.5*long+Math.max(0,m.burn-1)*1.5+(m.weak>1?(m.weak-1)*1.5:0)+(m.exp>1?(m.exp-1)*1.2:0)+(f.focus?3:0);
  if(m.keepBlk)sc-=m.blk*0.5;
  return sc;
}
const LEAF_CAP=500;
function planNext(){
  const real=run,E0=real.fight.m.hp,H0=real.hp;
  let best=null,bestS=-Infinity,leaves=0;
  const rec=(st,path)=>{
    leaves++;
    run=st;const sc=leafScore(st,path,E0,H0);
    if(sc>bestS){bestS=sc;best=path[0]||null;}
    if(st._dead||st._lost||leaves>LEAF_CAP)return;
    const f=st.fight;
    const tried=new Set();
    for(let i=0;i<f.hand.length;i++){
      const id=f.hand[i],c=CARDS[id],cost=c.cost==null?1:c.cost;
      if(c.unp||f.plays<cost||tried.has(id))continue;tried.add(id);
      const nx=structuredClone(st);run=nx;EV_DEAD=0;EV_LOST=0;play(i);nx._dead=EV_DEAD;nx._lost=EV_LOST;
      path.push(id);rec(nx,path);path.pop();
      if(leaves>LEAF_CAP)break;
    }
  };
  EVAL=1;
  try{const root=structuredClone(real);shuffle(root.fight.draw);rec(root,[]);}
  finally{run=real;EVAL=0;EV_DEAD=0;EV_LOST=0;}
  return best;
}
/* The simple bot: no lookahead. Block when the shown attack would get through, otherwise hit hardest. */
function simpleNext(){
  const f=run.fight,m=f.m,[k,v]=m.i[m.idx%m.i.length];
  const ok=f.hand.filter(id=>{const c=CARDS[id];return !c.unp&&f.plays>=(c.cost==null?1:c.cost);});
  if(!ok.length)return null;
  const inc=(!hidden(run)&&(k==='a'||k==='m')&&!m.stun)?atkVal(m,v)*(m.hits||1):0;
  const blk=id=>{const c=CARDS[id];return (c.blk||0)+(c.grow?c.grow[0]+c.grow[1]*f.thorns:0);};
  const dmg=id=>{const c=CARDS[id];return (c.dmg||0)*(c.hits||1)+(c.bs?c.bs[m.blk>0?0:1]:0)+(c.fin?c.fin[m.hp<=m.max/2?1:0]:0)+(c.tb?c.tb[0]+c.tb[1]*f.thorns:0)+(c.slam!=null?f.blk+c.slam:0)+(c.ifa?c.ifa[1]:0)+(c.stoke?m.burn*c.stoke:0);};
  if(inc>f.blk&&(!f.blocked||run.hp<run.max*0.4)){const b=bestBy(ok.filter(id=>blk(id)>0),blk);if(b){f.blocked=1;return b;}}
  return bestBy(ok,id=>dmg(id)*2+cval(id));
}
let BOT='smart';
const MAX_TURNS=60; /* a fight this long counts as a loss (the bot can't break through) */
function fightStep(){
  const id=BOT==='simple'?simpleNext():planNext();
  if(id==null){run.fight.blocked=0;if(run.fight.turn>=MAX_TURNS){run.stalled=1;run.hp=0;loseFight();return;}endTurn();return;}
  const f=run.fight,used=()=>f.hand.join()+'|'+(f.disc.length+f.exh.length+f.draw.length),n=used();play(f.hand.indexOf(id));
  if(S.screen==='fight'&&run.fight===f&&used()===n){f.blocked=0;endTurn();} /* the game refused the card */
}

/* ---------- Between fights ---------- */
function doorScore(d){
  const miss=run.max-run.hp,frac=run.hp/run.max;
  if(d.kind==='well')return Math.min(7,miss)*0.8+3;
  if(d.kind==='shop')return 3+run.embers/3+(frac<0.5?3:0);
  if(d.kind==='purge2')return 4;
  if(d.kind==='event')return 4;
  if(d.elite)return frac>0.65?6:-5;
  const r=d.reward;if(!r)return 0;
  return r.type==='heal'?Math.min(healDoor(),miss)*0.8:r.type==='boon'?4:r.type==='card'?3:r.type==='purge'?2.5:2;
}
function doReward(){
  const r=run.reward;
  if(!r){afterReward();return;}
  if(r.type==='card'||r.type==='boon'){
    const k=bestBy(r.opts||[],cval),bar=deckAvg()*(r.type==='boon'?0.9:1);
    if(k&&cval(k)>bar)takeCard(k);else afterReward();
  }else if(r.type==='purge'){
    const w=worstIdx();
    if(w>=0&&(r.left||r.back||cval(run.deck[w])<deckAvg()*0.8))purge(w);else afterReward();
  }else if(r.type==='upgrade'){
    let bi=-1,bg=-1e9;run.deck.forEach((k,i)=>{if(canUp(k)){const g=cval(k+'+')-cval(k);if(g>bg){bg=g;bi=i;}}});
    if(bi>=0){run.deck[bi]+='+';}afterReward();
  }else if(r.type==='dup'){
    const i=run.deck.indexOf(bestBy(playable(),cval));if(i>=0)run.deck.push(run.deck[i]);afterReward();
  }else if(r.type==='elite'){
    const t=run.trinkets.length<TRINKET_SLOTS?bestBy(r.opts,k=>-TRINKET_PREF.indexOf(k)):null;
    if(r.ult&&(!t||['coin','map'].includes(t))){run.deck.push(r.ult);run.ultGot=(run.ultGot||0)+1;afterReward();}
    else if(t){run.trinkets.push(t);afterReward();}
    else{run.reward={type:'upgrade'};doReward();}
  }else afterReward();
}
function doShop(){
  const s=run.shop;
  for(let guard=0;guard<20;guard++){
    if(S.screen!=='shop')return;
    if(!s.healed&&run.hp<run.max*0.5&&run.embers>=s.heal){buyHeal();continue;}
    if(!s.purged&&run.embers>=s.purge&&run.deck.some(isCurse)){buyPurge();return;}
    const t=s.trinkets.filter(x=>!x.sold&&run.embers>=x.cost).sort((a,b)=>TRINKET_PREF.indexOf(a.id)-TRINKET_PREF.indexOf(b.id))[0];
    if(t&&run.trinkets.length<TRINKET_SLOTS){buyT(s.trinkets.indexOf(t));continue;}
    const bar=deckAvg(),c=s.items.filter(x=>!x.sold&&run.embers>=x.cost&&cval(x.id)>bar).sort((a,b)=>cval(b.id)-cval(a.id))[0];
    if(c){buy(s.items.indexOf(c));continue;}
    if(!s.forged&&run.embers>=s.forge&&run.deck.some(canUp)){spend(s.forge);s.forged=1;run.reward={type:'upgrade',back:'shop'};S.screen='reward';return;}
    if(!s.purged&&run.embers>=s.purge&&cval(run.deck[worstIdx()])<deckAvg()*0.8){buyPurge();return;}
    if(!s.healed&&run.hp<run.max*0.8&&run.embers>=s.heal){buyHeal();continue;}
    break;
  }
  toDoors();
}
function doEvent(){
  const e=run.event;
  if(e.result){if(e.after){const r=e.after;e.after=null;toReward(r);}else toDoors();return;}
  const E=EVENTS[e.id],ok=i=>!E.opts[i].can||E.opts[i].can(),frac=run.hp/run.max;
  const pick={
    statue:()=>run.hp>15&&frac>0.5&&ok(0)?0:1,
    hoard:()=>1,
    anvil:()=>ok(0)?0:1,
    skull:()=>run.hp>14?0:1,
    pool:()=>frac<0.6?1:0,
    candle:()=>ok(0)?0:(frac<0.7&&ok(1)?1:2),
  }[e.id];
  E.opts[pick?pick():E.opts.length-1].go();
}
function step(){
  const sc=S.screen;
  if(sc==='fight')fightStep();
  else if(sc==='reward')doReward();
  else if(sc==='doors')enter(bestBy(run.doors,doorScore));
  else if(sc==='shop')doShop();
  else if(sc==='well')toDoors();
  else if(sc==='event')doEvent();
  else throw new Error('sim: unknown screen '+sc);
}

/* ---------- A maxed hero: every perk at max, the chosen weapon in its final form ---------- */
/* fresh=true: no perks and the weapon's first form (still level 6, so every line can be equipped).
   pacts: Heat Pacts to run with (they need one earlier clear, so that is set too). */
function prepHero(hero,weapon,fresh,pacts){
  meta=freshMeta();meta.depth=4;
  const h=hs(hero),H=HEROES[hero];
  h.level=fresh?6:20;h.weapon=weapon;h.wxp={[weapon]:fresh?0:WTIER[3]};
  if(!fresh)for(const k in H.perks)h.perks[k]=H.perks[k].max;
  if(pacts&&pacts.length){meta.clears=1;h.pacts=pacts.slice();}
}
let EXTRA=[]; /* cards added to the starting deck, for testing one card's strength */
function playRun(hero){
  S={screen:'home',tab:'play'};
  startRun(hero);
  for(const k of EXTRA){run.deck.push(k);run.fight.draw.push(k);}if(EXTRA.length)shuffle(run.fight.draw);
  let n=0;
  while(S.screen!=='end'){if(++n>20000)throw new Error('sim: run did not finish');step();}
  const m=run.fight&&run.fight.m;
  return {won:!!run.amulet,stalled:!!run.stalled,layer:run.layer,chamber:run.chamber,killer:run.won?null:(m?m.id:null),hp:run.hp,deck:run.deck.length,heat:run.heat};
}
function simRun(hero,weapon,fresh,pacts){prepHero(hero,weapon,fresh,pacts);return playRun(hero);}
function simBatch(hero,weapon,n,bot,fresh,pacts,extra){BOT=bot||'smart';EXTRA=extra||[];const out=[];for(let i=0;i<n;i++)out.push(simRun(hero,weapon,fresh,pacts));return out;}

/* ---------- Campaign: one save from scratch, run after run, levelling and picking perks like a player ---------- */
const perkRank=p=>p.hp?4:p.swap?3:p.add?2:p.open?2:1;
function simCampaign(hero,weapon,runs,bot){
  BOT=bot||'smart';meta=freshMeta();
  const h=hs(hero),H=HEROES[hero],total=Object.values(H.perks).reduce((a,p)=>a+p.max,0);h.weapon=weapon;
  const out=[];
  for(let i=1;i<=runs;i++){
    const perks=Object.values(h.perks).reduce((a,n)=>a+n,0),wt=tierOf(wxp(hero,curWeapon(hero).id));
    const r=playRun(hero);r.i=i;r.perks=perks/total;r.tier=wt;r.level=h.level;out.push(r);
    for(let g=0;h.pending>0&&g<50;g++){const ch=perkChoices();if(!ch.length){h.pending=0;break;}takePerk(bestBy(ch,k=>perkRank(H.perks[k])));}
  }
  return out;
}
