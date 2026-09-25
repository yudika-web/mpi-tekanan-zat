const IMG='assets/img/', AUD='assets/audio/';
const A=n=>IMG+n;
const KEY='mpiTekananV2';
const menuDefs=[
{id:'opening',label:'Pembuka',ico:'◎'},{id:'objectives',label:'Tujuan Pembelajaran',ico:'⌖'},{id:'materials',label:'Materi Pembelajaran',ico:'◫'},{id:'missions',label:'Pembelajaran Bertahap',ico:'◆'},{id:'quiz',label:'Evaluasi',ico:'✓'},{id:'games',label:'Simulasi / Games',ico:'⚙'}];
const DEFAULT={name:'',kelas:'',current:'opening',unlocked:1,completed:[],topic:0,topicStep:0,topicChecks:{},missions:[],quizIndex:0,answers:{},checked:{},firstScore:{},quizScore:null,quizCorrect:0,categoryScores:{},mastery:{},cloudStatus:'off',sessionId:(Date.now().toString(36)+Math.random().toString(36).slice(2)),started:Date.now()};
let S=load();
function load(){try{return {...DEFAULT,...JSON.parse(sessionStorage.getItem(KEY)||'{}')}}catch(e){return {...DEFAULT}}}
function save(){try{sessionStorage.setItem(KEY,JSON.stringify(S))}catch(e){}updateNav()}
function sfx(name,vol=.22){const e=document.getElementById('sfx');e.src=AUD+name;e.volume=vol;e.play().catch(()=>{})}
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1800)}
function mi(id){return menuDefs.findIndex(x=>x.id===id)}
function done(id){return S.completed.includes(id)}
function completeMenu(id){if(!done(id))S.completed.push(id);S.unlocked=Math.max(S.unlocked,Math.min(menuDefs.length,mi(id)+2));save()}
function go(id){if(mi(id)>=S.unlocked){toast('Tahap ini masih terkunci.');return}S.current=id;save();render();document.getElementById('sidebar').classList.remove('open');scrollTo(0,0)}
window.go=go;
function img(n,c=''){return `<img src="${A(n)}" class="${c}" alt="">`}
function updateNav(){
 const nav=document.getElementById('nav');
 nav.innerHTML=menuDefs.map((m,i)=>{const open=i<S.unlocked,active=S.current===m.id,fin=done(m.id);const st=!open?'🔒':fin?'✓':active?'●':'○';const tx=!open?'Belum dibuka':fin?'Selesai':active?'Sedang dipelajari':'Terbuka';return `<button class="nav-btn ${active?'active':''}" ${open?'':'disabled'} onclick="go('${m.id}')"><span class="nav-ico">${m.ico}</span><span><strong>${m.label}</strong><small>${tx}</small></span><span class="state">${st}</span></button>`}).join('');
 document.getElementById('navName').textContent=S.name||'Navigator Sains';document.getElementById('navClass').textContent=S.kelas?`Kelas ${S.kelas}`:'Kelas IX';
 const pct=Math.round(S.completed.length/menuDefs.length*100);document.getElementById('headerPct').textContent=pct+'%';document.getElementById('headerBar').style.width=pct+'%';
}
document.getElementById('menuToggle').onclick=()=>document.getElementById('sidebar').classList.toggle('open');

// ===== v3.3 Background Music Controller =====
const MUSIC_PREF_KEY='mpiTekananMusicPrefs';
const MUSIC_DEFAULT={enabled:true,volume:28};
let musicPrefs=loadMusicPrefs();
let musicUnlocked=false;

function loadMusicPrefs(){
  try{
    const saved=JSON.parse(localStorage.getItem(MUSIC_PREF_KEY)||'{}');
    return {
      enabled:typeof saved.enabled==='boolean'?saved.enabled:MUSIC_DEFAULT.enabled,
      volume:Number.isFinite(+saved.volume)?Math.max(0,Math.min(100,+saved.volume)):MUSIC_DEFAULT.volume
    };
  }catch(e){return {...MUSIC_DEFAULT}}
}
function saveMusicPrefs(){
  try{localStorage.setItem(MUSIC_PREF_KEY,JSON.stringify(musicPrefs))}catch(e){}
}
function bgmEl(){return document.getElementById('bgm')}
function updateMusicUI(){
  const enabled=document.getElementById('bgmEnabled');
  const volume=document.getElementById('bgmVolume');
  const out=document.getElementById('bgmVolumeOut');
  const btn=document.getElementById('settingsBtn');
  if(enabled)enabled.checked=musicPrefs.enabled;
  if(volume)volume.value=musicPrefs.volume;
  if(out)out.textContent=Math.round(musicPrefs.volume)+'%';
  if(btn){
    btn.textContent=musicPrefs.enabled&&musicPrefs.volume>0?'♫':'🔇';
    btn.classList.toggle('muted',!musicPrefs.enabled||musicPrefs.volume===0);
  }
}
function updateMusicStatus(message){
  const e=document.getElementById('musicStatus');
  if(e)e.textContent=message;
}
function applyMusicPrefs(tryPlay=false){
  const audio=bgmEl();
  if(!audio)return;
  audio.volume=Math.max(0,Math.min(1,musicPrefs.volume/100));
  if(!musicPrefs.enabled||musicPrefs.volume===0){
    audio.pause();
    updateMusicStatus('Musik latar dimatikan.');
  }else if(tryPlay&&musicUnlocked){
    const p=audio.play();
    if(p&&typeof p.then==='function'){
      p.then(()=>updateMusicStatus('Musik latar sedang diputar.'))
       .catch(()=>updateMusicStatus('Tekan “Coba musik” untuk memulai audio pada browser ini.'));
    }
  }else if(audio.paused){
    updateMusicStatus('Musik siap dan akan mulai setelah interaksi pengguna.');
  }
  updateMusicUI();
}
function unlockMusic(){
  if(musicUnlocked)return;
  musicUnlocked=true;
  applyMusicPrefs(true);
}
function openSettings(){
  const overlay=document.getElementById('settingsOverlay');
  if(!overlay)return;
  overlay.hidden=false;
  updateMusicUI();
  applyMusicPrefs(false);
  setTimeout(()=>document.getElementById('bgmEnabled')?.focus(),0);
}
function closeSettings(){
  const overlay=document.getElementById('settingsOverlay');
  if(overlay)overlay.hidden=true;
  document.getElementById('settingsBtn')?.focus();
}
window.openSettings=openSettings;

document.getElementById('settingsBtn')?.addEventListener('click',()=>{
  musicUnlocked=true;
  openSettings();
});
document.getElementById('settingsClose')?.addEventListener('click',closeSettings);
document.getElementById('settingsDone')?.addEventListener('click',closeSettings);
document.getElementById('settingsOverlay')?.addEventListener('click',e=>{
  if(e.target===e.currentTarget)closeSettings();
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!document.getElementById('settingsOverlay')?.hidden)closeSettings();
});
document.getElementById('bgmEnabled')?.addEventListener('change',e=>{
  musicPrefs.enabled=e.target.checked;
  saveMusicPrefs();
  musicUnlocked=true;
  applyMusicPrefs(true);
});
document.getElementById('bgmVolume')?.addEventListener('input',e=>{
  musicPrefs.volume=Math.max(0,Math.min(100,+e.target.value));
  saveMusicPrefs();
  const audio=bgmEl();
  if(audio)audio.volume=musicPrefs.volume/100;
  if(musicPrefs.volume>0&&musicPrefs.enabled&&musicUnlocked&&audio?.paused){
    audio.play().catch(()=>{});
  }
  updateMusicUI();
  updateMusicStatus(musicPrefs.volume===0?'Volume musik 0% (hening).':`Volume musik ${Math.round(musicPrefs.volume)}%.`);
});
document.getElementById('bgmTestBtn')?.addEventListener('click',()=>{
  musicUnlocked=true;
  if(!musicPrefs.enabled){
    musicPrefs.enabled=true;
    saveMusicPrefs();
  }
  applyMusicPrefs(true);
});
document.addEventListener('pointerdown',unlockMusic,{once:true,capture:true});
document.addEventListener('keydown',unlockMusic,{once:true,capture:true});
document.addEventListener('visibilitychange',()=>{
  const audio=bgmEl();
  if(!audio)return;
  if(document.hidden){
    audio.pause();
  }else if(musicPrefs.enabled&&musicPrefs.volume>0&&musicUnlocked){
    audio.play().catch(()=>{});
  }
});
applyMusicPrefs(false);


