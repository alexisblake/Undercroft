/* Upgraded (+) versions of cards. */
"use strict";
/* ---------- UPGRADES: every non-curse card has a + version ---------- */
const UP={
  strike:{dmg:5,x:'Deal 5.'},block:{blk:5,x:'Block 5.'},wind:{heal:3,draw:2,x:'Heal 3. Draw 2.'},
  slash:{dmg:6,x:'Deal 6.'},riposte:{blk:3,dmg:4,x:'Block 3. Deal 4.'},vanish:{blk:7,x:'Block 7. Draw 1.'},
  twin:{dmg:3,x:'Deal 3 twice.'},backstab:{bs:[4,10],x:'Deal 4. If the enemy has no Guard, deal 10 instead.'},
  smolder:{blk:4,burn:3,x:'Block 4. Apply 3 Burn.'},flare:{dmg:2,burn:3,x:'Deal 2. Apply 3 Burn.'},fan:{draw:1,x:'Double the enemy\u2019s Burn. Draw 1.'},
  heavy:{dmg:9,x:'Deal 9.'},jab:{dmg:3,x:'Deal 3. Draw 1.'},bash:{blk:4,dmg:5,x:'Block 4. Deal 5.'},brace:{blk:10,x:'Block 10.'},
  bandage:{heal:5,x:'Heal 5.'},counter:{blk:5,ctr:6,x:'Block 5. If the enemy attacks this turn, deal 6 back.'},
  focus:{draw:2,x:'Your next attack deals double. Draw 2.'},finisher:{fin:[5,13],x:'Deal 5. If the enemy is at half HP or less, deal 13 instead.'},
  adrenaline:{draw:2,x:'Play 2 extra cards this turn. Draw 2. Exhaust.'},
  bulwark:{blk:16,x:'Block 16. Exhaust.'},execute:{dmg:14,x:'Deal 14. Exhaust.'},rally:{str:3,x:'Gain 3 Strength. Exhaust.'},
  poised:{dmg:7,x:'Retain. Deal 7.'},patience:{blk:7,x:'Retain. Block 7. Draw 1.'},
  kindle:{dmg:3,burn:3,x:'Deal 3. Apply 3 Burn.'},wildfire:{burn:6,x:'Apply 6 Burn.'},stoke:{stoke:3,x:'Deal damage equal to three times the enemy\u2019s Burn.'},
  temper:{dmg:4,x:'Deal 4. Gain 1 Strength.'},fury:{str:3,x:'Gain 3 Strength.'},flurry:{hits:4,x:'Deal 1 four times.'},
  wither:{blk:4,x:'Block 4. Apply 2 Weak.'},mark:{exp:3,x:'Apply 3 Exposed. Draw 1.'},hexbolt:{dmg:5,x:'Deal 5. Apply 1 Weak and 1 Exposed.'},
  bramble:{blk:6,x:'Block 6. Gain 1 Thorns.'},thornwall:{thorns:4,x:'Gain 4 Thorns.'},overgrowth:{grow:[5,2],x:'Block 5, plus 2 for each Thorns you have.'},
  hedgefire:{thorns:3,x:'Gain 3 Thorns. This fight, your Thorns also apply 1 Burn.'},fever:{burn:3,x:'Apply 3 Burn. This fight, Burn deals double to Exposed enemies.'},
  press:{dmg:5,x:'Deal 5. If the enemy is Exposed, gain 2 Strength.'},ironbark:{blk:8,x:'Block 8. This fight, Thorns deal +1 per Strength.'},
  forge:{str:2,x:'Gain 2 Strength. Apply Burn equal to twice your Strength.'},vines:{weak:3,x:'Apply 3 Weak. Gain Thorns equal to the enemy\u2019s Weak.'},
};
Object.assign(UP,{
  cleave:{dmg:32,x:'Deal 32. Retain. Ultimate: once per run.'},laststand:{blk:38,x:'Block 38. Retain. Ultimate: once per run.'},conflag:{burn:20,x:'Apply 20 Burn. Retain. Ultimate: once per run.'},hexstorm:{weak:6,exp:6,x:'Apply 6 Weak and 6 Exposed. Stun. Retain. Ultimate: once per run.'},
  quickdraw:{draw:3,x:'Draw 3. Exhaust.'},sidestep:{blk:5,x:'Block 5.'},flick:{dmg:3,x:'Deal 3.'},
  thornburst:{tb:[6,4],x:'Deal 6, plus 4 for each Thorns you have. Stun: the enemy skips its next turn. Exhaust.'},hammerstorm:{dmg:4,x:'Deal 4 four times, then gain 2 Strength. Exhaust.'},
  mend:{heal:7,blk:4,x:'Heal 7. Block 4. Consume: gone from your deck after use.'},siphon:{dmg:7,steal:3,x:'Deal 7. Lifesteal: heal for up to 3 of the damage dealt. Exhaust.'},sanctuary:{blk:11,heal:11,x:'Block 11. Heal 11. Consume: gone from your deck after use.'},
});
Object.keys(UP).forEach(k=>{if(CARDS[k])CARDS[k+'+']=Object.assign({},CARDS[k],UP[k],{n:CARDS[k].n+'+',up:1});});
const canUp=k=>!!CARDS[k+'+'];
const isCurse=k=>CARDS[k].t==='curse';
