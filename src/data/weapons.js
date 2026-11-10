/* Weapons: three lines per hero, four forms each, and their final passives. */
"use strict";
/* ---------- WEAPONS: three per hero, each evolving through four forms with mastery ---------- */
Object.assign(CARDS,{
  rusty:{n:'Rusty Swing',t:'atk',x:'Deal 3.',dmg:3,src:'Weapon'},
  parry:{n:'Parry',t:'def',x:'Block 2. Deal 1.',blk:2,dmg:1,src:'Weapon'},
  plank:{n:'Hide',t:'def',x:'Block 3.',blk:3,src:'Weapon'},
  shove:{n:'Shield Shove',t:'def',x:'Block 4. Deal 2.',blk:4,dmg:2,src:'Weapon'},
  slam:{n:'Shield Slam',t:'atk',x:'Deal damage equal to your Block.',slam:0,src:'Weapon'},
  poke:{n:'Feint',t:'atk',x:'Deal 2. If the enemy intends to attack, deal 4 instead.',ifa:[2,4],src:'Weapon'},
  pole:{n:'En Garde',t:'def',x:'Block 2. If the enemy attacks this turn, deal 2 back.',blk:2,ctr:2,src:'Weapon'},
  thrust:{n:'Thrust',t:'atk',x:'Deal 3. If the enemy intends to attack, deal 6 instead.',ifa:[3,6],src:'Weapon'},
  setspear:{n:'Parry Stance',t:'def',x:'Block 3. If the enemy attacks this turn, deal 4 back.',blk:3,ctr:4,src:'Weapon'},
  nick:{n:'Nick',t:'atk',x:'Deal 1 twice.',dmg:1,hits:2,src:'Weapon'},
  shiv:{n:'Shiv',t:'atk',x:'Deal 2. If the enemy has no Guard, deal 5 instead.',bs:[2,5],src:'Weapon'},
  dullknife:{n:'Dull Toss',t:'atk',x:'Deal 2. Draw 1.',dmg:2,draw:1,src:'Weapon'},
  scatter:{n:'Scatter',t:'atk',x:'Deal 1 three times. Exhaust.',dmg:1,hits:3,ex:1,src:'Weapon'},
  knife:{n:'Knife Toss',t:'atk',x:'Deal 4. Draw 1.',dmg:4,draw:1,src:'Weapon'},
  volley:{n:'Volley',t:'atk',x:'Deal 2 three times. Exhaust.',dmg:2,hits:3,ex:1,src:'Weapon'},
  tug:{n:'Tug',t:'atk',x:'Deal 1. Apply 1 Weak.',dmg:1,weak:1,src:'Weapon'},
  gap:{n:'Probe',t:'def',x:'Block 2. Apply 1 Exposed.',blk:2,exp:1,src:'Weapon'},
  choke:{n:'Choke',t:'atk',x:'Deal 3. Apply 1 Weak.',dmg:3,weak:1,src:'Weapon'},
  findgap:{n:'Find the Gap',t:'def',x:'Block 3. Apply 2 Exposed.',blk:3,exp:2,src:'Weapon'},
  cinder:{n:'Cinder',t:'atk',x:'Deal 1. Apply 1 Burn.',dmg:1,burn:1,src:'Weapon'},
  stir:{n:'Stir the Coals',t:'skill',x:'Apply 2 Burn.',burn:2,src:'Weapon'},
  frostspit:{n:'Frost Spit',t:'atk',x:'Deal 2. Apply 1 Weak.',dmg:2,weak:1,src:'Weapon'},
  rime:{n:'Rime',t:'def',x:'Block 3.',blk:3,src:'Weapon'},
  frostbolt:{n:'Frostbolt',t:'atk',x:'Deal 4. Apply 1 Weak.',dmg:4,weak:1,src:'Weapon'},
  iceward:{n:'Ice Ward',t:'def',x:'Block 4. Apply 1 Weak.',blk:4,weak:1,src:'Weapon'},
  dimlight:{n:'Dim Light',t:'atk',x:'Retain. Deal 4.',dmg:4,ret:1,src:'Weapon'},
  glint:{n:'Glint',t:'def',x:'Block 2. Draw 1.',blk:2,draw:1,src:'Weapon'},
  starfall:{n:'Starfall',t:'atk',x:'Retain. Deal 5.',dmg:5,ret:1,src:'Weapon'},
  glimmer:{n:'Glimmer',t:'def',x:'Retain. Block 4. Draw 1.',blk:4,draw:1,ret:1,src:'Weapon'},
});
Object.assign(UP,{
  shove:{blk:5,dmg:3,x:'Block 5. Deal 3.'},slam:{slam:3,x:'Deal damage equal to your Block, plus 3.'},
  thrust:{ifa:[4,9],x:'Deal 4. If the enemy intends to attack, deal 9 instead.'},setspear:{blk:4,ctr:6,x:'Block 4. If the enemy attacks this turn, deal 6 back.'},
  knife:{dmg:6,x:'Deal 6. Draw 1.'},volley:{dmg:3,x:'Deal 3 three times. Exhaust.'},
  choke:{dmg:4,weak:2,x:'Deal 4. Apply 2 Weak.'},findgap:{blk:5,x:'Block 5. Apply 2 Exposed.'},
  frostbolt:{dmg:5,x:'Deal 5. Apply 1 Weak.'},iceward:{blk:6,x:'Block 6. Apply 1 Weak.'},
  starfall:{dmg:7,x:'Retain. Deal 7.'},glimmer:{blk:6,x:'Retain. Block 6. Draw 1.'},
});
['shove','slam','thrust','setspear','knife','volley','choke','findgap','frostbolt','iceward','starfall','glimmer'].forEach(k=>{CARDS[k+'+']=Object.assign({},CARDS[k],UP[k],{n:CARDS[k].n+'+',up:1});});
const plus=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k+'+',v]));
const W=(id,ic,forms,blurb,k1,k2,pass)=>({id,ic,forms,blurb,kits:[k1,k2,plus(k2),plus(k2)],pass});
const WEAPONS={
  runaway:[
    W('blade','sword',['Rusted Blade','Knight\u2019s Sword','Dawnbreaker','Oathkeeper'],'Balanced cuts and parries.',{rusty:2,parry:1},{slash:2,riposte:1},{n:'Oath',x:'Your first hit each fight deals +4.',oath:4}),
    W('shield','shield',['Iron Broadsword','Warden\u2019s Blade','Bastion Edge','Aegis Brand'],'Stack Block, then slam the enemy with it.',{plank:2,slam:1},{shove:2,slam:1},{n:'Bulwark',x:'Every card that Blocks gives 1 more Block.',bulwark:1}),
    W('spear','target',['Dueling Saber','Riposte Blade','Mirror Edge','Skypiercer'],'Read the enemy. Your cards punish attacks; your blade shatters guards.',{poke:2,pole:1},{thrust:2,setspear:1},{n:'Guard Break',x:'Whenever an enemy gains Guard, shatter up to 5 of it. Shattered Guard hits the enemy for that much damage.',gbreak:5,gbDmg:1}),
  ],
  cutpurse:[
    W('daggers','dagger',['Chipped Shivs','Twin Daggers','Viper Fangs','Nightfang Pair'],'Many small hits and a finishing stab.',{nick:2,shiv:1},{twin:2,backstab:1},{n:'Venom',x:'Cards that hit more than once hit one extra time and apply 1 Exposed.',venom:1,extraHit:1}),
    W('knives','bolt',['Rusty Tacks','Throwing Knives','Storm Needles','Thousand Cuts'],'Draw fast, burst hard, burn through your hand.',{dullknife:2,scatter:1},{knife:2,volley:1},{n:'Quick Hands',x:'Play 1 extra card on your first two turns of every fight.',quick:1}),
    W('garrote','eye',['Frayed Cord','Garrote','Silk Noose','Widow\u2019s Thread'],'Weaken and expose. Enemies hit softer.',{tug:2,gap:1},{choke:2,findgap:1},{n:'Strangle',x:'Enemies start every fight with 2 Weak.',strangle:2}),
  ],
  ashbound:[
    W('staff','flame',['Charred Stick','Cinder Staff','Flame Scepter','Phoenix Staff'],'Stack Burn and let it work.',{cinder:2,stir:1},{flare:2,fan:1},{n:'Inferno',x:'Enemies start every fight with 4 Burn, and Burn no longer fades.',inferno:1,burnStart:4}),
    W('frost','snow',['Icicle Twig','Frost Wand','Glacier Rod','Winter\u2019s Heart'],'Keep enemies Weak and out of the fight.',{frostspit:2,rime:1},{frostbolt:2,iceward:1},{n:'Deep Freeze',x:'Weak enemies also deal 1 less damage.',freeze:1}),
    W('orb','orb',['Cloudy Marble','Star Orb','Moonstone Orb','Heart of the Cosmos'],'Hold big spells for the right turn.',{dimlight:2,glint:1},{starfall:2,glimmer:1},{n:'Orbit',x:'Gain 2 Block at the start of every turn.',orbit:2}),
  ],
};
const WTIER=[0,20,60,140], WUNLOCK=[1,3,6];
const tierOf=xp=>WTIER.reduce((t,th,i)=>xp>=th?i:t,0);
function weaponOpen(k,i){return hs(k).level>=WUNLOCK[i];}
function curWeapon(k){const h=hs(k),L=WEAPONS[k];let w=L.find(x=>x.id===h.weapon);if(!w||!weaponOpen(k,L.indexOf(w)))w=L[0];return w;}
function wxp(k,id){return (hs(k).wxp||{})[id]||0;}
function weaponName(k,w){w=w||curWeapon(k);return w.forms[tierOf(wxp(k,w.id))];}
