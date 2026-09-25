# MPI Misi Tekanan v2 — IPA Kelas IX

## Keputusan proyek yang dipertahankan
- Canva Sheet: **Tidak**
- Akses menu: **Bertahap**
- Nama dan kelas: opsional
- Progres: `sessionStorage` browser, tidak dikirim keluar
- Perangkat: HP potret dan laptop

## Perbaikan utama
- Mengganti seluruh aset materi/simulasi/evaluasi dengan aset terbaru Batch 1–3.
- Setiap gambar menjadi file WebP individual; tidak memakai hasil crop sprite sheet lama.
- Seluruh file WebP dikompres di bawah 500 KB.
- Menambahkan apersepsi dan alasan pentingnya mempelajari tekanan.
- Materi diperluas menjadi 8 topik dengan alur fenomena → konsep → konteks → contoh terbimbing → cek pemahaman.
- Menambahkan 6 misi bertahap dengan feedback dinamis.
- Evaluasi 12 soal multi-tipe dengan feedback langsung setelah jawaban diperiksa dan pembahasan lengkap setelah selesai.
- Game Lab berisi Ground Challenge, Hydraulic Garage, Gas Explorer, Hydrostatic Explorer, dan Submarine Commander.

## Menjalankan
Buka `index.html` di browser modern. Untuk hasil paling stabil, dapat dijalankan dari server lokal:

`python -m http.server 8080`


## v2.1 QA
- Maskot SUBI dimasukkan kembali: normal, berpikir, sukses, dan peringatan.
- Bug tombol `Topik Berikutnya` setelah jawaban benar diperbaiki.
- Halaman Mission Complete dipertahankan saat halaman direfresh setelah MPI selesai.
- Target sentuh tombol diperbesar untuk HP.
- Tambahan layout khusus HP landscape dan layar laptop pendek.
- Paket ini menjalani pengujian alur end-to-end dan pemeriksaan viewport.

- Ketahanan file lokal: jika browser membatasi `sessionStorage` pada `file://`, MPI tetap berjalan dalam sesi aktif; penyimpanan lintas refresh memerlukan origin normal/server lokal.


## v3.0 GitHub + Apps Script
- 15 soal evaluasi: 10 LOTS/MOTS, 3 HOTS, 2 PISA-style.
- Format LOTS/MOTS mencakup pilihan ganda, benar/salah, mengurutkan, menjodohkan, dan isian singkat/numerik.
- Skor ditampilkan total dan per kelompok: LOTS/MOTS, HOTS, PISA-style.
- `config.js` untuk endpoint Apps Script.
- Backend tersedia di `apps-script/Code.gs`.
- Penyimpanan Google Sheet opsional melalui Script Property `SPREADSHEET_ID`.