const topics=[
{id:'solid',title:'Tekanan Zat Padat',img:'solid_context.webp',chips:['Gaya','Luas bidang tekan','Pascal'],formula:'p = F / A',phenomenon:'Mengapa sepatu hak tinggi lebih mudah meninggalkan bekas pada tanah lunak, sedangkan ban traktor dibuat lebar?',concept:'Tekanan menunjukkan seberapa besar gaya bekerja pada setiap satuan luas. Pada gaya yang sama, luas kontak yang lebih kecil membuat gaya terkonsentrasi pada area lebih kecil sehingga tekanannya lebih besar.',context:'Di sekolah kamu bisa membandingkan kaki kursi, ujung pensil, sepatu olahraga, dan sepatu berhak. Pada kendaraan berat, memperlebar ban atau menambah jumlah roda membantu memperbesar luas kontak sehingga tekanan pada tanah berkurang.',worked:'Sebuah peti menekan lantai dengan gaya 600 N dan luas alas 0,03 m². Tekanan = 600 / 0,03 = 20.000 Pa.',q:'Dua balok mendapat gaya tekan sama. Balok A menyentuh meja dengan luas lebih kecil. Balok mana memberi tekanan lebih besar?',opts:['Balok A','Balok B','Sama'],ans:0,feedback:'Karena F sama, p berbanding terbalik dengan A. Luas lebih kecil menghasilkan tekanan lebih besar.',extra:'solid_blocks.webp',focus:'Bandingkan gaya sama dengan luas kontak berbeda.'},
{id:'hydro',title:'Tekanan Hidrostatis',img:'hydro_dam.webp',chips:['Kedalaman h','Massa jenis ρ','Gravitasi g'],formula:'p = ρ g h',phenomenon:'Mengapa telinga penyelam terasa makin tertekan saat turun lebih dalam dan mengapa bendungan lebih tebal di bagian bawah?',concept:'Setiap lapisan cairan menahan berat cairan di atasnya. Semakin dalam suatu titik, semakin banyak kolom cairan di atas titik itu, sehingga tekanan hidrostatis semakin besar. Tekanan juga bertambah jika massa jenis cairan lebih besar.',context:'Konsep ini penting untuk desain bendungan, tangki air, kapal selam, penyelaman, dan pemasangan saluran air. Pada wadah dengan bentuk berbeda, tekanan pada kedalaman yang sama tetap ditentukan oleh ρ, g, dan h.',worked:'Pada air (ρ ≈ 1.000 kg/m³), titik sedalam 5 m dengan g ≈ 10 m/s² memiliki p = 1.000 × 10 × 5 = 50.000 Pa.',q:'Pada cairan yang sama, titik P berada 2 m dan Q 6 m di bawah permukaan. Tekanan hidrostatis terbesar berada di ...',opts:['P','Q','Sama'],ans:1,feedback:'Q lebih dalam. Pada ρ dan g yang sama, p = ρgh bertambah ketika h bertambah.',extra:'hydro_diver.webp',focus:'Kedalaman bertambah → tekanan hidrostatis bertambah.'},
{id:'arch',title:'Hukum Archimedes',img:'arch_ship.webp',chips:['Gaya apung','Volume tercelup','Massa jenis cairan'],formula:'Fₐ = ρ V g',phenomenon:'Kapal dibuat dari logam, tetapi dapat terapung. Sebaliknya, sepotong logam kecil dapat tenggelam. Mengapa?',concept:'Benda yang berada dalam cairan memperoleh gaya apung ke atas sebesar berat cairan yang dipindahkan. Bentuk kapal membuat volume air yang dipindahkan cukup besar sehingga gaya apung dapat menyeimbangkan berat total kapal.',context:'Kapal selam mengubah massa totalnya dengan tangki ballast. Saat lebih banyak air masuk ke ballast, berat efektif kapal meningkat sehingga dapat turun. Saat air dikeluarkan, kapal menjadi lebih mudah naik.',worked:'Benda memindahkan 0,002 m³ air. Dengan ρ air 1.000 kg/m³ dan g 10 m/s², gaya apungnya = 1.000 × 0,002 × 10 = 20 N.',q:'Sebuah benda melayang diam di dalam air. Hubungan gaya apung Fₐ dan berat W adalah ...',opts:['Fₐ > W','Fₐ = W','Fₐ < W'],ans:1,feedback:'Melayang berarti resultan gaya vertikal nol, sehingga gaya apung ke atas sama dengan berat ke bawah.',extra:'arch_forces.webp',focus:'Perhatikan dua gaya vertikal: berat dan gaya apung.'},
{id:'gas',title:'Tekanan Gas',img:'gas_balloon_bath.webp',chips:['Partikel gas','Tumbukan','Suhu'],formula:'Gas memberikan tekanan',phenomenon:'Mengapa balon pada mulut botol dapat berubah saat botol dipanaskan atau didinginkan, dan mengapa kartu dapat menahan air pada gelas terbalik?',concept:'Gas tersusun dari partikel yang bergerak terus-menerus dan bertumbukan dengan dinding wadah. Tumbukan itu menimbulkan tekanan. Perubahan suhu memengaruhi energi gerak partikel dan dapat mengubah keadaan gas serta perbedaan tekanan.',context:'Prinsip tekanan gas digunakan pada pompa ban, aerosol, sistem pneumatik, dan balon udara panas. Pada balon udara, pemanasan membuat udara di dalam balon lebih renggang sehingga gaya apung dapat mengangkat balon.',worked:'Jika botol tertutup balon ditempatkan pada air hangat, partikel udara di dalam bergerak lebih aktif. Udara cenderung mengembang sehingga balon dapat membesar. Saat didinginkan, keadaan berbalik.',q:'Ketika udara dalam wadah dipanaskan, gerak rata-rata partikelnya cenderung ...',opts:['Lebih cepat','Lebih lambat','Berhenti'],ans:0,feedback:'Pemanasan meningkatkan energi kinetik rata-rata partikel sehingga geraknya menjadi lebih cepat.',extra:'gas_inverted_glass.webp',focus:'Tekanan udara luar dapat membantu menahan kartu pada kondisi percobaan yang tepat.'},
{id:'pascal',title:'Hukum Pascal',img:'pascal_car_lift.webp',chips:['Fluida tertutup','Tekanan diteruskan','Keuntungan gaya'],formula:'F₁/A₁ = F₂/A₂',phenomenon:'Bagaimana teknisi bengkel dapat mengangkat mobil dengan gaya tangan yang jauh lebih kecil daripada berat mobil?',concept:'Pada fluida hampir tak termampatkan di ruang tertutup, tekanan yang diberikan diteruskan ke segala arah. Jika tekanan yang sama bekerja pada piston dengan luas lebih besar, gaya keluaran menjadi lebih besar.',context:'Hukum Pascal digunakan pada dongkrak hidrolik, rem hidrolik, pengangkat mobil, dan mesin press. Keuntungan gaya tidak menciptakan energi; piston besar bergerak lebih pendek ketika piston kecil menempuh jarak lebih panjang.',worked:'A₁ = 5 cm², A₂ = 200 cm², F₁ = 100 N. F₂ = (200/5) × 100 = 4.000 N.',q:'Jika A₂ dibuat 10 kali A₁ dan F₁ = 50 N, secara ideal F₂ adalah ...',opts:['5 N','50 N','500 N'],ans:2,feedback:'Tekanan sama: F₁/A₁ = F₂/A₂. Karena A₂/A₁ = 10, gaya keluaran menjadi 10 × 50 = 500 N.',extra:'eval_pascal.webp',focus:'Tekanan ditransmisikan melalui fluida tertutup.'},
{id:'xylem',title:'Transport pada Tumbuhan',img:'plant_xylem.webp',chips:['Osmosis','Xilem','Transpirasi'],formula:'Air: akar → xilem → daun',phenomenon:'Pohon tinggi tidak memiliki pompa seperti jantung. Bagaimana air dari tanah dapat mencapai daun?',concept:'Air masuk ke akar melalui proses yang melibatkan perbedaan potensial air atau osmosis, lalu bergerak menuju xilem. Kolom air di xilem dipertahankan oleh kohesi antarmolekul air dan adhesi pada dinding, sementara transpirasi di daun membantu menarik air ke atas.',context:'Pada hari panas dan berangin, transpirasi dapat meningkat. Jika akar tidak memperoleh cukup air, tumbuhan dapat kehilangan turgor dan layu. Kapilaritas membantu, tetapi bukan satu-satunya mekanisme pengangkutan pada tumbuhan tinggi.',worked:'Urutan sederhana: tanah → rambut akar → jaringan akar → xilem → batang → daun. Hasil fotosintesis didistribusikan terutama melalui floem ke jaringan yang membutuhkan.',q:'Jaringan yang terutama membawa air dan mineral dari akar menuju bagian atas tumbuhan adalah ...',opts:['Xilem','Floem','Epidermis'],ans:0,feedback:'Xilem adalah jaringan utama pengangkut air dan mineral. Floem terutama mentranslokasikan hasil fotosintesis.',extra:'plant_phloem.webp',focus:'Bedakan aliran xilem dengan transpor hasil fotosintesis melalui floem.'},
{id:'blood',title:'Tekanan Darah',img:'blood_cuff.webp',chips:['Jantung','Pembuluh darah','Sphygmomanometer'],formula:'Darah menekan dinding pembuluh',phenomenon:'Apa yang sebenarnya diukur saat manset tensimeter dikembangkan pada lengan?',concept:'Jantung menghasilkan perbedaan tekanan yang mendorong darah melalui pembuluh. Tekanan berubah selama siklus jantung. Pengukuran tekanan darah dilakukan dengan manset yang memberi tekanan pada arteri dan alat ukur yang mendeteksi tekanan saat aliran berubah.',context:'Tekanan darah bukan sekadar “kekuatan jantung”. Nilainya dipengaruhi kerja jantung, tahanan pembuluh, volume darah, aktivitas, dan kondisi tubuh. Dalam MPI ini fokus kita adalah hubungan antara tekanan fluida dan aliran darah.',worked:'Saat manset dikembangkan, tekanan manset dapat sementara menekan arteri. Saat tekanan manset diturunkan perlahan, perubahan aliran dapat digunakan untuk memperkirakan tekanan sistolik dan diastolik.',q:'Fungsi utama manset pada sphygmomanometer adalah ...',opts:['Memberi tekanan terkontrol pada arteri lengan','Mengukur suhu darah','Menambah volume darah'],ans:0,feedback:'Manset memberi tekanan eksternal yang dapat menekan arteri secara terkontrol selama pengukuran.',extra:'blood_heart.webp',focus:'Jantung dan pembuluh membentuk sistem aliran fluida biologis.'},
{id:'resp',title:'Difusi Gas pada Pernapasan',img:'resp_alveolus.webp',chips:['Alveolus','Kapiler','Difusi'],formula:'O₂: alveolus → darah | CO₂: darah → alveolus',phenomenon:'Mengapa oksigen dapat berpindah dari alveolus ke darah tanpa dipompa langsung melewati membran?',concept:'Gas berdifusi secara neto dari daerah dengan tekanan parsial atau kondisi efektif lebih tinggi menuju lebih rendah melalui membran tipis. Di paru-paru, kondisi ini mendukung O₂ masuk ke darah dan CO₂ bergerak ke alveolus untuk dikeluarkan.',context:'Permukaan alveolus yang luas, dinding yang sangat tipis, dan jaringan kapiler yang rapat mendukung pertukaran gas. Ventilasi dan aliran darah terus mempertahankan perbedaan yang diperlukan untuk difusi.',worked:'Setelah menarik napas, O₂ di alveolus relatif tinggi dibanding darah vena yang datang ke paru. Akibatnya O₂ berdifusi ke darah; CO₂ memiliki kecenderungan bersih ke arah sebaliknya.',q:'Arah perpindahan bersih O₂ di paru yang benar adalah ...',opts:['Darah → alveolus','Alveolus → darah','Tidak berpindah'],ans:1,feedback:'O₂ berdifusi dari alveolus menuju kapiler darah karena adanya perbedaan kondisi atau tekanan parsial.',extra:'resp_alveolus.webp',focus:'Membran tipis dan kapiler rapat mendukung difusi gas.'}
];

