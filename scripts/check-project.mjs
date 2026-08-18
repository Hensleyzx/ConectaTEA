import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const required = [
  'App.tsx', 'app.json', 'package.json', 'eas.json',
  'assets/conectatea-logo.png', 'assets/conectatea-mark.png',
  'assets/audio/rain.wav', 'assets/audio/ocean.wav', 'assets/audio/forest.wav',
  'assets/audio/birds.wav', 'assets/audio/wind.wav', 'assets/audio/brown.wav',
  'supabase/schema.sql', 'supabase/functions/send-help-notification/index.ts',
];

let failed = false;
for (const rel of required) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full) || fs.statSync(full).size === 0) {
    console.error(`FALHOU: ${rel}`);
    failed = true;
  } else {
    console.log(`OK: ${rel}`);
  }
}

for (const rel of ['package.json', 'app.json', 'eas.json']) {
  try { JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')); }
  catch (error) { console.error(`JSON inválido: ${rel}`, error); failed = true; }
}

if (failed) process.exit(1);
console.log('\nAuditoria estrutural concluída: arquivos essenciais presentes.');
