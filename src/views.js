/* Every screen, drawn as HTML. */
"use strict";
/* ---------- VIEWS ---------- */
const HERO_SPR={runaway:'runaway',cutpurse:'cutpurse',ashbound:'ashbound'};
const up=s=>s.toUpperCase();
function emb(n){return `<span class="embers">${px('i_ember','','')}${n}</span>`.replace('<img ','<img style="width:16px;height:16px" ');}
function icon(k,size){return px('i_'+k).replace('<img ',`<img style="width:${size}px;height:${size}px" `);}
function cardArt(id){
  const c=CARDS[id];
  if(c.p==='duo')return icon(PATRONS[c.pair[0]].ic,28)+icon(PATRONS[c.pair[1]].ic,28);
  if(c.t==='curse')return icon('skull',32);
  if(c.t==='boon')return icon(PATRONS[c.p].ic,32);
  const k=(c.burn||c.fan||c.stoke)?'flame':c.str?'anvil':(c.weak||c.exp)?'eye':c.extra?'bolt':c.focus?'target':c.heal?'heart':(c.hits>1)?'dagger':c.tb?'leaf':c.steal?'heart':c.ifa?'target':c.slam!=null?'shield':(c.dmg||c.fin||c.bs)?'sword':(c.blk||c.grow)?'shield':c.thorns?'leaf':'card';
  return icon(k,32);
}
function cardHTML(id,{btn=false,act='',dis=false,price=null}={}){
  const c=CARDS[id];
  const ty=c.p==='duo'?'DUO \u00B7 '+up(PATRONS[c.pair[0]].short)+'+'+up(PATRONS[c.pair[1]].short):c.t==='boon'?'BOON \u00B7 '+up(PATRONS[c.p].short):up(TYPE[c.t])+(c.r==='r'?' \u00B7 RARE':'');
  const cst=c.cost==null?1:c.cost,tyc=(c.ult?'ULTIMATE':ty)+(cst===0?' \u00B7 QUICK':cst===2?' \u00B7 2 PLAYS':'');
  const cls=`card ${c.t}${c.p==='duo'?' duo':''}${c.r==='r'?' rare':''}${c.up?' up':''}${c.ult?' ult':''}`;
  const inner=`<span class="cn">${up(c.n)}${cst!==1?`<span class="cost c${cst}" aria-hidden="true">${cst===0?'<b>Q</b>':'<i></i><i></i>'}</span>`:''}</span><span class="art">${cardArt(id)}</span><span class="body"><span class="ty">${tyc}</span><span class="tx">${c.x}</span></span>${price!==null?`<span class="price">${icon('ember',12)}${price}</span>`:''}`;
  return btn?`<button class="${cls}" data-act="${act}" ${dis?'disabled':''} aria-label="${c.n}. ${c.x}">${inner}</button>`:`<div class="${cls}">${inner}</div>`;
}
function rulesHTML(){
  return `<div class="box rules"><h3>THE WHOLE RULEBOOK</h3><ol>
  <li>Choose a hero. Shuffle their deck. Enter the first chamber.</li>
  <li>Fight: the enemy shows what it will do next. Draw your hand (4 cards for most heroes), play 2, discard the rest. The enemy acts. Repeat until someone hits 0.</li>
  <li>Block only lasts until the end of the enemy\u2019s turn.</li>
  <li>Win fights to earn Embers. Take the reward shown on the door you chose.</li>
  <li>Spend Embers in shops, or save them. Whatever you haven\u2019t spent when the run ends becomes your hero\u2019s XP.</li></ol></div>`;
}
function pips(){
  return `<div class="pips" aria-label="Chamber ${run.chamber} of ${PLAN.length}">${PLAN.map((t,i)=>`<b class="${t==='m'?'m':t==='B'?'B':''} ${i+1<run.chamber?'done':i+1===run.chamber?'now':''}"></b>`).join('')}</div>`;
}
function hpBar(hp,max){const r=Math.max(0,Math.min(1,hp/max));const c=r>.5?'var(--hpg)':r>.2?'var(--hpy)':'var(--hpr)';
  return `<div class="hp"><b>HP</b><div class="bar" role="img" aria-label="${Math.max(0,hp)} of ${max} HP"><i style="width:${r*100}%;background:${c}"></i></div></div>`;}
