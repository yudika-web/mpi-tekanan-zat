# QA MPI Misi Tekanan v2.1

## Perubahan
- Maskot SUBI dimasukkan kembali:
  - normal: pembuka dan sidebar
  - berpikir: pemandu materi
  - sukses: feedback benar dan Mission Complete
  - peringatan: feedback jawaban belum tepat
- Bug progres materi diperbaiki: tombol **Topik Berikutnya** sekarang langsung aktif setelah cek pemahaman dijawab benar.
- Penyimpanan sesi dibuat lebih tahan terhadap browser yang membatasi `sessionStorage` saat file HTML dibuka langsung.
- Tampilan landscape ditata ulang agar tidak terlalu tinggi dan tetap nyaman.

## Pengujian alur end-to-end
Status: **LULUS**

Tahapan yang diuji:
1. Pembuka + identitas opsional
2. 4 pertanyaan apersepsi
3. Tujuan Pembelajaran
4. 8 topik materi + cek pemahaman
5. 6 misi bertahap
6. 12 soal evaluasi + feedback setiap soal
7. Hasil evaluasi
8. 5 tab simulasi/game
9. Refleksi
10. Mission Complete

Semua menu dapat dibuka sesuai urutan. Tidak ditemukan dead-end setelah perbaikan.

## Responsivitas yang diuji
- HP potret: 390×844 — tidak ada overflow horizontal, target tombol minimum 44 px.
- HP landscape: 844×390 — tidak ada overflow horizontal, layout landscape aktif.
- Laptop: 1366×768 — tidak ada overflow horizontal, sidebar tampil normal.

## Validasi teknis
- Runtime error pada pengujian: 0
- JavaScript syntax: OK
- Referensi aset hilang: 0
- Gambar >500 KB: 0
- Handler tombol yang tidak ditemukan: 0
- Maskot tersedia: 4 file

## Keputusan proyek tetap
- Canva Sheet: **Tidak**
- Akses menu: **Bertahap**