const apQs=[
['Dengan gaya sama, permukaan lebih kecil menghasilkan tekanan ...',['lebih besar','lebih kecil'],0,'Gaya yang sama terkonsentrasi pada luas lebih kecil.'],
['Semakin dalam penyelam turun, tekanan air cenderung ...',['meningkat','menurun'],0,'Kolom air di atas penyelam semakin tinggi.'],
['Pada lift hidrolik, piston keluaran yang lebih luas dapat menghasilkan gaya ...',['lebih besar','lebih kecil'],0,'Tekanan yang sama bekerja pada luas yang lebih besar.'],
['O₂ dari alveolus menuju darah terutama melalui ...',['difusi','konduksi'],0,'Pertukaran gas terjadi melalui difusi.']];
let apAnswered={};
function opening(){return `<section class="page hero"><div class="hero-grid"><div><div class="kicker">Deep Ocean Science Mission</div><h1>Misi Tekanan</h1><p>Tekanan bukan hanya rumus. Konsep ini menjelaskan mengapa sepatu hak tinggi mudah membekas, bendungan dibuat tebal di bawah, kapal baja dapat terapung, dongkrak bisa mengangkat mobil, air naik dalam tumbuhan, dan oksigen dapat masuk ke darah.</p><div class="btn-row"><button class="btn primary" onclick="document.getElementById('identity').scrollIntoView({behavior:'smooth'})">Mulai Eksplorasi</button></div></div><div><div class="sonar">${img('maskot_subi_normal.webp','subi-hero')}</div><div class="card" id="identity"><h3>Identitas Navigator <small style="font-weight:400;color:#64748B">(opsional)</small></h3><div class="form-grid"><div class="field"><label>Nama</label><input id="name" value="${S.name}" placeholder="Nama siswa"></div><div class="field"><label>Kelas</label><select id="kelas"><option value="">Lewati</option><option ${S.kelas==='9A'?'selected':''}>9A</option><option ${S.kelas==='9B'?'selected':''}>9B</option></select></div></div><button class="btn success" style="width:100%;margin-top:12px" onclick="saveIdentity()">Lanjut ke Apersepsi</button></div></div></div></section><section class="page"><div class="wrap"><div class="section-head"><div class="kicker">Apersepsi</div><h1>Mengapa Kita Mempelajari Tekanan?</h1><p>Sebelum melihat rumus, hubungkan konsep dengan situasi yang benar-benar kamu temui.</p></div><div class="why-box"><h2>Tekanan membantu kita menjawab pertanyaan desain dan keselamatan.</h2><p>Insinyur, tenaga kesehatan, teknisi, penyelam, dan bahkan tumbuhan “berhadapan” dengan persoalan tekanan. Memahami penyebab perubahan tekanan membuat kita dapat memprediksi, menghitung, dan merancang solusi.</p><div class="why-list"><div>🚜 Mengapa ban kendaraan berat dibuat lebar?</div><div>🌊 Mengapa penyelam merasakan tekanan lebih besar?</div><div>🚗 Bagaimana lift bengkel memperbesar gaya?</div><div>🌿 Bagaimana air mencapai daun yang tinggi?</div></div></div><div class="grid4" style="margin-top:16px"><div class="context-card">${img('solid_context.webp')}<b>Bidang sentuh</b><p>Bandingkan stiletto, sneaker, dan ban besar. Berat bukan satu-satunya faktor—luas kontak penting.</p></div><div class="context-card">${img('hydro_dam.webp')}<b>Kedalaman</b><p>Bendungan menerima tekanan air yang tidak sama dari atas ke bawah.</p></div><div class="context-card">${img('pascal_car_lift.webp')}<b>Fluida tertutup</b><p>Sistem hidrolik memanfaatkan tekanan yang diteruskan melalui fluida.</p></div><div class="context-card">${img('resp_alveolus.webp')}<b>Makhluk hidup</b><p>Tekanan dan gradien membantu memahami aliran darah serta pertukaran gas.</p></div></div><div class="card" style="margin-top:16px"><h2>Cek Prediksi Awal</h2><div class="apperception">${apQs.map((q,i)=>`<div class="scenario"><strong>${i+1}. ${q[0]}</strong><div class="scenario-options">${q[1].map((o,j)=>`<button onclick="answerAp(${i},${j},this)">${o}</button>`).join('')}</div><div id="ap${i}"></div></div>`).join('')}</div><div class="btn-row"><button id="apDone" class="btn primary" disabled onclick="finishOpening()">Selesaikan Pembuka →</button></div></div></div></section>`}
window.answerAp=(i,j,btn)=>{apAnswered[i]=true;const ok=j===apQs[i][2];btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('correct','wrong'));btn.classList.add(ok?'correct':'wrong');document.getElementById('ap'+i).innerHTML=`<div class="feedback-box ${ok?'ok':'bad'}">${ok?'Tepat. ':'Belum tepat. '}${apQs[i][3]}</div>`;document.getElementById('apDone').disabled=Object.keys(apAnswered).length<4}
window.saveIdentity=()=>{S.name=document.getElementById('name').value.trim();S.kelas=document.getElementById('kelas').value;save();document.querySelectorAll('.page')[1].scrollIntoView({behavior:'smooth'})}
window.finishOpening=()=>{completeMenu('opening');sfx('sfx_unlock.wav');go('objectives')}

function objectives(){return `<section class="page"><div class="wrap"><div class="section-head"><div class="kicker">Target Belajar</div><h1>Tujuan Pembelajaran</h1><p>Target dirumuskan agar dapat diamati dari aktivitas, perhitungan, dan evaluasi.</p></div><div class="grid3"><div class="objective"><div class="n">1</div><h3>Menjelaskan & menghitung</h3><p>Menentukan tekanan zat padat dan hidrostatis dari gaya, luas, massa jenis, gravitasi, dan kedalaman.</p></div><div class="objective"><div class="n">2</div><h3>Menganalisis mekanisme</h3><p>Menggunakan Hukum Archimedes, tekanan gas, dan Hukum Pascal untuk menjelaskan teknologi sehari-hari.</p></div><div class="objective"><div class="n">3</div><h3>Menerapkan pada kehidupan</h3><p>Menghubungkan konsep tekanan dengan transport tumbuhan, tekanan darah, dan pertukaran gas.</p></div></div><div class="card" style="margin-top:15px"><h2>Rencana 5 JP</h2><div class="timeline"><div><b>JP 1</b>Padat + Hidrostatis</div><div><b>JP 2</b>Archimedes + kapal selam</div><div><b>JP 3</b>Gas + Pascal</div><div><b>JP 4</b>Makhluk hidup</div><div><b>JP 5</b>Misi, evaluasi, game</div></div><div class="btn-row"><button class="btn primary" onclick="finishObjectives()">Saya Siap →</button></div></div></div></section>`}
window.finishObjectives=()=>{completeMenu('objectives');sfx('sfx_unlock.wav');go('materials')}

