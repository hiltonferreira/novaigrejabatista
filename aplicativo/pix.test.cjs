const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/pix.js','utf8'),ctx);
const pix=ctx.NibPix;
// Conteúdo lido do QR Code oficial publicado no site da igreja (assets/pix-qrcode.png).
const official='00020126360014br.gov.bcb.pix0114405187580001305204000053039865802BR5919NOVA IGREJA BATISTA6009ARIQUEMES62070503***6304669F';
test('Sem valor, gera exatamente o mesmo Pix do QR Code oficial',()=>{assert.equal(pix.brCode(),official);});
test('Com valor e identificador, inclui valor, txid e CRC válido',()=>{
  const code=pix.brCode({amount:150,txid:'DIZ-20261103-ab12'});
  assert.ok(code.includes('5406150.00'));
  assert.ok(code.includes('0515DIZ20261103AB12'));
  assert.equal(code.slice(-4),pix.crc16(code.slice(0,-4)));
});
test('Identificador é limitado a 25 caracteres sem acentos',()=>{assert.equal(pix.cleanTxid('Dízimo Jéssica Exemplo 2026 novembro'),'DIZIMOJESSICAEXEMPLO2026N');assert.equal(pix.cleanTxid(''),'***');});
test('Com descrição, inclui o campo 26-02 sem acentos e o CRC continua válido',()=>{
  const code=pix.brCode({amount:80,txid:'NXTCAMP',description:'Inscrição NXT Camp'});
  assert.ok(code.includes('0218Inscricao NXT Camp'));
  assert.ok(code.startsWith('00020126580014br.gov.bcb.pix0114405187580001300218Inscricao NXT Camp'));
  assert.equal(code.slice(-4),pix.crc16(code.slice(0,-4)));
  assert.equal(pix.brCode({description:''}),official);
});
test('Descrição é limitada a 40 caracteres',()=>{assert.equal(pix.cleanDescription('Dízimo '+'x'.repeat(60)).length,40);});
test('Gera o mesmo Pix do NXT Camp publicado no site quando não há descrição',()=>{
  assert.equal(pix.brCode({amount:80}),'00020126360014br.gov.bcb.pix011440518758000130520400005303986540580.005802BR5919NOVA IGREJA BATISTA6009ARIQUEMES62070503***63047D99');
});
