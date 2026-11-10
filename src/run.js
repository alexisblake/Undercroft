/* Run flow: doors, fights, enemy turns, winning and losing. */
"use strict";
/* ---------- RUN FLOW ---------- */
function startRun(id){
  if(!HEROES[id]||!unlocked(id))return;
  const pacts=heatOpen()?(hs(id).pacts||[]).filter(k=>PACTS.some(p=>p.id===k)):[];
  const H=HEROES[id],h=hs(id),Wp=curWeapon(id),wt=Math.max(0,tierOf(wxp(id,Wp.id))-(pacts.includes('bare')?1:0)),c=Object.assign({},H.deck);
  if(pacts.includes('cursed'))c.fleas=(c.fleas||0)+2;
  for(const k in Wp.kits[wt])c[k]=(c[k]||0)+Wp.kits[wt][k];
  let hp=H.hp,heal=0,open=0;
  for(const k in h.perks){
    const n=h.perks[k],p=H.perks[k];if(!n||!p)continue;
    if(p.swap){const m=Math.min(n,c[p.swap[0]]||0);c[p.swap[0]]-=m;c[p.swap[1]]=(c[p.swap[1]]||0)+m;}
    if(p.add)c[p.add]=(c[p.add]||0)+n;
    if(p.hp)hp+=p.hp*n;
    if(p.heal)heal+=p.heal*n;
    if(p.open)open+=p.open*n;
  }
  const deck=[];for(const k in c)for(let i=0;i<c[k];i++)deck.push(k);
  const wp=wt===3?Wp.pass:{};
  run={hero:id,weapon:Wp.id,wtier:wt,wp,hp,max:hp,hand:H.hand+(wp.hand||0),open,healBonus:heal,deck,trinkets:[],pacts,heat:pactHeat(pacts),layer:1,cap:meta.depth,chamber:0,embers:0,spent:0,log:[],fight:null,reward:null,doors:null,shop:null};
  meta.runs++;h.runs++;
  enter({kind:'fight',reward:{type:'boon',p:rnd(Object.keys(PATRONS))}});
}
function log(s){run.log.push(s);if(run.log.length>3)run.log.shift()}
function enter(door){
  if(!door.th)run.chamber++;
  const tier=PLAN[Math.max(0,run.chamber-1)];
  run.reward=door.reward||null;
  if(door.kind==='purge2'){run.reward={type:'purge',left:2};S.screen='reward';render();return;}
  if(door.kind==='shop'){run.shop=makeShop();run.log=[];S.screen='shop';render();return;}
  if(door.kind==='well'){
    const h=Math.min(hasP('lean')?3:7,run.max-run.hp);run.hp+=h;
    run.log=[];log('A quiet well. You drink and heal '+h+'.');
    S.screen='well';render();return;
  }
  if(door.kind==='event'){run.event={id:door.ev,result:''};S.screen='event';render();return;}
  const id=door.mon||rnd(pool()[tier]), m=MON[id];
  run.fight={m:{id,...m,max:m.hp,hp:m.hp,blk:0,burn:0,str:0,idx:0,rage:0,weak:0,exp:0},
    draw:shuffle(run.deck.slice()),disc:[],hand:[],plays:PLAYS,blk:0,thorns:0,focus:0,ctr:0,turn:0,str:0,pweak:0};
  const F=run.fight;F.exh=[];
  if(door.elite){F.m.hp=F.m.max=Math.round(F.m.hp*1.6);F.m.str+=2;F.m.n='Elite '+F.m.n;F.m.elite=1;}
  if(hpMul(F.m)>1)F.m.hp=F.m.max=Math.round(F.m.max*hpMul(F.m));
  if(hasP('swift'))F.m.str+=1;
  if(hasT('tinder'))F.m.burn+=2;
  if(hasT('mail'))F.thorns+=1;
  if(hasT('whet'))F.whet=1;
  if(run.wp.oath)F.oath=run.wp.oath;
  if(run.wp.strangle)F.m.weak+=run.wp.strangle;
  if(run.wp.burnStart)F.m.burn+=run.wp.burnStart;
  if(run.wp.reach){F.m.hp-=run.wp.reach;log(weaponName(run.hero)+' strikes first for '+run.wp.reach+'.');}
  run.log=[];log(m.n+' blocks the way.');
  if(run.chamber===1&&LAYERS[run.layer].rule)log(LAYERS[run.layer].rule);
  if(m.duel)log('The Fairy King accepts your challenge. A duel for the Duke\u2019s amulet!');
  startTurn();S.screen='fight';render();
}
function drawN(n){
  const f=run.fight;
  for(let i=0;i<n;i++){
    if(!f.draw.length){if(!f.disc.length)break;f.draw=shuffle(f.disc);f.disc=[];}
    f.hand.push(f.draw.pop());
  }
}
function startTurn(){const f=run.fight;f.turn++;f.plays=PLAYS+(run.wp.quick&&f.turn<=2?1:0)+(run.wp.quick1&&f.turn===1?1:0);f.blk=run.wp.orbit||0;f.ctr=0;drawN(Math.max(0,run.hand-f.hand.length)+(f.turn===1?run.open:0));}
function hit(n){
  const f=run.fight,m=f.m;
  if(n<=0)return 0;
  if(f.whet){n+=3;f.whet=0;}
  if(f.oath){n+=f.oath;f.oath=0;}
  n+=f.str+(m.exp>0?2:0);
  if(f.focus){n*=2;f.focus=0;}
  if(f.pweak>0)n=Math.floor(n/2);
  const a=Math.min(m.blk,n);m.blk-=a;m.hp-=(n-a);if(n-a>0)S.hitFoe=1;
  if(m.spikes)run.hp-=m.spikes;
  return n-a;
}
function play(i){
  const f=run.fight;if(!f||S.lock||S.dying)return;
  const id=f.hand[i],c=CARDS[id],cost=c.cost==null?1:c.cost;if(f.plays<cost||c.unp)return;f.plays-=cost;
  const wasExposed=f.m.exp>0,fhp0=f.m.hp,php0=run.hp;
  f.hand.splice(i,1);f.disc.push(id);
  const bits=[];
  if(c.blk){f.blk+=c.blk;bits.push('block '+c.blk);}
  if(c.grow){const b=c.grow[0]+c.grow[1]*f.thorns;f.blk+=b;bits.push('block '+b);}
  if(c.heal){const h=Math.min(c.heal,run.max-run.hp);run.hp+=h;bits.push('heal '+h);}
  const hp0=f.m.hp;
  if(c.dmg){let t=0;const nh=(c.hits||1)+(run.wp.extraHit&&(c.hits||1)>1?1:0);for(let h=0;h<nh;h++)t+=hit(c.dmg);bits.push('hit for '+t);}
  if(c.bs){bits.push('hit for '+hit(f.m.blk>0?c.bs[0]:c.bs[1]));}
  if(c.tb){bits.push('hit for '+hit(c.tb[0]+c.tb[1]*f.thorns));}
  if(c.consume){const di=run.deck.indexOf(id);if(di>=0)run.deck.splice(di,1);bits.push('consumed');}
  if(c.steal){const st=Math.min(Math.max(0,fhp0-f.m.hp),c.steal,run.max-run.hp);if(st>0){run.hp+=st;bits.push('steal '+st);}}
  if(c.stun){f.m.stun=1;bits.push('stunned');}
  if(c.slam!=null){bits.push('hit for '+hit(f.blk+c.slam));}
  if(c.ifa){const ik=f.m.i[f.m.idx%f.m.i.length][0];bits.push('hit for '+hit((ik==='a'||ik==='m')?c.ifa[1]:c.ifa[0]));}
  if(run.wp.venom&&(c.hits||1)>1){f.m.exp+=run.wp.venom;bits.push(run.wp.venom+' Exposed');}
  if(run.wp.bulwark&&(c.blk||c.grow)){f.blk+=run.wp.bulwark;}
  if(c.fin){bits.push('hit for '+hit(f.m.hp<=f.m.max/2?c.fin[1]:c.fin[0]));}
  if(c.stoke){bits.push('hit for '+hit(f.m.burn*c.stoke));}
  if(c.ex){f.disc.pop();f.exh.push(id);bits.push('exhausted');}
  if(c.burn){f.m.burn+=c.burn;bits.push(c.burn+' Burn');}
  if(c.fan){f.m.burn*=2;bits.push('Burn now '+f.m.burn);}
  if(c.str){f.str+=c.str;bits.push('+'+c.str+' Strength');}
  if(c.forge){const b=2*f.str;f.m.burn+=b;bits.push(b+' Burn');}
  if(c.press&&wasExposed){f.str+=2;bits.push('+2 Strength');}
  if(c.hedge)f.hedge=1;
  if(c.fever)f.fever=1;
  if(c.iron)f.iron=1;
  if(c.weak){f.m.weak+=c.weak;bits.push(c.weak+' Weak');}
  if(c.vines){f.thorns+=f.m.weak;bits.push('+'+f.m.weak+' Thorns');}
  if(c.exp){f.m.exp+=c.exp;bits.push(c.exp+' Exposed');}
  if(c.thorns){f.thorns+=c.thorns;bits.push('+'+c.thorns+' Thorns');}
  if(c.focus){f.focus=1;bits.push('focused');}
  if(c.ctr){f.ctr+=c.ctr;}
  if(c.extra){f.plays+=c.extra;bits.push('+'+c.extra+' plays');}
  if(c.draw){drawN(c.draw);}
  log(c.n+': '+(bits.join(', ')||'done')+'.');
  S.pops=[];const dF=fhp0-f.m.hp,dH=run.hp-php0;
  if(dF>0){S.pops.push({s:'f',t:'-'+dF,c:'dmg'});S.lungeMe=1;}
  S.heroAnim=(w=>{const A=ART[run.hero].anims||{};return A[w]?w:({ultatk:'atk',ultdef:'guard'})[w]||w;})(heroAnimFor(c,dF));
  if(dH>0)S.pops.push({s:'m',t:'+'+dH,c:'heal'});else if(dH<0)S.pops.push({s:'m',t:''+dH,c:'dmg'});
  f.last={dmg:Math.max(0,dF),blk:c.blk||0};
  checkSplit(f.m);
  if(run.hp<=0){run.hp=0;return loseFight();}
  if(f.m.hp<=0){
    const A=ART[run.hero].anims,a=S.heroAnim;
    if(A&&A[a]&&typeof requestAnimationFrame==='function'){
      const ms=Math.min(1300,Math.max(450,A[a].n*(HANIM_MS[a]||80)));
      S.lock=1;render();setTimeout(()=>{S.lock=0;win();},ms);return;}
    return win();}
  render();
}
function tide(){return (run.layer===2||hasP('tide'))&&run.fight?Math.max(0,run.fight.turn-3):0;}
function atkVal(m,v){let d=v+m.str+tide();if(m.weak>0){d=Math.floor(d/2);if(run.wp&&run.wp.freeze)d=Math.max(0,d-run.wp.freeze);}return d;}
function checkSplit(m){if(m.split&&!m.splitDone&&m.hp>0&&m.hp<=m.max/2){m.splitDone=1;m.hits=2;log(m.n+' '+(m.splitText||'splits in two! It now attacks twice.'));}}
function endTurn(){
  if(S.lock||S.dying)return;
  const f=run.fight,m=f.m;
  const sting=f.hand.reduce((a,k)=>a+(CARDS[k].sting||0),0);
  if(sting){run.hp-=sting;log('Fleas bite for '+sting+'.');}
  f.disc.push(...f.hand.filter(k=>!CARDS[k].ret));f.hand=f.hand.filter(k=>CARDS[k].ret);
  if(!m.keepBlk)m.blk=0;
  if(f.pweak>0)f.pweak--;
  const me0=run.hp,f0=m.hp;
  let [k,v]=m.i[m.idx%m.i.length];
  if(m.stun){m.stun=0;k='none';log(m.n+' is stunned and loses its turn.');}
  if(k==='m'){const L=f.last;if(L&&L.dmg>0){k='a';v=L.dmg;log(m.n+' mirrors your last card!');}else if(L&&L.blk>0){k='b';v=L.blk;log(m.n+' mirrors your last card!');}else k='a';}
  if(k==='x'){const st=Math.min(v,run.embers);run.embers-=st;log(m.n+' steals '+st+' Embers.');k='a';v=4;}
  if(k==='c'){for(let q=0;q<v;q++)f.disc.push('glyph');log(m.n+' inscribes a Cursed Glyph into your discard.');}
  if(k==='a'){
    const d=atkVal(m,v),n=m.hits||1;let taken=0,blocked=0,td=0;
    for(let h=0;h<n;h++){const a=Math.min(f.blk,d);f.blk-=a;blocked+=a;taken+=d-a;
      if(f.thorns){const t=f.thorns+(f.iron?f.str:0);m.hp-=t;td+=t;if(f.hedge)m.burn+=1;}}
    run.hp-=taken;
    let s=m.n+' attacks'+(n>1?' twice':'')+' for '+d+(n>1?' each':'')+(blocked?' ('+blocked+' blocked)':'')+'.';
    if(td)s+=' Thorns deal '+td+'.';
    if(f.ctr){m.hp-=f.ctr;s+=' Counter deals '+f.ctr+'.';}
    log(s);if(taken>0)S.flash=1;
  }else if(k==='b'){const gb=Math.min(v,run.wp.gbreak||0);S.guardFoe=1;m.blk+=v-gb;if(gb&&run.wp.gbExp)m.exp+=run.wp.gbExp;if(gb&&run.wp.gbDmg)m.hp-=gb;if(gb&&run.wp.gbStr)f.str+=run.wp.gbStr;log(m.n+' guards for '+v+'.'+(gb?' Guard Break shatters '+gb+' of it'+(run.wp.gbDmg?' and deals '+gb+' damage':'')+(run.wp.gbExp?', leaving it Exposed':'')+(run.wp.gbStr?'. You gain '+run.wp.gbStr+' Strength':'')+'.':''));}
  else if(k==='s'){m.str+=v;S.yellFoe=1;log(m.n+' howls. Attacks +'+v+'.');}
  else if(k==='h'){S.healFoe=1;const h=Math.min(v,m.max-m.hp);m.hp+=h;log(m.n+' heals '+h+'.');}
  else if(k==='w'){f.pweak+=v;S.singFoe=1;f.disc.push('waterlogged');log(m.n+' sings. You are Weak for '+v+' turns, and a Waterlogged card washes into your discard.');}
  if(m.burn>0&&m.hp>0){const bd=m.burn*(f.fever&&m.exp>0?2:1);m.hp-=bd;log('Burn deals '+bd+'.');if(!run.wp.inferno)m.burn--;}
  if(m.weak>0)m.weak--;
  if(m.exp>0)m.exp--;
  if(m.grow&&m.hp>0){m.str+=m.grow;}
  if(m.regen&&m.hp>0){const h=Math.min(m.regen,m.max-m.hp);if(h>0){m.hp+=h;log(m.n+' regrows '+h+'.');}}
  if(run.layer===3&&f.turn%3===0){run.hp-=3;m.hp-=3;log('Stones fall from the ceiling: 3 damage to you both.');}
  if(m.enrage&&!m.rage&&m.hp>0&&m.hp<=m.max/2){m.rage=1;m.str+=m.enrage;if(m.summon){S.summonFoe=1;log(m.n+' yells for help! Rat Vagrants swarm in. Attacks +'+m.enrage+'.');}else log(m.n+' enrages! Attacks +'+m.enrage+'.');}
  f.last=null;
  checkSplit(m);
  m.idx++;
  S.pops=[];const dm=me0-run.hp,df=f0-m.hp;
  if(dm>0)S.pops.push({s:'m',t:'-'+dm,c:'dmg'});
  if(df>0)S.pops.push({s:'f',t:'-'+df,c:'dmg'});else if(df<0)S.pops.push({s:'f',t:'+'+(-df),c:'heal'});
  if(k==='a'){const ab=m.i.filter(q=>q[0]==='a').map(q=>q[1]);S.lungeFoe=(ab.length>1&&v>=Math.max(...ab))?2:1;}
  if(run.hp<=0){run.hp=0;return loseFight();}
  if(m.hp<=0)return win();
  startTurn();render();
}
function win(){
  const mm=run.fight.m;
  if(mm.phase2&&!mm.p2done&&!S.dying&&EANIM[mm.id]&&EANIM[mm.id].anims.dead&&typeof requestAnimationFrame==='function'){
    S.dying=1;render();
    setTimeout(()=>{S.dying=0;S.whiteFlash=1;winNow();},EANIM[mm.id].anims.dead.n*220+500);return;}
  if(!(mm.phase2&&!mm.p2done)&&!S.dying&&typeof requestAnimationFrame==='function'){
    const A=ART[run.hero],hw=A.anims&&A.anims.win?A.anims.win.n*HANIM_MS.win:0,ed=EANIM[mm.id]&&EANIM[mm.id].anims.dead?(EANIM[mm.id].anims.dead.n*0.2+0.3)*1000:900;
    S.dying=1;S.heroAnim=A.anims&&A.anims.win?'win':0;render();
    setTimeout(()=>{winNow();S.dying=0;},Math.max(2200,ed+700,hw+500));return;}
  winNow();
}
/* The hero falls: hold on the defeat animation before the end screen. */
function loseFight(){
  const A=ART[run.hero];
  if(!S.dying&&A.anims&&A.anims.dead&&typeof requestAnimationFrame==='function'){
    S.dying=2;S.heroAnim='dead';render();
    setTimeout(()=>{S.dying=0;end(false);},A.anims.dead.n*HANIM_MS.dead+1200);return;}
  return end(false);
}
function winNow(){
  const m=run.fight.m;
  if(m.phase2&&!m.p2done){
    const p2=m.phase2;m.p2done=1;m.id=p2.id;m.n=p2.n;m.hp=m.max=Math.round(p2.hp*hpMul(m));m.i=p2.i;m.idx=0;m.blk=0;m.str=hasP('swift')?1:0;
    log('The Saint falls\u2026 and rises again, unveiled.');S.hitFoe=0;render();return;
  }
  const g=LAYERS[run.layer].earn[PLAN[run.chamber-1]]*(m.elite?2:1)+(hasT('coin')?1:0);run.embers+=g;S.gain=g;
  if(m.elite){run.reward={type:'elite',opts:shuffle(Object.keys(TRINKETS).filter(t=>!run.trinkets.includes(t))).slice(0,2)};if((run.ultGot||0)<ULT_MAX&&Math.random()<.35)run.reward.ult=rnd(ULTS);}
  if(m.boss&&run.layer<4){
    if(run.layer>=meta.depth)meta.depth=run.layer+1;
    run.layer++;run.chamber=0;run.fight=null;run.reward=null;run.log=[];
    log(LAYERS[run.layer].down);
    run.doors=[{kind:'shop',th:1},{kind:'well',th:1},{kind:'purge2',th:1}];S.screen='doors';S.threshold=1;render();return;
  }
  if(m.boss){if(run.layer===4){meta.clears=(meta.clears||0)+1;run.amulet=1;}else if(run.layer>=meta.depth){meta.depth=run.layer+1;run.opened=LAYERS[run.layer+1].n;}return end(true);}
  if(m.mini)run.reward={type:'boon',p:rnd(Object.keys(PATRONS))};
  run.fight=null;
  const r=run.reward;
  if(!r){toDoors();return;}
  if(r.type==='heal'){const h=Math.min(healDoor(),run.max-run.hp);run.hp+=h;r.healed=h;}
  if(r.type==='embers'){run.embers+=EMBER_DOOR;}
  if(r.type==='card'&&!r.opts)r.opts=lootPick(hasP('starved')?2:3);
  if(r.type==='boon'){r.opts=shuffle(PATRONS[r.p].cards.slice()).slice(0,hasP('starved')?1:2);const d=availDuos(r.p);if(d.length)r.opts.push(rnd(d));}
  S.screen='reward';render();
}
function lootPick(n,rareOnly){
  const opts=[],w=rareOnly?LOOT.filter(k=>CARDS[k].r==='r'):LOOT.flatMap(k=>CARDS[k].r==='r'?[k]:[k,k,k]);
  let guard=0;while(opts.length<n&&guard++<200){const k=rnd(w);if(!opts.includes(k))opts.push(k);}
  return opts;
}
function afterReward(){
  if(run.reward&&run.reward.back==='shop'){run.reward=null;S.screen='shop';render();}
  else toDoors();
}
function takeCard(id){run.deck.push(id);afterReward();}
function purge(i){run.deck.splice(i,1);const r=run.reward;if(r&&r.left>1){r.left--;render();return;}afterReward();}