function materials(){const t=topics[S.topic],checked=!!S.topicChecks[t.id];return `<section class="page"><div class="wrap"><div class="section-head"><div class="kicker">Materi Pembelajaran</div><h1>Belajar dari Fenomena ke Konsep</h1><p>Setiap topik melalui empat lapis: fenomena → konsep → contoh kontekstual → cek pemahaman.</p></div><div class="material-layout"><div class="topic-list">${topics.map((x,i)=>`<button class="topic-btn ${i===S.topic?'active':''}" ${i>S.topic&&!S.topicChecks[topics[i-1].id]?'disabled':''} onclick="setTopic(${i})">${S.topicChecks[x.id]?'✓ ':''}${i+1}. ${x.title}</button>`).join('')}</div><article class="card topic-card"><div class="topic-top"><div class="topic-copy"><span class="badge">Topik ${S.topic+1}/8</span><h2>${t.title}</h2><div class="concept-chips">${t.chips.map(c=>`<span class="chip">${c}</span>`).join('')}</div><div class="formula">${t.formula}</div><h3>Fenomena Pemantik</h3><p>${t.phenomenon}</p><div class="unlock-note">Jangan hafalkan rumus dulu. Jelaskan apa yang berubah dan mengapa sebelum melakukan perhitungan.</div><div class="subi-guide">${img('maskot_subi_berpikir.webp')}<p><b>SUBI:</b> Cari hubungan sebab–akibat pada fenomena ini. Variabel apa yang berubah, dan apa akibatnya?</p></div></div><div class="topic-visual">${img(t.img)}</div></div><div class="detail-tabs"><button class="${S.topicStep===0?'active':''}" onclick="topicTab(0)">Konsep</button><button class="${S.topicStep===1?'active':''}" onclick="topicTab(1)">Konteks</button><button class="${S.topicStep===2?'active':''}" onclick="topicTab(2)">Contoh</button><button class="${S.topicStep===3?'active':''}" onclick="topicTab(3)">Cek Pemahaman</button></div><div class="detail-panel">${topicPanel(t,checked)}</div></article></div></div></section>`}
function topicPanel(t,checked){if(S.topicStep===0)return `<h3>Konsep Inti</h3><p>${t.concept}</p><div class="grid2" style="margin-top:12px"><div class="context-card">${img(t.extra)}</div><div class="feedback-box"><b>Fokus visual:</b> ${t.focus}</div></div>`;if(S.topicStep===1)return `<h3>Hubungan dengan Kehidupan</h3><p>${t.context}</p>`;if(S.topicStep===2)return `<h3>Contoh Terbimbing</h3><div class="worked"><span>${t.worked}</span><span class="answer">Ikuti satuan & hubungan variabel</span></div>`;return `<h3>Cek Pemahaman</h3><div class="micro-check"><b>${t.q}</b><div class="choice-list">${t.opts.map((o,i)=>`<label class="choice"><input type="radio" name="topicCheck" value="${i}"> ${o}</label>`).join('')}</div><button class="btn secondary" onclick="checkTopic()">Periksa Jawaban</button><div id="topicFeedback"></div></div><div class="btn-row"><button class="btn secondary" onclick="prevTopic()" ${S.topic===0?'disabled':''}>← Topik Sebelumnya</button><button id="topicNextBtn" class="btn primary" onclick="nextTopic()" ${checked?'':'disabled'}>${S.topic===7?'Selesaikan Materi':'Topik Berikutnya →'}</button></div>`}
window.setTopic=i=>{if(i>S.topic&&!S.topicChecks[topics[i-1].id])return;S.topic=i;S.topicStep=0;save();render()};window.topicTab=i=>{S.topicStep=i;save();render()};
window.checkTopic=()=>{const t=topics[S.topic],sel=document.querySelector('input[name="topicCheck"]:checked'),f=document.getElementById('topicFeedback');if(!sel){f.innerHTML='<div class="feedback-box bad">Pilih jawaban terlebih dahulu.</div>';return}const ok=+sel.value===t.ans;const mascot=ok?'maskot_subi_sukses.webp':'maskot_subi_peringatan.webp';f.innerHTML=`<div class="feedback-box ${ok?'ok':'bad'}"><div class="quiz-feedback-inner">${img(mascot)}<div><b>${ok?'Benar.':'Belum tepat.'}</b> ${t.feedback}</div></div></div>`;if(ok){S.topicChecks[t.id]=true;save();const n=document.getElementById('topicNextBtn');if(n)n.disabled=false;sfx('sfx_success.wav')}else sfx('sfx_error_soft.wav')};
window.prevTopic=()=>{if(S.topic>0){S.topic--;S.topicStep=0;save();render()}};window.nextTopic=()=>{if(!S.topicChecks[topics[S.topic].id]){toast('Selesaikan cek pemahaman pada topik ini terlebih dahulu.');return};if(S.topic<7){S.topic++;S.topicStep=0;save();render()}else{completeMenu('materials');sfx('sfx_unlock.wav');go('missions')}};

