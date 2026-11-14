(() => {
  "use strict";
  const canvas = document.getElementById("hotelCanvas");
  const ctx = canvas.getContext("2d");
  const $ = id => document.getElementById(id);
  const state = {
    money:12500, reputation:4.2, day:1, income:0, zoom:1, offsetX:0, offsetY:0,
    rooms:3, guests:0, staff:{cleaner:1,reception:1}, buildings:[],
    selected:null, bonusClaimed:false, lastTick:Date.now(), elapsed:0,
    tasks:[{title:"Da la bienvenida a tus primeros huéspedes",desc:"Abre tu hotel y recibe 3 visitantes.",goal:3,progress:0,reward:500,done:false},{title:"Amplía tu alojamiento",desc:"Construye una habitación adicional.",goal:1,progress:0,reward:750,done:false},{title:"Cuida la experiencia",desc:"Alcanza una reputación de 4.5 estrellas.",goal:4.5,progress:4.2,reward:900,done:false}]
  };
  const tiles=[];
  const W=11,H=9;
  const defs={
    room:{name:"Habitación",cost:1800,icon:"🛏",desc:"Aloja hasta 2 huéspedes y genera ingresos.",color:"#d6a77c",capacity:2},
    deluxe:{name:"Suite deluxe",cost:4200,icon:"🛎",desc:"Una estancia premium con mayores ingresos.",color:"#c5a4db",capacity:3},
    restaurant:{name:"Restaurante",cost:3200,icon:"🍽",desc:"Mejora la satisfacción y los ingresos.",color:"#df9a70"},
    pool:{name:"Piscina",cost:2800,icon:"🏊",desc:"Atrae visitantes y mejora la reputación.",color:"#62b9ce"},
    garden:{name:"Jardín",cost:900,icon:"🌳",desc:"Embellece el hotel y mejora su valoración.",color:"#7ebd83"},
    shop:{name:"Tienda",cost:2400,icon:"🛍",desc:"Una fuente adicional de ingresos.",color:"#e3c36f"}
  };
  const tileKey=(x,y)=>x+","+y;
  function iso(x,y){return {x:canvas.width/2+(x-y)*43+state.offsetX,y:105+(x+y)*22+state.offsetY};}
  function diamond(x,y,fill,stroke="#ffffff20"){const p=iso(x,y);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+43,p.y+22);ctx.lineTo(p.x,p.y+44);ctx.lineTo(p.x-43,p.y+22);ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
  function poly(points,fill,stroke="#ffffff20"){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.stroke();}
  function drawBuilding(b){
    const p=iso(b.x,b.y), d=defs[b.type], lift=b.type==="room"?48:b.type==="deluxe"?67:b.type==="restaurant"?42:b.type==="pool"?8:b.type==="garden"?20:35;
    if(b.type==="pool"){
      poly([[p.x-38,p.y+5],[p.x,p.y+24],[p.x+38,p.y+5],[p.x,p.y-14]],"#399bb5");
      poly([[p.x-32,p.y+5],[p.x,p.y+21],[p.x+32,p.y+5],[p.x,p.y-10]],"#72d3dc");
      ctx.strokeStyle="#d5ffff80";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-15,p.y+2);ctx.lineTo(p.x+9,p.y+14);ctx.stroke();return;
    }
    if(b.type==="garden"){
      diamond(b.x,b.y,"#3f855e");
      [[-13,-13],[12,-6],[0,9]].forEach(([dx,dy],i)=>{ctx.fillStyle=["#367a50","#4e9860","#2f704c"][i];ctx.beginPath();ctx.arc(p.x+dx,p.y+dy-16,11,0,Math.PI*2);ctx.fill();ctx.fillStyle="#a7c77a";ctx.fillRect(p.x+dx-2,p.y+dy-8,4,13);});return;
    }
    const w=37, h=lift;
    poly([[p.x-38,p.y+1],[p.x,p.y+20],[p.x,p.y+20-h],[p.x-38,p.y-h-19]],"#9d795e");
    poly([[p.x,p.y+20],[p.x+38,p.y+1],[p.x+38,p.y-h-19],[p.x,p.y-h]],"#795b4d");
    poly([[p.x-38,p.y-h-19],[p.x,p.y-h-40],[p.x+38,p.y-h-19],[p.x,p.y-h]],d.color);
    if(b.type==="room"||b.type==="deluxe"){
      poly([[p.x-25,p.y-h-15],[p.x-8,p.y-h-6],[p.x-8,p.y-h-31],[p.x-25,p.y-h-40]],"#7ec0ca");
      poly([[p.x+7,p.y-h-6],[p.x+25,p.y-h-15],[p.x+25,p.y-h-40],[p.x+7,p.y-h-31]],"#a4d8d8");
      ctx.strokeStyle="#fff8";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-25,p.y-h-28);ctx.lineTo(p.x-8,p.y-h-20);ctx.moveTo(p.x+7,p.y-h-20);ctx.lineTo(p.x+25,p.y-h-28);ctx.stroke();
      if(b.type==="deluxe"){ctx.fillStyle="#f5d68a";ctx.fillRect(p.x-4,p.y-h-8,8,20);}
    }else if(b.type==="restaurant"||b.type==="shop"){
      poly([[p.x-25,p.y-h-16],[p.x,p.y-h-3],[p.x+25,p.y-h-16],[p.x,p.y-h-29]],"#f4e1b8");
      ctx.fillStyle="#7e5843";ctx.fillRect(p.x-6,p.y-h-27,12,18);
      ctx.fillStyle="#fff";ctx.font="13px sans-serif";ctx.fillText(b.type==="restaurant"?"✦":"▣",p.x-5,p.y-h-34);
    }
    ctx.fillStyle="#fff";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(b.type==="room"?"ROOM":b.type==="deluxe"?"SUITE":b.type==="restaurant"?"DINE":"SHOP",p.x,p.y+11);
  }
  function drawTree(x,y){const p=iso(x,y);ctx.fillStyle="#8a684b";ctx.fillRect(p.x-3,p.y-16,6,22);ctx.fillStyle="#2e7656";ctx.beginPath();ctx.arc(p.x,p.y-24,14,0,Math.PI*2);ctx.fill();ctx.fillStyle="#438c62";ctx.beginPath();ctx.arc(p.x-7,p.y-30,9,0,Math.PI*2);ctx.fill();}
  function render(){
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
    if(canvas.width!==Math.round(rect.width*dpr)||canvas.height!==Math.round(rect.height*dpr)){canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);}
    ctx.setTransform(dpr*state.zoom,0,0,dpr*state.zoom,(canvas.width/dpr)*(1-state.zoom)/2,(canvas.height/dpr)*(1-state.zoom)/2);
    const cw=canvas.width/dpr,ch=canvas.height/dpr;
    ctx.clearRect(-cw,-ch,cw*3,ch*3);
    // Water and island landscaping
    ctx.fillStyle="#244b5b";ctx.fillRect(-100,-100,cw+200,ch+200);
    for(let i=0;i<8;i++){ctx.strokeStyle="#8bd2d222";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,40+i*55);ctx.bezierCurveTo(cw*.25,20+i*55,cw*.6,75+i*55,cw,35+i*55);ctx.stroke();}
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){
      const p=iso(x,y),isRoad=(y===4||x===5),occupied=state.buildings.some(b=>b.x===x&&b.y===y);
      diamond(x,y,occupied?"#427d67":isRoad?"#b6a78b":"#568a69",occupied?"#d8f5d055":"#d8f5d025");
      if(!occupied&&((x*7+y*3)%13===0))drawTree(x,y);
    }
    // Boardwalk and hotel entrance
    const ent=iso(5,4);ctx.fillStyle="#e8d6ad";ctx.beginPath();ctx.arc(ent.x,ent.y-3,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#f3d99e";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText("AURORA",ent.x,ent.y-18);
    state.buildings.slice().sort((a,b)=>(a.x+a.y)-(b.x+b.y)).forEach(drawBuilding);
    // guests strolling
    for(let i=0;i<Math.min(state.guests,9);i++){const x=(i*3+2)%W,y=(i*5+3)%H;if(state.buildings.some(b=>b.x===x&&b.y===y))continue;const p=iso(x,y);ctx.fillStyle="#f0c39b";ctx.beginPath();ctx.arc(p.x,p.y-7,4,0,Math.PI*2);ctx.fill();ctx.fillStyle=["#e6b86f","#82b8e6","#d78fa3"][i%3];ctx.fillRect(p.x-3,p.y-3,6,9);}
    if(state.selected){const p=iso(state.selected.x,state.selected.y);ctx.strokeStyle="#fff2b0";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+43,p.y+22);ctx.lineTo(p.x,p.y+44);ctx.lineTo(p.x-43,p.y+22);ctx.closePath();ctx.stroke();}
  }
  function updateUI(){
    $("money").textContent=money(state.money);$("reputation").textContent=state.reputation.toFixed(1);$("guestCount").textContent=state.guests+" / "+capacity();
    $("incomeToday").textContent=money(state.income);$("roomCount").textContent=state.rooms;$("roomSub").textContent=Math.max(0,state.rooms-state.guests/2|0)+" disponibles";
    $("ratingValue").innerHTML=state.reputation.toFixed(1)+' <i>★</i>';$("staffCount").textContent=state.staff.cleaner+state.staff.reception;
    $("cleanerStatus").textContent=state.staff.cleaner+" empleado"+(state.staff.cleaner===1?"":"s")+" · En servicio";
    $("receptionStatus").textContent=state.staff.reception+" empleado"+(state.staff.reception===1?"":"s")+" · En servicio";
    $("dayNumber").textContent=state.day;$("occupancyLabel").textContent=Math.round(state.guests/Math.max(1,capacity())*100)+"% ocupación";
    $("taskList").innerHTML=state.tasks.map((t,i)=>{let pct=Math.min(100,t.progress/t.goal*100);return '<div class="task-card"><b>'+t.title+(t.done?' ✓':'')+'</b><p>'+t.desc+'</p><div class="task-progress"><span style="width:'+pct+'%"></span></div><div class="task-reward">'+(t.done?'COMPLETADO':'RECOMPENSA '+money(t.reward))+'</div></div>';}).join("");
  }
  function money(n){return "$"+Math.floor(n).toLocaleString("en-US");}
  function capacity(){return state.rooms*2+state.buildings.filter(b=>b.type==="deluxe").length;}
  function log(title,detail){const el=document.createElement("div");el.className="activity-item";el.innerHTML='<span class="activity-mark">✦</span><span><b></b><small></small></span><time></time>';el.querySelector("b").textContent=title;el.querySelector("small").textContent=detail;el.querySelector("time").textContent="Ahora";$("activityList").prepend(el);while($("activityList").children.length>4)$("activityList").lastElementChild.remove();}
  function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2300);}
  function checkTasks(){
    state.tasks[0].progress=Math.max(state.tasks[0].progress,state.guests);
    state.tasks[1].progress=state.buildings.filter(b=>b.type==="room"||b.type==="deluxe").length;
    state.tasks[2].progress=state.reputation;
    state.tasks.forEach(t=>{if(!t.done&&t.progress>=t.goal){t.done=true;state.money+=t.reward;toast("Objetivo completado: +"+money(t.reward));log("Objetivo completado",t.title);}});
  }
  function build(type){
    const d=defs[type],s=state.selected;
    if(!s){toast("Selecciona primero una parcela.");return;}
    if(state.buildings.some(b=>b.x===s.x&&b.y===s.y)){toast("Esta parcela ya está ocupada.");return;}
    if(state.money<d.cost){toast("No tienes suficiente dinero.");return;}
    state.money-=d.cost;state.buildings.push({x:s.x,y:s.y,type});if(type==="room")state.rooms++;if(type==="deluxe")state.rooms++;
    if(type==="pool"||type==="garden")state.reputation=Math.min(5,state.reputation+.15);
    state.selected=null;closeModal();log(d.name+" construido","Tu hotel sigue creciendo.");checkTasks();updateUI();render();toast(d.name+" construido correctamente.");
  }
  function showModal(title,desc,items,eyebrow="GESTIÓN DEL HOTEL"){
    $("modalTitle").textContent=title;$("modalDescription").textContent=desc;$("modalEyebrow").textContent=eyebrow;
    const body=$("modalBody");body.innerHTML="";
    items.forEach(item=>{const row=document.createElement("div");row.className="modal-option";const icon=document.createElement("span");icon.className="option-icon";icon.textContent=item.icon||"✦";const info=document.createElement("div");const b=document.createElement("b");b.textContent=item.name;const small=document.createElement("small");small.textContent=item.desc;info.append(b,small);const btn=document.createElement("button");btn.textContent=item.button||money(item.cost||0);btn.disabled=!!item.disabled;btn.addEventListener("click",item.action);row.append(icon,info,btn);body.append(row);});
    $("modalBackdrop").classList.remove("hidden");
  }
  function closeModal(){$("modalBackdrop").classList.add("hidden");}
  function openBuild(){
    if(!state.selected){toast("Primero selecciona una parcela vacía en el mapa.");return;}
    showModal("Elige una construcción","Parcela seleccionada · "+(state.selected.x+1)+", "+(state.selected.y+1),Object.entries(defs).map(([type,d])=>({icon:d.icon,name:d.name,desc:d.desc+" · "+money(d.cost),cost:d.cost,disabled:state.money<d.cost,action:()=>build(type)})),"CONSTRUCCIÓN");
  }
  function openStaff(){
    showModal("Gestionar personal","Un buen equipo mantiene felices a tus huéspedes.",[
      {icon:"✦",name:"Contratar limpieza",desc:"Mejora el servicio · "+money(700),cost:700,disabled:state.money<700,action:()=>{state.money-=700;state.staff.cleaner++;closeModal();updateUI();log("Nuevo empleado","Se unió al equipo de limpieza.");toast("¡Has contratado a alguien!");}},
      {icon:"⌂",name:"Contratar recepción",desc:"Agiliza las llegadas · "+money(900),cost:900,disabled:state.money<900,action:()=>{state.money-=900;state.staff.reception++;closeModal();updateUI();log("Nuevo recepcionista","La recepción tiene un nuevo integrante.");toast("¡Recepción reforzada!");}}
    ],"RECURSOS HUMANOS");
  }
  function openMarketing(){
    showModal("Campaña de marketing","Atrae nuevos visitantes a Hotel Aurora.",[
      {icon:"✧",name:"Anuncio local",desc:"Atrae 2 huéspedes · "+money(350),cost:350,disabled:state.money<350,action:()=>{state.money-=350;state.guests=Math.min(capacity(),state.guests+2);state.reputation=Math.min(5,state.reputation+.05);closeModal();checkTasks();updateUI();render();log("Campaña local","Llegaron nuevos huéspedes.");toast("¡Han llegado nuevos visitantes!");}},
      {icon:"✦",name:"Campaña premium",desc:"Atrae 4 huéspedes · "+money(800),cost:800,disabled:state.money<800,action:()=>{state.money-=800;state.guests=Math.min(capacity(),state.guests+4);state.reputation=Math.min(5,state.reputation+.1);closeModal();checkTasks();updateUI();render();log("Campaña premium","Tu hotel está ganando popularidad.");toast("¡Campaña completada!");}}
    ],"MARKETING");
  }
  function clickCanvas(e){
    const r=canvas.getBoundingClientRect(),sx=(e.clientX-r.left)*(canvas.width/(window.devicePixelRatio||1))/r.width,sy=(e.clientY-r.top)*(canvas.height/(window.devicePixelRatio||1))/r.height;
    // Find closest tile center in screen space; canvas CSS scaling is accounted for.
    let best=null,dist=Infinity;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=iso(x,y),d=Math.hypot(p.x-sx,p.y+22-sy);if(d<dist){dist=d;best={x,y};}}
    if(dist<42){state.selected=best;const occupied=state.buildings.some(b=>b.x===best.x&&b.y===best.y);$("canvasHint").textContent=occupied?"Parcela ocupada":"Parcela "+(best.x+1)+", "+(best.y+1)+" · pulsa Construir";render();if(!occupied)openBuild();else toast("Aquí ya hay una construcción.");}
  }
  canvas.addEventListener("click",clickCanvas);
  $("openBuild").addEventListener("click",openBuild);$("buildShortcut").addEventListener("click",openBuild);$("staffShortcut").addEventListener("click",openStaff);$("manageStaff").addEventListener("click",openStaff);$("marketingShortcut").addEventListener("click",openMarketing);
  $("modalClose").addEventListener("click",closeModal);$("modalBackdrop").addEventListener("click",e=>{if(e.target===$("modalBackdrop"))closeModal();});
  $("dailyBonus").addEventListener("click",()=>{if(state.bonusClaimed){toast("La recompensa diaria ya fue cobrada.");return;}state.bonusClaimed=true;state.money+=1000;updateUI();log("Recompensa diaria","Has recibido "+money(1000)+".");toast("¡Recompensa diaria: +$1,000!");});
  $("profileButton").addEventListener("click",()=>toast("Propietario · Hotel Aurora"));
  $("zoomIn").addEventListener("click",()=>{state.zoom=Math.min(1.3,state.zoom+.08);render();});$("zoomOut").addEventListener("click",()=>{state.zoom=Math.max(.8,state.zoom-.08);render();});$("resetView").addEventListener("click",()=>{state.zoom=1;state.offsetX=0;state.offsetY=0;render();});
  document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===tab));$("overviewTab").classList.toggle("hidden",tab.dataset.tab!=="overview");$("tasksTab").classList.toggle("hidden",tab.dataset.tab!=="tasks");}));
  function tick(){
    const now=Date.now(),delta=Math.min(5,(now-state.lastTick)/1000);state.lastTick=now;state.elapsed+=delta;
    if(state.elapsed>=8){state.elapsed=0;state.day++;const occupied=Math.min(capacity(),state.guests);const roomsIncome=occupied*45;const serviceBonus=state.buildings.some(b=>b.type==="restaurant")?Math.round(occupied*12):0;const costs=(state.staff.cleaner+state.staff.reception)*5;const earned=Math.max(0,roomsIncome+serviceBonus-costs);state.money+=earned;state.income+=earned;state.guests=Math.min(capacity(),Math.max(0,state.guests+(Math.random()<.7?1:0)));if(state.guests>0&&state.staff.cleaner===0)state.reputation=Math.max(2,state.reputation-.1);else if(state.guests>0&&state.staff.cleaner>0)state.reputation=Math.min(5,state.reputation+.01);checkTasks();updateUI();render();log("Cierre del día","Ingresos: "+money(earned)+" · "+state.guests+" huéspedes alojados.");}
  }
  // Starter hotel: three rooms already built on the property.
  state.buildings.push({x:3,y:3,type:"room"},{x:4,y:3,type:"room"},{x:6,y:3,type:"room"});
  updateUI();render();setInterval(tick,1000);window.addEventListener("resize",render);
})();