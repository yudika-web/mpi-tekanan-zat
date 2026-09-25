(function(){
  'use strict';

  const ASSET='assets/game-lab-v2/';
  const GAME_IDS=['ground','hydraulic','gas','hydro','submarine'];
  const TITLES={
    ground:'Ground Rescue Challenge',
    hydraulic:'Hydraulic Garage',
    gas:'Gas Laboratory',
    hydro:'Hydrostatic Explorer',
    submarine:'Submarine Commander'
  };
  const ICONS={ground:'🚙',hydraulic:'🛠️',gas:'⚛️',hydro:'🌊',submarine:'⚓'};
  let ctx=null;
  let raf=0;
  let cleanupFns=[];
  let activeIndex=0;

  function asset(n){return ASSET+n}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function fmt(v,d=0){return Number(v).toLocaleString('id-ID',{maximumFractionDigits:d,minimumFractionDigits:d})}
  function now(){return performance.now()}
  function stopLoop(){if(raf)cancelAnimationFrame(raf);raf=0;cleanupFns.splice(0).forEach(fn=>{try{fn()}catch(e){}})}
  function ensureState(S){
    if(!S.gameV2) S.gameV2={};
    for(const id of GAME_IDS){
      if(!S.gameV2[id]) S.gameV2[id]={level:1,stars:[0,0,0],attempts:[0,0,0],done:[false,false,false],predicted:[false,false,false],data:[[],[],[]]};
    }
    return S.gameV2;
  }
  function save(){if(ctx&&ctx.save)ctx.save()}
  function toast(t){if(ctx&&ctx.toast)ctx.toast(t)}
  function sfx(n){if(ctx&&ctx.sfx)ctx.sfx(n)}
  function totalStars(S){const st=ensureState(S);return GAME_IDS.reduce((sum,id)=>sum+st[id].stars.reduce((a,b)=>a+b,0),0)}
  function totalDone(S){const st=ensureState(S);return GAME_IDS.reduce((sum,id)=>sum+st[id].done.filter(Boolean).length,0)}
  function gameState(id){return ensureState(ctx.S)[id]}
  function levelUnlocked(g,l){return l===1 || g.done[l-2]}
  function setLevel(id,l){const g=gameState(id);if(!levelUnlocked(g,l)){toast('Selesaikan level sebelumnya terlebih dahulu.');return}g.level=l;save();open(activeIndex,document.querySelectorAll('.game-tabs button')[activeIndex],ctx)}
  function starsHtml(n){return `<span class="gl-stars" aria-label="${n} dari 3 bintang">${[0,1,2].map(i=>`<span class="${i<n?'on':''}">★</span>`).join('')}</span>`}
  function levelNav(id){
    const g=gameState(id);
    return `<div class="gl-levels" role="group" aria-label="Pilih level">${[1,2,3].map(l=>`<button type="button" class="${g.level===l?'active':''}" ${levelUnlocked(g,l)?'':'disabled'} onclick="GameLabV2.setLevel('${id}',${l})"><b>Level ${l}</b>${starsHtml(g.stars[l-1])}</button>`).join('')}</div>`;
  }
  function summaryCards(S){
    const st=ensureState(S);
    return GAME_IDS.map((id,i)=>`<button type="button" class="gl-summary-card" onclick="game(${i},document.querySelectorAll('.game-tabs button')[${i}])"><span>${ICONS[id]}</span><b>${TITLES[id]}</b><small>${st[id].done.filter(Boolean).length}/3 level · ${st[id].stars.reduce((a,b)=>a+b,0)}/9 ★</small></button>`).join('');
  }
  function updateHeaderSummary(){
    const e=document.getElementById('glSummary');if(e)e.innerHTML=`<b>${totalDone(ctx.S)}/15</b> level selesai · <b>${totalStars(ctx.S)}/45 ★</b>`;
  }
  function commonIntro(id,desc){
    return `<div class="gl-game-head"><div><span class="badge">Model fisika pendidikan</span><h2>${ICONS[id]} ${TITLES[id]}</h2><p>${desc}</p></div><div class="gl-mini-note">Gerakan mengikuti perhitungan simulasi. Hambatan, deformasi, dan kondisi dunia nyata yang sangat kompleks disederhanakan agar sesuai pembelajaran SMP.</div></div>${levelNav(id)}`;
  }
  function predictionBox(id,question,options,correct){
    const g=gameState(id),l=g.level-1,locked=g.predicted[l];
    return `<div class="gl-predict"><b>1. Prediksi sebelum eksperimen</b><p>${question}</p><div class="gl-predict-options">${options.map((o,i)=>`<button type="button" ${locked?'disabled':''} onclick="GameLabV2.predict('${id}',${i},${correct},this)">${o}</button>`).join('')}</div><div class="gl-predict-status">${locked?'Prediksi sudah dikunci. Jalankan eksperimen dan bandingkan dengan hasilnya.':'Pilih prediksi agar kontrol simulasi aktif.'}</div></div>`;
  }
  function markPrediction(id,choice,correct,btn){
    const g=gameState(id),l=g.level-1;if(g.predicted[l])return;
    g.predicted[l]=true;if(id==='submarine'&&sub)sub.pred=true;g.predictionCorrect=g.predictionCorrect||[false,false,false];g.predictionCorrect[l]=choice===correct;save();
    const box=btn.closest('.gl-predict');box.querySelectorAll('button').forEach(b=>b.disabled=true);box.querySelector('.gl-predict-status').textContent=(choice===correct?'Prediksi logis. ':'Prediksi dicatat. ')+'Sekarang uji dengan simulasi.';
    document.querySelectorAll('[data-requires-predict]').forEach(e=>e.disabled=false);
  }
  function finalizeLevel(id,conceptCorrect,efficient=true){
    const g=gameState(id),i=g.level-1;
    let stars=1+(efficient?1:0)+(conceptCorrect?1:0);
    g.stars[i]=Math.max(g.stars[i],stars);g.done[i]=true;if(g.level<3)g.level++;
    save();sfx('sfx_success.wav');updateHeaderSummary();
    toast(`Level selesai: ${stars}/3 bintang.`);
    setTimeout(()=>open(activeIndex,document.querySelectorAll('.game-tabs button')[activeIndex],ctx),500);
  }
  function conceptPanel(id,question,options,correct,efficient){
    return `<div class="gl-concept"><b>3. Jelaskan hasil</b><p>${question}</p><div class="gl-predict-options">${options.map((o,i)=>`<button type="button" onclick="GameLabV2.finishConcept('${id}',${i},${correct},${efficient?'true':'false'})">${o}</button>`).join('')}</div><small>1 bintang target + 1 bintang efisiensi + 1 bintang alasan ilmiah.</small></div>`;
  }

  function shell(S){
    ensureState(S);
    return `<section class="page"><div class="wrap"><div class="section-head"><div class="kicker">Game Lab v2 — Simulasi Dinamis</div><h1>Laboratorium Virtual Tekanan</h1><p>Prediksi, kendalikan sistem, amati gerakan nyata pada model, ambil data, lalu jelaskan hasilnya. Skor game terpisah dari nilai evaluasi 15 soal.</p></div><div class="gl-overview"><div id="glSummary"><b>${totalDone(S)}/15</b> level selesai · <b>${totalStars(S)}/45 ★</b></div><div class="gl-overview-grid">${summaryCards(S)}</div></div><div class="game-tabs gl-tabs"><button class="active" onclick="game(0,this)">🚙 Ground</button><button onclick="game(1,this)">🛠️ Hidrolik</button><button onclick="game(2,this)">⚛️ Gas</button><button onclick="game(3,this)">🌊 Hidrostatis</button><button onclick="game(4,this)">⚓ Kapal Selam</button></div><div id="gameHost" class="gl-host"></div><div class="card gl-reflection" style="margin-top:14px"><h3>Refleksi setelah bereksperimen</h3><div class="field"><label>Konsep apa yang paling membantu menjelaskan fenomena sehari-hari?</label><textarea id="reflection" rows="3" placeholder="Tuliskan 2–3 kalimat...">${S.reflection||''}</textarea></div><button class="btn success" style="margin-top:10px" onclick="finishGames()">Selesaikan MPI</button><p class="gl-safe-note">Nilai evaluasi sudah dikirim setelah soal ke-15. Game Lab ini tidak mengubah skor evaluasi atau payload Apps Script.</p></div></div></section>`;
  }

  function open(i,btn,context){
    stopLoop();ctx=context;activeIndex=i;ensureState(ctx.S);
    document.querySelectorAll('.game-tabs button').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active');
    const host=document.getElementById('gameHost');if(!host)return;
    const id=GAME_IDS[i];
    if(id==='ground')renderGround(host);
    else if(id==='hydraulic')renderHydraulic(host);
    else if(id==='gas')renderGas(host);
    else if(id==='hydro')renderHydro(host);
    else renderSubmarine(host);
  }

  // ---------- GROUND ----------
  const groundLevels=[
    {terrain:'hard',name:'Tanah keras',limit:30000,mass:900,contact:.35,attempt:5},
    {terrain:'sand',name:'Pasir',limit:18000,mass:1100,contact:.45,attempt:4},
    {terrain:'mud',name:'Lumpur + beban misi',limit:14000,mass:1500,contact:.55,attempt:3}
  ];
  function renderGround(host){
    const g=gameState('ground'),L=groundLevels[g.level-1],pred=g.predicted[g.level-1];
    host.innerHTML=`${commonIntro('ground','Rancang konfigurasi kendaraan agar tekanan pada tanah cukup rendah untuk melintas tanpa terjebak.')}${predictionBox('ground','Jika massa kendaraan tetap dan luas kontak roda diperbesar, tekanan pada tanah akan ...',['bertambah','tetap','berkurang'],2)}<div class="gl-lab-grid"><div class="gl-panel"><h3>2. Atur kendaraan</h3><div class="gl-control-row"><label>Massa total</label><input id="grMass" type="range" min="600" max="1800" step="50" value="${L.mass}" ${pred?'':'disabled'} data-requires-predict oninput="GameLabV2.groundPreview()"><output id="grMassO">${L.mass} kg</output></div><div class="gl-control-row"><label>Luas kontak total</label><input id="grArea" type="range" min="0.20" max="1.20" step="0.05" value="${L.contact}" ${pred?'':'disabled'} data-requires-predict oninput="GameLabV2.groundPreview()"><output id="grAreaO">${fmt(L.contact,2)} m²</output></div><div class="gl-readouts"><div><span>Gaya berat</span><b id="grForce">${fmt(L.mass*10)} N</b></div><div><span>Tekanan</span><b id="grPressure">${fmt(L.mass*10/L.contact)} Pa</b></div><div><span>Batas medan</span><b>${fmt(L.limit)} Pa</b></div></div><button id="grRun" class="btn primary" ${pred?'':'disabled'} data-requires-predict onclick="GameLabV2.runGround()">▶ Jalankan kendaraan</button><button class="btn secondary" onclick="GameLabV2.resetGround()">Reset posisi</button><div id="grFeedback" class="feedback-box">Level ${g.level}: ${L.name}. Atur konfigurasi lalu jalankan.</div><div id="grConcept"></div></div><div class="gl-scene ground-scene" id="groundScene" style="background-image:url('${asset('terrain_'+L.terrain+'.webp')}')"><div class="gl-ground-depth"><span id="grSinkMeter"></span></div><div id="grVehicle" class="gl-vehicle"><img src="${asset('game_rescue_suv.webp')}" alt="Kendaraan penyelamat"><div class="gl-dust"></div></div><div class="gl-finish">TARGET</div><div class="gl-scene-label">${L.name}</div></div></div>`;
    groundPreview();
  }
  function groundPreview(){
    const m=+document.getElementById('grMass').value,a=+document.getElementById('grArea').value,p=m*10/a;
    document.getElementById('grMassO').value=`${m} kg`;document.getElementById('grAreaO').value=`${fmt(a,2)} m²`;document.getElementById('grForce').textContent=`${fmt(m*10)} N`;document.getElementById('grPressure').textContent=`${fmt(p)} Pa`;
  }
  function resetGround(){const v=document.getElementById('grVehicle');if(v){v.style.left='4%';v.style.setProperty('--sink','0px');v.classList.remove('stuck','moving')}const f=document.getElementById('grFeedback');if(f)f.textContent='Posisi kendaraan direset. Ubah variabel atau jalankan lagi.'}
  function runGround(){
    const g=gameState('ground'),li=g.level-1,L=groundLevels[li];g.attempts[li]++;save();
    const m=+document.getElementById('grMass').value,a=+document.getElementById('grArea').value,p=m*10/a,ratio=p/L.limit;
    const vehicle=document.getElementById('grVehicle'),fb=document.getElementById('grFeedback'),run=document.getElementById('grRun');run.disabled=true;vehicle.classList.add('moving');
    let start=now(),dur=4200,success=ratio<=1,stall=success?88:clamp(70-(ratio-1)*65,28,68),sink=clamp((ratio-.7)*48,0,38);
    function frame(t){if(!document.getElementById('grVehicle'))return;let k=clamp((t-start)/dur,0,1),x=4+(stall-4)*k;vehicle.style.left=x+'%';vehicle.style.setProperty('--sink',`${sink*k}px`);document.getElementById('grSinkMeter').style.height=`${clamp(sink*2,5,75)}%`;
      if(k<1){raf=requestAnimationFrame(frame)}else{vehicle.classList.remove('moving');run.disabled=false;if(success){fb.className='feedback-box ok';fb.innerHTML=`Berhasil. p = <b>${fmt(p)} Pa</b> ≤ batas ${fmt(L.limit)} Pa. Kendaraan mencapai target dengan deformasi tanah kecil.`;document.getElementById('grConcept').innerHTML=conceptPanel('ground','Mengapa luas kontak yang lebih besar membantu kendaraan di tanah lunak?',['Karena gaya tersebar pada area lebih luas sehingga tekanan turun','Karena massa kendaraan otomatis menjadi nol','Karena gravitasi berhenti bekerja'],0,g.attempts[li]<=L.attempt)}else{vehicle.classList.add('stuck');fb.className='feedback-box bad';fb.innerHTML=`Kendaraan terjebak. p = <b>${fmt(p)} Pa</b> > batas ${fmt(L.limit)} Pa. Perbesar luas kontak atau kurangi massa lalu coba lagi.`;sfx('sfx_error_soft.wav')}}
    }
    raf=requestAnimationFrame(frame);
  }

  // ---------- HYDRAULIC ----------
  const hydLevels=[{load:2500,attempt:5},{load:4000,attempt:4},{load:6000,attempt:3}];
  function renderHydraulic(host){
    const g=gameState('hydraulic'),L=hydLevels[g.level-1],pred=g.predicted[g.level-1];
    host.innerHTML=`${commonIntro('hydraulic','Atur luas piston dan gaya input. Piston bergerak mengikuti Hukum Pascal dan konservasi volume sederhana.')}${predictionBox('hydraulic','Jika A₂ diperbesar sementara A₁ dan F₁ tetap, gaya keluaran F₂ akan ...',['bertambah','tetap','berkurang'],0)}<div class="gl-lab-grid"><div class="gl-panel"><h3>2. Rancang sistem</h3><div class="gl-control-row"><label>A₁</label><input id="hyA1" type="range" min="4" max="20" step="1" value="8" ${pred?'':'disabled'} data-requires-predict oninput="GameLabV2.hydPreview()"><output id="hyA1O">8 cm²</output></div><div class="gl-control-row"><label>A₂</label><input id="hyA2" type="range" min="80" max="320" step="10" value="180" ${pred?'':'disabled'} data-requires-predict oninput="GameLabV2.hydPreview()"><output id="hyA2O">180 cm²</output></div><div class="gl-control-row"><label>F₁</label><input id="hyF1" type="range" min="50" max="220" step="10" value="120" ${pred?'':'disabled'} data-requires-predict oninput="GameLabV2.hydPreview()"><output id="hyF1O">120 N</output></div><div class="gl-readouts"><div><span>Tekanan</span><b id="hyP">15 N/cm²</b></div><div><span>F₂</span><b id="hyF2">2.700 N</b></div><div><span>Target beban</span><b>${fmt(L.load)} N</b></div></div><button class="btn primary" id="hyRun" ${pred?'':'disabled'} data-requires-predict onclick="GameLabV2.runHydraulic()">▶ Uji rancangan</button><div id="hyFeedback" class="feedback-box">Perhatikan bahwa keuntungan gaya dibayar dengan perpindahan piston besar yang lebih pendek.</div><div id="hyConcept"></div></div><div class="gl-scene hydraulic-scene"><div class="hy-pipe"></div><div class="hy-small"><div id="hySmallPiston" class="hy-piston"></div><span>A₁</span></div><div class="hy-big"><div id="hyBigPiston" class="hy-piston big"></div><div id="hyCar" class="hy-car"><img src="${asset('game_rescue_suv.webp')}" alt="Kendaraan di atas lift"></div><span>A₂</span></div><div id="hyFlow" class="hy-flow"></div><div class="gl-scene-label">Lift hidrolik</div></div></div>`;
    hydPreview();
  }
  function hydPreview(){
    const a1=+document.getElementById('hyA1').value,a2=+document.getElementById('hyA2').value,f1=+document.getElementById('hyF1').value,p=f1/a1,f2=p*a2;
    document.getElementById('hyA1O').value=`${a1} cm²`;document.getElementById('hyA2O').value=`${a2} cm²`;document.getElementById('hyF1O').value=`${f1} N`;document.getElementById('hyP').textContent=`${fmt(p,1)} N/cm²`;document.getElementById('hyF2').textContent=`${fmt(f2)} N`;
  }
  function runHydraulic(){
    const g=gameState('hydraulic'),li=g.level-1,L=hydLevels[li];g.attempts[li]++;save();
    const a1=+document.getElementById('hyA1').value,a2=+document.getElementById('hyA2').value,f1=+document.getElementById('hyF1').value,f2=f1/a1*a2,s1=12,s2=s1*a1/a2,success=f2>=L.load;
    const sm=document.getElementById('hySmallPiston'),bg=document.getElementById('hyBigPiston'),car=document.getElementById('hyCar'),flow=document.getElementById('hyFlow'),fb=document.getElementById('hyFeedback'),run=document.getElementById('hyRun');run.disabled=true;flow.classList.add('active');
    sm.style.transform='translateY(82px)';if(success){bg.style.transform=`translateY(${-clamp(s2*8,12,55)}px)`;car.style.transform=`translate(-50%,${-clamp(s2*8,12,55)}px)`}else{car.classList.add('shake')}
    setTimeout(()=>{run.disabled=false;flow.classList.remove('active');car.classList.remove('shake');if(success){fb.className='feedback-box ok';fb.innerHTML=`Berhasil: F₂ ≈ <b>${fmt(f2)} N</b>. Untuk langkah piston kecil ${s1} cm, piston besar hanya bergerak sekitar <b>${fmt(s2,1)} cm</b>.`;document.getElementById('hyConcept').innerHTML=conceptPanel('hydraulic','Mengapa piston besar bergerak lebih pendek walau gayanya lebih besar?',['Karena volume fluida yang berpindah harus tetap seimbang: A₁s₁ ≈ A₂s₂','Karena fluida hilang selama pemompaan','Karena massa mobil menjadi lebih kecil'],0,g.attempts[li]<=L.attempt)}else{fb.className='feedback-box bad';fb.innerHTML=`Belum mampu mengangkat beban. F₂ ≈ <b>${fmt(f2)} N</b> < ${fmt(L.load)} N. Ubah rasio A₂/A₁ atau F₁.`;sfx('sfx_error_soft.wav')}setTimeout(()=>{sm.style.transform='';if(!success){bg.style.transform='';car.style.transform=''}},400)},2200);
  }

  // ---------- GAS ----------
  const gasLevels=[{mode:'fixed',need:2,attempt:5},{mode:'free',need:2,attempt:5},{mode:'compare',need:4,attempt:6}];
  let gasSim=null;
  function renderGas(host){
    const g=gameState('gas'),L=gasLevels[g.level-1],pred=g.predicted[g.level-1];
    host.innerHTML=`${commonIntro('gas','Amati partikel bergerak real-time. Pada volume tetap, perubahan suhu terutama mengubah tekanan; pada piston bebas, volume dapat ikut berubah.')}${predictionBox('gas','Pada wadah tertutup dengan volume tetap, jika suhu dinaikkan maka tekanan cenderung ...',['naik','tetap','turun'],0)}<div class="gl-lab-grid"><div class="gl-panel"><h3>2. Laboratorium gas</h3><div class="gl-segment"><button id="gasFixed" ${pred?'':'disabled'} data-requires-predict class="${L.mode==='free'?'':'active'}" onclick="GameLabV2.setGasMode('fixed')">Volume tetap</button><button id="gasFree" ${pred?'':'disabled'} data-requires-predict class="${L.mode==='free'?'active':''}" onclick="GameLabV2.setGasMode('free')">Piston bebas</button></div><div class="btn-row"><button class="btn orange" ${pred?'':'disabled'} data-requires-predict onclick="GameLabV2.changeGasTemp(40)">🔥 Panaskan</button><button class="btn secondary" ${pred?'':'disabled'} data-requires-predict onclick="GameLabV2.changeGasTemp(-40)">❄ Dinginkan</button><button class="btn secondary" ${pred?'':'disabled'} data-requires-predict onclick="GameLabV2.gasPause()">⏯ Pause</button></div><div class="gl-readouts"><div><span>Suhu</span><b id="gasT">298 K</b></div><div><span>Tekanan</span><b id="gasP">101,3 kPa</b></div><div><span>Volume relatif</span><b id="gasV">1,00×</b></div></div><button class="btn primary" ${pred?'':'disabled'} data-requires-predict onclick="GameLabV2.takeGasData()">＋ Ambil Data</button><div id="gasFeedback" class="feedback-box">Gerakan partikel akan berubah mengikuti suhu. Ambil data pada beberapa kondisi.</div><div class="gl-data-mini" id="gasData"></div><div id="gasConcept"></div></div><div class="gl-scene gas-scene"><canvas id="gasCanvas" width="520" height="340" aria-label="Simulasi partikel gas"></canvas><div class="gl-scene-label">Model partikel gas</div></div></div>`;
    startGas(L);
  }
  function startGas(L){
    const c=document.getElementById('gasCanvas');if(!c)return;const x=c.getContext('2d');
    const particles=Array.from({length:30},(_,i)=>({x:80+Math.random()*350,y:70+Math.random()*190,vx:(Math.random()-.5)*90,vy:(Math.random()-.5)*90,r:5+(i%3)}));
    gasSim={canvas:c,x,particles,T:298,targetT:298,V:1,mode:L.mode==='free'?'free':'fixed',paused:false,last:now(),level:L};
    function loop(t){if(!document.getElementById('gasCanvas'))return;const s=gasSim,dt=Math.min(.03,(t-s.last)/1000);s.last=t;if(!s.paused){s.T+=(s.targetT-s.T)*Math.min(1,dt*1.8);let targetV=s.mode==='free'?clamp(s.T/298,.68,1.32):1;s.V+=(targetV-s.V)*Math.min(1,dt*2.1);const speed=Math.sqrt(s.T/298);let top=70+(1.32-s.V)*85,bottom=300;for(const p of s.particles){p.x+=p.vx*dt*speed;p.y+=p.vy*dt*speed;if(p.x<55+p.r||p.x>465-p.r){p.vx*=-1;p.x=clamp(p.x,55+p.r,465-p.r)}if(p.y<top+p.r||p.y>bottom-p.r){p.vy*=-1;p.y=clamp(p.y,top+p.r,bottom-p.r)}}}
      drawGas();raf=requestAnimationFrame(loop)}raf=requestAnimationFrame(loop);
  }
  function drawGas(){const s=gasSim;if(!s)return;const {x,c}= {x:s.x,c:s.canvas};x.clearRect(0,0,c.width,c.height);x.fillStyle='#eaf9ff';x.fillRect(45,50,430,260);let top=70+(1.32-s.V)*85;x.fillStyle='#cad7de';x.fillRect(40,top-16,440,18);x.fillStyle='#6b7b86';x.fillRect(215,20,90,top-35);x.strokeStyle='#527a8e';x.lineWidth=5;x.strokeRect(45,top,430,300-top);for(const p of s.particles){x.beginPath();x.fillStyle=(p.r%2)?'#0ea5e9':'#ffb020';x.arc(p.x,p.y,p.r,0,Math.PI*2);x.fill()}const P=101.3*(s.T/298)/s.V;document.getElementById('gasT').textContent=`${fmt(s.T)} K`;document.getElementById('gasP').textContent=`${fmt(P,1)} kPa`;document.getElementById('gasV').textContent=`${fmt(s.V,2)}×`;}
  function setGasMode(m){if(!gasSim)return;gasSim.mode=m;document.getElementById('gasFixed').classList.toggle('active',m==='fixed');document.getElementById('gasFree').classList.toggle('active',m==='free');}
  function changeGasTemp(d){if(!gasSim)return;gasSim.targetT=clamp(gasSim.targetT+d,220,500)}
  function gasPause(){if(gasSim)gasSim.paused=!gasSim.paused}
  function takeGasData(){
    const g=gameState('gas'),li=g.level-1,L=gasLevels[li],s=gasSim;if(!s)return;g.attempts[li]++;const P=101.3*(s.T/298)/s.V;g.data[li].push({T:Math.round(s.T),P:+P.toFixed(1),V:+s.V.toFixed(2),mode:s.mode});if(g.data[li].length>6)g.data[li].shift();save();
    document.getElementById('gasData').innerHTML=`<table><tr><th>T (K)</th><th>P (kPa)</th><th>V rel.</th><th>Mode</th></tr>${g.data[li].map(d=>`<tr><td>${d.T}</td><td>${fmt(d.P,1)}</td><td>${fmt(d.V,2)}</td><td>${d.mode==='fixed'?'Tetap':'Bebas'}</td></tr>`).join('')}</table>`;
    let ok=false;if(L.mode==='fixed')ok=g.data[li].length>=2&&g.data[li].every(d=>d.mode==='fixed')&&Math.max(...g.data[li].map(d=>d.T))-Math.min(...g.data[li].map(d=>d.T))>30;else if(L.mode==='free')ok=g.data[li].length>=2&&g.data[li].every(d=>d.mode==='free')&&Math.max(...g.data[li].map(d=>d.T))-Math.min(...g.data[li].map(d=>d.T))>30;else ok=new Set(g.data[li].map(d=>d.mode)).size===2&&g.data[li].length>=4;
    if(ok){document.getElementById('gasFeedback').className='feedback-box ok';document.getElementById('gasFeedback').textContent='Data cukup untuk dibandingkan. Jawab pertanyaan konsep untuk menutup level.';document.getElementById('gasConcept').innerHTML=conceptPanel('gas',L.mode==='fixed'?'Mengapa tekanan naik ketika suhu naik pada volume tetap?':L.mode==='free'?'Mengapa piston naik saat gas dipanaskan?':'Apa perbedaan utama respons volume tetap dan piston bebas?',['Partikel bergerak lebih cepat; pada volume tetap tumbukan menaikkan tekanan, sedangkan piston bebas memungkinkan volume berubah','Suhu tidak memengaruhi gerak partikel','Tekanan selalu nol jika gas dipanaskan'],0,g.attempts[li]<=L.attempt)}
  }

  // ---------- HYDROSTATIC ----------
  const hydroLevels=[{need:3,mode:'depth',attempt:5},{need:3,mode:'fluid',attempt:5},{need:4,mode:'graph',attempt:6}];
  let hydro={depth:4,rho:1000};
  function renderHydro(host){
    const g=gameState('hydro'),L=hydroLevels[g.level-1],pred=g.predicted[g.level-1];
    host.innerHTML=`${commonIntro('hydro','Geser sensor secara langsung di kolom cairan. Tekanan, gauge, tabel, dan grafik diperbarui dari posisi sensor.')}${predictionBox('hydro','Jika sensor diturunkan lebih dalam pada cairan yang sama, tekanan hidrostatis akan ...',['naik','tetap','turun'],0)}<div class="gl-lab-grid"><div class="gl-panel"><h3>2. Eksperimen kedalaman</h3><div class="gl-control-row"><label>Cairan</label><select id="hyFluid" ${pred?'':'disabled'} data-requires-predict onchange="GameLabV2.hydroFluid(this.value)"><option value="1000">Air tawar (ρ 1000)</option><option value="1025">Air laut (ρ 1025)</option><option value="800">Minyak (ρ 800)</option></select><output id="hyRhoO">1000 kg/m³</output></div><div class="btn-row"><button class="btn secondary" ${pred?'':'disabled'} data-requires-predict onclick="GameLabV2.hydroMove(-1)">▲ Naik</button><button class="btn secondary" ${pred?'':'disabled'} data-requires-predict onclick="GameLabV2.hydroMove(1)">▼ Turun</button><button class="btn primary" ${pred?'':'disabled'} data-requires-predict onclick="GameLabV2.takeHydroData()">＋ Ambil Data</button></div><div class="gl-readouts"><div><span>Kedalaman</span><b id="hyDepth">4,0 m</b></div><div><span>Tekanan h</span><b id="hyPressure">40,0 kPa</b></div><div><span>ρ</span><b id="hyRho">1000</b></div></div><div id="hydroFeedback" class="feedback-box">Sensor dapat di-drag naik/turun atau gunakan tombol.</div><div id="hydroData" class="gl-data-mini"></div><div id="hydroConcept"></div></div><div class="gl-scene hydro-scene" id="hydroTank"><div class="hydro-surface"></div><div id="hydroSensor" class="hydro-sensor" tabindex="0" role="slider" aria-label="Kedalaman sensor"><span>●</span></div><div class="hydro-scale">0 m<br><span>5</span><br><span>10</span><br><span>15</span><br><span>20</span></div><div class="hydro-gauge"><div id="hydroNeedle" class="hydro-needle"></div><b>p</b></div><svg id="hydroGraph" viewBox="0 0 220 140" aria-label="Grafik tekanan terhadap kedalaman"><line x1="30" y1="110" x2="205" y2="110"/><line x1="30" y1="110" x2="30" y2="15"/><polyline id="hydroLine" points=""/></svg><div class="gl-scene-label">Tarik sensor • p = ρgh</div></div></div>`;
    hydro={depth:4,rho:1000};updateHydro();attachHydroDrag();renderHydroData();
  }
  function updateHydro(){const p=hydro.rho*10*hydro.depth/1000;const sensor=document.getElementById('hydroSensor');if(!sensor)return;sensor.style.top=`${10+hydro.depth/20*72}%`;sensor.setAttribute('aria-valuenow',hydro.depth.toFixed(1));document.getElementById('hyDepth').textContent=`${fmt(hydro.depth,1)} m`;document.getElementById('hyPressure').textContent=`${fmt(p,1)} kPa`;document.getElementById('hyRho').textContent=hydro.rho;document.getElementById('hyRhoO').value=`${hydro.rho} kg/m³`;document.getElementById('hydroNeedle').style.transform=`rotate(${clamp(-55+p/220*110,-55,55)}deg)`}
  function hydroMove(d){hydro.depth=clamp(hydro.depth+d,0,20);updateHydro()}
  function hydroFluid(v){hydro.rho=+v;updateHydro()}
  function attachHydroDrag(){const tank=document.getElementById('hydroTank'),sensor=document.getElementById('hydroSensor');if(!tank||!sensor)return;let dragging=false;const move=e=>{if(!dragging)return;const r=tank.getBoundingClientRect();const y=clamp(e.clientY-r.top,r.height*.1,r.height*.82);hydro.depth=clamp((y-r.height*.1)/(r.height*.72)*20,0,20);updateHydro()};sensor.addEventListener('pointerdown',e=>{dragging=true;sensor.setPointerCapture(e.pointerId)});sensor.addEventListener('pointermove',move);sensor.addEventListener('pointerup',()=>dragging=false);cleanupFns.push(()=>{dragging=false})}
  function takeHydroData(){
    const g=gameState('hydro'),li=g.level-1,L=hydroLevels[li],p=hydro.rho*10*hydro.depth/1000;g.attempts[li]++;g.data[li].push({h:+hydro.depth.toFixed(1),p:+p.toFixed(1),rho:hydro.rho});if(g.data[li].length>8)g.data[li].shift();save();renderHydroData();
    const d=g.data[li];let ok=false;if(L.mode==='depth')ok=d.length>=3&&new Set(d.map(x=>x.h)).size>=3&&d.every(x=>x.rho===1000);else if(L.mode==='fluid')ok=d.length>=3&&new Set(d.map(x=>x.rho)).size>=2;else ok=d.length>=4&&new Set(d.map(x=>x.h)).size>=4;
    if(ok){document.getElementById('hydroFeedback').className='feedback-box ok';document.getElementById('hydroFeedback').textContent='Data cukup. Grafik dibangun dari pengukuranmu sendiri.';document.getElementById('hydroConcept').innerHTML=conceptPanel('hydro',L.mode==='fluid'?'Pada kedalaman sama, cairan lebih rapat menghasilkan tekanan hidrostatis ...':'Apa bentuk hubungan p terhadap h saat ρ dan g tetap?',['lebih besar / hubungan p-h linear','selalu lebih kecil / tidak terkait kedalaman','selalu sama untuk semua cairan'],0,g.attempts[li]<=L.attempt)}
  }
  function renderHydroData(){const g=gameState('hydro'),d=g.data[g.level-1]||[];const el=document.getElementById('hydroData');if(el)el.innerHTML=d.length?`<table><tr><th>h (m)</th><th>ρ</th><th>p (kPa)</th></tr>${d.map(x=>`<tr><td>${fmt(x.h,1)}</td><td>${x.rho}</td><td>${fmt(x.p,1)}</td></tr>`).join('')}</table>`:'';const line=document.getElementById('hydroLine');if(line){const pts=[...d].sort((a,b)=>a.h-b.h).map(x=>`${30+x.h/20*170},${110-clamp(x.p/220*90,0,90)}`).join(' ');line.setAttribute('points',pts)}}

  // ---------- SUBMARINE ----------
  const subLevels=[{target:10,hold:2,attempt:6},{target:20,hold:5,attempt:5},{target:28,hold:0,attempt:6}];
  let sub=null;
  function renderSubmarine(host){
    const g=gameState('submarine'),L=subLevels[g.level-1],pred=g.predicted[g.level-1];
    host.innerHTML=`${commonIntro('submarine','Kendalikan ballast. Kedalaman dan kecepatan kapal dihitung dari resultan berat, gaya apung, serta hambatan gerak sederhana.')}${predictionBox('submarine',g.level===3?'Setelah kapsul penelitian diambil dan ballast tidak diubah, kapal cenderung ...':'Jika air ballast ditambah sementara volume luar kapal hampir tetap, kapal cenderung ...',['naik','melayang','turun'],2)}<div class="gl-lab-grid"><div class="gl-panel"><h3>2. Kendalikan kapal</h3><div class="gl-sub-controls"><button id="subFill" class="btn primary" ${pred?'':'disabled'} data-requires-predict>↓ Isi Ballast</button><button id="subVent" class="btn orange" ${pred?'':'disabled'} data-requires-predict>↑ Buang Ballast</button><button class="btn secondary" ${pred?'':'disabled'} data-requires-predict onclick="GameLabV2.subHold()">⏸ Netral kontrol</button></div><div class="gl-readouts"><div><span>Kedalaman</span><b id="subDepth">0,0 m</b></div><div><span>Kecepatan</span><b id="subVel">0,00 m/s</b></div><div><span>Ballast</span><b id="subBallast">50%</b></div><div><span>Fₐ</span><b id="subFa">5.528 N</b></div><div><span>W</span><b id="subW">5.528 N</b></div><div><span>p_h</span><b id="subP">0 kPa</b></div></div><div id="subMission" class="feedback-box"></div><button id="subCapsuleBtn" class="btn success" style="display:none" onclick="GameLabV2.pickCapsule()">Ambil Kapsul Penelitian</button><div id="subConcept"></div></div><div class="gl-scene sub-scene"><div class="sub-rays"></div><div class="sub-bubbles"></div><div id="subSprite" class="sub-sprite"><img src="${asset('arch_submarine.webp')}" alt="Kapal selam"></div><div id="subCapsule" class="sub-capsule">▣</div><div class="sub-depth-line"></div><div class="gl-scene-label">0–32 m • model dinamika vertikal</div></div></div>`;
    startSub(L,g.level,pred);attachSubControls();
  }
  function startSub(L,level,pred){sub={depth:0,v:0,ballast:50,rate:0,last:now(),holdTime:0,cargo:false,picked:false,level,target:L.target,holdNeed:L.hold,pred};function loop(t){if(!document.getElementById('subSprite'))return;const dt=Math.min(.035,(t-sub.last)/1000);sub.last=t;if(sub.pred){sub.ballast=clamp(sub.ballast+sub.rate*14*dt,0,100);const rho=1025,g=9.81,V=.55,Fa=rho*g*V,base=513.55,ballastMass=sub.ballast,cargo=sub.cargo?25:0,m=base+ballastMass+cargo,W=m*g;let a=(W-Fa)/m-0.85*sub.v;sub.v+=a*dt;sub.v=clamp(sub.v,-2.3,2.3);sub.depth+=sub.v*dt; if(sub.depth<0){sub.depth=0;sub.v=Math.max(0,sub.v)} if(sub.depth>32){sub.depth=32;sub.v=Math.min(0,sub.v)} const targetOk=Math.abs(sub.depth-sub.target)<=1&&Math.abs(sub.v)<.35;if(level<3){sub.holdTime=targetOk?sub.holdTime+dt:0}else if(!sub.picked&&Math.abs(sub.depth-28)<1.2){document.getElementById('subCapsuleBtn').style.display='inline-flex'} if(level===3&&sub.picked&&sub.depth<2&&Math.abs(sub.v)<.6){subSuccess(Fa,W)}else if(level<3&&sub.holdTime>=sub.holdNeed){subSuccess(Fa,W)} renderSub(Fa,W)}raf=requestAnimationFrame(loop)}raf=requestAnimationFrame(loop)}
  function attachSubControls(){const fill=document.getElementById('subFill'),vent=document.getElementById('subVent');if(!fill||!vent)return;const bind=(el,rate)=>{const down=e=>{if(!sub||!sub.pred)return;sub.rate=rate;const g=gameState('submarine'),li=g.level-1;g.attempts[li]++;save();el.setPointerCapture?.(e.pointerId)};const up=()=>{if(sub)sub.rate=0};el.addEventListener('pointerdown',down);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('pointerleave',up)};bind(fill,1);bind(vent,-1)}
  function subHold(){if(sub)sub.rate=0}
  function renderSub(Fa,W){const sp=document.getElementById('subSprite');if(!sp)return;sp.style.top=`${8+sub.depth/32*75}%`;sp.style.transform=`translate(-50%,-50%) rotate(${clamp(sub.v*3,-7,7)}deg)`;document.getElementById('subDepth').textContent=`${fmt(sub.depth,1)} m`;document.getElementById('subVel').textContent=`${fmt(sub.v,2)} m/s`;document.getElementById('subBallast').textContent=`${fmt(sub.ballast)}%`;document.getElementById('subFa').textContent=`${fmt(Fa)} N`;document.getElementById('subW').textContent=`${fmt(W)} N`;document.getElementById('subP').textContent=`${fmt(1025*9.81*sub.depth/1000,1)} kPa`;const status=W>Fa+40?'Turun':W<Fa-40?'Naik':'Hampir netral';const g=gameState('submarine');document.getElementById('subMission').innerHTML=g.level===1?`Target <b>10 ±1 m</b> dan stabil selama 2 detik. Status gaya: <b>${status}</b>.`:g.level===2?`Target <b>20 ±1 m</b> dan stabil selama 5 detik. Status gaya: <b>${status}</b>.`:sub.picked?`Kapsul sudah diambil (+25 kg). Kembali ke permukaan (<2 m). Status: <b>${status}</b>.`:`Turun ke <b>28 m</b>, ambil kapsul, lalu kembali ke permukaan. Status: <b>${status}</b>.`}
  function pickCapsule(){if(!sub||Math.abs(sub.depth-28)>1.4)return;sub.picked=true;sub.cargo=true;document.getElementById('subCapsule').classList.add('picked');document.getElementById('subCapsuleBtn').style.display='none';toast('Kapsul masuk kapal: massa bertambah 25 kg. Amati perubahan geraknya.')}
  function subSuccess(Fa,W){if(sub.completed)return;sub.completed=true;sub.rate=0;const g=gameState('submarine'),li=g.level-1,L=subLevels[li],efficient=g.attempts[li]<=L.attempt;document.getElementById('subConcept').innerHTML=conceptPanel('submarine',g.level===3?'Mengapa kapal cenderung turun sesaat setelah mengambil kapsul jika ballast belum diubah?':'Apa kondisi ideal agar kapal dapat melayang stabil?',['Karena berat bertambah sehingga W dapat melebihi Fₐ / saat melayang Fₐ ≈ W','Karena tekanan air menjadi nol','Karena gaya gravitasi menghilang'],0,efficient);document.getElementById('subMission').className='feedback-box ok';document.getElementById('subMission').innerHTML='Target gerak tercapai. Sekarang jelaskan penyebab fisiknya untuk menyelesaikan level.';sfx('sfx_success.wav')}

  // Public API
  window.GameLabV2={
    shell,open,setLevel,predict:markPrediction,finishConcept:(id,choice,correct,efficient)=>finalizeLevel(id,choice===correct,efficient),
    groundPreview,runGround,resetGround,
    hydPreview,runHydraulic,
    setGasMode,changeGasTemp,gasPause,takeGasData,
    hydroMove,hydroFluid,takeHydroData,
    subHold,pickCapsule
  };
})();
