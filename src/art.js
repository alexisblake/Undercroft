/* Hero art, hair/cloak recolors, animation timing, which animation each card plays, and backgrounds. */
"use strict";
const IMG={};
Object.assign(SPRITES,{"i_sword":{"p":{"m":"#d8dce8","g":"#F2B31C"},"r":["......kk",".....kmk","....kmk.","k..kmk..",".kkmk...","..kgk...",".kgkk...","kk......"]},"i_shield":{"p":{"t":"#1FA6A0","g":"#F2B31C"},"r":["kkkkkkkk","kttggttk","kttggttk","kggggggk","kttggttk",".kttttk.","..kttk..","...kk..."]},"i_bolt":{"p":{"y":"#F2B31C"},"r":["....kkk.","...kyyk.","..kyyk..",".kyyyykk","kkkyyyk.","..kyyk..","..kyk...","..kk...."]},"i_target":{"p":{"p":"#F0508C"},"r":["..kkkk..",".kppppk.","kppwwppk","kpwkkwpk","kpwkkwpk","kppwwppk",".kppppk.","..kkkk.."]},"i_dagger":{"p":{"m":"#d8dce8","g":"#F2B31C"},"r":["k......k","mk....km",".mk..km.","..mkkm..","..kmmk..",".gk..kg.","gk....kg","k......k"]}});
Object.assign(SPRITES,{"i_q":{"p":{"y":"#F2B31C"},"r":["..kkkk..",".kyyyyk.","kyykkyyk",".kk.kyyk","...kyyk.","...kyk..","........","...kyk.."]}});
Object.assign(SPRITES,{"i_spear":{"p":{"m":"#d8dce8","w":"#f8f8f8","b":"#8a5a2a"},"r":["......kk",".....kmk","....kmk.","...kbk..","..kbk...",".kbk....","kbk.....","kk......"]},"i_snow":{"p":{"c":"#8fe6f0"},"r":["...k....","k.kck.k.",".kcck...","kcckcck.",".kcck...","k.kck.k.","...k....","........"]},"i_orb":{"p":{"b":"#9fb8ff","p":"#7B4BA8","g":"#F2B31C"},"r":["..kkkk..",".kbwbbk.","kbwbbbbk","kbbbbpbk","kbbbpbbk",".kbbbbk.","..kkkk..",".kggggk."]}});
const LOOKS={
  skin:['#f7d7b5','#f2c29a','#d9a066','#a86b3c','#6b4226'],
  hair:['#7a4a24','#2a1b1b','#e8c04a','#c0402a','#e8e8f0','#F0508C','#1FA6A0','#7B4BA8'],
  outfit:['#3868d0','#F0508C','#1FA6A0','#F2B31C','#7B4BA8','#3a8a4a','#c04828','#404050'],
};
const PARTS={runaway:{skin:'s',hair:'h',outfit:'c',outfit2:'d'},cutpurse:{skin:'s',hair:'x',outfit:'p',outfit2:'q'},ashbound:{skin:'s',hair:'a',outfit:'r'}};
function hexAdj(hex,f){
  let r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,sat=0,l=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;sat=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
  l=Math.max(0,Math.min(1,l+f));
  const q=l<.5?l*(1+sat):l+sat-l*sat,pp=2*l-q;
  const hue=t=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp;};
  const to=v=>Math.round(v*255).toString(16).padStart(2,'0');
  return sat===0?'#'+to(l)+to(l)+to(l):'#'+to(hue(h+1/3))+to(hue(h))+to(hue(h-1/3));
}
function lookPal(hero,look){
  const P=PARTS[hero],o={};if(!P||!look)return o;
  if(look.skin!=null&&P.skin)o[P.skin]=LOOKS.skin[look.skin];
  if(look.hair!=null&&P.hair)o[P.hair]=LOOKS.hair[look.hair];
  if(look.outfit!=null&&P.outfit){o[P.outfit]=LOOKS.outfit[look.outfit];if(P.outfit2)o[P.outfit2]=hexAdj(LOOKS.outfit[look.outfit],-.18);}
  return o;
}
/* 16x16 art is doubled to 32x32 with Scale2x (rounds diagonals), outlines thinned back to 1px, then lit from the top-left. */
function scale2x(g){
  const h=g.length,w=g[0].length,o=Array.from({length:h*2},()=>Array(w*2).fill('.'));
  const at=(y,x)=>(y>=0&&y<h&&x>=0&&x<w)?g[y][x]:'.';
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const P=g[y][x],A=at(y-1,x),B=at(y,x+1),C=at(y,x-1),D=at(y+1,x);
    o[2*y][2*x]=(C===A&&C!==D&&A!==B)?A:P;o[2*y][2*x+1]=(A===B&&A!==C&&B!==D)?B:P;
    o[2*y+1][2*x]=(D===C&&D!==B&&C!==A)?C:P;o[2*y+1][2*x+1]=(B===D&&B!==A&&D!==C)?D:P;
  }
  const n=o.length,m=o[0].length,t=o.map(r=>r.slice());
  for(let y=0;y<n;y++)for(let x=0;x<m;x++){
    if(o[y][x]!=='k')continue;
    const ns=[[y-1,x],[y+1,x],[y,x-1],[y,x+1]].map(([a,b])=>(a>=0&&a<n&&b>=0&&b<m)?o[a][b]:'.');
    if(ns.includes('.')&&!ns.some(c=>c!=='.'&&c!=='k'))t[y][x]='.';
  }
  return t;
}
function spriteURL(key,over){
  const ck=key+'|'+JSON.stringify(over||{});
  if(ck in IMG)return IMG[ck];
  try{
    const d=SPRITES[key];let g=d.r.map(r=>[...r]);const big=g.length===16;if(big)g=scale2x(g);
    const n=g.length,c=document.createElement('canvas');c.width=n;c.height=n;const x=c.getContext('2d');
    const p=Object.assign({k:'#1a1a2e',w:'#f8f8f8'},d.p,over||{}),edge=ch=>ch==='.'||ch==='k';
    for(let y=0;y<n;y++)for(let i=0;i<n;i++){const ch=g[y][i];if(ch==='.')continue;let col=p[ch];
      if(big&&ch!=='k'){const dn=y<n-1?g[y+1][i]:'.',upc=y>0?g[y-1][i]:'.',lf=i>0?g[y][i-1]:'.';
        if(edge(dn))col=hexAdj(col,-.14);else if(edge(upc)||edge(lf))col=hexAdj(col,.12);}
      x.fillStyle=col;x.fillRect(i,y,1,1);}
    IMG[ck]=c.toDataURL();
  }catch(e){IMG[ck]='';}
  return IMG[ck];
}
/* Hero art: the Runaway's portrait plus 6-frame animation strips for the Cutpurse and Ashbound.
   Customization recolors by hue band so the same looks apply to every piece of hero art. */
