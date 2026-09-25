# Game Lab v2 — Dynamic Simulation Patch

Patch ini hanya mengganti modul **Simulasi / Games**. Evaluasi 15 soal, konfigurasi endpoint, dan `Code.gs` dipertahankan byte-for-byte dari v3.1.1.

## 1. Ground Rescue Challenge
Model utama: `p = F/A`, dengan `F ≈ mg`.

Animasi dinamis:
- kendaraan bergerak melintasi medan;
- badan kendaraan turun ketika rasio tekanan terhadap batas medan meningkat;
- kendaraan dapat berhenti/terjebak sebelum target;
- indikator deformasi tanah ikut berubah.

Tiga level menggunakan tanah keras, pasir, dan lumpur. Nilai batas tanah adalah parameter pendidikan untuk memperlihatkan hubungan sebab-akibat, bukan data geoteknik untuk perancangan nyata.

## 2. Hydraulic Garage
Model:
- `F1/A1 = F2/A2`;
- `A1 s1 ≈ A2 s2` untuk memperlihatkan konservasi volume.

Animasi:
- piston kecil turun;
- aliran fluida divisualisasikan bergerak;
- piston besar dan kendaraan naik bila `F2` mencukupi;
- kendaraan bergetar bila rancangan tidak mampu mengangkat beban.

## 3. Gas Laboratory
Model pendidikan berbasis gas ideal relatif:
- pada volume tetap, `P ∝ T`;
- pada piston bebas, volume bergerak menuju keadaan yang menjaga tekanan mendekati tekanan luar;
- kecepatan visual partikel diskalakan sekitar `sqrt(T/T0)`.

Animasi:
- 30 partikel bergerak dan memantul real-time di canvas;
- pemanasan mempercepat partikel;
- piston bergerak ketika mode volume bebas digunakan;
- siswa mengambil data `T`, `P`, dan `V`.

## 4. Hydrostatic Explorer
Model: `p_h = ρgh`.

Interaksi:
- sensor dapat di-drag naik-turun;
- tersedia tombol Naik/Turun sebagai alternatif layar sentuh;
- pressure gauge bergerak;
- tabel dan grafik `p-h` dibangun dari data yang diambil siswa;
- cairan dapat diganti untuk membandingkan massa jenis.

## 5. Submarine Commander
Model:
- `F_a = ρVg`;
- `W = mg`;
- percepatan vertikal berasal dari resultan `W - F_a`;
- hambatan linear sederhana dipakai agar gerak stabil dan mudah dikendalikan.

Animasi dan kontrol:
- tombol Isi Ballast/Buang Ballast mengubah massa secara kontinu selama ditekan;
- kapal bergerak naik/turun secara real-time;
- indikator kedalaman, kecepatan, ballast, `F_a`, `W`, dan tekanan hidrostatis berubah terus;
- Level 3 menambahkan kapsul penelitian +25 kg, sehingga keseimbangan gaya berubah setelah kapsul diambil.

## Mekanik pembelajaran
Setiap level menggunakan urutan:
1. Prediksi.
2. Atur variabel.
3. Jalankan/observasi simulasi.
4. Ambil data bila relevan.
5. Jawab alasan ilmiah.
6. Dapat 1–3 bintang.

Bintang:
- 1: target level tercapai;
- 1: strategi cukup efisien;
- 1: penjelasan konsep benar.

## Isolasi data
Game memakai `S.gameV2` dan tidak menulis ke:
- `S.answers`
- `S.checked`
- `S.firstScore`
- `S.quizScore`
- `S.quizCorrect`
- `S.categoryScores`
- `S.mastery`

Pengiriman nilai evaluasi tetap terjadi setelah soal ke-15. Refleksi akhir tetap memakai jalur `submitCompletion` yang sudah ada.