const missionCards=[['Tekanan di Tanah Lunak','Atur luas kontak kendaraan agar tekanan pada tanah tidak melebihi batas aman.','game_vehicle.webp'],['Penyelaman Aman','Ubah kedalaman dan hitung tekanan hidrostatis penyelam.','hydro_diver.webp'],['Komandan Kapal Selam','Gunakan konsep berat dan gaya apung untuk tiga keadaan gerak.','arch_submarine.webp'],['Laboratorium Gas','Hubungkan suhu, gerak partikel, dan perubahan balon.','gas_balloon_bath.webp'],['Bengkel Hidrolik','Rancang kombinasi piston yang mampu mengangkat beban.','game_hydraulic_lift.webp'],['Tekanan Kehidupan','Selesaikan tantangan tumbuhan, darah, dan pernapasan.','resp_alveolus.webp']];
function missionPage(){const n=S.missions.length;return `<section class="page"><div class="wrap"><div class="section-head"><div class="kicker">Pembelajaran Bertahap</div><h1>6 Misi Kontekstual</h1><p>Misi tidak hanya meminta jawaban; setiap simulasi memberi feedback tentang akibat perubahan variabel.</p></div><div class="missions">${missionCards.map((c,i)=>`<div class="mission ${i>n?'locked':''}">${img(c[2])}<span class="badge">${S.missions.includes(i)?'Selesai':i<=n?'Terbuka':'Terkunci'}</span><h3>${c[0]}</h3><p>${c[1]}</p><button class="btn ${S.missions.includes(i)?'success':'primary'}" ${i<=n?'':'disabled'} onclick="openMission(${i})">${S.missions.includes(i)?'Ulang':'Mulai'}</button></div>`).join('')}</div>${n===6?`<div class="card" style="margin-top:15px"><h2>Semua misi selesai ✓</h2><p>Evaluasi sekarang terbuka.</p><button class="btn primary" onclick="finishMissions()">Masuk Evaluasi →</button></div>`:''}</div></section>`}
window.openMission=i=>{document.getElementById('main').innerHTML=`<section class="page"><div class="wrap"><div class="section-head"><div class="kicker">Misi ${i+1}/6</div><h1>${missionCards[i][0]}</h1></div>${[m1,m2,m3,m4,m5,m6][i]()}<div class="btn-row"><button class="btn secondary" onclick="go('missions')">← Ruang Misi</button></div></div></section>`;scrollTo(0,0)};
function completeMission(i,msg){if(!S.missions.includes(i))S.missions.push(i);S.missions.sort((a,b)=>a-b);save();sfx('sfx_success.wav');toast(msg||'Misi selesai. Tahap berikutnya terbuka.');setTimeout(()=>go('missions'),800)}
function m1(){return `<div class="card sim"><div class="controls"><h2>Target: p ≤ 15.000 Pa</h2><div class="range"><label>Gaya kendaraan</label><input id="m1F" type="range" min="3000" max="9000" step="500" value="6000" oninput="calcM1()"><output id="m1Fo">6000 N</output></div><div class="range"><label>Luas kontak</label><input id="m1A" type="range" min=".15" max=".8" step=".05" value=".30" oninput="calcM1()"><output id="m1Ao">0,30 m²</output></div><div class="readouts"><div><span>Tekanan</span><b id="m1P">20.000</b><small>Pa</small></div><div><span>Status</span><b id="m1St">Terlalu besar</b></div><div><span>Konsep</span><b>p=F/A</b></div></div><div id="m1Fb" class="feedback-box">Coba perbesar luas kontak atau kurangi gaya. Jelaskan perubahan yang terjadi.</div><button id="m1Done" class="btn success" disabled onclick="completeMission(0,'Kamu berhasil menurunkan tekanan dengan mengubah F dan/atau A.')">Kunci Solusi</button></div><div><div class="terrain" id="terrain" style="background-image:url('${A('terrain_sand.webp')}')">${img('game_vehicle.webp','vehicle')}</div><div class="btn-row"><button class="btn secondary" onclick="setGround('hard')">Tanah keras</button><button class="btn secondary" onclick="setGround('sand')">Pasir</button><button class="btn secondary" onclick="setGround('mud')">Lumpur</button></div></div></div>`}
let ground='sand';window.setGround=g=>{ground=g;document.getElementById('terrain').style.backgroundImage=`url('${A('terrain_'+g+'.webp')}')`;calcM1()};window.calcM1=()=>{const F=+document.getElementById('m1F').value,a=+document.getElementById('m1A').value,p=F/a;document.getElementById('m1Fo').value=F+' N';document.getElementById('m1Ao').value=a.toFixed(2).replace('.',',')+' m²';document.getElementById('m1P').textContent=Math.round(p).toLocaleString('id-ID');const ok=p<=15000;document.getElementById('m1St').textContent=ok?'Aman':'Terlalu besar';document.getElementById('m1Done').disabled=!ok;document.getElementById('m1Fb').className='feedback-box '+(ok?'ok':'bad');document.getElementById('m1Fb').innerHTML=ok?'<b>Berhasil.</b> Luas kontak yang lebih besar menyebarkan gaya sehingga tekanan menurun.':'<b>Belum aman.</b> p masih di atas 15.000 Pa. Ingat p=F/A.';document.querySelector('.vehicle').classList.toggle('sink',!ok)};
function m2(){return `<div class="card sim"><div class="controls"><h2>Deep-Dive Calculator</h2><div class="range"><label>Kedalaman</label><input id="dep" type="range" min="1" max="30" value="5" oninput="calcM2()"><output id="depO">5 m</output></div><div class="readouts"><div><span>ρ air</span><b>1000</b></div><div><span>g</span><b>10</b></div><div><span>p</span><b id="depP">50.000</b></div></div><div id="depFb" class="feedback-box">Geser lebih dalam dan perhatikan p bertambah secara linear terhadap h.</div><div class="micro-check"><b>Jika kedalaman dilipatgandakan pada cairan yang sama, tekanan hidrostatis ...</b><div class="choice-list"><label class="choice"><input type="radio" name="m2q" value="0"> kira-kira ikut berlipat ganda</label><label class="choice"><input type="radio" name="m2q" value="1"> menjadi nol</label></div></div><button class="btn success" onclick="checkM2()">Selesaikan</button></div><div class="sim-visual">${img('hydro_diver.webp')}</div></div>`}
window.calcM2=()=>{const h=+document.getElementById('dep').value,p=1000*10*h;document.getElementById('depO').value=h+' m';document.getElementById('depP').textContent=p.toLocaleString('id-ID');document.getElementById('depFb').innerHTML=`Pada kedalaman <b>${h} m</b>, p hidrostatis ≈ <b>${p.toLocaleString('id-ID')} Pa</b>. Karena ρ dan g tetap, perubahan p mengikuti perubahan h.`};window.checkM2=()=>{const v=document.querySelector('input[name="m2q"]:checked')?.value;if(v==='0')completeMission(1,'Tepat: pada cairan yang sama p berbanding lurus dengan kedalaman.');else{toast('Belum tepat. Tinjau p=ρgh.');sfx('sfx_error_soft.wav')}};
function m3(){return `<div class="card sim"><div class="controls"><h2>Ballast & Gaya</h2><div class="range"><label>Isi ballast</label><input id="ballast" type="range" min="0" max="100" value="50" oninput="calcM3()"><output id="ballastO">50%</output></div><div class="readouts"><div><span>Kondisi</span><b id="subState">Melayang</b></div><div><span>Perbandingan</span><b id="forceRel">Fₐ = W</b></div><div><span>Sudah dicoba</span><b id="subSeen">1/3</b></div></div><div id="subFb" class="feedback-box">Coba tiga zona: kurang air, sedang, dan lebih banyak air.</div><button id="m3Done" class="btn success" disabled onclick="completeMission(2,'Kamu menghubungkan perubahan ballast dengan perbandingan berat dan gaya apung.')">Selesai</button></div><div class="sim-visual">${img('arch_submarine.webp')}</div></div>`}
let seenSub=new Set(['Melayang']);window.calcM3=()=>{const v=+document.getElementById('ballast').value;document.getElementById('ballastO').value=v+'%';const st=v<35?'Naik':v>65?'Turun':'Melayang';seenSub.add(st);document.getElementById('subState').textContent=st;document.getElementById('forceRel').textContent=st==='Naik'?'Fₐ > W':st==='Turun'?'Fₐ < W':'Fₐ = W';document.getElementById('subSeen').textContent=seenSub.size+'/3';document.getElementById('subFb').innerHTML=st==='Naik'?'Berat efektif lebih kecil daripada gaya apung: kapal cenderung naik.':st==='Turun'?'Berat efektif lebih besar daripada gaya apung: kapal cenderung turun.':'Gaya apung dan berat seimbang: kapal dapat melayang.';document.getElementById('m3Done').disabled=seenSub.size<3};
function m4(){return `<div class="card sim"><div class="controls"><h2>Suhu & Gas</h2><div class="range"><label>Suhu</label><input id="temp" type="range" min="10" max="80" value="25" oninput="calcM4()"><output id="tempO">25°C</output></div><div class="readouts"><div><span>Gerak partikel</span><b id="speed">Sedang</b></div><div><span>Balon</span><b id="balloon">Normal</b></div><div><span>Sudah diuji</span><b id="tempSeen">0/2</b></div></div><div id="gasFb" class="feedback-box">Uji kondisi dingin (&lt;20°C) dan panas (&gt;55°C).</div><button id="m4Done" class="btn success" disabled onclick="completeMission(3,'Kamu menghubungkan perubahan suhu dengan gerak partikel dan perubahan keadaan gas.')">Selesai</button></div><div class="sim-visual">${img('gas_balloon_bath.webp')}</div></div>`}
let tempSeen={cold:false,hot:false};window.calcM4=()=>{const t=+document.getElementById('temp').value;document.getElementById('tempO').value=t+'°C';if(t<20)tempSeen.cold=true;if(t>55)tempSeen.hot=true;document.getElementById('speed').textContent=t<20?'Lambat':t>55?'Cepat':'Sedang';document.getElementById('balloon').textContent=t<20?'Cenderung mengecil':t>55?'Cenderung mengembang':'Normal';document.getElementById('tempSeen').textContent=((tempSeen.cold?1:0)+(tempSeen.hot?1:0))+'/2';document.getElementById('m4Done').disabled=!(tempSeen.cold&&tempSeen.hot);document.getElementById('gasFb').innerHTML=t>55?'Pemanasan meningkatkan energi gerak partikel; gas cenderung mengembang jika dapat.':t<20?'Pendinginan menurunkan gerak partikel; keadaan gas berubah ke arah sebaliknya.':'Ini kondisi sedang. Geser ke dua ekstrem untuk membandingkan.'};
function m5(){return `<div class="card sim"><div class="controls"><h2>Hydraulic Builder</h2><div class="range"><label>A₁</label><input id="a1" type="range" min="2" max="20" value="5" oninput="calcM5()"><output id="a1O">5 cm²</output></div><div class="range"><label>A₂</label><input id="a2" type="range" min="50" max="300" value="200" oninput="calcM5()"><output id="a2O">200 cm²</output></div><div class="range"><label>F₁</label><input id="f1" type="range" min="20" max="200" step="10" value="100" oninput="calcM5()"><output id="f1O">100 N</output></div><div class="readouts"><div><span>F₂</span><b id="f2">4000</b></div><div><span>Target</span><b>≥4000 N</b></div><div><span>Status</span><b id="hydSt">Mampu</b></div></div><div id="hydFb" class="feedback-box ok">Konfigurasi awal tepat: A₂/A₁=40, sehingga F₂=40×F₁.</div><button id="m5Done" class="btn success" onclick="completeMission(4,'Kamu menggunakan perbandingan luas piston untuk memperoleh keuntungan gaya.')">Kunci Rancangan</button></div><div class="sim-visual">${img('game_hydraulic_lift.webp')}</div></div>`}
window.calcM5=()=>{const a=+document.getElementById('a1').value,b=+document.getElementById('a2').value,f=+document.getElementById('f1').value,out=b/a*f;document.getElementById('a1O').value=a+' cm²';document.getElementById('a2O').value=b+' cm²';document.getElementById('f1O').value=f+' N';document.getElementById('f2').textContent=Math.round(out);const ok=out>=4000;document.getElementById('hydSt').textContent=ok?'Mampu':'Belum';document.getElementById('m5Done').disabled=!ok;document.getElementById('hydFb').className='feedback-box '+(ok?'ok':'bad');document.getElementById('hydFb').innerHTML=ok?`Tekanan dari piston kecil menghasilkan gaya keluaran sekitar <b>${Math.round(out)} N</b>.`:`Gaya keluaran baru <b>${Math.round(out)} N</b>. Coba perbesar rasio A₂/A₁ atau F₁.`};
function m6(){return `<div class="card"><h2>3 Sistem Kehidupan</h2><div class="grid3"><div class="context-card">${img('plant_xylem.webp')}<b>Tumbuhan</b><select id="life1"><option value="">Pilih jalur utama air</option><option value="x">Xilem</option><option value="f">Floem</option></select></div><div class="context-card">${img('blood_cuff.webp')}<b>Tekanan darah</b><select id="life2"><option value="">Pilih fungsi manset</option><option value="p">Memberi tekanan terkontrol</option><option value="s">Mengukur suhu</option></select></div><div class="context-card">${img('resp_alveolus.webp')}<b>Alveolus</b><select id="life3"><option value="">Pilih proses</option><option value="d">Difusi</option><option value="k">Konduksi</option></select></div></div><div id="lifeFb"></div><button class="btn success" style="margin-top:12px" onclick="checkLife()">Periksa</button></div>`}
window.checkLife=()=>{const ok=document.getElementById('life1').value==='x'&&document.getElementById('life2').value==='p'&&document.getElementById('life3').value==='d';document.getElementById('lifeFb').innerHTML=`<div class="feedback-box ${ok?'ok':'bad'}">${ok?'Tepat: xilem membawa air, manset memberi tekanan terkontrol, dan pertukaran gas berlangsung melalui difusi.':'Periksa lagi: bedakan xilem/floem, fungsi manset, dan mekanisme perpindahan gas.'}</div>`;if(ok)completeMission(5,'Kamu berhasil menghubungkan konsep tekanan dengan tiga sistem kehidupan.');else sfx('sfx_error_soft.wav')};window.finishMissions=()=>{completeMenu('missions');sfx('sfx_unlock.wav');go('quiz')};

