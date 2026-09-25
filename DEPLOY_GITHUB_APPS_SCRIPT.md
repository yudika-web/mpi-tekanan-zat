# Deployment GitHub Pages + Google Apps Script

## GitHub Pages
1. Buat repository baru.
2. Upload seluruh isi folder utama paket ke root repository.
3. Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
4. Pastikan `index.html`, `styles.css`, `app.js`, `config.js`, dan `assets/` berada pada struktur yang sama.

## Google Apps Script
1. Buat project Apps Script.
2. Salin `apps-script/Code.gs` ke `Code.gs`.
3. Deploy → New deployment → Web app.
4. Execute as: Me.
5. Who has access: sesuaikan kebijakan sekolah.
6. Salin URL Web App yang berakhir `/exec`.

### Penyimpanan Google Sheet (opsional)
Jika ingin hasil tersimpan:
1. Buat Google Spreadsheet.
2. Ambil Spreadsheet ID dari URL.
3. Apps Script → Project Settings → Script Properties.
4. Tambahkan `SPREADSHEET_ID` dengan nilai ID spreadsheet.

Tanpa `SPREADSHEET_ID`, endpoint tetap hidup tetapi tidak menyimpan data.

## Hubungkan frontend
Edit `config.js`:

window.MPI_CONFIG = {
  appsScriptUrl: "https://script.google.com/macros/s/DEPLOYMENT_ID/exec",
  sendResults: true,
  appVersion: "3.0-github-appsscript"
};

Catatan: dua soal terakhir adalah **PISA-style**, bukan soal resmi OECD PISA.
