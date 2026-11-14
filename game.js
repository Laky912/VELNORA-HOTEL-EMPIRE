(() => {
  "use strict";
  const canvas = document.getElementById("hotelCanvas");
  const $ = id => document.getElementById(id);
  const THREE = window.THREE;
  const W=11,H=9,TILE=1.55;
  const defs={
    room:{name:"Habitación",cost:1800,icon:"🛏",desc:"Aloja hasta 2 huéspedes y genera ingresos.",color:0xf4c99a,capacity:2},
    deluxe:{name:"Suite deluxe",cost:4200,icon:"🛎",desc:"Una estancia premium con mayores ingresos.",color:0xe8c2ef,capacity:3},
    restaurant:{name:"Restaurante",cost:3200,icon:"🍽",desc:"Mejora la satisfacción y los ingresos.",color:0xe99d70},
    pool:{name:"Piscina",cost:2800,icon:"🏊",desc:"Atrae visitantes y mejora la reputación.",color:0x54c7df},
    garden:{name:"Jardín",cost:900,icon:"🌳",desc:"Embellece el hotel y mejora su valoración.",color:0x76bd78},
    shop:{name:"Tienda",cost:2400,icon:"🛍",desc:"Una fuente adicional de ingresos.",color:0xe8c96f}
  };
  const fresh=()=>({money:12500,reputation:4.2,day:1,income:0,rooms:3,guests:0,staff:{cleaner:1,reception:1},buildings:[{x:3,y:3,type:"room"},{x:4,y:3,type:"room"},{x:6,y:3,type:"room"}],selected:null,bonusClaimed:false,tasks:[{title:"Da la bienvenida a tus primeros huéspedes",desc:"Abre tu hotel y recibe 3 visitantes.",goal:3,progress:0,reward:500,done:false},{title:"Amplía tu alojamiento",desc:"Construye una habitación adicional.",goal:1,progress:0,reward:750,done:false},{title:"Cuida la experiencia",desc:"Alcanza una reputación de 4.5 estrellas.",goal:4.5,progress:4.2,reward:900,done:false}]});
  let state;
  try { state=JSON.parse(localStorage.getItem("velnoraHotelSave"))||fresh(); } catch { state=fresh(); }
  state.staff ||= {cleaner:1,reception:1}; state.buildings ||= fresh().buildings; state.tasks ||= fresh().tasks;
  state.selected=null;
  const money=n=>"$"+Math.floor(n).toLocaleString("en-US");
  const capacity=()=>state.rooms*2+state.buildings.filter(b=>b.type==="deluxe").length;
  function save(){try{localStorage.setItem("velnoraHotelSave",JSON.stringify(state));}catch{}}
  function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2300);}
  function log(title,detail){const el=document.createElement("div");el.className="activity-item";el.innerHTML='<span class="activity-mark">✦</span><span><b></b><small></small></span><time></time>';el.querySelector("b").textContent=title;el.querySelector("small").textContent=detail;el.querySelector("time").textContent="Ahora";$("activityList").prepend(el);while($("activityList").children.length>4)$("activityList").lastElementChild.remove();}
  function updateUI(){
    $("money").textContent=money(state.money);$("reputation").textContent=state.reputation.toFixed(1);$("guestCount").textContent=state.guests+" / "+capacity();
    $("incomeToday").textContent=money(state.income);$("roomCount").textContent=state.rooms;$("roomSub").textContent=Math.max(0,state.rooms-Math.ceil(state.guests/2))+" disponibles";
    $("ratingValue").innerHTML=state.reputation.toFixed(1)+' <i>★</i>';$("staffCount").textContent=state.staff.cleaner+state.staff.reception;
    $("cleanerStatus").textContent=state.staff.cleaner+" empleado"+(state.staff.cleaner===1?"":"s")+" · En servicio";
    $("receptionStatus").textContent=state.staff.reception+" empleado"+(state.staff.reception===1?"":"s")+" · En servicio";
    $("dayNumber").textContent=state.day;$("occupancyLabel").textContent=Math.round(state.guests/Math.max(1,capacity())*100)+"% ocupación";
    $("taskList").innerHTML=state.tasks.map(t=>{let pct=Math.min(100,t.progress/t.goal*100);return '<div class="task-card"><b>'+t.title+(t.done?' ✓':'')+'</b><p>'+t.desc+'</p><div class="task-progress"><span style="width:'+pct+'%"></span></div><div class="task-reward">'+(t.done?'COMPLETADO':'RECOMPENSA '+money(t.reward))+'</div></div>';}).join("");
    save();
  }
  function checkTasks(){state.tasks[0].progress=Math.max(state.tasks[0].progress,state.guests);state.tasks[1].progress=state.buildings.filter(b=>b.type==="room"||b.type==="deluxe").length-3;state.tasks[2].progress=state.reputation;state.tasks.forEach(t=>{if(!t.done&&t.progress>=t.goal){t.done=true;state.money+=t.reward;toast("Objetivo completado: +"+money(t.reward));log("Objetivo completado",t.title);}});}
  function showModal(title,desc,items,eyebrow="GESTIÓN DEL HOTEL"){
    $("modalTitle").textContent=title;$("modalDescription").textContent=desc;$("modalEyebrow").textContent=eyebrow;const body=$("modalBody");body.innerHTML="";
    items.forEach(item=>{const row=document.createElement("div");row.className="modal-option";const icon=document.createElement("span");icon.className="option-icon";icon.textContent=item.icon||"✦";const info=document.createElement("div");const b=document.createElement("b");b.textContent=item.name;const small=document.createElement("small");small.textContent=item.desc;info.append(b,small);const btn=document.createElement("button");btn.textContent=item.button||money(item.cost||0);btn.disabled=!!item.disabled;btn.addEventListener("click",item.action);row.append(icon,info,btn);body.append(row);});
    $("modalBackdrop").classList.remove("hidden");
  }
  function closeModal(){$("modalBackdrop").classList.add("hidden");}
  let renderer,scene,camera,raycaster,pointer,hotelGroup,tiles=[],buildingMeshes=[],guestMeshes=[],clock,selectedMesh=null,zoom=1;
  const mats={};
  function mat(color,roughness=.86){return new THREE.MeshStandardMaterial({color,roughness});}
  function box(parent,w,h,d,material,x,y,z, bevel=0){const geo=bevel?new THREE.BoxGeometry(w,h,d,1,1,1):new THREE.BoxGeometry(w,h,d);const mesh=new THREE.Mesh(geo,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  function sphere(parent,r,material,x,y,z,segments=12){const m=new THREE.Mesh(new THREE.SphereGeometry(r,segments,10),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
  function cylinder(parent,r1,r2,h,material,x,y,z,segments=8){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
  function init3D(){
    if(!THREE){$("canvasHint").textContent="No se pudo cargar el motor 3D. Comprueba tu conexión.";return;}
    scene=new THREE.Scene();scene.background=new THREE.Color(0x9bd6df);scene.fog=new THREE.Fog(0x9bd6df,25,52);
    camera=new THREE.OrthographicCamera(-13,13,8, -8,.1,100);camera.position.set(17,20,19);camera.lookAt(0,0,0);
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
    scene.add(new THREE.HemisphereLight(0xe8fbff,0x55745c,2.1));
    const sun=new THREE.DirectionalLight(0xfff0d4,3.1);sun.position.set(-10,20,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-20;sun.shadow.camera.right=20;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-20;scene.add(sun);
    hotelGroup=new THREE.Group();scene.add(hotelGroup);
    const sea=box(hotelGroup,42,.12,36,mat(0x55b8c8),0,-.34,0);sea.receiveShadow=true;
    const island=box(hotelGroup,19,.5,15,mat(0xd8c99c),0,-.05,0);island.scale.set(1,1,1);
    box(hotelGroup,18,.24,14,mat(0x78b77d),0,.23,0);
    // Decorative sandy shoreline and boardwalk
    box(hotelGroup,5,.12,1.1,mat(0xc8a875),0,.38,7.1);
    box(hotelGroup,1.2,.13,5,mat(0xd9bd8a),0,.39,5.0);
    for(let i=0;i<9;i++){const wave=box(hotelGroup,1.1,.025,.045,mat(0xb6edf0),-8+i*2,-.24,9.2+Math.sin(i)*.3);wave.rotation.y=-.2;}
    tiles=[];
    for(let z=0;z<H;z++)for(let x=0;x<W;x++){
      const g=new THREE.Group();g.position.set((x-(W-1)/2)*TILE,.38,(z-(H-1)/2)*TILE);hotelGroup.add(g);
      const isPath=z===4||x===5;const tile=box(g,1.48,.12,1.48,mat(isPath?0xc8b995:0x79b77d),0,0,0);tile.userData={x,z};tile.castShadow=false;
      const edge=box(g,1.49,.035,1.49,mat(0xe3d7ad),0,-.065,0);edge.castShadow=false;
      if(!isPath&&((x*7+z*3)%13===0))makeTree(hotelGroup,(x-(W-1)/2)*TILE,.47,(z-(H-1)/2)*TILE);
      tiles.push(tile);
    }
    // entrance sign
    box(hotelGroup,1.5,.55,.16,mat(0x276c62),0,1.05,((H-1)/2)*TILE-1.2);
    const signText=makeLabel("AURORA",0xffffff);signText.position.set(0,1.08,((H-1)/2)*TILE-1.1);hotelGroup.add(signText);
    raycaster=new THREE.Raycaster();pointer=new THREE.Vector2();clock=new THREE.Clock();
    rebuildBuildings();makeGuests();
    resize3D();window.addEventListener("resize",resize3D);
    canvas.addEventListener("click",onCanvasClick);
    animate();
  }
  function makeLabel(text,color=0xffffff){const c=document.createElement("canvas");c.width=256;c.height=64;const x=c.getContext("2d");x.fillStyle="#173d42";x.roundRect(4,4,248,56,12);x.fill();x.font="bold 30px Arial";x.textAlign="center";x.textBaseline="middle";x.fillStyle="#fff";x.fillText(text,128,33);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.38),new THREE.MeshBasicMaterial({map:t,transparent:true,side:THREE.DoubleSide}));m.rotation.x=-.22;return m;}
  function makeTree(parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);cylinder(g,.11,.14,.55,mat(0x805a3a),0,.25,0,7);const crown=sphere(g,.48,mat(0x348b58),0,.76,0,7);crown.scale.set(1,1.12,1);sphere(g,.34,mat(0x55a968),-.2,.95,.08,7);sphere(g,.3,mat(0x26794c),.2,.95,-.08,7);}
  function makeBuilding(b){
    const g=new THREE.Group();const x=(b.x-(W-1)/2)*TILE,z=(b.y-(H-1)/2)*TILE;g.position.set(x,.48,z);hotelGroup.add(g);g.userData={building:true,...b};
    const wall=mat(b.type==="deluxe"?0xe6c6e9:b.type==="restaurant"?0xffd0a1:b.type==="shop"?0xf3dc91:0xf0d1aa),side=mat(0xc58e69),roof=mat(defs[b.type].color),dark=mat(0x765342),glass=new THREE.MeshStandardMaterial({color:0x8bd9e7,metalness:.15,roughness:.2});
    if(b.type==="pool"){
      box(g,1.45,.18,1.4,mat(0x4f9d9e),0,.04,0);const water=box(g,1.25,.07,1.2,mat(0x39b9dc,.22),0,.16,0);water.material.metalness=.18;
      for(let i=0;i<3;i++)box(g,.12,.025,.035,mat(0xd8ffff),-.35+i*.34,.21,-.12+i*.16);
      box(g,.18,.36,.18,mat(0xf5f0e4),.65,.23,.52);return g;
    }
    if(b.type==="garden"){
      box(g,1.4,.12,1.4,mat(0x5a9c5d),0,0,0);
      [[-.4,-.3],[.35,-.3],[-.25,.35],[.38,.35]].forEach(([tx,tz],i)=>{cylinder(g,.055,.07,.32,mat(0x795a38),tx,.19,tz,6);sphere(g,.27,mat(i%2?0x3e9858:0x55a85e),tx,.48,tz,7);});
      return g;
    }
    const height=b.type==="deluxe"?2.25:b.type==="restaurant"?1.75:b.type==="shop"?1.55:1.85;
    box(g,1.38,height,1.28,side,0,height/2,0);
    box(g,1.4,height-.08,1.25,wall,-.035,height/2,.035);
    // flat stylized roof and trim
    box(g,1.56,.18,1.48,roof,0,height+.06,0);
    box(g,1.62,.08,1.54,mat(0xffe8bd),0,height-.08,0);
    // front windows and entrance
    for(let i=0;i<2;i++){box(g,.34,.52,.035,glass,-.42+i*.84,height*.61,.67);box(g,.38,.045,.05,mat(0xffffff),-.42+i*.84,height*.61,.69);}
    box(g,.32,.72,.06,dark,0,.38,.69);
    box(g,.38,.055,.07,mat(0xffe1a3),0,.78,.7);
    if(b.type==="room"||b.type==="deluxe"){
      box(g,.92,.13,.65,mat(0xfff4e3),0,.3,-.03);box(g,.92,.24,.18,mat(0x83bdce),0,.48,-.22);box(g,.28,.12,.2,mat(0xffffff),-.28,.62,-.22);box(g,.28,.12,.2,mat(0xffffff),.28,.62,-.22);
      box(g,.12,.4,.12,mat(0x8a5b40),.48,.24,-.45);
    }else{
      // awning stripes
      for(let i=0;i<5;i++)box(g,.28,.1,.38,mat(i%2?0xfff0d2:0xd75d4c),-.56+i*.28,height+.03,.83);
      box(g,.65,.38,.08,mat(0x76503b),0,.65,.72);
    }
    const label=makeLabel(b.type==="room"?"ROOM":b.type==="deluxe"?"SUITE":b.type==="restaurant"?"BISTRO":"SHOP");label.position.set(0,height+.42,.76);g.add(label);
    return g;
  }
  function rebuildBuildings(){buildingMeshes.forEach(m=>hotelGroup.remove(m));buildingMeshes=[];state.buildings.slice().sort((a,b)=>a.x+a.y-b.x-b.y).forEach(b=>buildingMeshes.push(makeBuilding(b)));}
  function makeGuests(){
    guestMeshes.forEach(g=>hotelGroup.remove(g));guestMeshes=[];
    const outfits=[0xe87965,0x477db5,0xe9bd57,0x9b77c8,0x58a78c,0xe58daf];
    for(let i=0;i<Math.max(8,state.guests+4);i++){
      const g=new THREE.Group();hotelGroup.add(g);const body=mat(outfits[i%outfits.length]),skin=mat([0xf1c7a2,0xd89b76,0xf0d0b1][i%3]),legs=mat(0x39475a);
      cylinder(g,.13,.17,.43,body,0,.55,0,7);sphere(g,.16,skin,0,.9,0,9);cylinder(g,.035,.04,.28,legs,-.07,.16,0,6);cylinder(g,.035,.04,.28,legs,.07,.16,0,6);
      const a=i*2.4+Math.random(),r=2.2+(i%4)*.6;g.userData={a,r,speed:.16+(i%3)*.035,homeX:0,homeZ:0};g.position.set(Math.cos(a)*r,.48,Math.sin(a)*r);guestMeshes.push(g);
    }
  }
  function resize3D(){if(!renderer)return;const w=canvas.clientWidth||800,h=canvas.clientHeight||440;renderer.setSize(w,h,false);const aspect=w/h;const frustum=9.6/zoom;camera.left=-frustum*aspect/2;camera.right=frustum*aspect/2;camera.top=frustum/2;camera.bottom=-frustum/2;camera.updateProjectionMatrix();}
  function animate(){if(!renderer)return;requestAnimationFrame(animate);const t=clock.getElapsedTime();guestMeshes.forEach((g,i)=>{const u=g.userData;u.a+=u.speed*.008;g.position.x=Math.cos(u.a)*u.r;g.position.z=Math.sin(u.a)*u.r;g.position.y=.48+Math.abs(Math.sin(t*5+i))*.06;g.rotation.y=-u.a;});renderer.render(scene,camera);}
  function onCanvasClick(e){
    const rect=canvas.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObjects(tiles,false);if(!hits.length)return;const d=hits[0].object.userData;state.selected={x:d.x,y:d.z};const occupied=state.buildings.some(b=>b.x===d.x&&b.y===d.z);$("canvasHint").textContent=occupied?"Parcela ocupada":"Parcela "+(d.x+1)+", "+(d.z+1)+" · parcela seleccionada";drawSelection();if(!occupied)openBuild();else toast("Aquí ya hay una construcción.");
  }
  function drawSelection(){if(selectedMesh){hotelGroup.remove(selectedMesh);selectedMesh=null;}if(!state.selected)return;const {x,z}=state.selected;selectedMesh=new THREE.Mesh(new THREE.BoxGeometry(1.5,.035,1.5),new THREE.MeshBasicMaterial({color:0xffe28a,wireframe:true}));selectedMesh.position.set((x-(W-1)/2)*TILE,.55,(z-(H-1)/2)*TILE);hotelGroup.add(selectedMesh);}
  function build(type){
    const d=defs[type],s=state.selected;if(!s){toast("Selecciona primero una parcela.");return;}if(state.buildings.some(b=>b.x===s.x&&b.y===s.y)){toast("Esta parcela ya está ocupada.");return;}if(state.money<d.cost){toast("No tienes suficiente dinero.");return;}
    state.money-=d.cost;state.buildings.push({x:s.x,y:s.y,type});if(type==="room"||type==="deluxe")state.rooms++;if(type==="pool"||type==="garden")state.reputation=Math.min(5,state.reputation+.15);
    state.selected=null;closeModal();rebuildBuildings();drawSelection();if(type==="room"||type==="deluxe")makeGuests();log(d.name+" construido","Tu hotel sigue creciendo.");checkTasks();updateUI();toast(d.name+" construido correctamente.");
  }
  function openBuild(){if(!state.selected){toast("Primero selecciona una parcela vacía en el mapa.");return;}showModal("Elige una construcción","Parcela seleccionada · "+(state.selected.x+1)+", "+(state.selected.y+1),Object.entries(defs).map(([type,d])=>({icon:d.icon,name:d.name,desc:d.desc+" · "+money(d.cost),cost:d.cost,disabled:state.money<d.cost,action:()=>build(type)})),"CONSTRUCCIÓN");}
  function openStaff(){showModal("Gestionar personal","Un buen equipo mantiene felices a tus huéspedes.",[
    {icon:"✦",name:"Contratar limpieza",desc:"Mejora el servicio · "+money(700),cost:700,disabled:state.money<700,action:()=>{state.money-=700;state.staff.cleaner++;closeModal();updateUI();log("Nuevo empleado","Se unió al equipo de limpieza.");toast("¡Has contratado a alguien!");}},
    {icon:"⌂",name:"Contratar recepción",desc:"Agiliza las llegadas · "+money(900),cost:900,disabled:state.money<900,action:()=>{state.money-=900;state.staff.reception++;closeModal();updateUI();log("Nuevo recepcionista","La recepción tiene un nuevo integrante.");toast("¡Recepción reforzada!");}}
  ],"RECURSOS HUMANOS");}
  function openMarketing(){showModal("Campaña de marketing","Atrae nuevos visitantes a Hotel Aurora.",[
    {icon:"✧",name:"Anuncio local",desc:"Atrae 2 huéspedes · "+money(350),cost:350,disabled:state.money<350,action:()=>{state.money-=350;state.guests=Math.min(capacity(),state.guests+2);state.reputation=Math.min(5,state.reputation+.05);closeModal();checkTasks();updateUI();makeGuests();log("Campaña local","Llegaron nuevos huéspedes.");toast("¡Han llegado nuevos visitantes!");}},
    {icon:"✦",name:"Campaña premium",desc:"Atrae 4 huéspedes · "+money(800),cost:800,disabled:state.money<800,action:()=>{state.money-=800;state.guests=Math.min(capacity(),state.guests+4);state.reputation=Math.min(5,state.reputation+.1);closeModal();checkTasks();updateUI();makeGuests();log("Campaña premium","Tu hotel está ganando popularidad.");toast("¡Campaña completada!");}}
  ],"MARKETING");}
  function tick(){const occupied=Math.min(capacity(),state.guests);const roomsIncome=occupied*45;const serviceBonus=state.buildings.some(b=>b.type==="restaurant")?Math.round(occupied*12):0;const costs=(state.staff.cleaner+state.staff.reception)*5;const earned=Math.max(0,roomsIncome+serviceBonus-costs);state.money+=earned;state.income+=earned;state.day++;state.guests=Math.min(capacity(),Math.max(0,state.guests+(Math.random()<.7?1:0)));if(state.guests>0&&state.staff.cleaner===0)state.reputation=Math.max(2,state.reputation-.1);else if(state.guests>0&&state.staff.cleaner>0)state.reputation=Math.min(5,state.reputation+.01);checkTasks();updateUI();if(guestMeshes.length!==Math.max(8,state.guests+4))makeGuests();log("Cierre del día","Ingresos: "+money(earned)+" · "+state.guests+" huéspedes alojados.");}
  $("openBuild").addEventListener("click",openBuild);$("buildShortcut").addEventListener("click",openBuild);$("staffShortcut").addEventListener("click",openStaff);$("manageStaff").addEventListener("click",openStaff);$("marketingShortcut").addEventListener("click",openMarketing);
  $("modalClose").addEventListener("click",closeModal);$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeModal();});
  $("dailyBonus").addEventListener("click",()=>{if(state.bonusClaimed){toast("La recompensa diaria ya fue cobrada.");return;}state.bonusClaimed=true;state.money+=1000;updateUI();log("Recompensa diaria","Has recibido "+money(1000)+".");toast("¡Recompensa diaria: +$1,000!");});
  $("profileButton").addEventListener("click",()=>toast("Propietario · Hotel Aurora"));
  $("zoomIn").addEventListener("click",()=>{zoom=Math.min(1.45,zoom+.1);resize3D();});$("zoomOut").addEventListener("click",()=>{zoom=Math.max(.72,zoom-.1);resize3D();});$("resetView").addEventListener("click",()=>{zoom=1;resize3D();});
  document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===tab));$("overviewTab").classList.toggle("hidden",tab.dataset.tab!=="overview");$("tasksTab").classList.toggle("hidden",tab.dataset.tab!=="tasks");}));
  init3D();updateUI();setInterval(tick,8000);
})();