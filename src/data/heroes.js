/* Heroes and their level-up trees. */
"use strict";
/* Each hero levels on their own track, with their own upgrade tree. */
const HEROES={
  runaway:{n:'The Knight',hp:24,hand:4,renown:0,ic:'\u{1F5E1}',
    blurb:'Steady and hard to kill.',deck:{strike:5,block:3,wind:1},
    perks:{
      tougher:{n:'Tougher',x:'+4 max HP.',max:4,hp:4},
      sharpen:{n:'Sharpened',x:'A starting Strike becomes a Heavy Strike.',max:3,swap:['strike','heavy']},
      fortify:{n:'Fortified',x:'A starting Block becomes a Brace.',max:2,swap:['block','brace']},
      hearth:{n:'Hearth-marked',x:'Start every run with Kindle.',max:1,add:'kindle'},
      hedge:{n:'Hedge-marked',x:'Start every run with Bramble.',max:1,add:'bramble'},
      medic:{n:'Field medic',x:'Heal doors restore 3 more HP.',max:1,heal:3}}},
  cutpurse:{n:'The Rogue',hp:18,hand:5,renown:0,ic:'\u{1F977}',
    blurb:'Fragile and quick. Draws 5 cards a turn instead of 4.',deck:{strike:4,block:2,jab:2,vanish:1},
    perks:{
      wiry:{n:'Wiry',x:'+3 max HP.',max:4,hp:3},
      honed:{n:'Honed',x:'A starting Strike becomes Twin Cuts.',max:3,swap:['strike','twin']},
      shadow:{n:'Shadowed',x:'A starting Block becomes Vanish.',max:2,swap:['block','vanish']},
      fingers:{n:'Light fingers',x:'Start every run with Adrenaline.',max:1,add:'adrenaline'},
      quick:{n:'Quick draw',x:'Draw 2 extra cards on the first turn of each fight.',max:1,open:2},
      eye:{n:'Keen eye',x:'Start every run with Focus.',max:1,add:'focus'}}},
  ashbound:{n:'The Mage',hp:20,hand:4,renown:4,ic:'\u{1F56F}',
    blurb:'Fire, frost, and starlight. Slow to start, strong at the end.',deck:{strike:4,block:3,smolder:1},
    perks:{
      tempered:{n:'Tempered',x:'+4 max HP.',max:4,hp:4},
      kindling:{n:'Kindling',x:'A starting Strike becomes Kindle.',max:3,swap:['strike','kindle']},
      warded:{n:'Warded',x:'A starting Block becomes a Brace.',max:2,swap:['block','brace']},
      stoker:{n:'Stoker',x:'Start every run with Stoke.',max:1,add:'stoke'},
      pyre:{n:'Pyre',x:'Start every run with Wildfire.',max:1,add:'wildfire'},
      salve:{n:'Ash salve',x:'Heal doors restore 3 more HP.',max:1,heal:3}}},
};

