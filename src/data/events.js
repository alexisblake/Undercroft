/* Door events (the Gambler’s Skull and friends). */
"use strict";
/* ---------- EVENTS ---------- */
function evDone(text){run.event.result=text;render();}
function toReward(r){run.reward=r;S.screen='reward';render();}
const SKULL={laugh:'art/events/gambler-skull/laugh.png',idle:'art/events/gambler-skull/idle.png',angry:'art/events/gambler-skull/angry.png',out:'art/events/gambler-skull/out.png'};
const EVENTS={
  statue:{t:'A Weeping Statue',x:'Water runs from its eyes into a shallow bowl. Something is listening.',opts:[
    {l:'Offer blood (lose 6 HP): receive a boon',can:()=>run.hp>6,go:()=>{run.hp-=6;const p=rnd(Object.keys(PATRONS));const r={type:'boon',p};r.opts=shuffle(PATRONS[p].cards.slice()).slice(0,2);const d=availDuos(p);if(d.length)r.opts.push(rnd(d));toReward(r);}},
    {l:'Walk on',go:()=>evDone('You leave the statue to its grief.')}]},
  hoard:{t:'The Rat King\u2019s Hoard',x:'A nest of bones and bright coins. The rats are sleeping. Mostly.',opts:[
    {l:'Grab it all: +12 Embers, gain Fleas (a curse)',go:()=>{run.embers+=12;run.deck.push('fleas');evDone('You fill your pockets. Something bites your ankle.');}},
    {l:'Take a handful: +4 Embers',go:()=>{run.embers+=4;evDone('You slip away with a few coins.');}}]},
  anvil:{t:'A Forgotten Anvil',x:'Still warm. Someone was working here not long ago.',opts:[
    {l:'Temper a card (upgrade one)',can:()=>run.deck.some(canUp),go:()=>toReward({type:'upgrade'})},
    {l:'Break a card on it (remove one)',go:()=>toReward({type:'purge'})}]},
  skull:{t:'A Gambler\u2019s Skull',art:'skull',x:'It rattles on a stone table. It wants to play.',opts:[
    {l:'Roll the bones: a rare card, or take 7 damage',go:()=>{if(Math.random()<.5){run.event.face='out';run.event.after={type:'card',opts:lootPick(3,true)};evDone('Its candles gutter out. The skull pays its debts.');}else{run.hp=Math.max(1,run.hp-7);run.event.face='laugh';evDone('Snake eyes. The skull laughs as you bleed.');}}},
    {l:'Decline',go:()=>{run.event.face='angry';evDone('The skull flares up, then sulks.');}}]},
  pool:{t:'A Mirror Pool',x:'Your reflection is holding a card you don\u2019t remember drawing.',opts:[
    {l:'Reach in: copy a card from your deck',go:()=>toReward({type:'dup'})},
    {l:'Drink: heal 8',go:()=>{const h=Math.min(8,run.max-run.hp);run.hp+=h;evDone('Cold and clean. You heal '+h+'.');}}]},
  candle:{t:'The Candle Seller',x:'A hooded figure with a tray of stubby candles. \u201CFor the dark ahead.\u201D',opts:[
    {l:'Buy a trinket (5 Embers)',can:()=>run.embers>=5&&run.trinkets.length<TRINKET_SLOTS&&Object.keys(TRINKETS).some(k=>!run.trinkets.includes(k)),go:()=>{spend(5);const k=rnd(Object.keys(TRINKETS).filter(t=>!run.trinkets.includes(t)));run.trinkets.push(k);evDone('The seller presses a '+TRINKETS[k].n+' into your hand.');}},
    {l:'Buy a candle (3 Embers): heal 10',can:()=>run.embers>=3,go:()=>{spend(3);const h=Math.min(10,run.max-run.hp);run.hp+=h;evDone('The warmth soaks in. You heal '+h+'.');}},
    {l:'Move on',go:()=>evDone('\u201CSuit yourself.\u201D')}]},
};

const PLAYS=2, HEAL_DOOR=5, EMBER_DOOR=5;
const EARN={e:2,h:3,m:6,B:10};

