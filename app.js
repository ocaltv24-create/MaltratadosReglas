const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const symbols=['◎','♜','♠','✚','◈'];
let active=REGLAS.some(d=>d.id===location.hash.slice(1))?location.hash.slice(1):'generales',topic='all',view='all';
const highlights={
 generales:['Clean es obligatorio para cualquier persona que porte un arma.','No uses información OOC para decidir dentro del rol.','Las zonas seguras protegen a todos: respeta sus reglas y excepciones.'],
 policiales:['La vida del rehén que sigue vivo es prioridad en todo momento.','El conductor de la patrulla nunca puede disparar.','La fianza y los cargos se rigen por el Código Penal.'],
 ilegales:['Las organizaciones deben esperar 30 minutos entre robos.','El conductor no dispara durante una persecución.','No regreses al tiroteo después de reaparecer en el hospital.'],
 ems:['No entres a tiroteos activos: espera una escena asegurada.','Verifica el pulso mediante /do y espera la respuesta.','La segunda fase no implica un CK automático.'],
 discord:['El respeto se exige a todos, sin importar el rango.','Puedes apelar una decisión por ticket y con respeto.','Las faltas más graves pueden implicar ban inmediato.']
};
function highlighted(s,q){if(!q)return esc(s);let n=norm(s),needle=norm(q),pos=0,out='',i;while((i=n.indexOf(needle,pos))>=0){out+=esc(s.slice(pos,i))+'<mark>'+esc(s.slice(i,i+q.length))+'</mark>';pos=i+q.length;}return out+esc(s.slice(pos));}
function pair(good,bad,label='Ejemplo orientativo',q=''){return `<div class="example-pair"><div class="example-label">${label}</div><div class="example good"><strong><span>✓</span> Así está bien</strong><p>${highlighted(good,q)}</p></div><div class="example bad"><strong><span>✕</span> Así está mal</strong><p>${highlighted(bad,q)}</p></div></div>`;}
function hasExample(r){return !!r.examples||r.paragraphs.some(p=>p.type==='correct');}
function card(r,q){let result='',list=false,correct='',wrong='';const closeList=()=>{if(list){result+='</ul>';list=false;}};
 for(const p of r.paragraphs){if(p.type==='correct'){closeList();correct=p.text.replace(/^Correcto:\s*/,'');continue;}if(p.type==='wrong'){closeList();wrong=p.text.replace(/^Incorrecto:\s*/,'');continue;}if(p.type==='bullet'){if(!list){result+='<ul>';list=true;}result+=`<li>${highlighted(p.text,q)}</li>`;}else{closeList();result+=`<p>${highlighted(p.text,q)}</p>`;}}closeList();
 let illustration=correct&&wrong?pair(correct,wrong,'Ejemplo de la normativa',q):r.examples?pair(...r.examples,'Ejemplo orientativo',q):'';
 return `<article class="rule-card ${r.important?'is-important':''}" id="${r.id}"><div class="rule-card-meta"><span>${r.kind==='intro'?'CONTEXTO':r.ref?'NORMA '+esc(r.ref):'CONCEPTO'}</span>${r.important?'<span class="important-badge">! Importante</span>':''}</div><h5>${highlighted(r.title,q)}</h5><div class="rule-text">${result}</div>${illustration}</article>`;
}
function render(){const q=$('#search').value.trim(),selected=REGLAS.find(d=>d.id===active);$('#categories').innerHTML=REGLAS.map((d,i)=>`<button class="category ${active===d.id?'active':''}" data-id="${d.id}" aria-pressed="${active===d.id}"><span class="symbol">${symbols[i]}</span>${d.title.replace('Normativas de ','').replace('Normativas ','').replace('Reglas ','')}<small>${d.num}</small></button>`).join('');
 $('#reader-head').innerHTML=`<div class="reader-title-row"><div><div class="reading-label">${q?'BUSCADOR DE NORMAS':'LECTURA POR CATEGORÍA'}</div><h3>${q?'Encuentra tu regla':esc(selected.title)}</h3><p class="reader-desc">${q?'Resultados en las cinco categorías.':esc(selected.desc)}</p></div><span class="reader-symbol" aria-hidden="true">${q?'⌕':symbols[REGLAS.indexOf(selected)]}</span></div>${q?'':`<div class="remember"><strong>! Ten presente</strong><ul>${highlights[active].map(t=>`<li>${esc(t)}</li>`).join('')}</ul><small>Claves de consulta · Lee las reglas completas y sus excepciones.</small></div>`}`;
 $('#topic-nav').hidden=!!q;$('#topic-nav').innerHTML=`<span class="topic-label">TIPOS Y TEMAS</span><div class="topic-buttons"><button data-topic="all" aria-pressed="${topic==='all'}">Todos los temas</button>${selected.sections.map(g=>`<button data-topic="${g.id}" aria-pressed="${topic===g.id}">${esc(g.title)}</button>`).join('')}</div>`;
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(view===b.dataset.view)));
 let shown=0,sections=[];
 for(const d of q?REGLAS:[selected])for(const g of d.sections){if(!q&&topic!=='all'&&topic!==g.id)continue;
 const rules=g.rules.filter(r=>{if(view==='important'&&!r.important)return false;if(view==='examples'&&!hasExample(r))return false;return !q||norm([d.title,g.title,r.subtopic,r.title,...r.paragraphs.map(p=>p.text),...(r.examples||[])].join(' ')).includes(norm(q));});
 const groupExample=!!g.examples&&view!=='important'&&(!q||norm([g.title,...g.examples].join(' ')).includes(norm(q)));
 if(!rules.length&&!groupExample)continue;shown+=rules.length;let currentSub='';
 sections.push(`<section class="topic-section"><div class="topic-heading"><div><span>${esc(d.title)} / ${String(d.sections.indexOf(g)+1).padStart(2,'0')}</span><h4>${highlighted(g.title,q)}</h4></div><span class="topic-count">${rules.length} bloques</span></div>${rules.map(r=>{let heading=r.subtopic&&r.subtopic!==currentSub?`<h5 class="subtopic-heading">${highlighted(r.subtopic,q)}</h5>`:'';currentSub=r.subtopic;return heading+card(r,q);}).join('')}${groupExample?pair(...g.examples,'Ejemplo orientativo',q):''}</section>`);
 }
 $('#result-info').textContent=`${shown} ${shown===1?'norma o concepto':'normas y conceptos'}${q?' encontrados':''}`;
 $('#content').innerHTML=sections.length?sections.join(''):'<div class="empty"><h4>No hay coincidencias en esta vista.</h4><p>Prueba con otra palabra o selecciona «Todas» para ampliar los resultados.</p><button id="reset-filters">Ver todas las normas</button></div>';
 const reset=$('#reset-filters');if(reset)reset.onclick=()=>{if(q)$('#search').value='';else topic='all';view='all';render();};
}
$('#categories').onclick=e=>{const b=e.target.closest('button');if(!b)return;active=b.dataset.id;topic='all';view='all';$('#search').value='';history.replaceState(null,'','#'+active);render();};
$('#topic-nav').onclick=e=>{const b=e.target.closest('button[data-topic]');if(!b)return;topic=b.dataset.topic;render();};
document.querySelector('.view-filters').onclick=e=>{const b=e.target.closest('[data-view]');if(!b)return;view=b.dataset.view;render();};
$('#search').addEventListener('input',()=>{view='all';render();});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('#search').focus();}});
document.querySelectorAll('[data-jump]').forEach(a=>a.onclick=()=>{active=a.dataset.jump;const d=REGLAS.find(d=>d.id===active);topic=d.sections.find(g=>g.title===a.dataset.topic)?.id||'all';view='all';$('#search').value='';render();});
render();
// Keep existing shared GitHub Pages links such as #generales working.
function applyCategoryHash(){const category=REGLAS.find(d=>'#'+d.id===location.hash);if(!category)return;active=category.id;topic='all';view='all';$('#search').value='';render();$('#normativas').scrollIntoView({behavior:'auto',block:'start'});}
addEventListener('hashchange',applyCategoryHash);
if(REGLAS.some(d=>'#'+d.id===location.hash))requestAnimationFrame(applyCategoryHash);

