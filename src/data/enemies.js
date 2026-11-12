/* Enemies for all four floors, room pools, floor tuning, loot and trinkets. */
"use strict";
const MON={
  rats:{n:'Rat Vagrant',note:'A dusty vagrant with a rusty knife and nothing to lose.',hp:6,i:[['a',2],['a',2],['a',3]],tier:'Shallow'},
  moth:{n:'Ghost Moth',hp:8,i:[['b',3],['a',4]],tier:'Shallow'},
  hound:{n:'Ghoulish Puppy',hp:9,i:[['a',3],['s',2],['a',4]],tier:'Shallow'},
  wisp:{n:'Wandering Wisp',hp:12,i:[['a',3],['a',3],['a',7]],tier:'Deep'},
  knight:{n:'Bone Knight',hp:15,i:[['b',5],['a',6]],tier:'Deep'},
  lurker:{n:'Dungeon Goblin',hp:17,i:[['a',4],['a',8]],tier:'Deep'},
  warden:{n:'The Key Master',hp:26,i:[['a',5],['b',6],['a',6],['a',10]],tier:'Miniboss',mini:1},
  gate:{n:'Ratthew, the Rat King',hp:40,i:[['a',6],['b',8],['a',11],['a',4]],tier:'Boss',boss:1,enrage:2,summon:1,note:'At half HP he yells for help: Rat Vagrants swarm in, +2 to all his attacks.'},
};
const MON2={
  eel:{n:'Gargoyle Frog',hp:16,i:[['a',4],['s',2],['b',5],['a',5]],tier:'Nave',note:'Puffs up for +2 Attack, then hides behind a wall of swamp water.'},
  leech:{n:'Rat Zealot',hp:18,i:[['a',5],['b',5],['a',6]],tier:'Nave',note:'Prays behind his staff, then strikes.'},
  ghoul:{n:'Chapel Ghoul',hp:15,i:[['a',6],['b',5],['a',8]],tier:'Deep Nave',note:'Raises its unholy cross to guard, then strikes.'},
  siren:{n:'Drowned Siren',hp:16,i:[['w',1],['a',6],['a',5]],tier:'Nave',note:'Her song makes you Weak.'},
  ooze:{n:'Lil Ooze',hp:22,i:[['a',4],['a',5]],tier:'Deep Nave',split:1,note:'At half HP it splits and attacks twice.'},
  crab:{n:'Reliquary Crab',hp:20,i:[['b',7],['a',10]],tier:'Deep Nave',note:'Hides in its shell, then snaps.'},
  choir:{n:'The Choirmaster',hp:32,i:[['a',6],['w',1],['a',8],['h',6],['a',10]],tier:'Miniboss',mini:1,note:'Sings, heals, and hits hard.'},
  saint:{n:'The Drowned Saint',hp:36,i:[['a',7],['w',1],['a',9],['b',8]],tier:'Boss',boss:1,
    phase2:{id:'saint2',n:'The Saint Unveiled',hp:24,i:[['a',8],['a',8],['h',5],['a',13]]},note:'Two phases. When the Saint falls, the Unveiled rises.'},
};
const PLAN=['e','e','e','m','h','h','h','B'];
const POOL={e:['rats','moth','hound'],h:['wisp','knight','lurker','hound'],m:['warden'],B:['gate']};
const POOL2={e:['eel','leech','siren'],h:['ooze','crab','ghoul','eel'],m:['choir'],B:['saint']};
Object.assign(MON,MON2);
const MON3={
  robber:{n:'Grave Robber',hp:20,i:[['a',6],['x',3],['a',7]],tier:'Ruins',note:'Steals your Embers.'},
  rubble:{n:'Rubble Swarm',hp:22,i:[['a',3],['a',4]],hits:2,tier:'Ruins',note:'Attacks twice.'},
  glyph:{n:'Glyph Spirit',hp:20,i:[['c',1],['a',7],['w',1]],tier:'Ruins',note:'Inscribes Cursed Glyphs into your discard.'},
  sentry:{n:'Ruin Sentry',hp:28,i:[['b',8],['a',12]],tier:'Deep Ruins',note:'Braces, then swings hard.'},
  stonehound:{n:'Stone Hound',hp:24,i:[['a',5],['a',6]],grow:1,tier:'Deep Ruins',note:'Grows: +1 Attack after every turn.'},
  golem:{n:'The Old Golem',hp:50,i:[['b',10],['a',11],['a',8],['a',15]],keepBlk:1,mini:1,tier:'Miniboss',note:'Stoneskin: its Guard never wears off. Burn and Exposed get around it.'},
  shaman:{n:'The Ruin Shaman',hp:62,i:[['a',8],['c',1],['w',1],['h',8],['a',11]],boss:1,split:1,splitText:'calls down the storm! It now attacks twice.',tier:'Boss',note:'At half HP it calls the storm and attacks twice.'},
};
const MON4={
  pixies:{n:'Pixie Swarm',hp:22,i:[['a',4],['a',5]],hits:2,tier:'Fae',note:'Attacks twice.'},
  thornsprite:{n:'Thorn Sprite',hp:24,i:[['a',7],['b',6],['a',8]],spikes:1,tier:'Fae',note:'Prickly: every hit you land costs you 1 HP.'},
  changeling:{n:'Changeling',hp:24,i:[['w',1],['a',8],['h',6]],tier:'Fae',note:'Sings you Weak and mends itself.'},
  stag:{n:'Glamour Stag',hp:32,i:[['b',8],['a',14]],tier:'Deep Fae',note:'Lowers its antlers, then charges.'},
  moonmoth:{n:'Moon Moth',hp:26,i:[['c',1],['a',9],['a',7]],tier:'Deep Fae',note:'Scatters Cursed Glyphs.'},
  bloom:{n:'The Corpse Bloom',hp:60,i:[['a',10],['c',1],['a',13],['w',1]],regen:4,mini:1,tier:'Miniboss',note:'Regrows 4 HP at the end of every turn.'},
  king:{n:'The Fairy King',hp:90,i:[['a',10],['m',8],['b',10],['m',8],['a',16]],boss:1,enrage:3,duel:1,tier:'Final boss',note:'A duel for the amulet. Mirror: he turns the last card you played this turn back on you. Enrages at half HP: +3 to all attacks.'},
};
Object.assign(MON,MON3,MON4);
/* Four-layer tuning pass: layers 2 to 4 rebalanced so the Sewers are the midpoint, not the finale. */
const TUNING={"eel":{"hp":13},"leech":{"hp":14},"siren":{"hp":13},"ooze":{"hp":16},"crab":{"hp":15,"i":[["b",6],["a",8]]},"choir":{"hp":24,"i":[["a",5],["w",1],["a",7],["h",4],["a",8]]},"saint":{"hp":24,"i":[["a",6],["w",1],["a",7],["b",6]],"phase2":{"id":"saint2","n":"The Saint Unveiled","hp":14,"i":[["a",6],["a",6],["h",3],["a",10]]}},"robber":{"hp":16},"rubble":{"hp":16},"glyph":{"hp":15},"sentry":{"hp":20,"i":[["b",6],["a",9]]},"stonehound":{"hp":17,"i":[["a",4],["a",5]]},"golem":{"hp":26,"i":[["b",5],["a",7],["a",6],["a",10]]},"shaman":{"hp":34,"i":[["a",6],["c",1],["w",1],["h",5],["a",8]]},"pixies":{"hp":15},"thornsprite":{"hp":16},"changeling":{"hp":16},"stag":{"hp":22,"i":[["b",6],["a",10]]},"moonmoth":{"hp":17},"bloom":{"hp":32,"regen":2,"i":[["a",7],["c",1],["a",10],["w",1]]},"king":{"hp":42,"i":[["a",7],["m",5],["b",7],["m",5],["a",10]],"enrage":2}};
for(const k in TUNING)Object.assign(MON[k],TUNING[k]);
/* Deep layers: tougher through staying power, not burst. More HP, slightly softer hits. */
const DEEP={3:{hp:1.3,atk:1},4:{hp:1.4,atk:1}};
[[MON3,DEEP[3]],[MON4,DEEP[4]]].forEach(([M,D])=>{for(const k in M){const m=MON[k];m.hp=Math.round(m.hp*D.hp);m.i=m.i.map(([t,v])=>(t==='a'||t==='m')?[t,Math.max(1,Math.round(v*D.atk))]:[t,v]);}});
const POOL3={e:['robber','rubble','glyph'],h:['sentry','stonehound','glyph','rubble'],m:['golem'],B:['shaman']};
const POOL4={e:['pixies','thornsprite','changeling'],h:['stag','moonmoth','thornsprite','pixies'],m:['bloom'],B:['king']};
const LAYERS=[null,
  {n:'The Underbelly',pool:POOL,earn:{e:2,h:3,m:6,B:10},mons:()=>Object.keys(MON).filter(k=>!MON2[k]&&!MON3[k]&&!MON4[k]),rule:'',
    down:''},
  {n:'The Sewers',pool:POOL2,earn:{e:3,h:4,m:8,B:15},mons:()=>Object.keys(MON2),rule:'Rising Tide: enemies gain +1 Attack each turn after the third.',
    down:'The Rat King falls. Behind his throne, a grate opens onto black water: the sewers.'},
  {n:'The Old City Ruins',pool:POOL3,earn:{e:4,h:5,m:10,B:18},mons:()=>Object.keys(MON3),rule:'Falling Stone: every third turn, you and the enemy each take 3 damage.',
    down:'The Saint sinks. Past the last culvert, the water drains into streets that were buried centuries ago.'},
  {n:'The Fae Court',pool:POOL4,earn:{e:5,h:6,m:12,B:25},mons:()=>Object.keys(MON4),rule:'Glamour: every other turn, the enemy\u2019s intent is hidden.',
    down:'The Shaman crumbles. Beneath the oldest stone, flowers grow toward a light that isn\u2019t the sun.'},
];
const pool=()=>LAYERS[run.layer].pool;

const EARN2={e:3,h:4,m:8,B:15};
const LOOT=Object.keys(CARDS).filter(k=>CARDS[k].r&&CARDS[k].r!=='u');
const ULTS=Object.keys(CARDS).filter(k=>CARDS[k].ult);
const ULT_MAX=2;
const DUO=Object.keys(CARDS).filter(k=>CARDS[k].p==='duo');
const TRINKETS={
  whet:{n:'Whetstone',x:'Your first hit each fight deals +3.'},
  coin:{n:'Lucky Coin',x:'+1 Ember after every fight.'},
  kettle:{n:'Iron Kettle',x:'Heal doors restore 3 more HP.'},
  tinder:{n:'Tinderbox',x:'Enemies start each fight with 2 Burn.'},
  mail:{n:'Thornmail',x:'Start each fight with 1 Thorns.'},
  map:{n:'Old Map',x:'See which enemy waits behind each door.'},
};
const TRINKET_COST=8, TRINKET_SLOTS=3;