const ART={
  runaway:{anims:{spin:{src:'art/heroes/knight/spin.png',n:8},fire:{src:'art/heroes/knight/fire.png',n:17},eye:{src:'art/heroes/knight/eye.png',n:17},hurt:{src:'art/heroes/knight/hurt.png',n:9},idle:{src:'art/heroes/knight/idle.png',n:9},yell:{src:'art/heroes/knight/yell.png',n:9},heal:{src:'art/heroes/knight/heal.png',n:17},win:{src:'art/heroes/knight/win.png',n:13},atk:{src:'art/heroes/knight/atk.png',n:13},thorn:{src:'art/heroes/knight/thorn.png',n:17},breathe:{src:'art/heroes/knight/breathe.png',n:5},guard:{src:'art/heroes/knight/guard.png',n:9},dead:{src:'art/heroes/knight/dead.png',n:6}},src:'',frames:9,w:128,h:128,pix:1,cx:.48,rw:96,sw:192,
    cls:(h,s,l)=>(h>=245&&h<=295&&s>.08&&s<.4&&l>.7)?'hair':(h>=222&&h<=255&&s>.25&&l>.1&&l<.45)?'outfit':(h>=12&&h<=35&&s>.3&&l>.75)?'skin':null},
  cutpurse:{anims:{spin:{src:'art/heroes/rogue/spin.png',n:8},ultdef:{src:'art/heroes/rogue/ultdef.png',n:17},atk:{src:'art/heroes/rogue/atk.png',n:9},thorn:{src:'art/heroes/rogue/thorn.png',n:13},ultatk:{src:'art/heroes/rogue/ultatk.png',n:17},fire:{src:'art/heroes/rogue/fire.png',n:9},guard:{src:'art/heroes/rogue/guard.png',n:9},idle:{src:'art/heroes/rogue/idle.png',n:5},eye:{src:'art/heroes/rogue/eye.png',n:13},hurt:{src:'art/heroes/rogue/hurt.png',n:9},heal:{src:'art/heroes/rogue/heal.png',n:9},win:{src:'art/heroes/rogue/win.png',n:13},dead:{src:'art/heroes/rogue/dead.png',n:13}},src:'',frames:9,w:128,h:128,pix:1,cx:.48,rw:96,sw:192,
    cls:()=>null},
  ashbound:{src:'art/heroes/ashbound/portrait.png',frames:6,w:51,h:47,
    cls:(h,s,l)=>((h>=300||h<5)&&s>.35&&l>.55&&l<.9)?'hair':(h>=250&&h<=285&&s>.3&&l>.28&&l<.68)?'outfit':(h>=12&&h<=35&&s>.25&&l>.72)?'skin':null},
};
const KNIGHT_CHIBI='art/heroes/knight/chibi.png';
const artImg={};
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return [h,s,l];}
function hsl2rgb(h,s,l){h/=360;if(s===0){const v=Math.round(l*255);return [v,v,v];}
  const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=t=>{if(t<0)t+=1;if(t>1)t-=1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};
  return [f(h+1/3),f(h),f(h-1/3)].map(v=>Math.round(v*255));}