const quizzes=[
{level:'LOTS',group:'LOTS/MOTS',type:'mc',topic:'Padat',q:'Sebuah peti memberikan gaya 800 N pada lantai. Tindakan mana yang paling tepat untuk memperkecil tekanan tanpa mengubah berat peti?',opts:['Memperkecil luas alas','Memperbesar luas alas','Menambah gaya tekan','Membuat alas lebih keras'],ans:1,img:'eval_solid_contact.webp',exp:'Tekanan p=F/A. Jika F tetap, memperbesar luas bidang tekan A akan memperkecil tekanan.'},
{level:'MOTS',group:'LOTS/MOTS',type:'num',topic:'Padat',q:'Sebuah kotak menekan lantai dengan gaya 600 N dan luas alas 0,03 m². Hitung tekanannya dalam Pa.',ans:20000,exp:'p=F/A=600/0,03=20.000 Pa.'},
{level:'LOTS',group:'LOTS/MOTS',type:'tf',topic:'Hidrostatis',q:'Tentukan Benar atau Salah untuk setiap pernyataan tentang tekanan hidrostatis.',items:[['Pada cairan yang sama, tekanan hidrostatis bertambah jika kedalaman bertambah.',true],['Pada kedalaman sama, cairan yang massa jenisnya lebih besar dapat menghasilkan tekanan hidrostatis lebih besar.',true],['Bentuk wadah adalah satu-satunya penentu tekanan hidrostatis.',false]],img:'eval_hydro_depth.webp',exp:'Tekanan hidrostatis mengikuti p=ρgh. Faktor utamanya massa jenis, gravitasi, dan kedalaman, bukan bentuk wadah.'},
{level:'MOTS',group:'LOTS/MOTS',type:'match',topic:'Archimedes',q:'Jodohkan keadaan gerak benda dengan hubungan gaya yang paling sesuai.',pairs:[['Benda bergerak naik','Fₐ > W'],['Benda melayang','Fₐ = W'],['Benda bergerak turun','Fₐ < W']],options:['Fₐ > W','Fₐ = W','Fₐ < W'],img:'eval_arch_states.webp',exp:'Arah gerak vertikal ditentukan oleh resultan antara gaya apung Fₐ dan berat W.'},
{level:'MOTS',group:'LOTS/MOTS',type:'order',topic:'Gas',q:'Urutkan kejadian yang paling logis ketika udara di dalam botol yang dipasangi balon dipanaskan.',items:['Udara menerima energi panas','Gerak rata-rata partikel meningkat','Tumbukan partikel dan kecenderungan ekspansi meningkat','Balon cenderung mengembang'],ans:[0,1,2,3],exp:'Urutannya: menerima energi → gerak partikel meningkat → tumbukan/ekspansi meningkat → balon berubah.'},
{level:'MOTS',group:'LOTS/MOTS',type:'mc',topic:'Pascal',q:'Pada sistem hidrolik ideal, luas piston keluaran 20 kali luas piston masukan. Jika gaya masukan 75 N, gaya keluaran adalah ...',opts:['3,75 N','75 N','1.500 N','15.000 N'],ans:2,img:'eval_pascal.webp',exp:'F₂=(A₂/A₁)F₁=20×75=1.500 N.'},
{level:'LOTS',group:'LOTS/MOTS',type:'text',topic:'Tumbuhan',q:'Tuliskan nama jaringan tumbuhan yang terutama mengangkut air dan mineral dari akar menuju daun.',ans:['xilem'],img:'eval_root.webp',exp:'Xilem merupakan jaringan utama pengangkut air dan mineral dari akar ke bagian atas tumbuhan.'},
{level:'MOTS',group:'LOTS/MOTS',type:'tf',topic:'Darah',q:'Tentukan Benar atau Salah untuk pernyataan berikut.',items:[['Manset sphygmomanometer memberi tekanan terkontrol pada arteri lengan.',true],['Tekanan darah hanya ditentukan oleh suhu tubuh.',false],['Jantung membantu menghasilkan perbedaan tekanan yang mendorong aliran darah.',true]],img:'blood_cuff.webp',exp:'Manset memberi tekanan eksternal terkontrol; aliran darah dipengaruhi kerja jantung dan sistem pembuluh, bukan hanya suhu.'},
{level:'MOTS',group:'LOTS/MOTS',type:'match',topic:'Penerapan',q:'Jodohkan fenomena dengan konsep tekanan yang paling tepat.',pairs:[['Ban traktor dibuat lebar','Tekanan zat padat'],['Bendungan lebih tebal di bagian bawah','Tekanan hidrostatis'],['Kapal laut dapat terapung','Hukum Archimedes'],['Lift bengkel mengangkat mobil','Hukum Pascal']],options:['Tekanan zat padat','Tekanan hidrostatis','Hukum Archimedes','Hukum Pascal'],exp:'Setiap fenomena menonjolkan luas kontak, kedalaman, gaya apung, atau transmisi tekanan fluida.'},
{level:'LOTS',group:'LOTS/MOTS',type:'mc',topic:'Pernapasan',q:'Arah perpindahan bersih O₂ pada pertukaran gas di paru-paru yang benar adalah ...',opts:['Darah menuju alveolus','Alveolus menuju darah','Jantung menuju alveolus','Tidak terjadi perpindahan'],ans:1,img:'resp_alveolus.webp',exp:'O₂ berdifusi dari alveolus menuju darah karena perbedaan kondisi/tekanan parsial di kedua sisi membran.'},

{level:'HOTS',group:'HOTS',type:'mc',topic:'Integrasi Padat',q:'Sebuah kendaraan penyelamat menekan tanah lunak dengan gaya total 12.000 N dan luas kontak awal 0,40 m². Agar tekanannya menjadi setengah dari semula tanpa mengubah gaya, desain yang paling tepat adalah ...',opts:['Mengurangi luas kontak menjadi 0,20 m²','Memperbesar luas kontak menjadi 0,80 m²','Memperbesar luas kontak menjadi 0,60 m²','Menambah gaya menjadi 24.000 N'],ans:1,img:'game_vehicle.webp',exp:'Karena p=F/A, agar p menjadi 1/2 pada F tetap, luas A harus menjadi 2 kali semula: 0,40→0,80 m².'},
{level:'HOTS',group:'HOTS',type:'num',topic:'Desain Hidrolik',q:'Sebuah alat hidrolik harus menghasilkan gaya keluaran minimal 6.000 N. Jika A₁=6 cm² dan F₁=120 N, berapa luas minimum A₂ yang diperlukan secara ideal dalam cm²?',ans:300,img:'game_hydraulic_lift.webp',exp:'F₁/A₁=F₂/A₂ → A₂=(F₂×A₁)/F₁=(6.000×6)/120=300 cm².'},
{level:'HOTS',group:'HOTS',type:'mc',topic:'Kapal Selam',q:'Kapal selam sedang melayang stabil. Kemudian sebagian air laut masuk ke tangki ballast sementara volume luar kapal hampir tetap. Prediksi paling tepat adalah ...',opts:['Berat kapal bertambah sehingga kapal cenderung turun','Gaya apung langsung menjadi nol','Berat kapal berkurang sehingga kapal naik','Massa jenis air laut menjadi nol'],ans:0,img:'arch_submarine.webp',exp:'Masuknya air ballast menambah massa dan berat kapal. Jika volume luar hampir tetap, gaya apung tidak naik sebanding sehingga resultan dapat mengarah ke bawah.'},

{level:'PISA-Literasi',group:'PISA',type:'mc',topic:'PISA Literasi',stimulus:'Tim penyelamat membawa kendaraan ke daerah berpasir. Teknisi A berkata, “Ban yang lebih lebar membantu karena memperbesar luas kontak.” Teknisi B berkata, “Yang penting hanya berat kendaraan; lebar ban tidak berpengaruh.” Pada gaya berat yang sama, kendaraan dengan ban lebih lebar meninggalkan jejak yang lebih dangkal.',q:'Kesimpulan yang paling didukung oleh informasi tersebut adalah ...',opts:['Pernyataan Teknisi A didukung karena luas kontak yang lebih besar menurunkan tekanan','Pernyataan Teknisi B didukung karena tekanan tidak bergantung luas','Kedua pernyataan selalu benar pada semua kondisi','Data tidak memiliki hubungan dengan tekanan'],ans:0,img:'terrain_sand.webp',exp:'Bukti jejak lebih dangkal konsisten dengan p=F/A: pada gaya sama, luas kontak lebih besar menghasilkan tekanan lebih kecil.'},
{level:'PISA-Numerasi',group:'PISA',type:'mc',topic:'PISA Numerasi',stimulus:'Sebuah bengkel memiliki tiga pilihan piston keluaran. Piston masukan memiliki luas 5 cm² dan diberi gaya 100 N. Target gaya keluaran minimal 3.000 N. Pilihan luas piston keluaran: P=100 cm², Q=150 cm², R=200 cm².',q:'Piston terkecil yang memenuhi target adalah ...',opts:['P (100 cm²)','Q (150 cm²)','R (200 cm²)','Tidak ada yang memenuhi'],ans:1,img:'eval_pascal.webp',exp:'Tekanan masukan=100/5=20 N/cm². P menghasilkan 2.000 N; Q menghasilkan 3.000 N; R menghasilkan 4.000 N. Pilihan terkecil yang memenuhi target adalah Q.'}
];