function intentHTML(m){
  if(m.stun)return `<span class="intent b">NEXT: STUNNED</span>`;
  const [k,v]=m.i[m.idx%m.i.length];
  if(k==='a')return `<span class="intent a">NEXT: ATK ${atkVal(m,v)}${m.hits>1?' \u00D7'+m.hits:''}</span>`;
  if(k==='h')return `<span class="intent b">NEXT: HEAL ${v}</span>`;
  if(run.layer===4&&run.fight&&run.fight.turn%2===0)return `<span class="intent s">NEXT: ??? (GLAMOUR)</span>`;
  if(k==='w')return `<span class="intent s">NEXT: SING (WEAK ${v})</span>`;
  if(k==='m')return `<span class="intent a">NEXT: MIRROR YOUR LAST CARD</span>`;
  if(k==='x')return `<span class="intent s">NEXT: STEAL ${v} EMBERS</span>`;
  if(k==='c')return `<span class="intent s">NEXT: CURSE</span>`;
  if(k==='b'){const gb=Math.min(v,(run&&run.wp&&run.wp.gbreak)||0);return `<span class="intent b">NEXT: GUARD ${v-gb}${gb?' (\u2212'+gb+')':''}</span>`;}
  return `<span class="intent s">NEXT: HOWL +${v}</span>`;
}
function doorInfo(d){const o=doorInfo0(d);if(hasT('map')&&d.mon&&!d.tag)o.s+=' Inside: '+MON[d.mon].n+'.';return o;}
function doorInfo0(d){
  if(d.kind==='purge2')return {ic:'purge',t:'Purge two',s:'No fight. Remove two cards.',c:'var(--pink)'};
  if(d.kind==='event')return {ic:'q',t:'Strange room',s:'No fight. Something waits.',c:'var(--plum)'};
  if(d.elite)return {ic:'skull',t:'Elite',s:'A tougher foe. Double Embers and a trophy.',c:'var(--pink)'};
  if(d.kind==='well')return {ic:'well',t:'Quiet well',s:'No fight. Heal 7.',c:'var(--skill)'};
  if(d.kind==='shop')return {ic:'shop',t:'Shop',s:'No fight. Spend Embers.',c:'var(--gold)'};
  if(d.tag==='B')return {ic:'skull',t:MON[pool().B[0]].n,s:run.layer===4?'The duel for the amulet.':'The boss.',c:'var(--atk)'};
  if(d.tag==='m')return {ic:'key',t:MON[pool().m[0]].n,s:'Miniboss. Reward: a boon.',c:'var(--atk)'};
  const r=d.reward;
  if(r.type==='card')return {ic:'card',t:'New card',s:'Choose 1 of 3.',c:'var(--def)'};
  if(r.type==='heal')return {ic:'heart',t:'Healing',s:'Restore '+healDoor()+' HP.',c:'var(--skill)'};
  if(r.type==='purge')return {ic:'purge',t:'Purge',s:'Remove a card.',c:'var(--muted)'};
  if(r.type==='embers')return {ic:'ember',t:'Embers',s:'Gain '+EMBER_DOOR+' Embers.',c:'var(--gold)'};
  return {ic:PATRONS[r.p].ic,t:'Boon of '+PATRONS[r.p].short,s:'Choose 1 of 2.',c:'var(--boon)'};
}
function counts(arr){const o={};arr.forEach(k=>o[k]=(o[k]||0)+1);return o;}
function deckLine(obj){return Object.entries(obj).filter(([,n])=>n>0).map(([k,n])=>CARDS[k].n+(n>1?' \u00D7'+n:'')).join(', ');}
function perkLine(id){
  const H=HEROES[id],h=hs(id);
  return Object.keys(h.perks).filter(k=>h.perks[k]&&H.perks[k]).map(k=>H.perks[k].n+(h.perks[k]>1?' \u00D7'+h.perks[k]:'')).join(', ');
}
function heroMaxHP(id){const H=HEROES[id],h=hs(id);let hp=H.hp;for(const k in h.perks)if(H.perks[k]&&H.perks[k].hp)hp+=H.perks[k].hp*h.perks[k];return hp;}
function statusBar(){return `<div class="top"><span class="row" style="gap:12px"><span class="px" style="font-size:9px">HP ${run.hp}/${run.max}</span>${run.heat?`<span class="px" style="font-size:9px;color:var(--pink)">HEAT ${run.heat}</span>`:''}${emb(run.embers)}${run.trinkets.length?`<span class="tr">${run.trinkets.map(k=>icon(k,18)).join('')}</span>`:''}</span>${pips()}</div>`;}

