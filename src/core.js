/* Shared helpers and the two page elements everything draws into. */
"use strict";
const app=document.getElementById('app'), dock=document.getElementById('dock');
const rnd=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