function quiz(){
 if(S.quizScore!==null)return results();
 const q=quizzes[S.quizIndex],checked=S.checked[S.quizIndex]===true;
 return `<section class="page"><div class="quiz-wrap"><div class="quiz-head"><b>Evaluasi Akhir — 15 Soal</b><span>Soal ${S.quizIndex+1}/${quizzes.length}</span></div><div class="bar"><i style="width:${(S.quizIndex+1)/quizzes.length*100}%"></i></div><div class="quiz-card"><div class="quiz-labels"><span class="badge">${q.topic}</span><span class="level-badge">${q.level}</span></div>${q.stimulus?`<div class="stimulus"><b>Stimulus</b><p>${q.stimulus}</p></div>`:''}<h2>${q.q}</h2>${q.img?img(q.img,'quiz-img'):''}${quizInput(q,S.quizIndex,checked)}<div id="quizFeedback">${checked?feedbackForCurrent(q,S.quizIndex):''}</div><div class="btn-row">${!checked?`<button class="btn primary" onclick="checkQuiz()">Periksa Jawaban</button>`:`<button class="btn secondary" onclick="prevQuiz()" ${S.quizIndex===0?'disabled':''}>← Sebelumnya</button><button class="btn primary" onclick="nextQuiz()">${S.quizIndex===quizzes.length-1?'Selesai & Lihat Hasil':'Berikutnya →'}</button>`}</div></div></div></section>`;
}
function quizInput(q,i,locked){
 const v=S.answers[i],dis=locked?'disabled':'';
 if(q.type==='mc')return `<div class="choice-list">${q.opts.map((o,j)=>`<label class="choice"><input ${dis} type="radio" name="quiz" value="${j}" ${+v===j?'checked':''}> ${o}</label>`).join('')}</div>`;
 if(q.type==='num')return `<div class="field"><label>Jawaban numerik</label><input ${dis} id="qNum" type="number" value="${v??''}" placeholder="Masukkan angka"></div>`;
 if(q.type==='text')return `<div class="field"><label>Jawaban singkat</label><input ${dis} id="qText" value="${v??''}" placeholder="Ketik jawaban"></div>`;
 if(q.type==='tf')return `<div class="tf-grid">${q.items.map((it,j)=>`<div class="tf-row"><span>${it[0]}</span><select ${dis} data-tf="${j}"><option value="">Pilih</option><option value="true" ${v?.[j]===true?'selected':''}>Benar</option><option value="false" ${v?.[j]===false?'selected':''}>Salah</option></select></div>`).join('')}</div>`;
 if(q.type==='match')return `<div class="match">${q.pairs.map((p,j)=>`<span>${p[0]}</span><select ${dis} data-match="${j}"><option value="">Pilih</option>${q.options.map(o=>`<option ${v?.[j]===o?'selected':''}>${o}</option>`).join('')}</select>`).join('')}</div>`;
 if(q.type==='order'){const arr=v?.length?v:q.items.map((_,j)=>j);return `<div class="order">${arr.map((orig,pos)=>`<div class="order-item"><span>${q.items[orig]}</span><span class="move"><button ${dis} onclick="moveOrder(${pos},-1)">↑</button><button ${dis} onclick="moveOrder(${pos},1)">↓</button></span></div>`).join('')}</div>`}
}
function saveAnswer(){
 const q=quizzes[S.quizIndex],i=S.quizIndex;
 if(q.type==='mc'){const e=document.querySelector('input[name="quiz"]:checked');S.answers[i]=e?+e.value:null}
 if(q.type==='num')S.answers[i]=document.getElementById('qNum')?.value;
 if(q.type==='text')S.answers[i]=document.getElementById('qText')?.value;
 if(q.type==='tf')S.answers[i]=[...document.querySelectorAll('[data-tf]')].map(e=>e.value===''?null:e.value==='true');
 if(q.type==='match')S.answers[i]=[...document.querySelectorAll('[data-match]')].map(e=>e.value);
 if(q.type==='order'&&!S.answers[i])S.answers[i]=q.items.map((_,j)=>j);
 save();
}
function grade(q,v){
 if(q.type==='mc')return +v===q.ans;
 if(q.type==='num')return Math.abs(Number(v)-q.ans)<.0001;
 if(q.type==='text')return q.ans.includes(String(v||'').trim().toLowerCase());
 if(q.type==='tf')return q.items.every((it,i)=>v?.[i]===it[1]);
 if(q.type==='match')return q.pairs.every((p,i)=>v?.[i]===p[1]);
 if(q.type==='order')return JSON.stringify(v)===JSON.stringify(q.ans);
 return false;
}
function answerPresent(q,v){
 if(q.type==='mc'||q.type==='num'||q.type==='text')return v!==null&&v!==undefined&&String(v).trim()!=='';
 if(q.type==='tf')return Array.isArray(v)&&v.length===q.items.length&&v.every(x=>x!==null);
 if(q.type==='match')return Array.isArray(v)&&v.length===q.pairs.length&&v.every(Boolean);
 if(q.type==='order')return Array.isArray(v)&&v.length===q.items.length;
 return false;
}
function feedbackForCurrent(q,i){const ok=grade(q,S.answers[i]),mascot=ok?'maskot_subi_sukses.webp':'maskot_subi_peringatan.webp';return `<div class="quiz-feedback ${ok?'good':'bad'}"><div class="quiz-feedback-inner">${img(mascot)}<div><b>${ok?'Jawaban benar.':'Jawaban belum tepat.'}</b><br>${q.exp}${!ok?`<br><b>Jawaban benar:</b> ${correctText(q)}`:''}</div></div></div>`}
function correctText(q){
 if(q.type==='mc')return q.opts[q.ans];
 if(q.type==='num')return q.ans.toLocaleString('id-ID');
 if(q.type==='text')return q.ans[0];
 if(q.type==='tf')return q.items.map(x=>`${x[0]} → ${x[1]?'Benar':'Salah'}`).join('; ');
 if(q.type==='match')return q.pairs.map(x=>`${x[0]} → ${x[1]}`).join('; ');
 if(q.type==='order')return q.ans.map(i=>q.items[i]).join(' → ');
 return '';
}
window.checkQuiz=()=>{saveAnswer();const q=quizzes[S.quizIndex],v=S.answers[S.quizIndex];if(!answerPresent(q,v)){toast('Lengkapi jawaban terlebih dahulu.');return}const ok=grade(q,v);S.checked[S.quizIndex]=true;S.firstScore[S.quizIndex]=ok?1:0;save();sfx(ok?'sfx_success.wav':'sfx_error_soft.wav');render()};
window.prevQuiz=()=>{if(S.quizIndex>0){S.quizIndex--;save();render()}};
window.nextQuiz=()=>{if(S.quizIndex<quizzes.length-1){S.quizIndex++;save();render()}else submitQuiz()};
window.moveOrder=(pos,dir)=>{const q=quizzes[S.quizIndex],arr=[...(S.answers[S.quizIndex]||q.items.map((_,i)=>i))],j=pos+dir;if(j<0||j>=arr.length)return;[arr[pos],arr[j]]=[arr[j],arr[pos]];S.answers[S.quizIndex]=arr;save();render()};
function categoryScores(){const groups={'LOTS/MOTS':[0,0],'HOTS':[0,0],'PISA':[0,0]};quizzes.forEach((q,i)=>{groups[q.group][1]++;groups[q.group][0]+=S.firstScore[i]||0});return Object.fromEntries(Object.entries(groups).map(([k,[c,t]])=>[k,{correct:c,total:t,pct:Math.round(c/t*100)}]))}
function submitQuiz(){
 const n=quizzes.length,raw=Object.values(S.firstScore).reduce((a,b)=>a+b,0);
 S.quizCorrect=raw;S.quizScore=Math.round(raw/n*100);S.categoryScores=categoryScores();
 const map={};quizzes.forEach((q,i)=>{map[q.topic]??=[0,0];map[q.topic][1]++;map[q.topic][0]+=S.firstScore[i]||0});
 S.mastery=Object.fromEntries(Object.entries(map).map(([k,[c,t]])=>[k,Math.round(c/t*100)]));
 completeMenu('quiz');S.unlocked=6;save();sfx('sfx_mission_complete.wav');sendEvaluationToAppsScript();render()
}
function cloudConfig(){return window.MPI_CONFIG||{appsScriptUrl:'',sendResults:false}}
function sendEvaluationToAppsScript(){
 const cfg=cloudConfig();
 if(!cfg.sendResults||!cfg.appsScriptUrl){S.cloudStatus='off';save();return}
 const payload={action:'submitEvaluation',appVersion:cfg.appVersion||'unknown',sessionId:S.sessionId||'',studentName:S.name||'',studentClass:S.kelas||'',scorePercent:S.quizScore,correct:S.quizCorrect||0,total:quizzes.length,categoryScores:S.categoryScores||{},mastery:S.mastery||{},answers:quizzes.map((q,i)=>({no:i+1,level:q.level,group:q.group,topic:q.topic,correct:!!S.firstScore[i],answer:S.answers[i]})),durationMinutes:Math.max(1,Math.round((Date.now()-S.started)/60000)),submittedAt:new Date().toISOString()};
 S.cloudStatus='sending';save();
 fetch(cfg.appsScriptUrl,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)})
 .then(()=>{S.cloudStatus='sent';save();const e=document.getElementById('cloudStatus');if(e)e.textContent='Permintaan hasil telah dikirim ke endpoint Apps Script.'})
 .catch(()=>{S.cloudStatus='failed';save();const e=document.getElementById('cloudStatus');if(e)e.textContent='Pengiriman cloud gagal; hasil lokal tetap aman di sesi ini.'});
}
function results(){
 const cs=S.categoryScores||categoryScores();
 const cloudMsg=S.cloudStatus==='sending'?'Mengirim hasil ke Apps Script...':S.cloudStatus==='sent'?'Permintaan hasil telah dikirim ke endpoint Apps Script.':S.cloudStatus==='failed'?'Pengiriman cloud gagal; hasil lokal tetap tersedia.':'Sinkronisasi Apps Script belum diaktifkan.';
 return `<section class="page"><div class="quiz-wrap"><div class="card results"><div class="kicker">Hasil Evaluasi 15 Soal</div><div class="score">${S.quizScore}</div><p><b>${S.quizCorrect||0}/${quizzes.length}</b> soal benar — skor dihitung dari percobaan pertama setiap soal.</p><div class="score-groups"><div><span>LOTS/MOTS</span><b>${cs['LOTS/MOTS'].correct}/${cs['LOTS/MOTS'].total}</b><small>${cs['LOTS/MOTS'].pct}%</small></div><div><span>HOTS</span><b>${cs.HOTS.correct}/${cs.HOTS.total}</b><small>${cs.HOTS.pct}%</small></div><div><span>PISA-style</span><b>${cs.PISA.correct}/${cs.PISA.total}</b><small>${cs.PISA.pct}%</small></div></div><div class="mastery">${Object.entries(S.mastery).map(([k,v])=>`<div class="mastery-row"><span>${k}</span><div class="mastery-bar"><i style="width:${v}%"></i></div><b>${v}%</b></div>`).join('')}</div><p id="cloudStatus" class="sync-note">${cloudMsg}</p><div class="btn-row" style="justify-content:center"><button class="btn secondary" onclick="resetQuiz()">Ulang Evaluasi</button><button class="btn primary" onclick="go('games')">Lanjut ke Game Lab →</button></div></div><div class="card" style="margin-top:14px"><h2>Pembahasan Semua Soal</h2>${quizzes.map((q,i)=>`<div class="review-card"><div class="quiz-labels"><b>Soal ${i+1} — ${q.topic}</b><span class="level-badge">${q.level}</span></div><p>${q.q}</p><strong class="${S.firstScore[i]?'good':'bad'}">${S.firstScore[i]?'Benar':'Belum benar'} pada percobaan pertama</strong><p>${q.exp}</p><small>Jawaban benar: ${correctText(q)}</small></div>`).join('')}</div></div></section>`
}
window.resetQuiz=()=>{S.quizIndex=0;S.answers={};S.checked={};S.firstScore={};S.quizScore=null;S.quizCorrect=0;S.categoryScores={};S.mastery={};S.cloudStatus='off';save();render()};

