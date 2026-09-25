# Update GitHub ke v3.2 Game Lab Dinamis

Cara paling aman: unggah ulang/replace seluruh isi paket v3.2 ke root repository GitHub Pages.

Jika ingin update minimal, file yang berubah/baru hanya:
- `index.html`
- `app.js` (hanya blok loader Game Lab lama diganti)
- `game-lab-v2.js` **baru**
- `game-lab-v2.css` **baru**
- folder `assets/game-lab-v2/` **baru**

Jangan ganti `config.js` dengan versi lama. Paket v3.2 ini sudah membawa `config.js` v3.1.1 yang menunjuk ke deployment Apps Script aktif.

Tidak perlu deploy ulang Apps Script karena `apps-script/Code.gs` tidak berubah pada patch Game Lab ini.