function intentWord([a,v]){return a==='a'?'Attack '+v:a==='b'?'Guard '+v:a==='h'?'Heal '+v:a==='w'?'Sing (you: Weak '+v+')':'Howl +'+v;}
function monList(keys){return keys.map(k=>{const m=MON[k];return `<div class="box mon">${monImg(k,56)}<div><b>${m.n}</b> <span class="muted">${m.tier}, ${m.hp} HP</span><br>${m.i.map(intentWord).join(', then ')}${m.phase2?`<br>Then: ${m.phase2.n}, ${m.phase2.hp} HP. ${m.phase2.i.map(intentWord).join(', then ')}`:''}${m.note?'<br><span class="muted">'+m.note+'</span>':''}</div></div>`}).join('');}
function home(){
  let body='';
  if(S.tab==='play'){
    const rn=renown();
    const roster=Object.entries(HEROES).map(([k,H])=>{
      const h=hs(k);
      if(!unlocked(k))return `<div class="box hero locked"><div class="face">${heroPx(k,'locked-face')}</div><div>
        <h2>${up(H.n)}</h2><p>${H.blurb}</p><p class="muted">Unlocks at Renown ${H.renown}. You have ${rn}.</p></div></div>`;
      return `<div class="box hero"><div class="face">${ART[k].anims?stripHTML(k,'',`position:absolute;bottom:${ART[k].pix?-6:0}px;width:${ART[k].rw||112}px;left:${Math.round(37-ART[k].cx*(ART[k].rw||112))}px;margin:0`,'idle'):portrait(k,'bob')}</div><div>
        <div class="row" style="justify-content:space-between"><h2>${up(heroName(k))}</h2><span class="px" style="font-size:10px">Lv${h.level}</span></div>
        <p>${H.blurb} <b>${heroMaxHP(k)} HP.</b> Wields the ${weaponName(k)}.</p>
        <div class="xp"><div class="bar"><i style="width:${h.xp/need(h.level)*100}%"></i></div><span class="px" style="font-size:8px">${h.xp}/${need(h.level)}</span></div>
        <p class="muted">${perkLine(k)?'Upgrades: '+perkLine(k)+'.':'No upgrades yet.'} Runs ${h.runs}, wins ${h.wins}, deepest ${h.best}.</p>
        ${heatOpen()?`<p class="muted">Best Heat cleared: ${h.heatBest||0}.</p>`:''}
        <p style="margin-top:10px" class="row"><button class="btn" data-act="${heatOpen()?'pact':'start'}:${k}">DESCEND</button><button class="btn ghost" data-act="arms:${k}">WEAPON</button><button class="btn ghost" data-act="cust:${k}">STYLE</button></p>
      </div></div>`;}).join('');
    body=`<p class="px" style="font-size:11px">RENOWN ${rn}</p><p class="muted">Every level any hero gains adds 1 Renown. Renown unlocks new heroes.</p>
    <div class="roster">${roster}</div>
    <div class="sec">${rulesHTML()}</div>
    <p class="muted" style="margin-top:18px">${S.saveMode==='cloud'?'Progress saves to your Claude account after each run.':'Progress saves in this browser after each run.'} A run abandoned midway is lost.</p>
    <p><button class="btn ghost" data-act="reset">${S.resetArm?'TAP AGAIN TO ERASE':'RESET PROGRESS'}</button></p>`;
  }else{
    const g=(ks)=>ks.map(k=>cardHTML(k)).join('');
    body=Object.entries(HEROES).map(([k,H])=>`<div class="sec"><div class="row">${heroPx(k,"").replace('<img ','<img style="width:48px;height:48px" ')}<h3>${up(H.n)}</h3></div><p class="muted">${H.hp} HP, draws ${H.hand}${H.renown?`, unlocks at Renown ${H.renown}`:''}. Core deck: ${deckLine(H.deck)}, plus 3 weapon cards.</p>
      <div class="stack" style="margin-top:10px">${WEAPONS[k].map((w,i)=>`<div class="box" style="padding:8px"><div class="row">${icon(w.ic,24)}<b>${w.forms.join(' \u2192 ')}</b></div><span class="muted">${w.blurb} ${i?`Unlocks at hero level ${WUNLOCK[i]}.`:'Starting weapon.'} Final form: ${w.pass.n}, ${w.pass.x}</span></div>`).join('')}</div>
      <div class="grid" style="margin-top:10px">${g(Object.keys(H.deck))}</div>
      <p style="margin-top:14px" class="px"><span style="font-size:9px">UPGRADE TREE</span></p><div class="stack" style="margin-top:8px">${Object.values(H.perks).map(p=>`<div class="box" style="padding:8px"><b>${p.n}</b>${p.max>1?` <span class="muted">up to ${p.max}\u00D7</span>`:''}<br>${p.x}</div>`).join('')}</div></div>`).join('')+`
      <div class="sec"><h3>LOOT</h3><p class="muted">Behind card doors and in shops. Rares show up a third as often.</p><div class="grid" style="margin-top:10px">${g(LOOT)}</div></div>
      ${Object.values(PATRONS).map(pt=>`<div class="sec"><div class="row">${icon(pt.ic,32)}<h3>${up(pt.n)}</h3></div><p class="muted">${pt.kw}</p><div class="grid" style="margin-top:10px">${g(pt.cards)}</div></div>`).join('')}
      ${LAYERS.slice(1).map((L,n)=>`<div class="sec"><h3>LAYER ${n+1}: ${up(L.n)}</h3><p class="muted">${n===0?'Always open.':meta.depth>n?'Discovered.':'Not yet reached. Beat the boss above it and the run continues down.'} ${L.rule?'Rule: '+L.rule:'No special rule.'} Embers: ${L.earn.e} shallow, ${L.earn.m} miniboss, ${L.earn.h} deep, ${L.earn.B} boss.</p>
      <div class="stack" style="margin-top:10px">${monList(L.mons())}</div></div>`).join('')}
      <div class="sec box"><h3>KEYWORDS</h3><p><b>Ultimate:</b> a rare, huge 2-play card you can use once per run. It stays in your hand until you use it. At most 2 per run; unused ones turn into 5 Embers each.<br><b>Exhaust:</b> after you play it, the card is gone for the rest of the fight.<br><b>Retain:</b> stays in your hand at end of turn instead of being discarded.<br><b>Upgrade (+):</b> every card has a stronger + version. Upgrade at shops (6 Embers), from elite trophies, or at the Forgotten Anvil.</p></div>
      <div class="sec"><h3>ULTIMATES</h3><p class="muted">Elite trophies sometimes offer one, and shops occasionally stock one for 14 Embers. Never more than 2 per run.</p><div class="grid" style="margin-top:10px">${g(ULTS)}</div></div>
      <div class="sec"><h3>CURSES</h3><p class="muted">Junk cards. Enemies that sing wash Waterlogged into your discard for the fight. Some choices add curses to your deck for the run. Purge them.</p><div class="grid" style="margin-top:10px">${g(['waterlogged','fleas'])}</div></div>
      <div class="sec box"><h3>ELITES AND STRANGE ROOMS</h3><p><b>Elite doors</b> (skull) hide a tougher version of a normal enemy: 60% more HP and +2 Attack. They pay double Embers and a trophy: a trinket or a free upgrade.<br><b>Strange rooms</b> (?) are events with choices: ${Object.values(EVENTS).map(e=>e.t).join(', ')}.</p></div>
      <div class="sec"><h3>DUO BOONS</h3><p class="muted">Offered as a third choice at boon doors once you hold boons from both patrons.</p><div class="grid" style="margin-top:10px">${g(DUO)}</div></div>
      <div class="sec"><h3>TRINKETS</h3><p class="muted">Sold in shops for ${TRINKET_COST} Embers. Up to ${TRINKET_SLOTS} per run. Always on.</p><div class="stack" style="margin-top:10px">${Object.entries(TRINKETS).map(([k,t])=>`<div class="box trow" style="grid-template-columns:36px 1fr">${icon(k,32)}<div><b>${t.n}</b><br>${t.x}</div></div>`).join('')}</div></div>
      <div class="sec box"><h3>HEAT</h3><p>Unlocks after your first amulet. Before a run, add Pacts to raise the Heat; each point adds 10% to banked Embers. New best clears unlock style colors at Heat ${HEAT_LOOKS.map(x=>x.req).join(', ')}.</p><div class="stack" style="margin-top:8px">${PACTS.map(p=>`<div><b>${p.n}</b> <span class="muted">+${p.heat}</span><br>${p.x}</div>`).join('')}</div></div>
      <div class="sec box"><h3>SHOPS</h3><p>Loot cards 5 Embers (rares 8), a patron boon 9, trinkets ${TRINKET_COST}, heal 8 HP for 5, remove a card for 6. A shop is guaranteed after the Key Master.</p></div>`;
  }
  return `<h1>UNDERCROFT</h1><div class="story"><p class="px" style="font-size:9px;color:var(--pink)">THE DUKE\u2019S AMULET</p><p>You\u2019re a traveler, passing through a town with a problem. The Duke\u2019s amulet has been stolen and carried down beneath the streets: through the underbelly, the sewers, and the ruins of the old city, all the way to the court of the Fairy King. Only a duel will win it back.</p><p class="muted">Deepest discovered: ${LAYERS[Math.min(4,meta.depth)].n}.${meta.clears?' Amulet recovered '+meta.clears+(meta.clears>1?' times.':' time.'):''}</p></div><p class="muted" style="margin-top:8px">Choose a hero, descend eight chambers per layer, four layers deep.</p>
  <div class="tabs" role="group"><button data-act="tab:play" aria-pressed="${S.tab==='play'}">HEROES</button><button data-act="tab:cards" aria-pressed="${S.tab==='cards'}">ALL CARDS</button></div>${body}`;
}
function st(ic,n,label){return `<span class="st" title="${label}" aria-label="${label} ${n}">${icon(ic,14)}${n}</span>`;}
function fight(){
  const f=run.fight,m=f.m,EA=EANIM[m.id],E=EA?null:ESTRIP[m.id],sc=E?(ESCALE[m.id]||1):((m.boss||m.mini)?1.2:1);
  const foeArt=EA?eanimHTML(m.id,S.dying===1?'dead':S.dying===2&&EA.anims.taunt?'taunt':S.summonFoe&&EA.anims.summon?'summon':S.lungeFoe===2&&EA.anims.smash?'smash':S.lungeFoe?'atk':S.hitFoe?'hurt':S.guardFoe&&EA.anims.guard?'guard':S.singFoe&&EA.anims.sing?'sing':S.healFoe&&EA.anims.heal?'heal':(S.yellFoe||S.guardFoe)?'yell':'idle'):E?estripHTML(m.id,S.lungeFoe?'atk':'','width:100%'):px(m.id,'bob',m.n).replace('<img ','<img style="width:100%;height:auto" ');
  const mst=[f.str?st('anvil',f.str,'Strength'):'',f.thorns?st('leaf',f.thorns,'Thorns'):'',f.focus?st('target','2x','Focus: next attack doubled'):'',f.ctr?st('sword',f.ctr,'Counter'):'',f.pweak?st('snow',f.pweak,'Weak: your hits deal half'):'',
    f.hedge?'<span class="chip burn">HEDGEFIRE</span>':'',f.fever?'<span class="chip burn">FEVER</span>':'',f.iron?'<span class="chip thorn">IRONBARK</span>':''].join('');
  const fst=[m.burn?st('flame',m.burn,'Burn'):'',m.weak?st('snow',m.weak,'Weak: attacks deal half'):'',m.exp?st('eye',m.exp,'Exposed: +2 per hit'):'',m.str?st('anvil','+'+m.str,'Attack bonus'):'',tide()?st('well','+'+tide(),'Rising Tide'):'',m.spikes?st('leaf',m.spikes,'Prickly'):'',m.regen?st('heart','+'+m.regen,'Regrows each turn'):''].join('');
  const plate=(name,hp,max,blk,blkLabel,sts,side)=>`<div class="plate ${side}"><div class="pn">${name}</div><div class="hprow">${blk?`<span class="blk" title="${blkLabel}">${icon('shield',14)}${blk}</span>`:''}${hpBar(hp,max)}</div><div class="pnum">${Math.max(0,hp)} / ${max}</div><div class="sts">${sts}</div></div>`;
  return `${statusBar()}
  <div class="arena ${['','','nave','l3','l4'][run.layer]}">
    ${bgHTML(run.layer)}
    <div class="fig me"><i class="shadow"></i><div class="figin ${S.flash&&!ART[run.hero].anims?'shake':''} ${S.lungeMe&&ART[run.hero].frames===1&&!ART[run.hero].anims?'lunge-r':''}">${battleHero(run.hero,S.lungeMe)}</div></div>
    ${m.rage&&m.summon&&EANIM.rats&&S.dying!==1?[[22,40,.5],[-38,16,.75]].map(([r,b,br])=>`<div class="fig minion" style="right:${r}px;bottom:calc(6% + ${b-EANIM.rats.drop}px);width:${EANIM.rats.w}px;filter:brightness(${br})">${eanimHTML('rats',S.summonFoe?'yell':'idle')}</div>`).join(''):''}<div class="fig foe${S.dying===1&&(!EA||!EA.anims.dead)?' gone':''}" style="width:${EA?eanimWidth(m.id):Math.round(104*sc)}px;${EA&&EANIM[m.id].lift?`bottom:calc(6% + ${EANIM[m.id].lift}px)`:''}${EA&&EANIM[m.id].drop?`bottom:calc(6% - ${EANIM[m.id].drop}px)`:''}"><i class="shadow"></i><div class="figin ${S.hitFoe&&(!EA||!EA.anims.hurt)?'shake':''} ${S.lungeFoe&&!E&&!EA?'lunge-l':''}">${foeArt}</div></div>
    <div class="bubble">${intentHTML(m)}</div>${S.whiteFlash?'<div class="wflash"></div>':''}
    ${(S.pops||[]).map(q=>`<span class="pop ${q.s} ${q.c}" aria-hidden="true">${q.t}</span>`).join('')}
  </div>
  <div class="plates">${plate(up(heroName(run.hero)),run.hp,run.max,f.blk,'Block',mst,'me')}${plate(up(m.n),m.hp,m.max,m.blk,'Guard',fst,'foe')}</div>
  <div class="tbox" style="margin-top:10px">${run.log.map(l=>`<div>${l}</div>`).join('')}</div>
  <div class="hand" aria-label="Your hand">${f.hand.map((id,i)=>cardHTML(id,{btn:true,act:'play:'+i,dis:f.plays<(CARDS[id].cost==null?1:CARDS[id].cost)||CARDS[id].unp})).join('')}</div>
  <div class="piles"><span><i class="cardback"></i>DRAW ${f.draw.length}</span><span><i class="cardback disc"></i>DISCARD ${f.disc.length}</span>${f.hand.length>3?'<span class="muted">SWIPE FOR MORE</span>':''}</div>`;
}
function reward(){
  const r=run.reward;
  let body='';
  const gained=S.gain?`<p>${emb('+'+S.gain)} from the fight.</p>`:'';
  if(r.type==='heal')body=`${gained}<p>You recover ${r.healed} HP.</p><button class="btn" data-act="after">CONTINUE</button>`;
  else if(r.type==='embers')body=`${gained}<p>You find a cache: ${emb('+'+EMBER_DOOR)}</p><button class="btn" data-act="after">CONTINUE</button>`;
  else if(r.type==='card')body=`${gained}<p class="muted">Pick one to add to your deck.</p><div class="grid">${r.opts.map(k=>cardHTML(k,{btn:true,act:'take:'+k})).join('')}</div><p style="margin-top:16px"><button class="btn ghost" data-act="after">SKIP</button></p>`;
  else if(r.type==='boon')body=`${gained}<div class="row">${icon(PATRONS[r.p].ic,32)}<p class="muted" style="flex:1">${PATRONS[r.p].n} offers a blessing. ${PATRONS[r.p].kw}</p></div><div class="grid">${r.opts.map(k=>cardHTML(k,{btn:true,act:'take:'+k})).join('')}</div><p style="margin-top:16px"><button class="btn ghost" data-act="after">REFUSE</button></p>`;
  else if(r.type==='purge')body=`${r.back||r.left?'':gained}<p class="muted">${r.left?`Remove ${r.left===2?'two cards':'one more card'} for good.`:'Remove one card for good.'} Thinner decks draw your best cards more often.</p><div class="grid">${run.deck.map((k,i)=>cardHTML(k,{btn:true,act:'purge:'+i})).join('')}</div>${r.back?'':`<p style="margin-top:16px"><button class="btn ghost" data-act="after">KEEP THEM ALL</button></p>`}`;
  else if(r.type==='upgrade')body=`<p class="muted">Choose a card to upgrade. Upgraded cards show a + and hit harder.</p><div class="grid">${run.deck.map((k,i)=>canUp(k)?cardHTML(k,{btn:true,act:'upg:'+i}):'').join('')}</div>${r.back?'':`<p style="margin-top:16px"><button class="btn ghost" data-act="after">SKIP</button></p>`}`;
  else if(r.type==='dup')body=`<p class="muted">Choose a card to copy into your deck.</p><div class="grid">${run.deck.map((k,i)=>isCurse(k)?'':cardHTML(k,{btn:true,act:'dup:'+i})).join('')}</div><p style="margin-top:16px"><button class="btn ghost" data-act="after">SKIP</button></p>`;
  else if(r.type==='elite')body=`${gained}<p class="muted">The elite drops a trophy. Take one.</p>${r.ult?`<div style="max-width:150px;margin-bottom:12px">${cardHTML(r.ult,{btn:true,act:'eult'})}</div>`:''}<div class="stack">${(run.trinkets.length<TRINKET_SLOTS?r.opts:[]).map(k=>`<button class="box trow" style="width:100%;text-align:left" data-act="etr:${k}">${icon(k,32)}<div><b>${TRINKETS[k].n}</b><br><span class="muted">${TRINKETS[k].x}</span></div><span class="px" style="font-size:9px">TAKE</span></button>`).join('')}
    <button class="box trow" style="width:100%;text-align:left" data-act="eup" ${run.deck.some(canUp)?'':'disabled'}>${icon('anvil',32)}<div><b>Upgrade a card</b><br><span class="muted">Make one card in your deck stronger.</span></div><span class="px" style="font-size:9px">TAKE</span></button></div>`;
  const title={heal:'HEALING',card:'CHOOSE A CARD',boon:'A PATRON STIRS',purge:'PURGE',embers:'EMBERS',upgrade:'UPGRADE',dup:'MIRROR',elite:'TROPHY'}[r.type];
  S.gain=0;
  return `${statusBar()}<h2>${title}</h2><div class="stack" style="margin-top:12px">${body}</div>`;
}
function shop(){
  const s=run.shop;
  return `${statusBar()}<div class="row">${icon('shop',40)}<div style="flex:1"><h2>SHOP</h2><p class="muted">Every Ember you spend here is XP you won\u2019t bank.</p></div></div>
  <div class="grid" style="margin-top:14px">${s.items.map((it,i)=>it.sold?`<div class="box" style="display:flex;align-items:center;justify-content:center;aspect-ratio:5/7;border-radius:8px"><span class="px" style="font-size:10px">SOLD</span></div>`:cardHTML(it.id,{btn:true,act:'buy:'+i,dis:run.embers<it.cost,price:it.cost})).join('')}</div>
  <div class="stack" style="margin-top:18px">
    <h3>TRINKETS (${run.trinkets.length}/${TRINKET_SLOTS})</h3>
    ${s.trinkets.map((t,i)=>`<div class="box trow">${icon(t.id,32)}<div><b>${TRINKETS[t.id].n}</b><br><span class="muted">${TRINKETS[t.id].x}</span></div><button class="btn ghost" data-act="buyt:${i}" ${t.sold||run.embers<t.cost||run.trinkets.length>=TRINKET_SLOTS?'disabled':''}>${t.sold?'SOLD':t.cost+' EMBERS'}</button></div>`).join('')||'<p class="muted">Sold out.</p>'}
    <h3 style="margin-top:8px">SERVICES</h3>
    <div class="box shoprow"><div class="row">${icon('heart',24)}<span>Heal ${s.healAmt} HP</span></div><button class="btn ghost" data-act="buyheal" ${s.healed||run.embers<s.heal?'disabled':''}>${s.healed?'SOLD':s.heal+' EMBERS'}</button></div>
    <div class="box shoprow"><div class="row">${icon('anvil',24)}<span>Upgrade a card</span></div><button class="btn ghost" data-act="buyforge" ${s.forged||run.embers<s.forge||!run.deck.some(canUp)?'disabled':''}>${s.forged?'SOLD':s.forge+' EMBERS'}</button></div>
    <div class="box shoprow"><div class="row">${icon('purge',24)}<span>Remove a card</span></div><button class="btn ghost" data-act="buypurge" ${s.purged||run.embers<s.purge?'disabled':''}>${s.purged?'SOLD':s.purge+' EMBERS'}</button></div>
  </div>
  ${run.log.length?`<div class="tbox" style="margin-top:14px;min-height:0"><div>${run.log[run.log.length-1]}</div></div>`:''}
  <p style="margin-top:18px"><button class="btn" data-act="doors">LEAVE</button></p>`;
}
function doors(){
  return `${statusBar()}
  ${S.threshold?`<h2>THE WAY DOWN</h2><div class="tbox" style="margin:10px 0"><div>${run.log[run.log.length-1]||''}</div></div><p class="muted">One last stop before ${LAYERS[run.layer].n}. ${LAYERS[run.layer].rule?'Its rule: '+LAYERS[run.layer].rule:''}</p>`:
  `<h2>CHOOSE A DOOR</h2><p class="muted">${LAYERS[run.layer].n}, chamber ${run.chamber+1} of ${PLAN.length}. The reward is marked. What waits inside is not.</p>`}
  <div class="doors" style="margin-top:14px">${run.doors.map((d,i)=>{const o=doorInfo(d);return `<button class="door ${run.doors.length===1?'solo':''}" style="--c:${o.c}" data-act="door:${i}"><span class="arch">${icon(o.ic,40)}</span><h3>${up(o.t)}</h3><span class="muted" style="font-size:15px">${o.s}</span></button>`}).join('')}</div>
  <div class="sec box"><h3>YOUR DECK (${run.deck.length})</h3><p class="muted" style="margin-top:6px">${deckLine(counts(run.deck))}</p></div>`;
}
function well(){return `${statusBar()}<div class="row">${icon('well',40)}<h2>A QUIET WELL</h2></div><div class="tbox" style="margin-top:12px"><div>${run.log[run.log.length-1]}</div></div><p style="margin-top:14px"><button class="btn" data-act="doors">CONTINUE</button></p>`}
function endV(){
  const H=HEROES[run.hero],h=hs(run.hero);
  if(h.pending>0&&!perkChoices().length)h.pending=0;
  let perk='';
  if(h.pending>0){
    perk=`<div class="sec"><h3>${up(heroName(run.hero))} REACHES LV${h.level-h.pending+1}</h3><p class="muted">Choose an upgrade. Permanent, for this hero only.</p><div class="stack" style="margin-top:10px">${perkChoices().map(k=>`<button class="card skill" style="aspect-ratio:auto" data-act="perk:${k}"><span class="cn">${up(H.perks[k].n)}</span><span class="body"><span class="tx">${H.perks[k].x}</span></span></button>`).join('')}</div></div>`;
  }
  const Wp=WEAPONS[run.hero].find(w=>w.id===run.weapon),wt=tierOf(wxp(run.hero,run.weapon)),nx=WTIER[wt+1];
  const wl=`<div class="box trow" style="margin-top:12px">${icon(Wp.ic,32)}<div><b>${Wp.forms[wt]}</b> <span class="muted">+${run.wgain} mastery</span><div class="xp"><div class="bar"><i style="width:${nx?Math.min(100,(wxp(run.hero,run.weapon)-WTIER[wt])/(nx-WTIER[wt])*100):100}%"></i></div></div><span class="muted">${nx?`Evolves into ${Wp.forms[wt+1]} at ${nx} mastery (${wxp(run.hero,run.weapon)} now).`:'Final form.'}</span></div></div>
  ${run.evolved?`<p class="unlock"><b>Your ${run.evolved[0]} evolved into the ${run.evolved[1]}!</b>${run.evolved[2]?` It gains <b>${run.evolved[2].n}</b>: ${run.evolved[2].x}`:' Its cards are stronger now.'}</p>`:''}
  ${run.newWeapons&&run.newWeapons.length?`<p class="unlock"><b>New weapon unlocked: ${run.newWeapons.join(', ')}.</b> Equip it from the hero screen.</p>`:''}`;
  const un=run.unlocked&&run.unlocked.length?`<p class="unlock"><b>Renown ${renown()}. New hero unlocked: ${run.unlocked.join(', ')}.</b></p>`:'';
  return `<div class="box row" style="gap:14px"><div class="hero" style="display:block">${(ART[run.hero].anims?stripHTML(run.hero,'','width:120px',run.won?'win':'dead'):(run.won?portrait(run.hero):px('i_skull'))).replace('<img ','<img style="width:64px;height:64px" ')}</div><div style="flex:1"><h2>${run.amulet?'THE AMULET IS YOURS':run.won?up(MON[pool().B[0]].n)+' FALLS':'FALLEN IN '+up(LAYERS[run.layer].n)+', CHAMBER '+run.chamber}</h2>
  <p>${run.amulet?'The Fairy King bows and yields the Duke\u2019s amulet. You climb back up through ruin, sewer, and underbelly into daylight. The town will talk about this for years.':run.won?'The way down is open now. Next time, keep going.':'The deep keeps what it takes. You keep what you learned.'}</p></div></div>
  ${run.opened?`<p class="unlock"><b>${run.opened} has opened.</b> From now on, when this boss falls, the run keeps descending.</p>`:''}
  <p style="margin-top:14px"><b>${heroName(run.hero)} banks ${run.xp} unspent Embers as XP.</b>${run.spent?` (${run.spent} spent in shops.)`:''}${run.ultLeft?` Unused Ultimates converted: +${run.ultLeft*5} Embers.`:''} Lv${h.level}, ${h.xp} of ${need(h.level)} to next.</p>
  ${heatLine()}${wl}
  ${un}${perk}
  <p style="margin-top:20px" class="row"><button class="btn" data-act="start:${run.hero}" ${h.pending?'disabled':''}>RUN AGAIN</button><button class="btn ghost" data-act="home" ${h.pending?'disabled':''}>HEROES</button></p>`;
}
function custom(){
  const k=S.cust,H=HEROES[k],h=hs(k),P=PARTS[k],L=h.look||{};
  const row=(part,label)=>P[part]?`<div class="sec" style="margin-top:16px"><h3>${label}</h3><div class="sw">${LOOKS[part].map((col,i)=>{const req=lookReq(part,i),lock=req>(h.heatBest||0);return `<button style="background:${col}${lock?';opacity:.35':''}" data-act="look:${part}.${i}" aria-pressed="${L[part]===i}" aria-label="${label} option ${i+1}${req?', unlocked by clearing Heat '+req:''}" ${lock?'disabled title="Clear Heat '+req+' to unlock"':''}>${lock?'<span class="px" style="font-size:7px;color:#fff">'+req+'</span>':''}</button>`;}).join('')}<button style="background:var(--panel)" data-act="look:${part}.-1" aria-pressed="${L[part]==null}" aria-label="Original ${label}"><span class="px" style="font-size:6px">OG</span></button></div></div>`:'';
  return `<div class="cust"><h2>STYLE: ${up(H.n)}</h2><p class="muted">Name and looks are saved per hero.</p>
  <div class="sec" style="margin-top:12px"><h3>NAME</h3><input id="hname" class="namein" maxlength="14" autocomplete="off" value="${esc(h.name||'')}" placeholder="${esc(H.n)}" aria-label="Hero name" style="margin-top:6px"></div>
  <div class="stage" style="margin-top:12px;gap:18px">${bgHTML(1)}${ART[k].anims?stripHTML(k,'',`position:relative;margin-bottom:${ART[k].pix?-4:6}px;width:${ART[k].sw||230}px;transform:translateX(${Math.round((.5-ART[k].cx)*(ART[k].sw||230))}px)`,ART[k].anims.spin?'spin':'idle'):ART[k].pix?stripHTML(k,'bob',`position:relative;margin-bottom:12px;width:${ART[k].w*ART[k].pix}px`):portrait(k,'bob')}</div>
  ${row('skin','SKIN')}${row('hair','HAIR')}${row('outfit',k==='cutpurse'?'HOOD':k==='ashbound'?'ROBE':'CLOAK')}
  <p style="margin-top:22px"><button class="btn" data-act="home">DONE</button></p></div>`;
}
function eventV(){
  const E=EVENTS[run.event.id];
  return `${statusBar()}<div class="row">${icon('q',40)}<h2 style="flex:1">${up(E.t)}</h2></div>
  ${E.art==='skull'?(()=>{const f=run.event.face||'idle';return `<div class="evstage"><div class="skull ${f}" role="img" aria-label="The gambler's skull" style="background-image:url(${SKULL[f]})"></div></div>`;})():''}
  <div class="tbox" style="margin-top:12px"><div>${run.event.result||E.x}</div></div>
  <div class="stack" style="margin-top:16px">${run.event.result?(run.event.after?`<button class="btn" data-act="evrew">CLAIM YOUR WINNINGS</button>`:`<button class="btn" data-act="doors">CONTINUE</button>`):E.opts.map((o,i)=>`<button class="btn ghost" style="width:100%;text-align:left;line-height:1.6" data-act="ev:${i}" ${o.can&&!o.can()?'disabled':''}>${up(o.l)}</button>`).join('')}</div>`;
}
function arms(){
  const k=S.wh,h=hs(k),cur=curWeapon(k);
  return `<h2>WEAPONS: ${up(heroName(k))}</h2><p class="muted">Weapons earn mastery from the Embers you bank. Each evolution makes them stronger; the final form adds a passive.</p>
  <div class="stack" style="margin-top:14px">${WEAPONS[k].map((w,i)=>{
    const open=weaponOpen(k,i),x=wxp(k,w.id),t=tierOf(x),nx=WTIER[t+1],kit=w.kits[t];
    if(!open)return `<div class="box" style="opacity:.6"><div class="row">${icon(w.ic,32)}<div><h3>${up(w.forms[0])}</h3><span class="muted">Unlocks at hero level ${WUNLOCK[i]}. ${w.blurb}</span></div></div></div>`;
    return `<div class="box stack"><div class="row">${icon(w.ic,32)}<div style="flex:1"><h3>${up(w.forms[t])}</h3><span class="muted">Form ${t+1} of 4. ${w.blurb}</span></div></div>
      <div class="xp"><div class="bar"><i style="width:${nx?Math.min(100,(x-WTIER[t])/(nx-WTIER[t])*100):100}%"></i></div><span class="px" style="font-size:8px">${nx?x+'/'+nx:'MAX'}</span></div>
      <p class="muted">${nx?`Next: ${w.forms[t+1]}.`:'Final form reached.'} ${t===3?`<b>${w.pass.n}:</b> ${w.pass.x}`:`Final form adds <b>${w.pass.n}</b>: ${w.pass.x}`}</p>
      <div class="grid">${Object.keys(kit).map(c=>cardHTML(c)).join('')}</div>
      <p class="muted">Cards: ${Object.entries(kit).map(([c,n])=>CARDS[c].n+(n>1?' \u00D7'+n:'')).join(', ')}</p>
      <p><button class="btn ${cur.id===w.id?'ghost':''}" data-act="equip:${w.id}" ${cur.id===w.id?'disabled':''}>${cur.id===w.id?'EQUIPPED':'EQUIP'}</button></p></div>`;}).join('')}</div>
  <p style="margin-top:20px"><button class="btn" data-act="home">DONE</button></p>`;
}
function renderDock(){
  if(S.screen!=='fight'){dock.hidden=true;dock.innerHTML='';return;}
  const f=run.fight;dock.hidden=false;
  const total=Math.max(PLAYS,f.plays);
  dock.innerHTML=`<div class="in"><div class="plays" aria-label="${f.plays} plays left">PLAYS ${Array.from({length:total},(_,i)=>`<i class="${i<f.plays?'on':''}"></i>`).join('')}</div><button class="btn" data-act="end">END TURN</button></div>`;
}
/* Looping sprite animations stay in step with one shared clock, so rebuilding the screen never restarts them mid-loop. */
function phaseLock(){const t=performance.now()/1000;document.querySelectorAll('.strip').forEach(e=>{if(!/anim-(idle|breathe|spin)\b/.test(e.className))return;const d=parseFloat(getComputedStyle(e).animationDuration)||0;if(d>0)e.style.animationDelay=(-(t%d)).toFixed(3)+'s';});}
function render(){
  const v={home,fight,reward,doors,well,shop,custom,arms,pact:pactV,event:eventV,end:endV}[S.screen];
  app.innerHTML=v();renderDock();
  phaseLock();
  S.flash=0;S.hitFoe=0;S.yellFoe=0;S.guardFoe=0;S.summonFoe=0;S.singFoe=0;S.healFoe=0;S.whiteFlash=0;S.pops=[];S.lungeMe=0;S.lungeFoe=0;S.heroAnim=0;
  if(S.screen!=='fight')window.scrollTo(0,0);
}

