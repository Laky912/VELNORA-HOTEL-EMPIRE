(()=>{
"use strict";
const $=id=>document.getElementById(id);
const ui={money:$("money"),rating:$("rating"),guests:$("guests"),missionTitle:$("mission-title"),missionDesc:$("mission-desc"),missionProgress:$("mission-progress"),missionCount:$("mission-count"),hint:$("action-hint"),panel:$("side-panel"),panelTitle:$("panel-title"),panelEyebrow:$("panel-eyebrow"),panelContent:$("panel-content"),toast:$("toast"),pause:$("pause-modal")};
if(!window.THREE){$("world").innerHTML='<div style="padding:40px;color:#17313b">No se pudo cargar el motor 3D. Comprueba tu conexión a internet.</div>';return;}
const T=THREE,scene=new T.Scene();scene.background=new T.Color(0xa9dadd);scene.fog=new T.Fog(0xa9dadd,28,62);
const camera=new T.OrthographicCamera(-15,15,10,-10,.1,100);camera.position.set(19,23,21);camera.lookAt(0,0,0);
let renderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});}catch(err){$("world").innerHTML='<div style="position:absolute;inset:20%;display:grid;place-items:center;text-align:center;color:#17313b;font-weight:700">Tu navegador no pudo iniciar WebGL. Activa la aceleración por hardware y vuelve a cargar el juego.</div>';return;}renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;$("world").appendChild(renderer.domElement);
scene.add(new T.HemisphereLight(0xe8fbff,0x758b67,2.1));const sun=new T.DirectionalLight(0xfff1d5,2.8);sun.position.set(-12,22,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-24;sun.shadow.camera.right=24;sun.shadow.camera.top=24;sun.shadow.camera.bottom=-24;scene.add(sun);
const mats={grass:mat(0x7eae79),grass2:mat(0x91bd82),sand:mat(0xe7d19c),water:mat(0x56b9ca,.8),wood:mat(0x9a6949),wood2:mat(0xc18b5d),wall:mat(0xfff1d7),roof:mat(0xd87958),roof2:mat(0xe7a75f),tile:mat(0xe5d9bf),white:mat(0xfffbeb),teal:mat(0x45aa9a),dark:mat(0x36545a),leaf:mat(0x4e946b),leaf2:mat(0x78ad70),bed:mat(0xf3e8d6),blue:mat(0x79c2cf),gold:mat(0xe8b452)};
function mat(color,roughness=.86){return new T.MeshStandardMaterial({color,roughness});}
function box(w,h,d,m,x,y,z,parent=scene){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function sphere(r,m,x,y,z,parent=scene){const o=new T.Mesh(new T.SphereGeometry(r,12,10),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
function cylinder(rt,rb,h,m,x,y,z,parent=scene){const o=new T.Mesh(new T.CylinderGeometry(rt,rb,h,8),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
const ground=box(46,.5,42,mats.grass,0,-.45,0);const water=box(100,.2,100,mats.water,0,-1.0,0);water.receiveShadow=true;
const island=box(31,.45,25,mats.sand,0,-.12,0);box(27,.25,21,mats.grass,0,.18,0);
for(let i=0;i<42;i++){let x=(Math.random()-.5)*39,z=(Math.random()-.5)*34;if(Math.abs(x)<14&&Math.abs(z)<10)continue;let palm=new T.Group();palm.position.set(x,0,z);scene.add(palm);cylinder(.12,.2,1.2,mats.wood,0,0.8,0,palm);for(let j=0;j<5;j++){let leaf=box(.18,.08,1.25,mats.leaf,0,1.48,0,palm);leaf.rotation.y=j*Math.PI*2/5;leaf.rotation.x=-.25;} }
const hotel=new T.Group();scene.add(hotel);
box(18,.3,13,mats.tile,0,.42,0,hotel);
box(17,.5,1,mats.wall,0,1,-6,hotel);box(17,.5,1,mats.wall,0,1,6,hotel);
box(1,.5,11,mats.wall,-8,1,0,hotel);box(1,.5,11,mats.wall,8,1,0,hotel);
box(18,.35,1.2,mats.roof,0,1.65,-6,hotel);box(18,.35,1.2,mats.roof,0,1.65,6,hotel);box(1.2,.35,11,mats.roof,-8,1.65,0,hotel);box(1.2,.35,11,mats.roof,8,1.65,0,hotel);
function bed(x,z){box(2.2,.24,1.4,mats.wood,x,.72,z,hotel);box(2.05,.28,1.27,mats.white,x,.96,z,hotel);box(.9,.2,.42,mats.blue,x,.98,z-.38,hotel);box(.9,.2,.42,mats.white,x,.98,z+.35,hotel);box(2.2,.25,.12,mats.wood,x,1.08,z+.65,hotel);}
bed(-5,-3);bed(0,-3);bed(5,-3);bed(-5,3);bed(0,3);bed(5,3);
function roomWall(x,z){box(.14,1.1,4.7,mats.wall,x,1.1,z,hotel);box(4.5,1.1,.14,mats.wall,x,1.1,z,hotel);}
roomWall(-2,-.1);roomWall(3,-.1);box(4.5,1.1,.14,mats.wall,-5,1.1,0,hotel);box(4.5,1.1,.14,mats.wall,5,1.1,0,hotel);
box(3,.6,1.1,mats.wood,0,.85,5,hotel);box(2.8,.1,.9,mats.gold,0,1.2,5,hotel);box(.2,1.2,.2,mats.teal,-1.2,1.2,5,hotel);box(.2,1.2,.2,mats.teal,1.2,1.2,5,hotel);
for(let i=0;i<4;i++){let x=-6+i*4;box(.65,.9,.55,mats.wood,x,.95,-5.1,hotel);box(.7,.15,.58,mats.gold,x,1.43,-5.1,hotel);}
function plant(x,z){cylinder(.22,.3,.4,mats.wood,x,.55,z);sphere(.55,mats.leaf,x,.98,z);sphere(.4,mats.leaf2,x+.22,1.2,z+.1);}
plant(-10,-7);plant(10,-7);plant(-10,7);plant(10,7);
const path=box(3,.08,15,mats.sand,0,.44,12);path.rotation.x=0;
const pool=box(7,.35,4,mats.blue,12,.25,1);box(7.4,.16,4.4,mats.white,12,.05,1);
for(let i=0;i<3;i++){box(1.3,.18,.55,mats.white,10+i*2, .48,4);box(.2,.2,.6,mats.gold,10.55+i*2,.6,4);}
const reception=box(3,.95,.8,mats.wood,0,1.05,4.5);box(3,.12,.85,mats.gold,0,1.58,4.5);
const machine=box(.7,1.4,.7,mats.teal,7,.95,5);box(.45,.45,.08,mats.gold,7,1.25,4.63);machine.visible=false;

// Resort dressing: caminos, terrazas, luces y zonas de descanso.
const decor=new T.Group();scene.add(decor);
const pathStone=mat(0xd8c59b),metal=mat(0x405b60),flowerA=mat(0xe58c83),flowerB=mat(0xf4cf75);
for(let i=0;i<9;i++){const z=10+i*.72;box(2.5,.09,.48,pathStone,0,.49,z,decor);}
function lamp(x,z){cylinder(.07,.09,2.15,metal,x,.9,z,decor);cylinder(.25,.2,.22,mats.gold,x,2.02,z,decor);sphere(.19,mat(0xffe8a8),x,2.23,z,decor);}
lamp(-4,10);lamp(4,10);lamp(-10,1);lamp(10,7);
function lounger(x,z,rot=0){const g=new T.Group();g.position.set(x,.5,z);g.rotation.y=rot;decor.add(g);box(1.15,.12,2.05,mats.white,0,.15,0,g);box(1.15,.13,.62,mats.blue,0,.35,-.58,g).rotation.x=-.25;for(const sx of [-.42,.42]){cylinder(.045,.045,.48,metal,sx,-.02,.65,g);cylinder(.045,.045,.48,metal,sx,-.02,-.65,g);}}
lounger(9,6,-.35);lounger(12,6,-.35);lounger(14,6,-.35);
function umbrella(x,z,color){const g=new T.Group();g.position.set(x,0,z);decor.add(g);cylinder(.055,.055,2.2,metal,0,1,0,g);const canopy=new T.Mesh(new T.ConeGeometry(1.35,.48,10),mat(color));canopy.position.y=2.05;canopy.rotation.y=.2;canopy.castShadow=true;g.add(canopy);}
umbrella(8,8,0xf1b85f);umbrella(13,8,0xe88c78);
function flowerbed(x,z){box(1.6,.35,.8,mats.wood,x,.52,z,decor);for(let i=0;i<5;i++){sphere(.16,i%2?flowerA:flowerB,x-.55+i*.27,.82,z+(i%2?.12:-.12),decor);}}
flowerbed(-11,5);flowerbed(11,-8);flowerbed(-11,-8);
function windowPanel(x,y,z,w=1.1){box(w,.9,.12,mat(0x8bc6c7,.35),x,y,z,hotel);box(w+.14,.09,.16,mats.white,x,y+.5,z,hotel);box(w+.14,.09,.16,mats.white,x,y-.5,z,hotel);box(.09,1,.16,mats.white,x,y,z,hotel);}
windowPanel(-6.5,2.25,-6.56);windowPanel(-3.3,2.25,-6.56);windowPanel(3.3,2.25,-6.56);windowPanel(6.5,2.25,-6.56);
box(4.2,.22,.9,mats.roof2,0,2.05,6.45,hotel);
for(let i=0;i<5;i++)box(.72,.08,.12,mats.white,-1.45+i*.72,1.88,6.85,hotel);
function palm(x,z,scale=1){const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(scale);decor.add(g);cylinder(.12,.2,1.9,mats.wood,0,.95,0,g);for(let j=0;j<7;j++){const leaf=box(.16,.09,1.55,mats.leaf,0,1.9,0,g);leaf.rotation.y=j*Math.PI*2/7;leaf.rotation.x=-.3;}}
palm(-13,9,.9);palm(14,-8,1.05);palm(-13,-8,.85);

const roomDefs=[{id:0,x:-5,z:-3,open:true,dirty:false,occupied:false,level:1},{id:1,x:0,z:-3,open:false,dirty:false,occupied:false,level:1},{id:2,x:5,z:-3,open:false,dirty:false,occupied:false,level:1},{id:3,x:-5,z:3,open:false,dirty:false,occupied:false,level:1},{id:4,x:0,z:3,open:false,dirty:false,occupied:false,level:1},{id:5,x:5,z:3,open:false,dirty:false,occupied:false,level:1}];
const roomObjects=[];
function decorateRoom(r){
 const x=r.x,z=r.z;
 box(.72,.58,.62,mats.wood,x+1.45,.78,z-.75,hotel);
 box(.76,.08,.66,mats.gold,x+1.45,1.1,z-.75,hotel);
 cylinder(.1,.1,.34,mats.gold,x+1.45,1.31,z-.75,hotel);
 sphere(.19,mats.gold,x+1.45,1.52,z-.75,hotel);
 box(.9,1.45,.22,mats.wood,x-1.55,1.15,z-1.55,hotel);
 box(.62,.85,.06,mats.blue,x-1.55,1.42,z-1.42,hotel);
 box(.65,.08,.6,mats.tile,x+1.35,.57,z+1.15,hotel);
 box(.52,.55,.48,mats.wood,x+1.35,.88,z+1.15,hotel);
 sphere(.22,mats.leaf,x+1.35,1.28,z+1.15,hotel);
 box(.9,.12,.55,mats.gold,x-.95,.58,z+1.25,hotel);
 box(.12,.12,.12,mats.white,x-.95,.72,z+1.25,hotel);
}
roomDefs.forEach(decorateRoom);
for(let i=0;i<3;i++){
 const x=-5+i*5;
 box(1.35,.24,.75,mats.teal,x,.62,8.1,scene);
 box(1.45,.75,.16,mats.wood,x,.98,8.42,scene);
 box(.14,.65,.72,mats.wood,x-.68,.98,8.1,scene);
 box(.14,.65,.72,mats.wood,x+.68,.98,8.1,scene);
}
box(3.8,.18,.35,mats.wood,0,2.15,-6.72,hotel);
box(3.3,.55,.16,mats.gold,0,2.5,-6.72,hotel);
box(.16,.16,.16,mats.white,0,2.5,-6.61,hotel);
for(let i=0;i<4;i++){
 const x=-6+i*4;
 box(.95,.12,.16,mats.white,x,1.95,-6.72,hotel);
 box(.12,.9,.16,mats.teal,x-.48,2.35,-6.72,hotel);
 box(.12,.9,.16,mats.teal,x+.48,2.35,-6.72,hotel);
}

roomDefs.forEach(r=>{const marker=box(2.6,.035,2,mats.grass2,r.x,.52,r.z);marker.visible=!r.open;roomObjects.push(marker);});
const player=new T.Group();scene.add(player);player.position.set(0,0,8);
const avatarSettings={skin:0xf0bd91,shirt:0x286e75,pants:0x354b59,hair:0x493a31,style:"short"};
function buildAvatar(root,config=avatarSettings){
 root.clear();root.userData.rig=null;
 const skin=mat(config.skin),shirt=mat(config.shirt),pants=mat(config.pants),shoe=mat(config.shoes||0x473b35),hairMat=mat(config.hair),dark=mat(0x26343b),white=mat(0xffffff);
 // Silueta caricaturesca con articulaciones independientes para caminar.
 cylinder(.29,.34,.72,shirt,0,.72,0,root);
 const neck=cylinder(.09,.1,.16,skin,0,1.12,0,root);
 const head=new T.Group();head.position.set(0,1.29,0);root.add(head);
 sphere(.255,skin,0,0,0,head);
 sphere(.258,hairMat,0,.18,-.035,head).scale.set(1,.48,1.04);
 if(config.style==="long"){
  box(.13,.43,.22,hairMat,-.21,-.08,-.015,head);box(.13,.43,.22,hairMat,.21,-.08,-.015,head);
 }else if(config.style==="curly"){
  for(let n=0;n<9;n++){const a=n*Math.PI*2/9;sphere(.105,hairMat,Math.cos(a)*.19,.18,Math.sin(a)*.16-.025,head);}
 }
 // Cara visible desde el frente: ojos, cejas, nariz y sonrisa.
 for(const side of [-1,1]){
  sphere(.047,white,side*.092,.015,.218,head);sphere(.022,dark,side*.092,.015,.255,head);
  const brow=box(.085,.025,.025,hairMat,side*.092,.095,.22,head);brow.rotation.z=side*-.12;
 }
 sphere(.035,skin,0,-.045,.25,head);
 const smile=new T.Mesh(new T.TorusGeometry(.065,.012,5,14,Math.PI),mat(0x8b4d4b));smile.position.set(0,-.105,.224);smile.rotation.z=Math.PI;head.add(smile);
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const arm=new T.Group();arm.position.set(side*.34,.99,0);root.add(arm);
  cylinder(.09,.085,.43,shirt,0,-.22,0,arm);sphere(.085,skin,0,-.47,.015,arm);arms.push(arm);
  const leg=new T.Group();leg.position.set(side*.14,.42,0);root.add(leg);
  cylinder(.095,.09,.39,pants,0,-.2,0,leg);box(.2,.11,.31,shoe,0,-.42,.075,leg);legs.push(leg);
 }
 if(config.badge){box(.12,.16,.035,mat(0xf4bd59),.12,.91,.3,root);}
 if(config.accessory==="glasses"){
  for(const side of [-1,1]){const ring=new T.Mesh(new T.TorusGeometry(.065,.012,5,14),mat(0x344b55));ring.position.set(side*.092,.02,.235);head.add(ring);}
  box(.08,.018,.018,mat(0x344b55),0,.02,.235,head);
 }else if(config.accessory==="cap"){
  const brim=box(.38,.045,.22,hairMat,0,.17,.16,head);brim.rotation.x=-.08;
 }
 root.userData.rig={arms,legs,head,phase:Math.random()*Math.PI*2};
}
function animateAvatar(root,moving,time){
 const rig=root.userData.rig;if(!rig)return;
 const swing=moving?Math.sin(time*11+rig.phase)*.62:Math.sin(time*2+rig.phase)*.035;
 rig.legs[0].rotation.x=swing;rig.legs[1].rotation.x=-swing;
 rig.arms[0].rotation.x=-swing*.78;rig.arms[1].rotation.x=swing*.78;
 rig.head.rotation.z=moving?Math.sin(time*5+rig.phase)*.025:Math.sin(time*1.5+rig.phase)*.018;
}
buildAvatar(player);
const guests=[];let cash=50,received=0,cleaned=0,staff=0,cleaners=0,receptionists=0,roomLevel=1,paused=false,zoom=1,activeTask=null,toastTimer=0,day=1,guestTimer=2,machineUnlocked=false,lastSave=0,lastHud=0;
const keyMap={up:"w",down:"s",left:"a",right:"d",interact:"e"};
let waitingForKey=null;
const avatarPresets=[
 {name:"Recepcionista",shirt:0x286e75,hair:0x493a31,skin:0xf0bd91,style:"short",accessory:"glasses"},
 {name:"Resort azul",shirt:0x477fb6,hair:0x2b2524,skin:0xd99b70,style:"curly",accessory:"cap"},
 {name:"Verano coral",shirt:0xd87567,hair:0x9a6540,skin:0xffd3ad,style:"long"},
 {name:"Jardín",shirt:0x57936e,hair:0x211b19,skin:0x9b6548,style:"short",accessory:"cap"},
 {name:"Lujo violeta",shirt:0x8a6caa,hair:0x76503b,skin:0xf2c5a2,style:"curly",accessory:"glasses"}
];
let selectedAvatar=0,selectedHotelColor=0xd87958;
const guestLooks=[
 {skin:0xf0bd91,hair:0x574238,style:"short",pants:0x354b59},
 {skin:0x9b6548,hair:0x211b19,style:"curly",pants:0x3d526a},
 {skin:0xffd3ad,hair:0x9a6540,style:"long",pants:0x4d485c},
 {skin:0xd99b70,hair:0x2b2524,style:"short",pants:0x4a5c4b},
 {skin:0x70452f,hair:0x181716,style:"curly",pants:0x5a465d},
 {skin:0xf2c5a2,hair:0x76503b,style:"long",pants:0x46566a}
];
function person(color){
 const g=new T.Group(),look=guestLooks[Math.floor(Math.random()*guestLooks.length)];
 buildAvatar(g,{...look,shirt:color,badge:Math.random()>.7});scene.add(g);return g;
}
const guestColors=[0x5e83b5,0xc87562,0x8a6caa,0x3e9b85,0xd09a4c,0x4f8290,0xb56d91];
function saveGame(force=false){
 const now=Date.now();if(!force&&now-lastSave<1200)return;lastSave=now;
 try{localStorage.setItem("velnora-hotel-empire-save",JSON.stringify({version:3,cash,received,cleaned,staff,cleaners,receptionists,roomLevel,machineUnlocked,keyMap,selectedAvatar,selectedHotelColor,rooms:roomDefs.map(r=>({open:r.open,dirty:r.dirty,level:r.level}))}));}catch(e){}
}
function loadGame(){
 try{const raw=localStorage.getItem("velnora-hotel-empire-save");if(!raw)return;const s=JSON.parse(raw);if(!s||![2,3].includes(s.version))return;
 cash=Math.max(0,Number(s.cash)||50);received=Math.max(0,Number(s.received)||0);cleaned=Math.max(0,Number(s.cleaned)||0);cleaners=Math.max(0,Number(s.cleaners??s.staff)||0);receptionists=Math.max(0,Number(s.receptionists)||0);staff=cleaners+receptionists;roomLevel=Math.max(1,Number(s.roomLevel)||1);machineUnlocked=!!s.machineUnlocked;if(s.keyMap)Object.assign(keyMap,s.keyMap);selectedAvatar=Math.max(0,Math.min(avatarPresets.length-1,Number(s.selectedAvatar)||0));selectedHotelColor=Number(s.selectedHotelColor)||0xd87958;applyAvatar();mats.roof.color.setHex(selectedHotelColor);mats.roof2.color.copy(new T.Color(selectedHotelColor).multiplyScalar(1.16));
 if(Array.isArray(s.rooms))s.rooms.forEach((saved,i)=>{if(roomDefs[i]){roomDefs[i].open=!!saved.open;roomDefs[i].dirty=!!saved.dirty;roomDefs[i].level=Number(saved.level)||1;roomObjects[i].visible=!roomDefs[i].open;if(roomDefs[i].dirty)setDirty(roomDefs[i]);}});
 machine.visible=machineUnlocked;
 }catch(e){console.warn("No se pudo cargar la partida guardada",e);}
}
function applyAvatar(){const p=avatarPresets[selectedAvatar];Object.assign(avatarSettings,p);buildAvatar(player);updateControlHints();}
function updateControlHints(){const move=$("move-keys"),act=$("interact-key");if(move)move.textContent=keyMap.up.toUpperCase()+keyMap.left.toUpperCase()+keyMap.down.toUpperCase()+keyMap.right.toUpperCase();if(act)act.textContent=keyMap.interact.toUpperCase();}
function applyHotelColor(color){selectedHotelColor=color;mats.roof.color.setHex(color);mats.roof2.color.copy(new T.Color(color).multiplyScalar(1.16));saveGame(true);toast("Estilo del hotel actualizado");}
function toast(s){ui.toast.textContent=s;ui.toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>ui.toast.classList.remove("show"),2100);}
function updateHUD(){saveGame();ui.money.textContent="$"+Math.floor(cash).toLocaleString("en-US");ui.rating.textContent=(1+Math.min(4,cleaned*.08+staff*.1)).toFixed(1);ui.guests.textContent=guests.filter(g=>g.state==="room").length+" / "+roomDefs.filter(r=>r.open).length;let pct=Math.min(100,received/2*100);ui.missionProgress.style.width=pct+"%";ui.missionCount.textContent=received+" / 2 huéspedes recibidos";if(received<2){ui.missionTitle.textContent="Recibe a tus primeros huéspedes";ui.missionDesc.textContent="Acércate a recepción y pulsa E para registrar a un huésped.";}else if(cleaned<1){ui.missionTitle.textContent="Prepara una habitación";ui.missionDesc.textContent="Cuando el huésped se marche, limpia la habitación para recibir al siguiente.";}else{ui.missionTitle.textContent="Haz crecer tu hotel";ui.missionDesc.textContent="Abre nuevas habitaciones y contrata personal para automatizar el servicio."}}
function openPanel(name){ui.panel.classList.add("open");document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.panel===name));const content=ui.panelContent;let html="";if(name==="build"){ui.panelEyebrow.textContent="GESTIÓN DEL HOTEL";ui.panelTitle.textContent="Tu hotel";html='<div class="stat-grid"><div class="stat-box"><small>HABITACIONES</small><b>'+roomDefs.filter(r=>r.open).length+'/6</b></div><div class="stat-box"><small>EMPLEADOS</small><b>'+staff+'</b></div></div><div class="panel-card"><h3>Habitación estándar</h3><p>Desbloquea una nueva habitación para alojar más huéspedes y aumentar tus ingresos.</p><div class="card-row"><span class="price">$'+(100+roomDefs.filter(r=>r.open).length*75)+'</span><button class="small-btn" id="buy-room">Desbloquear</button></div></div><div class="panel-card"><h3>Máquina expendedora</h3><p>Una fuente extra de ingresos para tus huéspedes.</p><div class="card-row"><span class="price">$180</span><button class="small-btn" id="buy-machine">Construir</button></div></div><div class="panel-card"><h3>Piscina</h3><p>Mejora la reputación y atrae visitantes premium.</p><div class="card-row"><span class="price">$500</span><button class="small-btn" id="buy-pool">Mejorar</button></div></div>';}else if(name==="staff"){ui.panelEyebrow.textContent="RECURSOS HUMANOS";ui.panelTitle.textContent="Equipo";html='<div class="panel-card"><h3>Personal de limpieza</h3><p>Se encarga de preparar habitaciones sucias automáticamente. Tu primer paso para convertirte en gerente.</p><div class="card-row"><span class="price">$250</span><button class="small-btn" id="hire-cleaner">Contratar</button></div></div><div class="panel-card"><h3>Recepcionista</h3><p>Registra huéspedes mientras tú te ocupas de otras tareas.</p><div class="card-row"><span class="price">$400</span><button class="small-btn" id="hire-reception">Contratar</button></div></div><div class="stat-box"><small>EMPLEADOS CONTRATADOS</small><b>'+staff+'</b></div>';}else if(name==="upgrades"){ui.panelEyebrow.textContent="MEJORA TU NEGOCIO";ui.panelTitle.textContent="Mejoras";html='<div class="panel-card"><h3>Velocidad de movimiento</h3><p>Camina más rápido para atender el hotel con eficiencia.</p><div class="card-row"><span class="price">$'+(100+roomLevel*100)+'</span><button class="small-btn" id="upgrade-speed">Mejorar</button></div></div><div class="panel-card"><h3>Calidad de habitaciones</h3><p>Mejores habitaciones generan más dinero y reputación.</p><div class="card-row"><span class="price">$'+(150+roomLevel*100)+'</span><button class="small-btn" id="upgrade-room">Mejorar</button></div></div><div class="panel-card"><h3>Propinas</h3><p>Mejora la experiencia para recibir más propinas.</p><div class="card-row"><span class="price">$200</span><button class="small-btn" id="upgrade-tips">Mejorar</button></div></div>';}else if(name==="customize"){ui.panelEyebrow.textContent="TU ESTILO";ui.panelTitle.textContent="Personalización";
 html='<div class="panel-card"><h3>Uniforme y apariencia</h3><p>Elige el aspecto de tu personaje. Los cambios se guardan en tu partida.</p><div class="custom-grid">'+avatarPresets.map((p,n)=>'<button class="look-choice '+(n===selectedAvatar?'chosen':'')+'" data-look="'+n+'"><span class="look-swatch" style="background:#'+p.shirt.toString(16).padStart(6,'0')+'"></span>'+p.name+'</button>').join('')+'</div></div><div class="panel-card"><h3>Colores del hotel</h3><p>Cambia el color principal de los tejados y dale identidad a Brisa Marina.</p><div class="color-row">'+[0xd87958,0x397fa8,0x5d986b,0x8b6ab0,0xe0aa42,0xd46c87,0x53636e].map(color=>'<button class="color-choice" data-color="'+color+'" style="background:#'+color.toString(16)+'" aria-label="Color"></button>').join('')+'</div></div><div class="panel-card"><h3>Controles del teclado</h3><p>Pulsa Cambiar y después la tecla que quieras asignar.</p>'+[['up','Avanzar'],['down','Retroceder'],['left','Izquierda'],['right','Derecha'],['interact','Interactuar']].map(([k,label])=>'<div class="key-row"><span>'+label+'</span><button class="small-btn key-bind" data-key="'+k+'">'+keyMap[k].toUpperCase()+'</button></div>').join('')+'<button class="primary-btn" id="reset-keys">Restaurar controles</button></div>';
 }else{ui.panelEyebrow.textContent="EXPANDE TU IMPERIO";ui.panelTitle.textContent="Destinos";html='<div class="panel-card"><h3>Brisa Marina</h3><p>Tu primer hotel costero. Continúa mejorándolo hasta alcanzar la categoría de cinco estrellas.</p><span class="price">EN DESARROLLO · NIVEL '+day+'</span></div><div class="panel-card"><h3>Refugio del Bosque</h3><p>Un hotel entre árboles y montañas, con nuevas instalaciones y huéspedes.</p><div class="card-row"><span class="price">$5,000</span><button class="small-btn" disabled>Bloqueado</button></div></div><div class="panel-card"><h3>Palacio del Sol</h3><p>Un resort de lujo con playa privada y servicios premium.</p><div class="card-row"><span class="price">$25,000</span><button class="small-btn" disabled>Bloqueado</button></div></div>';}content.innerHTML=html;wireButtons();
 content.querySelectorAll("[data-look]").forEach(b=>b.onclick=()=>{selectedAvatar=Number(b.dataset.look);applyAvatar();saveGame(true);openPanel("customize");toast("Apariencia actualizada");});
 content.querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>{applyHotelColor(Number(b.dataset.color));});
 content.querySelectorAll("[data-key]").forEach(b=>b.onclick=()=>{waitingForKey=b.dataset.key;b.textContent="Pulsa una tecla…";b.classList.add("listening");toast("Pulsa la nueva tecla para "+b.dataset.key);});
 bindResetKeys();}
function bindResetKeys(){const b=$("reset-keys");if(b)b.onclick=()=>{Object.assign(keyMap,{up:"w",down:"s",left:"a",right:"d",interact:"e"});saveGame(true);openPanel("customize");toast("Controles restaurados");};}
function wireButtons(){const bind=(id,fn)=>{const el=$(id);if(el)el.onclick=fn};bind("buy-room",()=>{let r=roomDefs.find(x=>!x.open);if(!r)return toast("Todas las habitaciones están desbloqueadas");let cost=100+roomDefs.filter(x=>x.open).length*75;if(spend(cost)){r.open=true;roomObjects[r.id].visible=false;toast("¡Nueva habitación desbloqueada!");openPanel("build");updateHUD();}});bind("buy-machine",()=>{if(spend(180)){machineUnlocked=true;machine.visible=true;toast("Máquina expendedora construida");saveGame();}});bind("buy-pool",()=>{if(spend(500)){cash+=35;toast("¡Piscina mejorada! + reputación");updateHUD();}});bind("hire-cleaner",()=>{if(spend(250)){staff++;toast("¡Has contratado un limpiador!");openPanel("staff");updateHUD();}});bind("hire-reception",()=>{if(spend(400)){staff++;toast("¡Recepcionista contratado!");openPanel("staff");}});bind("upgrade-speed",()=>{if(spend(100+roomLevel*100)){player.userData.speed=(player.userData.speed||5)+.7;toast("Velocidad mejorada");}});bind("upgrade-room",()=>{if(spend(150+roomLevel*100)){roomLevel++;roomDefs.forEach(r=>r.level=roomLevel);toast("Calidad de habitaciones mejorada");}});bind("upgrade-tips",()=>{if(spend(200)){player.userData.tip=(player.userData.tip||2)+1;toast("¡Ahora recibes mejores propinas!");}});}
function spend(n){if(cash<n){toast("No tienes suficiente dinero");return false;}cash-=n;updateHUD();return true;}
document.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>openPanel(b.dataset.panel));$("close-panel").onclick=()=>ui.panel.classList.remove("open");
function dist(a,b){return Math.hypot(a.x-b.x,a.z-b.z)}
function spawnGuest(){
 if(guests.filter(g=>g.state!=="left").length>=roomDefs.filter(r=>r.open).length+1)return;
 let room=roomDefs.find(r=>r.open&&!r.occupied&&!r.dirty);if(!room)return;
 let g=person(guestColors[Math.floor(Math.random()*guestColors.length)]);
 g.position.set(0,0,15);
 const mood=sphere(.105,mat(0x63c58a),0,2.05,0,g);
 room.occupied=true;
 guests.push({obj:g,state:"reception",room,wait:0,patience:26+Math.random()*10,satisfaction:100,stay:30+Math.random()*18,mood});
}
function setDirty(r){r.dirty=true;r.occupied=false;const stain=sphere(.18,mat(0xb98a63),r.x,.67,r.z,hotel);stain.scale.set(2,.15,1.4);r.stain=stain;}
function interact(){
 if(activeTask==="reception"){
  let guest=guests.find(g=>g.state==="reception"||g.state==="waiting");
  if(guest){guest.state="toRoom";guest.wait=0;guest.room.occupied=true;guest.room.userGuest=guest;guest.satisfaction=Math.max(55,guest.satisfaction);cash+=20;received++;toast("Huésped registrado · +$20");updateHUD();}
 }else if(activeTask&&activeTask.type==="dirty"){
  let r=activeTask.room;r.dirty=false;cleaned++;if(r.stain){hotel.remove(r.stain);r.stain=null;}
  cash+=5+(player.userData.tip||2);toast("Habitación limpia · +$"+(5+(player.userData.tip||2)));updateHUD();
 }else if(activeTask==="cash"){cash+=25;toast("¡Has recogido $25!");activeTask=null;updateHUD();}
}
function getTask(){let nearReception=dist(player.position,{x:0,z:5})<2.4;if(nearReception&&guests.some(g=>g.state==="reception"||g.state==="waiting"))return "reception";let dirty=roomDefs.find(r=>r.dirty&&dist(player.position,{x:r.x,z:r.z})<2.3);if(dirty)return{type:"dirty",room:dirty};return null;}
const keys={};window.addEventListener("keydown",e=>{const pressed=e.key.toLowerCase();if(waitingForKey){if(pressed.length===1||pressed.startsWith("arrow")){const conflict=Object.keys(keyMap).find(k=>k!==waitingForKey&&keyMap[k]===pressed);if(conflict){toast("Esa tecla ya está asignada");return;}keyMap[waitingForKey]=pressed;waitingForKey=null;saveGame(true);updateControlHints();openPanel("customize");toast("Tecla asignada");}e.preventDefault();return;}keys[pressed]=true;if(pressed===keyMap.interact&&!e.repeat)interact();if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(pressed))e.preventDefault();});window.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
let dragging=false,lastX=0,lastY=0;renderer.domElement.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;});window.addEventListener("pointerup",()=>dragging=false);window.addEventListener("pointermove",e=>{if(!dragging||e.pointerType==="touch")return;let dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;camera.position.x-=dx*.025/zoom;camera.position.z-=dy*.025/zoom;camera.lookAt(camera.position.x-19,0,camera.position.z-21);});renderer.domElement.addEventListener("wheel",e=>{zoom=Math.max(.7,Math.min(1.6,zoom+(e.deltaY>0?-.08:.08)));resize();});
function resize(){let w=$("world").clientWidth,h=$("world").clientHeight;renderer.setSize(w,h,false);let aspect=w/h,fr=10/zoom;fr*=Math.max(1,1.6/aspect);camera.left=-fr*aspect;camera.right=fr*aspect;camera.top=fr;camera.bottom=-fr;camera.updateProjectionMatrix();}
window.addEventListener("resize",resize);resize();
let last=performance.now(),elapsed=0;
function loop(now){requestAnimationFrame(loop);let dt=Math.min(.04,(now-last)/1000);last=now;if(paused)return;elapsed+=dt;
const held=k=>!!keys[keyMap[k]];let dx=(held("right")?1:0)-(held("left")?1:0),dz=(held("down")?1:0)-(held("up")?1:0);if(dx||dz){let l=Math.hypot(dx,dz);dx/=l;dz/=l;let speed=player.userData.speed||4.5;player.position.x+=dx*speed*dt;player.position.z+=dz*speed*dt;player.rotation.y=Math.atan2(dx,dz);}player.position.x=Math.max(-13,Math.min(13,player.position.x));player.position.z=Math.max(-13,Math.min(16,player.position.z));
activeTask=getTask();ui.hint.classList.toggle("visible",!!activeTask);if(activeTask==="reception")ui.hint.innerHTML="<kbd>E</kbd><span>Registrar huésped</span>";else if(activeTask&&activeTask.type==="dirty")ui.hint.innerHTML="<kbd>E</kbd><span>Limpiar habitación</span>";
guests.forEach(g=>{
 if(g.state==="reception"){
  let target={x:0,z:5.6};moveToward(g.obj,target,dt,2.2);
  if(dist(g.obj.position,target)<.5)g.state="waiting";
 }else if(g.state==="waiting"){
  g.wait+=dt;g.patience-=dt;g.satisfaction=Math.max(35,100-g.wait*1.8);
  if(g.patience<=0){g.state="leaving";g.room.occupied=false;g.satisfaction=25;toast("Un huésped se cansó de esperar");}
 }else if(g.state==="toRoom"){
  moveToward(g.obj,{x:g.room.x,z:g.room.z},dt,2.4);
  if(dist(g.obj.position,{x:g.room.x,z:g.room.z})<.35){g.state="room";g.wait=0;}
 }else if(g.state==="room"){
  g.wait+=dt;
  if(g.wait>g.stay){g.state="leaving";g.room.occupied=false;g.room.dirty=true;setDirty(g.room);}
 }else if(g.state==="leaving"){
  moveToward(g.obj,{x:0,z:15},dt,2.5);
  if(g.obj.position.z>14){
   if(g.satisfaction>35){const tip=Math.round(5+g.satisfaction*.12);cash+=tip;toast("Salida de huésped · propina +$"+tip);}
   g.state="left";scene.remove(g.obj);
  }
 }
 if(g.mood){const color=g.satisfaction>70?0x63c58a:g.satisfaction>40?0xe8b452:0xd96c62;g.mood.material.color.setHex(color);g.mood.position.y=2.05+Math.sin(elapsed*4+g.wait)*.045;}
});
if(staff>0&&elapsed%3<dt){let r=roomDefs.find(r=>r.dirty);if(r){r.dirty=false;cleaned++;if(r.stain){hotel.remove(r.stain);r.stain=null;}cash+=8;}}
if(elapsed>guestTimer){spawnGuest();guestTimer=elapsed+Math.max(5,12-staff);}
if(elapsed>8&&Math.floor(elapsed)%15===0&&Math.floor(elapsed- dt)!==Math.floor(elapsed)){cash+=5;toast("Ingresos del hotel +$5");}
player.position.y=Math.abs(Math.sin(now*.008))*.035;animateAvatar(player,!!(dx||dz),elapsed);guests.forEach(g=>{if(g.obj){g.obj.position.y=Math.abs(Math.sin(now*.006+g.wait))*.025;animateAvatar(g.obj,["reception","toRoom","leaving"].includes(g.state),elapsed);}});
if(elapsed-lastHud>1){lastHud=elapsed;updateHUD();}renderer.render(scene,camera);}
function createTouchControls(){
 if(!("ontouchstart" in window)||window.innerWidth>900)return;
 const wrap=document.createElement("div");wrap.className="touch-controls";
 const pad=document.createElement("div");pad.className="touch-pad";
 [["▲","up","up"],["◀","left","left"],["▼","down","down"],["▶","right","right"]].forEach(([label,key,cls])=>{const b=document.createElement("button");b.type="button";b.textContent=label;b.className="touch-dir "+cls;b.addEventListener("pointerdown",e=>{e.preventDefault();keys[keyMap[key]]=true;b.setPointerCapture(e.pointerId);});const release=()=>keys[keyMap[key]]=false;b.addEventListener("pointerup",release);b.addEventListener("pointercancel",release);b.addEventListener("lostpointercapture",release);pad.appendChild(b);});
 const action=document.createElement("button");action.type="button";action.className="touch-action";action.textContent="E";action.addEventListener("pointerdown",e=>{e.preventDefault();interact();});
 wrap.append(pad,action);$("game-shell").appendChild(wrap);
}
function moveToward(obj,target,dt,speed){let dx=target.x-obj.position.x,dz=target.z-obj.position.z,d=Math.hypot(dx,dz);if(d>.08){obj.position.x+=dx/d*speed*dt;obj.position.z+=dz/d*speed*dt;obj.rotation.y=Math.atan2(dx,dz);}}
$("pause-btn").onclick=()=>{paused=true;ui.pause.classList.remove("hidden");};$("resume-btn").onclick=()=>{paused=false;ui.pause.classList.add("hidden");last=performance.now();};
loadGame();updateHUD();openPanel("build");ui.panel.classList.remove("open");createTouchControls();requestAnimationFrame(loop);
})();