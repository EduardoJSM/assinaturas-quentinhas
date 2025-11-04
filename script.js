
// Utilities
function onlyDigits(s){ return String(s||'').replace(/\D/g,''); }
function formatCPF(v){ const d=onlyDigits(v); if(d.length<=3) return d; if(d.length<=6) return d.replace(/(\d{3})(\d+)/,'$1.$2'); if(d.length<=9) return d.replace(/(\d{3})(\d{3})(\d+)/,'$1.$2.$3'); return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2}).*/,'$1.$2.$3-$4'); }

function setPreview(text, style){
  const pv = document.getElementById('preview');
  if(!pv) return;
  pv.textContent = text || 'Pré-visualização da assinatura';
  for(let i=1;i<=10;i++) pv.classList.remove('sig-'+i);
  if(style) pv.classList.add(style);
}

// storage helpers
function saveProfileObj(cpfKey, obj){
  const profiles = JSON.parse(localStorage.getItem('perfis')||'{}');
  profiles[cpfKey] = obj;
  localStorage.setItem('perfis', JSON.stringify(profiles));
}
function loadProfileObj(cpfKey){
  const profiles = JSON.parse(localStorage.getItem('perfis')||'{}');
  return profiles[cpfKey] || null;
}

// Index page logic
document.addEventListener('DOMContentLoaded', ()=>{
  // common elements
  const nome = document.getElementById('nome');
  const cpf = document.getElementById('cpf');
  const assinatura = document.getElementById('assinatura');
  const estilo = document.getElementById('estilo');
  const saveBtn = document.getElementById('saveBtn');
  const gotoSign = document.getElementById('gotoSign');
  const clearAll = document.getElementById('clearAll');
  const cpfConfirm = document.getElementById('cpfConfirm');
  const loadBtn = document.getElementById('loadBtn');
  const loaded = document.getElementById('loaded');
  const confirmWrap = document.getElementById('confirmWrap');
  const confirmBtn = document.getElementById('confirmBtn');

  // live preview
  function updatePreview(){ setPreview(assinatura.value || nome.value, estilo.value); }
  assinatura && assinatura.addEventListener('input', updatePreview);
  estilo && estilo.addEventListener('change', updatePreview);
  nome && nome.addEventListener('input', ()=>{ if(!assinatura.value) setPreview(nome.value, estilo.value); });
  updatePreview();

  // format CPF inputs as user types
  if(cpf) cpf.addEventListener('input', (e)=>{ e.target.value = formatCPF(e.target.value); });
  if(cpfConfirm) cpfConfirm.addEventListener('input', (e)=>{ e.target.value = formatCPF(e.target.value); });

  // save profile
  if(saveBtn){
    saveBtn.addEventListener('click', ()=>{
      const n = nome.value.trim();
      const cpfRaw = cpf.value.trim();
      const cpfKey = onlyDigits(cpfRaw);
      const sig = assinatura.value.trim();
      const est = estilo.value;
      if(!n || cpfKey.length!==11 || !sig){ alert('Preencha nome, CPF (11 dígitos) e assinatura.'); return; }
      const obj = { nome:n, cpf: formatCPF(cpfKey), assinatura: sig, estilo: est, savedAt: new Date().toISOString() };
      saveProfileObj(cpfKey, obj);
      alert('Perfil salvo com sucesso!');
    });
  }

  // goto assinar page with cpf param if filled
  if(gotoSign){
    gotoSign.addEventListener('click', ()=>{
      const cpfKey = onlyDigits(cpf.value||'');
      if(cpfKey.length===11){
        window.location.href = 'assinar.html?cpf='+cpfKey;
      } else {
        if(confirm('CPF incompleto. Deseja ir para a tela de assinatura mesmo assim?')) window.location.href='assinar.html';
      }
    });
  }

  // clear all
  if(clearAll){
    clearAll.addEventListener('click', ()=>{ if(confirm('Apagar todos os perfis salvos no navegador?')){ localStorage.removeItem('perfis'); alert('Perfis apagados'); } });
  }

  // load profile in aside by cpfConfirm
  if(loadBtn){
    loadBtn.addEventListener('click', ()=>{
      const key = onlyDigits(cpfConfirm.value||'');
      if(key.length!==11){ loaded.style.display='block'; loaded.innerHTML='<em>CPF inválido.</em>'; confirmWrap.style.display='none'; return; }
      const p = loadProfileObj(key);
      if(p){ loaded.style.display='block'; loaded.innerHTML = '<strong>'+p.nome+'</strong><div class="'+p.estilo+'" style="margin-top:8px; font-size:18px">'+p.assinatura+'</div><div class="small" style="margin-top:6px">Salvo em: '+ new Date(p.savedAt).toLocaleString() +'</div>'; confirmWrap.style.display='block'; } else { loaded.style.display='block'; loaded.innerHTML='<em>Perfil não encontrado.</em>'; confirmWrap.style.display='none'; }
    });
  }

  if(confirmBtn){
    confirmBtn.addEventListener('click', ()=>{
      const key = onlyDigits(cpfConfirm.value||'');
      const p = loadProfileObj(key);
      if(!p){ alert('Perfil não encontrado.'); return; }
      const regs = JSON.parse(localStorage.getItem('registros')||'[]');
      regs.unshift({ cpf:p.cpf, nome:p.nome, assinatura:p.assinatura, estilo:p.estilo, ts:new Date().toISOString() });
      localStorage.setItem('registros', JSON.stringify(regs));
      alert('Recebimento confirmado para ' + p.nome);
    });
  }
});

// assinar.html logic (same script)
document.addEventListener('DOMContentLoaded', ()=>{
  const params = new URLSearchParams(window.location.search);
  const cpfParam = params.get('cpf') || '';
  const cpfTarget = document.getElementById('cpfTarget');
  const profileBox = document.getElementById('profileBox');
  const confirmSign = document.getElementById('confirmSign');

  function renderProfileBox(p){
    if(!p){ profileBox.style.display='block'; profileBox.innerHTML='<em>Perfil não encontrado.</em>'; return; }
    profileBox.style.display='block';
    profileBox.innerHTML = '<strong>'+p.nome+'</strong><div class="'+p.estilo+'" style="margin-top:8px; font-size:20px">'+p.assinatura+'</div><div class="small" style="margin-top:6px">CPF: '+p.cpf+'</div>';
  }

  if(cpfTarget){
    if(cpfParam){ cpfTarget.value = formatCPF(cpfParam); const p = loadProfileObj(cpfParam); renderProfileBox(p); }
    cpfTarget.addEventListener('input', (e)=>{ e.target.value = formatCPF(e.target.value); });
    cpfTarget.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ const p = loadProfileObj(onlyDigits(cpfTarget.value)); renderProfileBox(p); } });
  }

  if(confirmSign){
    confirmSign.addEventListener('click', ()=>{
      const key = onlyDigits(cpfTarget.value||'');
      const p = loadProfileObj(key);
      if(!p){ alert('Perfil não encontrado.'); return; }
      const regs = JSON.parse(localStorage.getItem('registros')||'[]');
      regs.unshift({ cpf:p.cpf, nome:p.nome, assinatura:p.assinatura, estilo:p.estilo, ts:new Date().toISOString() });
      localStorage.setItem('registros', JSON.stringify(regs));
      alert('Assinatura confirmada para ' + p.nome);
    });
  }
});