function hexHsl(hex){return rgb2hsl(parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16));}
function artURL(k,look,an){
  const A0=ART[k],A=A0.anims?{src:(A0.anims[an||'idle']||A0.anims.idle).src,cls:A0.cls}:A0,ik=k+'|'+(an||'');look=look||{};
  if(!Object.keys(look).length)return A.src;
  const key='art|'+ik+'|'+JSON.stringify(look);
  if(key in IMG)return IMG[key];
  if(!artImg[ik]){try{const im=new Image();artImg[ik]={im,ready:false};im.onload=()=>{artImg[ik].ready=true;render();};im.src=A.src;}catch(e){}return A.src;}
  if(!artImg[ik].ready)return A.src;
  try{
    const im=artImg[ik].im,c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);
    const d=x.getImageData(0,0,c.width,c.height),a=d.data,tgt={};
    if(look.hair!=null)tgt.hair=hexHsl(LOOKS.hair[look.hair]);
    if(look.outfit!=null)tgt.outfit=hexHsl(LOOKS.outfit[look.outfit]);
    if(look.skin!=null)tgt.skin=hexHsl(LOOKS.skin[look.skin]);
    const cls=new Array(a.length/4),sum={},cnt={};
    for(let i=0;i<a.length;i+=4){if(a[i+3]<20)continue;const [h,s,l]=rgb2hsl(a[i],a[i+1],a[i+2]);const q=A.cls(h,s,l);
      if(q&&tgt[q]){cls[i/4]=[q,l];sum[q]=(sum[q]||0)+l;cnt[q]=(cnt[q]||0)+1;}}
    for(let i=0;i<a.length;i+=4){const q=cls[i/4];if(!q)continue;const T=tgt[q[0]],ref=sum[q[0]]/cnt[q[0]];
      const nl=Math.max(0,Math.min(1,q[1]+(T[2]-ref)*.9));const [r,g,b]=hsl2rgb(T[0],Math.max(T[1],.05),nl);a[i]=r;a[i+1]=g;a[i+2]=b;}
    x.putImageData(d,0,0);IMG[key]=c.toDataURL();return IMG[key];
  }catch(e){return A.src;}
}
function stripHTML(k,cls,extra,an){const A=ART[k];if(A.anims){const a2=A.anims[an]?an:'idle',n=A.anims[a2].n;return `<div data-hk="${k}" class="strip n${n} anim-${a2} ${cls||''}" style="background-size:${n*100}% 100%;aspect-ratio:${A.w}/${A.h};background-image:url(${artURL(k,hs(k).look,a2)});image-rendering:${A.pix?'pixelated':'auto'};${A.pix?heroAnimCSS(a2,n):''}${extra||''}" role="img" aria-label="${HEROES[k].n}"></div>`;}return `<div class="strip f${A.frames} ${cls||''}" style="background-size:${A.frames*100}% 100%;aspect-ratio:${A.w}/${A.h};background-image:url(${artURL(k,hs(k).look)});${extra||''}" role="img" aria-label="${HEROES[k].n}"></div>`;}
function esc(t){return String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);}
function heroName(k){const n=(hs(k).name||'').trim();return n?esc(n)+' the '+HEROES[k].n.replace('The ',''):HEROES[k].n;}
/* Hero animation timing: ms per frame; looping states keep playing, one-shots hand back to idle. */
const HANIM_MS={ultatk:70,ultdef:70,sing:80,taunt:80,smash:70,summon:80,idle:130,breathe:170,spin:170,win:110,atk:70,fire:70,eye:75,thorn:70,heal:75,yell:80,guard:80,hurt:70,dead:220};
const HANIM_LOOP={idle:1,breathe:1,spin:1,win:1};
function heroAnimCSS(a,n){const d=((HANIM_MS[a]||90)*n/1000).toFixed(2);return `animation:run${n} ${d}s steps(1,end) ${HANIM_LOOP[a]?'infinite':(a==='dead'?'forwards':'')};`;}
function heroRest(k){return run&&run.fight&&run.hero===k&&run.hp<=run.max*.3&&ART[k].anims.breathe?'breathe':'idle';}
/* Which animation a card plays, by what the card does. */
function heroAnimFor(c,dealt){
  if(c.ult)return (c.dmg||c.fin||c.bs)?'ultatk':'ultdef';
  if(c.heal||c.steal)return 'heal';
  if(c.burn||c.fan||c.stoke||c.forge)return 'fire';
  if(c.weak||c.exp)return 'eye';
  if(c.thorns||c.tb||c.grow||c.hedge||c.vines||c.iron)return 'thorn';
  if(dealt>0||c.dmg||c.fin||c.bs||c.slam!=null||c.ifa)return 'atk';
  if(c.str||c.extra||c.focus)return 'yell';
  if(c.blk)return 'guard';
  return 'yell';
}
function pixStyle(k){return ART[k].pix?'image-rendering:pixelated;image-rendering:crisp-edges;':'';}
function portrait(k,cls){if(ART[k].anims)return stripHTML(k,cls,'','idle');return ART[k].frames>1?stripHTML(k,cls):`<img class="chibi ${cls||''}" src="${artURL(k,hs(k).look)}" alt="" style="${pixStyle(k)}">`;}
function battleHero(k,anim){if(ART[k].anims)return stripHTML(k,'',ART[k].pix?'position:absolute;left:-6px;bottom:-8px;width:128px':'position:absolute;left:-10px;bottom:-4px;width:170px',S.heroAnim||(S.flash?'hurt':heroRest(k)));return ART[k].frames>1?stripHTML(k,anim?'atk':'',ART[k].pix?`position:absolute;left:0;bottom:-2px;width:${ART[k].w*ART[k].pix}px`:'position:absolute;left:4px;bottom:-2px;width:94%'):`<img class="chibi" src="${artURL(k,hs(k).look)}" alt="${HEROES[k].n}" style="position:absolute;left:10px;bottom:0;height:${ART[k].pix?'99px':'92%'};width:auto;${pixStyle(k)}">`;}
function px(key,cls,alt,over){return `<img class="px-img ${cls||''}" src="${spriteURL(key,over)}" alt="${alt||''}" ${alt?'':'aria-hidden="true"'}>`;}
function heroPx(k,cls,alt){return px(k,cls,alt,lookPal(k,hs(k).look));}
/* Scene backdrops: drawn once at 128x80, two frames for torch flicker and water. */
function bgURL(layer,frame){
  const ck='bg'+layer+'_'+frame;if(ck in IMG)return IMG[ck];
  try{
    const W=128,H=80,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
    let seed=layer*97+13;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
    const put=(col,xx,yy,w=1,h=1)=>{x.fillStyle=col;x.fillRect(xx,yy,w,h);};
    if(layer===1){
      put('#241A2E',0,0,W,H);
      for(let y=0,r=0;y<52;y+=6,r++){const off=r%2?6:0;for(let bx=-off;bx<W;bx+=12){put(['#3A2D47','#41324F','#352941'][Math.floor(R()*3)],bx+1,y+1,10,4);if(R()<.25)put('#4B3B5A',bx+2,y+1,4,1);}}
      [[22,14],[104,14]].forEach(([tx,ty])=>{
        x.globalAlpha=.07;for(let r=16;r>2;r-=3)put('#F2B31C',tx-r,ty-r+4,r*2,r*2);x.globalAlpha=1;
        put('#2A1B1B',tx-2,ty+3,5,2);put('#5A4A3A',tx-1,ty+5,3,7);
        (frame?[[0,0,'#F0508C'],[0,-1,'#F2B31C'],[-1,0,'#F2B31C'],[1,0,'#F0508C'],[0,-2,'#FFE38A'],[0,-3,'#F2B31C']]
              :[[0,0,'#F0508C'],[0,-1,'#F2B31C'],[1,-1,'#F2B31C'],[-1,0,'#F0508C'],[1,-2,'#FFE38A'],[1,-3,'#F2B31C'],[-1,-2,'#F0508C']])
          .forEach(([dx,dy,col])=>put(col,tx+dx,ty+2+dy));
      });
      put('#4A3B58',0,52,W,28);put('#1E1628',0,52,W,1);
      for(let y=58,i=0;y<H;y+=7,i++){put('#3E3049',0,y,W,1);for(let bx=(i%2)*10;bx<W;bx+=20)put('#3E3049',bx,y-6,1,6);}
      for(let i=0;i<14;i++)put('#57476A',Math.floor(R()*W),53+Math.floor(R()*26),2,1);
    }else if(layer===2){
      put('#0C262D',0,0,W,H);
      for(let y=0,r=0;y<52;y+=6,r++){const off=r%2?6:0;for(let bx=-off;bx<W;bx+=12)put(['#16404A','#1A4852','#123840'][Math.floor(R()*3)],bx+1,y+1,10,4);}
      [[24,8],[88,8]].forEach(([wx,wy])=>{
        put('#08191E',wx-1,wy-1,18,33);
        for(let i=0;i<16;i++){const top=(i<2||i>13)?4:(i<4||i>11)?1:0;put('#6FD0D0',wx+i,wy+top,1,31-top);}
        put('#A8ECEC',wx+4,wy+2,2,29);put('#A8ECEC',wx+11,wy+3,1,28);put('#08191E',wx+7,wy,2,31);put('#08191E',wx,wy+14,16,2);
      });
      x.globalAlpha=.1;put('#A8ECEC',16,42,34,10);put('#A8ECEC',80,42,34,10);x.globalAlpha=1;
      put('#12605F',0,52,W,28);put('#1FA6A0',0,52,W,2);
      for(let y=57,i=0;y<H;y+=5,i++)for(let bx=((i*7+frame*5)%18);bx<W;bx+=18)put('#3CC7C0',bx,y,5,1);
      for(let i=0;i<6;i++)put('#A8ECEC',Math.floor(R()*W),55+Math.floor(R()*24),1,1);
    }else if(layer===3){
      put('#2E2418',0,0,W,H);
      for(let y=0,r=0;y<52;y+=6,r++){const off=r%2?6:0;for(let bx=-off;bx<W;bx+=12){put(['#4A3A28','#524230','#433422'][Math.floor(R()*3)],bx+1,y+1,10,4);if(R()<.18)put('#4A6A3A',bx+1+Math.floor(R()*7),y+4,3,1);}}
      [[10,6],[104,16]].forEach(([cx,top],n)=>{put('#6A5A44',cx,top,12,52-top);put('#8A7A60',cx+1,top,9,52-top);put('#A89878',cx+2,top,2,52-top);put('#6A5A44',cx-2,top,16,3);put('#8A7A60',cx-1,top,14,2);
        if(n===1){put('#2E2418',cx+6,top-1,8,4);}for(let i=0;i<5;i++)put('#4A6A3A',cx+Math.floor(R()*12),48+Math.floor(R()*4),2,1);});
      const rc=frame?'#2A9A90':'#40E0D0';[[60,16],[62,16],[64,16],[60,18],[64,18],[61,20],[63,20],[62,22],[58,20],[66,20]].forEach(([xx,yy])=>put(rc,xx,yy));
      x.globalAlpha=.08;put('#40E0D0',52,10,22,18);x.globalAlpha=1;
      put('#5A4A38',0,52,W,28);put('#221A10',0,52,W,1);
      for(let i=0;i<10;i++){const xx=Math.floor(R()*W),yy=54+Math.floor(R()*24);put('#3E3226',xx,yy,Math.floor(R()*6)+2,1);}
      for(let i=0;i<12;i++)put('#7A6A52',Math.floor(R()*W),53+Math.floor(R()*26),2,1);
    }else{
      put('#140C28',0,0,W,52);put('#1C1236',0,18,W,16);put('#261848',0,34,W,18);
      for(let i=0;i<26;i++){const xx=Math.floor(R()*W),yy=Math.floor(R()*44);put(i%2===frame?'#F8F0FF':'#6A5A98',xx,yy);}
      put('#F8F0D8',97,8,6,6);put('#F8F0D8',96,9,8,4);put('#140C28',99,8,5,4);
      [[10,30],[102,34]].forEach(([mx,top])=>{
        x.globalAlpha=.12;put('#40E0D0',mx-6,top+6,24,18);x.globalAlpha=1;
        put('#E8D8C8',mx+4,top+6,4,52-top-4);put('#C8B8A8',mx+6,top+6,2,52-top-4);
        put('#E060A0',mx+2,top,8,2);put('#E060A0',mx,top+2,12,2);put('#E060A0',mx-2,top+4,16,3);put('#A83878',mx-2,top+6,16,1);
        [[mx+1,top+3],[mx+6,top+1],[mx+10,top+4],[mx+3,top+5]].forEach(([dx,dy])=>put('#F8F0FF',dx,dy));
      });
      put('#1E3A2E',0,52,W,28);put('#0E2018',0,52,W,1);
      for(let i=0;i<30;i++){const xx=Math.floor(R()*W),yy=53+Math.floor(R()*26);put('#2A4A3A',xx,yy,1,2);}
      for(let i=0;i<14;i++){const xx=Math.floor(R()*W),yy=55+Math.floor(R()*23);put(['#F0508C','#F2B31C','#3CC7C0','#C890F0'][i%4],xx,yy,2,2);put('#2A4A3A',xx,yy+2,1,1);}
      for(let i=0;i<9;i++){const xx=(Math.floor(R()*W)+frame*3)%W,yy=10+Math.floor(R()*50)+(frame?1:-1);put('#FFE38A',xx,yy);if(i%3===0){x.globalAlpha=.3;put('#FFE38A',xx-1,yy-1,3,3);x.globalAlpha=1;}}
    }
    IMG[ck]=c.toDataURL();
  }catch(e){IMG[ck]='';}
  return IMG[ck];
}
let BG1='art/backgrounds/floor1.jpg';
function bgHTML(layer){if(layer===1)return `<img class="bg" src="${BG1}" alt="" style="image-rendering:auto">`;return `<img class="bg a" src="${bgURL(layer,0)}" alt=""><img class="bg b" src="${bgURL(layer,1)}" alt="">`;}