function games(){return window.GameLabV2.shell(S)}
window.game=(i,btn)=>window.GameLabV2.open(i,btn,{S,save,toast,sfx});

function sendCompletionToAppsScript(reflection){
 const cfg=cloudConfig();
 if(!cfg.sendResults||!cfg.appsScriptUrl)return;
 const payload={
   action:'submitCompletion',
   appVersion:cfg.appVersion||'unknown',
   sessionId:S.sessionId||'',
   studentName:S.name||'',
   studentClass:S.kelas||'',
   scorePercent:S.quizScore,
   reflection:reflection||'',
   durationMinutes:Math.max(1,Math.round((Date.now()-S.started)/60000)),
   submittedAt:new Date().toISOString()
 };
 fetch(cfg.appsScriptUrl,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}).catch(()=>{});
}

window.finishGames=()=>{const r=document.getElementById('reflection').value.trim();if(!r){toast('Tuliskan refleksi singkat terlebih dahulu.');return}S.reflection=r;save();sendCompletionToAppsScript(r);completeMenu('games');sfx('sfx_mission_complete.wav');finalPage()};
function finalPage(){const mins=Math.max(1,Math.round((Date.now()-S.started)/60000));document.getElementById('main').innerHTML=`<section class="page final"><div class="card">${img('maskot_subi_sukses.webp','final-mascot')}<div class="kicker">Mission Complete</div><h1>Misi Tekanan Selesai</h1><p>${S.name?`Selamat, <b>${S.name}</b>.`:'Selamat, Navigator Sains.'} Kamu telah menyelesaikan materi, misi, evaluasi, dan game penguatan.</p><div class="readouts"><div><span>Skor evaluasi</span><b>${S.quizScore??'-'}</b></div><div><span>Misi</span><b>${S.missions.length}/6</b></div><div><span>Durasi sesi</span><b>${mins} mnt</b></div></div><p style="font-size:12px;color:#64748B">${cloudConfig().sendResults&&cloudConfig().appsScriptUrl?'Sinkronisasi Google Apps Script aktif. Hasil evaluasi/refleksi dikirim ke endpoint yang dikonfigurasi.':'Sinkronisasi cloud belum diaktifkan; hasil hanya berada di sesi browser.'}</p><div class="btn-row" style="justify-content:center"><button class="btn secondary" onclick="go('materials')">Pelajari Lagi</button><button class="btn primary" onclick="go('games')">Ulang Game</button><button class="btn orange" onclick="resetAll()">Sesi Baru</button></div></div></section>`}
window.resetAll=()=>{try{sessionStorage.removeItem(KEY)}catch(e){}S={...DEFAULT,sessionId:(Date.now().toString(36)+Math.random().toString(36).slice(2)),started:Date.now()};render()};
function render(){updateNav();const m=document.getElementById('main');if(S.current==='opening')m.innerHTML=opening();else if(S.current==='objectives')m.innerHTML=objectives();else if(S.current==='materials')m.innerHTML=materials();else if(S.current==='missions')m.innerHTML=missionPage();else if(S.current==='quiz')m.innerHTML=quiz();else if(S.current==='games'){if(done('games')){finalPage();return}else{m.innerHTML=games();setTimeout(()=>game(0,document.querySelector('.game-tabs button')),0)}}m.focus()}
render();
