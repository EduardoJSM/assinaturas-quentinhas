
const estilos = {
  italic: 'font-style:italic;',
  bold: 'font-weight:700;',
  digital: 'font-family:monospace; letter-spacing:1px; text-transform:uppercase;',
  script: 'font-family:"Brush Script MT", cursive; font-style:italic;',
  mono: 'font-family:"Courier New", monospace;'
};

function onlyDigits(s){ return String(s||'').replace(/\D/g,''); }
function formatCPF(cpf){ cpf = onlyDigits(cpf); if(cpf.length!==11) return cpf; return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4'); }

function loadPreview(){
  const text = document.getElementById('assinatura').value || document.getElementById('nome').value || '';
  const style = document.getElementById('estilo').value;
  const pv = document.getElementById('preview');
  pv.style = estilos[style] || '';
  pv.textContent = text || 'Pré-visualização da assinatura';
}

function saveProfile(){
  const nome = document.getElementById('nome').value.trim();
  const cpf = onlyDigits(document.getElementById('cpf').value);
  const assinatura = document.getElementById('assinatura').value.trim();
  const estilo = document.getElementById('estilo').value;
  if(!nome || cpf.length!==11 || !assinatura){ alert('Preencha nome, CPF (11 dígitos) e texto da assinatura.'); return; }
  const perfis = JSON.parse(localStorage.getItem('perfis')||'{}');
  perfis[cpf] = { nome, assinatura, estilo, createdAt: new Date().toISOString() };
  localStorage.setItem('perfis', JSON.stringify(perfis));
  alert('Perfil salvo para ' + nome);
  document.getElementById('cpf').value = formatCPF(cpf);
  loadProfilesInList();
}

function confirmReceipt(){
  const cpfRaw = document.getElementById('cpfConfirm').value;
  const cpf = onlyDigits(cpfRaw);
  const perfis = JSON.parse(localStorage.getItem('perfis')||'{}');
  if(!perfis[cpf]){ if(confirm('CPF não cadastrado. Deseja cadastrar agora?')){ document.getElementById('cpf').value = formatCPF(cpf); window.scrollTo({top:0, behavior:"smooth"}); } return; }
  const profile = perfis[cpf];
  const now = new Date();
  const reg = { cpf: formatCPF(cpf), nome: profile.nome, assinatura: profile.assinatura, estilo: profile.estilo, ts: now.toISOString(), date: now.toLocaleDateString('pt-BR'), time: now.toLocaleTimeString('pt-BR') };
  const regs = JSON.parse(localStorage.getItem('registros')||'[]');
  regs.unshift(reg);
  localStorage.setItem('registros', JSON.stringify(regs));
  renderTable();
  alert('Recebimento confirmado para ' + profile.nome + ' em ' + reg.date + ' ' + reg.time);
}

function renderTable(){
  const tbody = document.querySelector('#registros tbody');
  tbody.innerHTML = '';
  const regs = JSON.parse(localStorage.getItem('registros')||'[]');
  regs.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>'+r.cpf+'</td><td>'+r.nome+'</td><td style="'+estilos[r.estilo]+'">'+r.assinatura+'</td><td>'+r.date+' '+r.time+'</td>';
    tbody.appendChild(tr);
  });
}

function exportCSV(){
  const regs = JSON.parse(localStorage.getItem('registros')||'[]');
  if(regs.length===0){ alert('Nenhum registro para exportar.'); return; }
  const lines = ['"CPF","Nome","Assinatura","DataHora"'];
  regs.forEach(r=> lines.push(`"${r.cpf}","${r.nome}","${r.assinatura.replace(/"/g,'""')}","${r.date} ${r.time}"`) );
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'registros_quentinhas.csv'; a.click();
}

function loadProfilesInList(){
  const list = document.getElementById('profilesList');
  list.innerHTML = '';
  const p = JSON.parse(localStorage.getItem('perfis')||'{}');
  const keys = Object.keys(p);
  if(keys.length===0){ list.textContent = 'Nenhum perfil cadastrado.'; return; }
  keys.forEach(k=> { const item = document.createElement('div'); item.textContent = formatCPF(k) + ' — ' + p[k].nome; list.appendChild(item); });
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('assinatura').addEventListener('input', loadPreview);
  document.getElementById('estilo').addEventListener('change', loadPreview);
  document.getElementById('cpf').addEventListener('input', (e)=>{ e.target.value = formatCPF(onlyDigits(e.target.value)); });
  document.getElementById('cpfConfirm').addEventListener('input', (e)=>{ e.target.value = formatCPF(onlyDigits(e.target.value)); });
  document.getElementById('saveBtn').addEventListener('click', saveProfile);
  document.getElementById('confirmBtn').addEventListener('click', confirmReceipt);
  document.getElementById('exportBtn').addEventListener('click', exportCSV);
  loadProfilesInList();
  renderTable();
  loadPreview();
});
