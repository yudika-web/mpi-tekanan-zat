/**
 * MPI Misi Tekanan — Google Apps Script backend.
 * Google Sheet opsional: set Script Property SPREADSHEET_ID.
 */
const SHEET_NAME = 'Hasil Evaluasi';

function doGet(e) {
  return json_({ok:true, service:'MPI Misi Tekanan API', version:'3.0', storageConfigured:Boolean(getSpreadsheetId_())});
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json_({ok:false,error:'EMPTY_BODY'});
    const data = JSON.parse(e.postData.contents);
    if (data.action === 'submitEvaluation') return saveEvaluation_(data);
    if (data.action === 'submitCompletion') return saveCompletion_(data);
    return json_({ok:false,error:'UNKNOWN_ACTION'});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message ? err.message : err)});
  }
}

function saveEvaluation_(data) {
  const spreadsheetId = getSpreadsheetId_();
  if (!spreadsheetId) return json_({ok:true,stored:false,message:'SPREADSHEET_ID belum diatur. Data diterima tetapi tidak disimpan.'});

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sh = getOrCreateSheet_(ss, SHEET_NAME, [
      'Timestamp','Session ID','Nama','Kelas','Skor (%)','Benar','Total',
      'LOTS/MOTS','HOTS','PISA-style','Durasi (menit)','Mastery JSON','Jawaban JSON','Versi App'
    ]);
    const cats=data.categoryScores||{};
    sh.appendRow([
      new Date(),safe_(data.sessionId),safe_(data.studentName),safe_(data.studentClass),
      number_(data.scorePercent),number_(data.correct),number_(data.total),
      categoryText_(cats['LOTS/MOTS']),categoryText_(cats['HOTS']),categoryText_(cats['PISA']),
      number_(data.durationMinutes),JSON.stringify(data.mastery||{}),JSON.stringify(data.answers||[]),safe_(data.appVersion)
    ]);
    return json_({ok:true,stored:true});
  } finally { lock.releaseLock(); }
}

function saveCompletion_(data) {
  const spreadsheetId=getSpreadsheetId_();
  if (!spreadsheetId) return json_({ok:true,stored:false,message:'SPREADSHEET_ID belum diatur.'});
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try {
    const ss=SpreadsheetApp.openById(spreadsheetId);
    const sh=getOrCreateSheet_(ss,'Penyelesaian MPI',['Timestamp','Session ID','Nama','Kelas','Skor (%)','Refleksi','Durasi (menit)','Versi App']);
    sh.appendRow([new Date(),safe_(data.sessionId),safe_(data.studentName),safe_(data.studentClass),number_(data.scorePercent),safe_(data.reflection),number_(data.durationMinutes),safe_(data.appVersion)]);
    return json_({ok:true,stored:true});
  } finally { lock.releaseLock(); }
}

function getSpreadsheetId_(){return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID')||''}
function getOrCreateSheet_(ss,name,headers){
  let sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);
  if(sh.getLastRow()===0){sh.getRange(1,1,1,headers.length).setValues([headers]);sh.getRange(1,1,1,headers.length).setFontWeight('bold');sh.setFrozenRows(1)}
  return sh;
}
function categoryText_(obj){if(!obj)return'';return String(number_(obj.correct))+'/'+String(number_(obj.total))+' ('+String(number_(obj.pct))+'%)'}
function safe_(v){return v===null||v===undefined?'':String(v).slice(0,5000)}
function number_(v){const n=Number(v);return isFinite(n)?n:0}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}
