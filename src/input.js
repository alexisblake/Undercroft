/* Taps, clicks, and animation hand-offs. */
"use strict";
/* ---------- EVENTS ---------- */
document.addEventListener('input',e=>{if(e.target&&e.target.id==='hname'&&S.cust){hs(S.cust).name=e.target.value.slice(0,14);}});
document.addEventListener('change',e=>{if(e.target&&e.target.id==='hname')save();});
/* After a one-shot attack or hurt animation, drop back into the idle loop. */
document.addEventListener('animationend',e=>{
  const el=e.target;if(!el.classList)return;
  const one=['atk','hurt','fire','eye','thorn','heal','yell','guard','smash','summon','taunt','sing','ultatk','ultdef'].find(a=>el.classList.contains('anim-'+a));if(!one)return;
  if(el.dataset.hk){
    const k=el.dataset.hk,A=ART[k];if(!A||!A.anims)return;const r=heroRest(k),n=A.anims[r].n;
    el.className=el.className.replace(/\bn\d+\b/,'n'+n).replace('anim-'+one,'anim-'+r);
    el.style.backgroundImage=`url(${artURL(k,hs(k).look,r)})`;el.style.backgroundSize=`${n*100}% 100%`;
    if(A.pix)el.style.animation=heroAnimCSS(r,n).replace(/^animation:|;$/g,'');
  }else if(el.dataset.ek){
    const E=EANIM[el.dataset.ek];if(!E)return;const n=E.anims.idle.n;
    el.className=el.className.replace(/\bn\d+\b/g,'').replace('anim-'+one,'')+' anim-idle n'+n;el.style.animation=[4,6,9].includes(n)?'':heroAnimCSS('idle',n).replace(/^animation:|;$/g,'');
    el.style.backgroundImage=`url(${E.anims.idle.src})`;el.style.backgroundSize=`${n*100}% 100%`;
  }
  requestAnimationFrame(phaseLock);
});
document.addEventListener('click',e=>{
  if(S.dying)return;
  const b=e.target.closest('[data-act]');if(!b||b.disabled)return;
  const [a,arg]=b.dataset.act.split(':');
  if(a!=='reset')S.resetArm=0;
  if(a==='start')startRun(arg);
  else if(a==='home'){S.screen='home';S.tab='play';render();}
  else if(a==='tab'){S.tab=arg;render();}
  else if(a==='play'){const before=run.fight.m.hp;S.pendingHit=before;play(+arg);}
  else if(a==='end')endTurn();
  else if(a==='take')takeCard(arg);
  else if(a==='purge')purge(+arg);
  else if(a==='upg'){run.deck[+arg]+='+';afterReward();}
  else if(a==='dup'){run.deck.push(run.deck[+arg]);afterReward();}
  else if(a==='etr'){run.trinkets.push(arg);afterReward();}
  else if(a==='eult'){run.deck.push(run.reward.ult);run.ultGot=(run.ultGot||0)+1;afterReward();}
  else if(a==='eup'){run.reward={type:'upgrade'};render();}
  else if(a==='buyforge'){const s=run.shop;if(!s.forged&&run.embers>=s.forge){spend(s.forge);s.forged=1;run.reward={type:'upgrade',back:'shop'};S.screen='reward';render();}}
  else if(a==='ev'){const E=EVENTS[run.event.id],o=E.opts[+arg];if(!o.can||o.can())o.go();}
  else if(a==='after')afterReward();
  else if(a==='doors')toDoors();
  else if(a==='evrew'){const r=run.event.after;run.event.after=null;toReward(r);}
  else if(a==='door')enter(run.doors[+arg]);
  else if(a==='perk')takePerk(arg);
  else if(a==='buy')buy(+arg);
  else if(a==='buyheal')buyHeal();
  else if(a==='cust'){S.cust=arg;S.screen='custom';render();}
  else if(a==='arms'){S.wh=arg;S.screen='arms';render();}
  else if(a==='pact'){S.ph=arg;S.screen='pact';render();}
  else if(a==='ptog'){const h=hs(S.ph),L=(h.pacts||[]).slice(),i=L.indexOf(arg);if(i>=0)L.splice(i,1);else L.push(arg);h.pacts=L;save();render();}
  else if(a==='equip'){hs(S.wh).weapon=arg;save();render();}
  else if(a==='look'){const [part,v]=arg.split('.'),h=hs(S.cust);h.look=Object.assign({},h.look||{});if(+v<0)delete h.look[part];else h.look[part]=+v;save();render();}

  else if(a==='buyt')buyT(+arg);
  else if(a==='buypurge')buyPurge();
  else if(a==='reset'){
    if(!S.resetArm){S.resetArm=1;render();return;}
    S.resetArm=0;meta=freshMeta();save();render();
  }
});

