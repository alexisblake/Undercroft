/* Old placeholder enemy strips, used until an enemy gets a full animation set. */
"use strict";
/* ---------- Enemy animation strips (face left toward the hero) ---------- */
const ESTRIP={"rats":{"w":129,"h":76,"b":"art/legacy/rats.png"},"moth":{"w":127,"h":125,"b":"art/legacy/moth.png"},"hound":{"w":160,"h":96,"b":"art/legacy/hound.png"},"warden":{"w":177,"h":129,"b":"art/legacy/warden.png"},"gate":{"w":185,"h":190,"b":"art/legacy/gate.png"},"eel":{"w":129,"h":65,"b":"art/legacy/eel.png"},"leech":{"w":117,"h":54,"b":"art/legacy/leech.png"},"siren":{"w":131,"h":79,"b":"art/legacy/siren.png"},"ooze":{"w":108,"h":61,"b":"art/legacy/ooze.png"},"crab":{"w":128,"h":81,"b":"art/legacy/crab.png"},"choir":{"w":151,"h":125,"b":"art/legacy/choir.png"},"saint":{"w":169,"h":162,"b":"art/legacy/saint.png"},"saint2":{"w":152,"h":161,"b":"art/legacy/saint2.png"},"shaman":{"w":194,"h":188,"b":"art/legacy/shaman.png"},"robber":{"w":178,"h":149,"b":"art/legacy/robber.png"}};
const ESCALE={rats:1,moth:.95,hound:1.2,warden:1.3,gate:1.5,eel:1.25,leech:1.1,siren:1,ooze:1,crab:1.15,choir:1.3,saint:1.5,saint2:1.5,shaman:1.5,robber:1.05};
function estripHTML(k,cls,extra){const E=ESTRIP[k];return `<div class="strip ${cls||''}" style="aspect-ratio:${E.w}/${E.h};background-image:url(${E.b});image-rendering:auto;${extra||''}" role="img" aria-label="${MON[k]?MON[k].n:''}"></div>`;}