const canvas=$('#particles'),ctx=canvas.getContext('2d');let w,h,frame=0,running=!matchMedia('(prefers-reduced-motion: reduce)').matches,particles=Array.from({length:48},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.7+.4,v:Math.random()*.0006+.0002,blue:Math.random()>.5}));function resize(){w=innerWidth;h=innerHeight;canvas.width=w*devicePixelRatio;canvas.height=h*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)}resize();addEventListener('resize',resize);function draw(){if(!running)return;ctx.clearRect(0,0,w,h);for(const p of particles){p.y+=p.v;if(p.y>1)p.y=0;ctx.beginPath();ctx.fillStyle=p.blue?'#15baff88':'#ff781c88';ctx.shadowBlur=9;ctx.shadowColor=p.blue?'#00baff':'#ff7000';ctx.ellipse(p.x*w,p.y*h,p.r,p.blue?p.r*2.3:p.r,0,0,Math.PI*2);ctx.fill()}frame=requestAnimationFrame(draw)}function motion(){document.body.classList.toggle('still',!running);$('#motion').setAttribute('aria-pressed',String(running));$('#motion').innerHTML=`Efectos <span>${running?'●':'○'}</span>`}$('#motion').onclick=()=>{running=!running;cancelAnimationFrame(frame);motion();if(running)draw()};motion();draw();document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);if(!document.hidden&&running)draw()});

