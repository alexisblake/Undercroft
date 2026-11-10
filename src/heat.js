/* Heat: opt-in Pacts after the first clear. */
"use strict";
/* ---------- HEAT: opt-in Pacts after the first amulet ---------- */
const PACTS=[
  {id:'hard',n:'Hardened Foes',x:'All enemies have 15% more HP.',heat:3},
  {id:'mighty',n:'Mighty Bosses',x:'Minibosses and bosses have another 10% more HP.',heat:1},
  {id:'swift',n:'Swift Foes',x:'Enemies start every fight with +1 Attack.',heat:3},
  {id:'tide',n:'Cruel Tide',x:'Rising Tide applies on every layer.',heat:2},
  {id:'bare',n:'Bare Hands',x:'Your weapon fights one form weaker.',heat:2},
  {id:'lean',n:'Lean Times',x:'Heal doors and wells restore half as much.',heat:2},
  {id:'cursed',n:'Cursed Deck',x:'Start the run with 2 Fleas in your deck.',heat:1},
  {id:'starved',n:'Starved',x:'Card rewards and blessings offer one fewer choice.',heat:1},
  {id:'tight',n:'Tight Purse',x:'Shop prices are 50% higher.',heat:2},
];
const HEAT_LOOKS=[{c:'#FF7A3C',req:2,n:'Ember'},{c:'#B0203A',req:4,n:'Crimson'},{c:'#0E6E7A',req:6,n:'Abyss'},{c:'#F4F0FF',req:8,n:'Pearl'}];
const heatOpen=()=>(meta.clears||0)>0;
const hasP=k=>!!(run&&run.pacts&&run.pacts.includes(k));
const pactHeat=ids=>ids.reduce((a,k)=>a+(PACTS.find(p=>p.id===k)||{heat:0}).heat,0);
function hpMul(m){let f=1;if(hasP('hard'))f*=1.15;if(hasP('mighty')&&(m.boss||m.mini))f*=1.1;return f;}
const LBASE={hair:LOOKS.hair.length,outfit:LOOKS.outfit.length};
LOOKS.hair.push(...HEAT_LOOKS.map(x=>x.c));LOOKS.outfit.push(...HEAT_LOOKS.map(x=>x.c));
function lookReq(part,i){return (LBASE[part]!=null&&i>=LBASE[part])?HEAT_LOOKS[i-LBASE[part]].req:0;}
function heatLine(){if(!run.heat)return '';return `<p class="muted">Heat ${run.heat}: banked Embers \u00D7${(1+run.heat*0.1).toFixed(1)}.</p>${run.heatRecord!=null?`<p class="unlock"><b>New best Heat for ${heroName(run.hero)}: ${run.heat}.</b>${run.newLooks&&run.newLooks.length?` Unlocked style colors: ${run.newLooks.join(', ')}.`:''}</p>`:''}`;}
function pactV(){
  const k=S.ph,h=hs(k),sel=h.pacts||[];
  return `<h2>PACTS: ${up(heroName(k))}</h2><p class="muted">Pacts make the run harder and raise its Heat. Each point of Heat adds 10% to the Embers you bank, and clearing the amulet at a new best Heat unlocks style colors.</p>
  <p class="px" style="font-size:12px;margin-top:12px;color:var(--pink)">HEAT ${pactHeat(sel)} <span class="muted" style="font-size:9px">BEST ${h.heatBest||0}</span></p>
  <div class="stack" style="margin-top:12px">${PACTS.map(p=>{const on=sel.includes(p.id);return `<button class="box trow" style="width:100%;text-align:left;${on?'box-shadow:4px 4px 0 var(--pink);border-color:var(--pink)':''}" data-act="ptog:${p.id}" aria-pressed="${on}">${icon(on?'flame':'skull',28)}<div><b>${p.n}</b><br><span class="muted">${p.x}</span></div><span class="px" style="font-size:10px">+${p.heat}</span></button>`;}).join('')}</div>
  <p style="margin-top:18px" class="row"><button class="btn" data-act="start:${k}">DESCEND AT HEAT ${pactHeat(sel)}</button><button class="btn ghost" data-act="home">BACK</button></p>`;
}


