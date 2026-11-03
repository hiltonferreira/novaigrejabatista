/* Pix "copia e cola" (BR Code estático, padrão EMV do Banco Central) da Nova Igreja Batista.
   Chave, nome e cidade conferidos com o QR Code oficial do site (assets/pix-qrcode.png).
   O Pix estático é pago em qualquer banco; o banco do pagador já envia nome e CPF de quem pagou,
   então o membro não precisa digitar seus dados. A confirmação automática do pagamento exige a
   API Pix do banco da igreja (Pix dinâmico com webhook), que ainda não está integrada. */
(function(scope){
  const church = { key: '40518758000130', name: 'NOVA IGREJA BATISTA', city: 'ARIQUEMES' };
  const field = (id, value) => id + String(value.length).padStart(2, '0') + value;
  const crc16 = text => {
    let crc = 0xFFFF;
    for (let i = 0; i < text.length; i++) {
      crc ^= text.charCodeAt(i) << 8;
      for (let b = 0; b < 8; b++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  };
  // txid: até 25 letras/números (sem acento ou espaço); "***" quando não houver identificador.
  const cleanTxid = txid => (String(txid || '').normalize('NFD').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 25)) || '***';
  const brCode = ({ amount, txid } = {}) => {
    const account = field('00', 'br.gov.bcb.pix') + field('01', church.key);
    let payload = field('00', '01') + field('26', account) + field('52', '0000') + field('53', '986');
    if (amount) payload += field('54', Number(amount).toFixed(2));
    payload += field('58', 'BR') + field('59', church.name) + field('60', church.city) + field('62', field('05', cleanTxid(txid))) + '6304';
    return payload + crc16(payload);
  };
  scope.NibPix = { church, brCode, crc16, cleanTxid };
})(typeof window === 'undefined' ? globalThis : window);
