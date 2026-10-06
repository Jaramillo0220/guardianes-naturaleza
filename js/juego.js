/* ══════════════════════════════════════════════════════════
   MOTOR — pantallas, estado, HUD, exploración, retos y final.
   Para probar:  index.html?libre   → todas las zonas abiertas
                 index.html?final   → salta a la pantalla final
   ══════════════════════════════════════════════════════════ */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const PARAMS = new URLSearchParams(location.search);
const MODO_LIBRE = PARAMS.has('libre');
const REDUCIDO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CLAVE = 'gdn_partida_v1';

const BARRAS = [
  { id: 'biodiversidad', nombre: 'Biodiversidad',     icono: '🌿', color: '#4f9a5b' },
  { id: 'calidad',       nombre: 'Calidad ambiental', icono: '💧', color: '#3f9cc4' },
  { id: 'clima',         nombre: 'Clima',             icono: '🌡️', color: '#e0a03a' },
  { id: 'suelo',         nombre: 'Suelo',             icono: '🌱', color: '#a3714a' },
];
const PLANETA_INICIAL = { biodiversidad: 45, calidad: 45, clima: 45, suelo: 50 };

let E = null;   /* estado de la partida */
let Z = null;   /* zona en curso */

/* ───────── estado y guardado ───────── */
function estadoNuevo() {
  return { personaje: null, nombre: '', corazones: 3, puntos: 0, planeta: { ...PLANETA_INICIAL },
           completadas: [], huellas: {}, bonusCorazones: 0, terminado: false };
}
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(E)); } catch (e) {} }
function cargar() {
  try { const s = JSON.parse(localStorage.getItem(CLAVE)); if (s && s.personaje) { s.huellas = s.huellas || {}; return s; } } catch (e) {}
  return null;
}
function borrarPartida() { try { localStorage.removeItem(CLAVE); } catch (e) {} }

/* ───────── utilidades ───────── */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function barajar(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const conNombre = t => t.replace(/\{nombre\}/g, E ? E.nombre : '');
const personajeActual = () => INTEGRANTES.find(p => p.id === (E && E.personaje)) || INTEGRANTES[1];
const minus = t => t.charAt(0).toLowerCase() + t.slice(1);
const esVertical = () => innerWidth / innerHeight < .9;
function vibrar(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }
function centro(el) { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }

/* ───────── pantallas y transición de hojas ───────── */
let pantalla = 'p-inicio', transicionando = false;

function mostrar(id) {
  $$('.pantalla').forEach(p => p.classList.toggle('activa', p.id === id));
  pantalla = id;
  const conHud = id === 'p-mapa' || id === 'p-zona';
  $('#hud').hidden = !conHud;
  if (conHud) pintarHUD();
  cerrarPanelPlaneta();
}

function irA(id, etiqueta, alMostrar) {
  if (transicionando) return;
  const t = $('#transicion');
  if (REDUCIDO) { mostrar(id); if (alMostrar) alMostrar(); return; }
  transicionando = true;
  $('#cortina-texto').textContent = etiqueta || '';
  t.classList.remove('sale'); void t.offsetWidth; t.classList.add('entra');
  setTimeout(() => {
    mostrar(id); if (alMostrar) alMostrar();
    setTimeout(() => {
      t.classList.remove('entra'); t.classList.add('sale');
      setTimeout(() => { t.classList.remove('sale'); transicionando = false; }, 520);
    }, etiqueta ? 750 : 90);
  }, 480);
}

/* ───────── HUD: corazones, puntos y planeta ───────── */
const corazonSVG = lleno => `<svg viewBox="0 0 24 22" class="cz ${lleno ? 'lleno' : 'vacio'}"><path d="M12 21 C 5 15, 1 11, 1 6.5 C 1 3.4 3.4 1 6.4 1 C 8.6 1 10.6 2.3 12 4.3 C 13.4 2.3 15.4 1 17.6 1 C 20.6 1 23 3.4 23 6.5 C 23 11 19 15 12 21 Z"/></svg>`;

function pintarHUD() {
  if (!E) return;
  const ret = $('#hud-retrato');
  if (ret.dataset.p !== E.personaje) { ret.innerHTML = animal(personajeActual().animal, 'normal', { retrato: true }); ret.dataset.p = E.personaje; }
  $('#hud-nombre').textContent = E.nombre;
  $('#hud-corazones').innerHTML = [0, 1, 2].map(i => corazonSVG(i < E.corazones)).join('');
  $('#hud-corazones').setAttribute('aria-label', `${E.corazones} de 3 corazones`);
  $('#hud-puntos').textContent = E.puntos;
  $('#hud-salud').textContent = Math.round(salud()) + '%';
}

function salud(p) { p = p || (E ? E.planeta : PLANETA_INICIAL); return (p.biodiversidad + p.calidad + p.clima + p.suelo) / 4; }

/* la salud del planeta pinta el bosque:
   promedio → color (saturación) · calidad → neblina gris · clima → calor anaranjado */
function aplicarSalud(p, instantaneo) {
  p = p || (E ? E.planeta : PLANETA_INICIAL);
  const s = salud(p), app = $('#app');
  if (instantaneo) app.classList.add('quieto');
  app.style.setProperty('--sat', clamp(.6 + (s - 50) * .0175, .2, 1.3).toFixed(3));
  app.style.setProperty('--neblina', (clamp((70 - p.calidad) / 45, 0, 1) * .5).toFixed(3));
  app.style.setProperty('--calor', (clamp((70 - p.clima) / 45, 0, 1) * .45).toFixed(3));
  if (instantaneo) { void app.offsetWidth; app.classList.remove('quieto'); }
}

function pulso(sel) { const el = $(sel); if (!el) return; el.classList.remove('pulso'); void el.offsetWidth; el.classList.add('pulso'); }

function flotar(txt, x, y, clase = '') {
  if (x == null) { const r = $('.hud-puntos').getBoundingClientRect(); x = r.left + r.width / 2; y = r.bottom + 8; }
  const d = document.createElement('div');
  d.className = 'flota ' + clase; d.textContent = txt;
  d.style.left = x + 'px'; d.style.top = y + 'px';
  $('#flotantes').appendChild(d);
  setTimeout(() => d.remove(), 1400);
}

function sumarPuntos(n, x, y) {
  if (!n) return;
  E.puntos = Math.max(0, E.puntos + n);
  flotar((n > 0 ? '+' : '') + n + ' ⭐', x, y, n > 0 ? '' : 'neg');
  pintarHUD(); pulso('.hud-puntos'); guardar();
}

function fallar(x, y) {
  Sonido.sfx.error(); vibrar([40, 50, 40]);
  if (E.corazones > 0) {
    E.corazones--;
    flotar('−1 ❤', x, y, 'neg');
    pintarHUD(); pulso('.hud-corazones'); guardar();
    if (E.corazones === 0) toast('Te quedaste sin corazones. Desde ahora cada error resta 5 ⭐.');
  } else sumarPuntos(-5, x, y);
}

function ganarCorazon(x, y) {
  if (E.corazones >= 3) return false;
  E.corazones++;
  Sonido.sfx.corazon();
  if (x == null) { [x, y] = centro($('#hud-corazones')); y += 30; }
  flotar('+1 ❤', x, y, 'cor');
  pintarHUD(); pulso('.hud-corazones'); guardar();
  return true;
}

function cambiarPlaneta(efectos) {
  const cambios = [];
  for (const [k, d] of Object.entries(efectos || {})) {
    if (!d) continue;
    const antes = E.planeta[k];
    E.planeta[k] = clamp(antes + d, 0, 100);
    cambios.push({ k, antes, despues: E.planeta[k], d: E.planeta[k] - antes });
  }
  if (!cambios.length) return cambios;
  aplicarSalud(); pintarHUD(); pintarPanelPlaneta(); guardar(); pulso('.hud-planeta');
  const [cx, cy] = centro($('#hud-planeta'));
  cambios.forEach((c, i) => {
    const b = BARRAS.find(x => x.id === c.k);
    setTimeout(() => flotar(`${b.icono} ${c.d > 0 ? '+' : ''}${c.d}%`, cx, cy + 26, c.d > 0 ? 'eco' : 'neg'), i * 280);
  });
  return cambios;
}

function filaBarra(b, v) {
  return `<div class="fila-barra"><span class="fb-nombre">${b.icono} ${b.nombre}</span><span class="fb-valor">${Math.round(v)}%</span>` +
    `<div class="barra" style="--c:${b.color}"><i style="width:${v}%"></i></div></div>`;
}
function pintarPanelPlaneta() {
  if (!E) return;
  $('#panel-planeta').innerHTML = `<h3>Estado del planeta</h3>` + BARRAS.map(b => filaBarra(b, E.planeta[b.id])).join('') +
    `<p class="nota">Tus decisiones mueven estas barras. Cuando suben, el bosque recupera su color.</p>`;
}
function alternarPanelPlaneta() {
  const p = $('#panel-planeta'), abrir = p.hidden;
  if (abrir) pintarPanelPlaneta();
  p.hidden = !abrir;
  $('#hud-planeta').setAttribute('aria-expanded', String(abrir));
}
function cerrarPanelPlaneta() { $('#panel-planeta').hidden = true; $('#hud-planeta').setAttribute('aria-expanded', 'false'); }

/* ───────── avisos ───────── */
let toastT = null;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2800);
}

function chispas(x, y) {
  for (let k = 0; k < 10; k++) {
    const c = document.createElement('i'), a = k / 10 * Math.PI * 2, d = 40 + Math.random() * 30;
    c.className = 'chispa';
    c.style.left = x + 'px'; c.style.top = y + 'px';
    c.style.setProperty('--dx', (Math.cos(a) * d).toFixed(0) + 'px');
    c.style.setProperty('--dy', (Math.sin(a) * d).toFixed(0) + 'px');
    $('#flotantes').appendChild(c);
    setTimeout(() => c.remove(), 800);
  }
}

function lluviaDeHojas(n = 26) {
  if (REDUCIDO) return;
  const colores = ['#5f9e5a', '#86c06d', '#b8d977', '#f6c453', '#f5a3c7'];
  for (let k = 0; k < n; k++) {
    const h = document.createElement('i');
    h.className = 'hoja-cae';
    h.style.left = (Math.random() * 100) + 'vw';
    h.style.background = colores[k % colores.length];
    h.style.animationDelay = (Math.random() * .8).toFixed(2) + 's';
    h.style.animationDuration = (2.2 + Math.random() * 1.4).toFixed(2) + 's';
    $('#flotantes').appendChild(h);
    setTimeout(() => h.remove(), 4600);
  }
}

function hojasAmbiente(cont, n) {
  if (REDUCIDO || cont.childElementCount) return;
  for (let k = 0; k < n; k++) {
    const h = document.createElement('i');
    h.style.left = (5 + Math.random() * 90) + '%';
    h.style.animationDelay = (-Math.random() * 12).toFixed(1) + 's';
    h.style.animationDuration = (9 + Math.random() * 6).toFixed(1) + 's';
    h.style.setProperty('--giro', (Math.random() < .5 ? -1 : 1) * (120 + Math.random() * 200) + 'deg');
    cont.appendChild(h);
  }
}

/* ───────── ventana (modal) ───────── */
let modalId = 0;
function abrirModal(html, clase = '') {
  const m = $('#modal'), t = $('#modal-tarjeta');
  modalId++;
  t.className = 'modal-tarjeta ' + clase;
  t.innerHTML = html; t.onclick = null; t.scrollTop = 0;
  m.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add('abierto')));
  return t;
}
function cerrarModal() {
  const m = $('#modal'), id = modalId;
  m.classList.remove('abierto');
  redibujarReto = null;
  return new Promise(res => setTimeout(() => { if (id === modalId) m.hidden = true; res(); }, 220));
}
const modalAbierto = () => !$('#modal').hidden;

/* ───────── diálogo con máquina de escribir ───────── */
let D = { lineas: [], i: 0, fin: null, escribiendo: false, timer: null, completo: '' };

function hablar(lineas, fin) {
  if (!lineas || !lineas.length) { if (fin) fin(); return; }
  D = { lineas, i: 0, fin, escribiendo: false, timer: null, completo: '' };
  const d = $('#dialogo');
  d.hidden = false;
  requestAnimationFrame(() => d.classList.add('abierto'));
  mostrarLinea();
}
function mostrarLinea() {
  const l = D.lineas[D.i];
  $('#dlg-retrato').innerHTML = animal(personajeActual().animal, l.expr || 'normal', { retrato: true });
  $('#dlg-nombre').textContent = E.nombre;
  escribir(conNombre(l.texto));
}
function escribir(t) {
  const el = $('#dlg-texto');
  clearInterval(D.timer);
  D.completo = t;
  if (REDUCIDO) { el.textContent = t; D.escribiendo = false; return; }
  D.escribiendo = true; el.textContent = '';
  let i = 0;
  D.timer = setInterval(() => {
    i++; el.textContent = t.slice(0, i);
    if (i % 3 === 0) Sonido.sfx.letra();
    if (i >= t.length) { clearInterval(D.timer); D.escribiendo = false; }
  }, 22);
}
function avanzarDialogo() {
  if (D.escribiendo) { clearInterval(D.timer); $('#dlg-texto').textContent = D.completo; D.escribiendo = false; return; }
  D.i++;
  if (D.i < D.lineas.length) { mostrarLinea(); return; }
  const d = $('#dialogo'); d.classList.remove('abierto');
  setTimeout(() => { if (!d.classList.contains('abierto')) d.hidden = true; }, 200);
  const f = D.fin; D.fin = null; if (f) f();
}
const dialogoAbierto = () => !$('#dialogo').hidden;

/* ───────── pantalla de inicio ───────── */
function montarInicio() {
  if (!$('#inicio-fondo').firstChild) $('#inicio-fondo').innerHTML = portada();
  $('#cuarteto').innerHTML = INTEGRANTES.map((p, i) =>
    `<div class="cuarteto-item" style="--i:${i}">${animal(p.animal, i === 1 || i === 2 ? 'feliz' : 'normal')}</div>`).join('');
  hojasAmbiente($('#p-inicio .hojas'), 8);
  const s = cargar();
  $('#btn-continuar').hidden = !(s && !s.terminado);
}

function mostrarAyuda() {
  const t = abrirModal(`<h2>¿Cómo jugar?</h2>
    <ul class="lista-ayuda">
      <li><span>🔍</span><p>Explora cada zona del bosque y toca los objetos escondidos. En celular, desliza para ver toda la escena.</p></li>
      <li><span>🧩</span><p>Resuelve el reto de cada zona para abrir la siguiente en el sendero.</p></li>
      <li><span>❤️</span><p>Tienes 3 corazones. Cada error te quita uno; algunas semillas te lo devuelven.</p></li>
      <li><span>🌎</span><p>Tus decisiones cambian el estado del planeta. Mientras mejor lo cuides, más color tendrá el bosque.</p></li>
      <li><span>⭐</span><p>Al final verás tu puntuación y tu rango de guardián.</p></li>
    </ul>
    <button class="btn btn-madera" data-accion="cerrar">Entendido</button>`, 'tarjeta-ayuda');
  t.onclick = e => { if (e.target.closest('[data-accion="cerrar"]')) { Sonido.sfx.clic(); cerrarModal(); } };
}

/* ───────── selección de personaje ───────── */
let elegido = null;
function montarPersonaje() {
  if (!$('#personaje-fondo').firstChild) $('#personaje-fondo').innerHTML = portada();
  elegido = null;
  $('#tarjetas').innerHTML = INTEGRANTES.map(p =>
    `<button class="tarjeta" role="radio" aria-checked="false" data-id="${p.id}">` +
    `<span class="tarjeta-animal">${animal(p.animal, 'normal')}</span>` +
    `<span class="tarjeta-nombre">${p.integrante}</span><span class="tarjeta-especie">${p.especie}</span></button>`).join('');
  $('#nombre-panel').hidden = true;
}
function elegirPersonaje(id) {
  elegido = id;
  const p = INTEGRANTES.find(x => x.id === id);
  $$('.tarjeta').forEach(t => {
    const si = t.dataset.id === id;
    t.setAttribute('aria-checked', String(si));
    const q = INTEGRANTES.find(x => x.id === t.dataset.id);
    t.querySelector('.tarjeta-animal').innerHTML = animal(q.animal, si ? 'feliz' : 'normal');
  });
  Sonido.sfx.clic();
  const inp = $('#input-nombre');
  inp.value = p.integrante;
  $('#nombre-panel').hidden = false;
  if (innerWidth < 700) $('#nombre-panel').scrollIntoView({ behavior: REDUCIDO ? 'auto' : 'smooth', block: 'nearest' });
}
function entrarAlBosque() {
  if (!elegido) return;
  const p = INTEGRANTES.find(x => x.id === elegido);
  const nombre = $('#input-nombre').value.replace(/\s+/g, ' ').trim().slice(0, 14) || p.integrante;
  borrarPartida();
  E = estadoNuevo(); E.personaje = elegido; E.nombre = nombre;
  guardar(); aplicarSalud();
  Sonido.sfx.desbloquear();
  irA('p-mapa', '', () => {
    montarMapa(); Sonido.musica('mapa');
    setTimeout(() => hablar([
      { expr: 'feliz', texto: '¡Hola! Soy {nombre}, guardián del bosque. Este sendero lo cruza de punta a punta.' },
      { expr: 'normal', texto: 'Cada zona que cuides abre la siguiente. Empecemos por el claro del pueblo.' },
    ]), 650);
  });
}

/* ───────── mapa ───────── */
const zonasJugables = () => ZONAS.filter(z => !z.pendiente);

function estadoNodo(i) {
  if (i === ZONAS.length) return zonasJugables().every(z => E.completadas.includes(z.id)) || E.terminado || MODO_LIBRE ? 'disponible' : 'bloqueado';
  const z = ZONAS[i];
  if (E.completadas.includes(z.id)) return 'completada';
  if (MODO_LIBRE || i === 0 || E.completadas.includes(ZONAS[i - 1].id)) return 'disponible';
  return 'bloqueado';
}

/* color del río según la calidad ambiental: café turbio → azul limpio */
function colorRio(c) {
  const k = clamp((c - 25) / 55, 0, 1), A = [143, 136, 92], B = [108, 195, 230];
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
}

/* aplica el estado del planeta y las huellas de cada zona a los elementos del mapa */
function aplicarEstadoMapa(p, h) {
  const cap = $('#mapa-capa');
  $$('.u-bio', cap).forEach(g => g.classList.toggle('on', p.biodiversidad >= +g.dataset.t));
  $$('.u-seco', cap).forEach(g => g.classList.toggle('on', p.suelo < +g.dataset.t));
  $$('.u-basura', cap).forEach(g => g.classList.toggle('on', p.calidad < +g.dataset.t));
  cap.style.setProperty('--rio', colorRio(p.calidad));
  $$('.huella-zona', cap).forEach(g => { g.dataset.h = (h && h[g.dataset.z]) || ''; });
}

let mapaVertical = null;
/* vista = { planeta, huellas } dibuja un estado anterior (justo antes de la revelación) */
function montarMapa(vista) {
  const v = esVertical(), o = v ? 'v' : 'h';
  mapaVertical = v;
  const nodos = ZONAS.map((z, i) => ({ x: z.mapa[o][0], y: z.mapa[o][1], zid: z.id, icono: z.icono, nombre: z.nombre,
    estado: estadoNodo(i), bioma: z.bioma, decor: z.decor }));
  nodos.push({ x: META.mapa[o][0], y: META.mapa[o][1], icono: META.icono, nombre: META.nombre,
    estado: estadoNodo(ZONAS.length), bioma: META.bioma });
  let j = nodos.findIndex((n, i) => n.estado === 'disponible' && i < ZONAS.length && !ZONAS[i].pendiente);
  if (j < 0 && nodos[ZONAS.length].estado === 'disponible') j = ZONAS.length;
  if (j < 0) j = Math.max(0, ...nodos.map((n, i) => n.estado === 'completada' ? i : 0));
  $('#mapa-capa').innerHTML = dibujarMapa({ vertical: v, nodos, jugador: j, animal: personajeActual().animal });
  aplicarEstadoMapa((vista && vista.planeta) || E.planeta, (vista && vista.huellas) || E.huellas);
  const todas = zonasJugables().every(z => E.completadas.includes(z.id));
  $('#mapa-pie').textContent = !todas ? 'Toca la zona que brilla para entrar.'
    : ZONAS.some(z => z.pendiente) ? 'Las demás zonas llegan pronto. Toca el trofeo para ver tu resultado.'
    : 'Recorriste todo el bosque. Toca el trofeo para ver tu resultado.';
}

function tocarNodo(i, el) {
  if (dialogoAbierto() || modalAbierto() || transicionando) return;
  const st = estadoNodo(i);
  const sacude = () => { el.classList.remove('sacude'); void el.getBBox(); el.classList.add('sacude'); };
  if (i === ZONAS.length) {
    if (st === 'disponible') { Sonido.sfx.clic(); irFinal(); }
    else { Sonido.sfx.bloqueo(); sacude(); toast('Cuida todas las zonas para ver tu resultado.'); }
    return;
  }
  const z = ZONAS[i];
  if (st === 'bloqueado') { Sonido.sfx.bloqueo(); sacude(); toast('Primero cuida la zona anterior del sendero.'); return; }
  if (st === 'completada') { toast(`Ya cuidaste ${z.nombre.charAt(0).toLowerCase() + z.nombre.slice(1)}.`); return; }
  if (z.pendiente) { Sonido.sfx.bloqueo(); toast('Esta zona todavía se está construyendo.'); return; }
  Sonido.sfx.clic();
  entrarZona(i);
}

/* ───────── zona: escena explorable ───────── */
let panX = 0, panLim = 0, escala = 1, arrastre = null, ultimoArrastre = 0;

function entrarZona(i) {
  const def = ZONAS[i];
  Z = { def, i, encontrados: new Set(), fase: 'cargando', puntos0: E.puntos, salud0: salud(), pistaT: null,
        planeta0: { ...E.planeta }, huellas0: { ...E.huellas }, marcas: [], acciones: {} };
  $('#ver-escena').hidden = true;
  irA('p-zona', def.nombre, () => {
    montarEscena(def);
    Sonido.musica(def.musica);
    $('#objetivo').hidden = true;
    setTimeout(iniciarZona, 300);
  });
}

function montarEscena(def) {
  const objs = def.objetos.map((o, k) =>
    `<g class="obj" data-id="${o.id}" transform="translate(${o.x} ${o.y}) scale(${o.escala || 1})" role="button" tabindex="0" aria-label="Algo escondido">` +
    `<circle class="halo" r="50"/><g class="obj-dibujo">${OBJETOS[o.dibujo || o.id]}</g>` +
    `<g transform="translate(24 -32)"><path class="brillo" style="animation-delay:${(k * .8).toFixed(1)}s" d="${ESTRELLA}"/></g>` +
    `<circle class="toque" r="54" fill="transparent"/></g>`).join('');
  $('#escena-capa').innerHTML = ESCENAS[def.escena](objs);
  $('#escena-capa svg').classList.add('saludable');
  panX = 0;
  ajustarEscena();
  if (def.camaraX) panHacia(def.camaraX);
}

function ajustarEscena() {
  const capa = $('#escena-capa'), svg = capa.querySelector('svg');
  if (!svg) return;
  const W = capa.clientWidth, H = capa.clientHeight;
  if (!W || !H) return;
  escala = Math.max(W / 800, H / 600);
  svg.style.width = (800 * escala) + 'px';
  svg.style.height = (600 * escala) + 'px';
  panLim = Math.max(0, (800 * escala - W) / 2);
  panX = clamp(panX, -panLim, panLim);
  aplicarPan();
}
function aplicarPan() { $('#escena-capa').style.setProperty('--pan', panX.toFixed(1) + 'px'); }
function panHacia(xSvg) { panX = clamp((400 - xSvg) * escala, -panLim, panLim); aplicarPan(); }

function iniciarZona() {
  Z.fase = 'intro';
  hablar(Z.def.intro, () => {
    Z.fase = 'explorar';
    pintarObjetivo(); $('#objetivo').hidden = false;
    if (panLim > 40) {
      const a = $('#pista-paneo');
      a.innerHTML = '<span class="mano">👆</span> Desliza para explorar';
      a.classList.add('show');
      setTimeout(() => a.classList.remove('show'), 3200);
    }
    reiniciarPista();
  });
}

function requeridos() { return Z.def.objetos.filter(o => !o.bonus); }
function pintarObjetivo() {
  const req = requeridos(), n = req.filter(o => Z.encontrados.has(o.id)).length;
  $('#objetivo').innerHTML = `<span aria-hidden="true">${Z.def.objetivo.icono}</span> ${Z.def.objetivo.texto} <b>${n}/${req.length}</b>`;
}

function reiniciarPista() {
  if (!Z) return;
  clearTimeout(Z.pistaT);
  if (Z.fase !== 'explorar') return;
  Z.pistaT = setTimeout(darPista, 17000);
}
function darPista() {
  if (!Z || Z.fase !== 'explorar') return;
  if (modalAbierto() || dialogoAbierto()) { reiniciarPista(); return; }
  const o = requeridos().find(o => !Z.encontrados.has(o.id));
  if (!o) return;
  const el = $(`.obj[data-id="${o.id}"]`);
  if (el.classList.contains('pista')) return;
  el.classList.add('pista');
  panHacia(o.x);
  toast('Mira lo que brilla…');
}

function tocarObjeto(id, el) {
  if (!Z || Z.fase !== 'explorar' || modalAbierto() || dialogoAbierto() || Z.encontrados.has(id)) return;
  const o = Z.def.objetos.find(x => x.id === id);
  Z.encontrados.add(id);
  el.classList.add(o.accion ? 'revisado' : 'encontrado'); el.classList.remove('pista');
  Sonido.sfx.encontrar(); vibrar(25);
  const [x, y] = centro(el);
  chispas(x, y);
  reiniciarPista();
  const req = requeridos(), faltan = req.filter(r => !Z.encontrados.has(r.id)).length;

  setTimeout(() => {
    if (o.accion) { if (o.puntos) sumarPuntos(o.puntos); pintarObjetivo(); abrirAccion(o, el, faltan); return; }
    const premios = [];
    let pts = o.puntos || 0;
    if (o.corazon) { if (ganarCorazon()) premios.push('+1 ❤'); else pts += 5; }
    if (pts) { sumarPuntos(pts); premios.unshift(`+${pts} ⭐`); }
    if (o.efectos) cambiarPlaneta(o.efectos);
    cambiarEscena(o.escena);
    pintarObjetivo();
    const t = abrirModal(`<div class="obj-grande"><svg viewBox="-55 -58 110 110">${OBJETOS[o.dibujo || o.id]}</svg></div>
      <p class="hallazgo">${o.bonus ? 'Encontraste un extra' : 'Encontraste algo'}</p>
      <h2>${esc(o.titulo)}</h2><p>${esc(o.texto)}</p>
      <div class="premios">${premios.map(p => `<span class="premio">${p}</span>`).join('')}</div>
      <button class="btn btn-madera" data-accion="seguir">${!o.bonus && faltan === 0 ? 'Continuar' : 'Seguir explorando'}</button>`, 'tarjeta-objeto');
    t.onclick = e => {
      if (!e.target.closest('[data-accion="seguir"]')) return;
      Sonido.sfx.clic();
      cerrarModal().then(() => { if (!o.bonus && faltan === 0) terminarExploracion(); });
    };
  }, 420);
}

function terminarExploracion() {
  Z.fase = 'reto';
  clearTimeout(Z.pistaT);
  $('#objetivo').hidden = true;
  hablar(Z.def.antesDelReto, () => correrRetos(0));
}

/* ───────── retos ───────── */
let redibujarReto = null;

function correrRetos(k) {
  const r = Z.def.retos[k];
  if (!r) { completarZona(); return; }
  const sigue = () => correrRetos(k + 1);
  if (r.tipo === 'relacionar') retoRelacionar(r, sigue);
  else if (r.tipo === 'seleccionar') retoSeleccionar(r, sigue);
  else if (r.tipo === 'ordenar') retoOrdenar(r, sigue);
  else if (r.tipo === 'clasificar') retoClasificar(r, sigue);
  else if (r.tipo === 'decision') retoDecision(r, sigue);
  else if (r.tipo === 'plan') retoPlan(r, sigue);
  else sigue();
}

function cambiarEscena(claves) {
  [].concat(claves || []).forEach(c => $$(`#escena-capa [data-c="${c}"]`).forEach(g => g.classList.add('resuelto')));
}

function colorBarra(id) { const b = BARRAS.find(x => x.id === id); return b ? b.color : '#5f9e5a'; }

function retoRelacionar(r, fin) {
  const izq = r.pares.map((p, i) => ({ i, ...p.a }));
  let der = barajar(r.pares.map((p, i) => ({ i, ...p.b })));
  if (der.every((x, k) => x.i === k)) der.push(der.shift());
  const pieza = (x, lado) => `<button class="pieza" data-lado="${lado}" data-i="${x.i}"><span class="pieza-icono" aria-hidden="true">${x.icono}</span><span>${esc(x.texto)}</span></button>`;
  const t = abrirModal(`<div class="reto-cab"><span class="etiqueta-reto">🧩 Reto</span><h2>${esc(r.titulo)}</h2><p>${esc(r.enunciado)}</p></div>
    <div class="rel"><svg class="rel-lineas" aria-hidden="true"></svg>
      <div class="col">${izq.map(x => pieza(x, 'a')).join('')}</div>
      <div class="col">${der.map(x => pieza(x, 'b')).join('')}</div></div>
    <p class="reto-ayuda">${esc(r.ayuda || 'Toca una opción de cada columna para unirlas.')}</p><div class="reto-fin"></div>`, 'tarjeta-reto');

  let sel = null;
  const hechos = [];
  const lineas = () => {
    const cont = t.querySelector('.rel'), svg = t.querySelector('.rel-lineas'), R = cont.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${R.width.toFixed(0)} ${R.height.toFixed(0)}`);
    svg.innerHTML = hechos.map(i => {
      const a = t.querySelector(`.pieza[data-lado="a"][data-i="${i}"]`).getBoundingClientRect();
      const b = t.querySelector(`.pieza[data-lado="b"][data-i="${i}"]`).getBoundingClientRect();
      const x1 = a.right - R.left, y1 = a.top + a.height / 2 - R.top, x2 = b.left - R.left, y2 = b.top + b.height / 2 - R.top, m = (x1 + x2) / 2;
      const c = colorBarra(r.pares[i].barra);
      return `<path d="M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2} ${y2}" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>` +
        `<circle cx="${x1}" cy="${y1}" r="5" fill="${c}"/><circle cx="${x2}" cy="${y2}" r="5" fill="${c}"/>`;
    }).join('');
  };
  redibujarReto = lineas;

  t.onclick = e => {
    if (e.target.closest('[data-accion="continuar"]')) { Sonido.sfx.clic(); cerrarModal().then(fin); return; }
    const b = e.target.closest('.pieza');
    if (!b || b.disabled) return;
    if (!sel) { sel = b; b.classList.add('sel'); Sonido.sfx.clic(); return; }
    if (sel === b) { b.classList.remove('sel'); sel = null; return; }
    if (sel.dataset.lado === b.dataset.lado) { sel.classList.remove('sel'); sel = b; b.classList.add('sel'); Sonido.sfx.clic(); return; }
    const pa = sel.dataset.lado === 'a' ? sel : b, pb = sel.dataset.lado === 'a' ? b : sel;
    sel.classList.remove('sel'); sel = null;
    const [x, y] = centro(pb);
    if (pa.dataset.i === pb.dataset.i) {
      const par = r.pares[+pa.dataset.i];
      [pa, pb].forEach(p => { p.classList.add('hecho'); p.disabled = true; p.style.setProperty('--c', colorBarra(par.barra)); });
      hechos.push(+pa.dataset.i); lineas();
      Sonido.sfx.acierto(); vibrar(20);
      sumarPuntos(r.puntos || 10, x, y);
      cambiarPlaneta({ [par.barra]: par.delta });
      cambiarEscena(par.escena);
      if (hechos.length === r.pares.length) {
        setTimeout(() => {
          t.querySelector('.reto-ayuda').hidden = true;
          const f = t.querySelector('.reto-fin');
          f.innerHTML = `<div class="resultado buena"><p>${esc(r.cierre)}</p></div><button class="btn btn-madera" data-accion="continuar">Continuar</button>`;
          f.scrollIntoView({ behavior: REDUCIDO ? 'auto' : 'smooth', block: 'end' });
        }, 450);
      }
    } else {
      [pa, pb].forEach(p => { p.classList.remove('mal'); void p.offsetWidth; p.classList.add('mal'); });
      fallar(x, y);
    }
  };
}

function filaCambio(c) {
  const b = BARRAS.find(x => x.id === c.k);
  return `<div class="cambio"><span class="cb-nombre">${b.icono} ${b.nombre}</span>` +
    `<div class="barra" style="--c:${b.color}"><i data-a="${c.despues}" style="width:${c.antes}%"></i></div>` +
    `<b class="${c.d > 0 ? 'sube' : 'baja'}">${c.d > 0 ? '+' : ''}${c.d}%</b></div>`;
}
function animarBarras(cont) {
  requestAnimationFrame(() => requestAnimationFrame(() => $$('.barra i[data-a]', cont).forEach(i => { i.style.width = i.dataset.a + '%'; })));
}

function retoDecision(r, fin) {
  const t = abrirModal(`<div class="reto-cab"><span class="etiqueta-reto">🤔 Decisión</span><h2>${esc(r.titulo)}</h2><p>${esc(r.enunciado)}</p></div>
    <div class="opciones">${r.opciones.map((o, k) => `<button class="opcion" data-k="${k}"><span class="op-icono" aria-hidden="true">${o.icono}</span><span>${esc(o.texto)}</span></button>`).join('')}</div>
    <div class="reto-fin"></div>`, 'tarjeta-reto');
  let hecho = false;
  t.onclick = e => {
    if (e.target.closest('[data-accion="continuar"]')) { Sonido.sfx.clic(); cerrarModal().then(fin); return; }
    const b = e.target.closest('.opcion');
    if (!b || hecho) return;
    hecho = true;
    const o = r.opciones[+b.dataset.k];
    E.huellas[Z.def.id] = o.tipo; guardar();
    if (o.foco) Z.marcas.push({ f: o.foco, tipo: o.tipo });
    $$('.opcion', t).forEach(x => { x.disabled = true; if (x !== b) x.classList.add('apagada'); });
    b.classList.add('elegida', o.tipo);
    const [x, y] = centro(b);
    if (o.tipo === 'mala') fallar(x, y);
    else { Sonido.sfx[o.tipo === 'buena' ? 'acierto' : 'regular'](); vibrar(20); }
    sumarPuntos(o.puntos || 0, x, y);
    const cambios = cambiarPlaneta(o.efectos);
    cambiarEscena(o.escena);
    const titulo = { buena: '¡Buena decisión!', regular: 'Casi…', mala: 'Esto tuvo consecuencias' }[o.tipo];
    const f = t.querySelector('.reto-fin');
    f.innerHTML = `<div class="resultado ${o.tipo}"><p class="res-titulo">${titulo}</p><p>${esc(o.feedback)}</p>` +
      (cambios.length ? `<div class="cambios">${cambios.map(filaCambio).join('')}</div>` : '') +
      `</div><button class="btn btn-madera" data-accion="continuar">Continuar</button>`;
    animarBarras(f);
    setTimeout(() => f.scrollIntoView({ behavior: REDUCIDO ? 'auto' : 'smooth', block: 'end' }), 60);
  };
}

function cabReto(etiqueta, r) {
  return `<div class="reto-cab"><span class="etiqueta-reto">${etiqueta}</span><h2>${esc(r.titulo)}</h2><p>${esc(r.enunciado)}</p></div>`;
}
function mostrarCierre(t, texto) {
  setTimeout(() => {
    const a = t.querySelector('.reto-ayuda'); if (a) a.hidden = true;
    const f = t.querySelector('.reto-fin');
    f.innerHTML = `<div class="resultado buena"><p>${esc(texto)}</p></div><button class="btn btn-madera" data-accion="continuar">Continuar</button>`;
    f.scrollIntoView({ behavior: REDUCIDO ? 'auto' : 'smooth', block: 'end' });
  }, 450);
}
const sacudir = el => { el.classList.remove('mal'); void el.offsetWidth; el.classList.add('mal'); };

/* ── seleccionar: encontrar todas las opciones correctas ── */
function retoSeleccionar(r, fin) {
  const total = r.opciones.filter(o => o.correcta).length;
  const ops = barajar(r.opciones.map((o, k) => ({ ...o, k })));
  const t = abrirModal(`${cabReto('🧩 Reto', r)}
    <p class="contador">Encontradas <b>0</b> de ${total}</p>
    <div class="selec">${ops.map(o => `<button class="opcion sel-op" data-k="${o.k}"><span class="op-icono" aria-hidden="true">${o.icono}</span>` +
      `<span class="op-txt">${esc(o.texto)}<small class="op-explica"></small></span></button>`).join('')}</div>
    <div class="reto-fin"></div>`, 'tarjeta-reto');
  let n = 0;
  t.onclick = e => {
    if (e.target.closest('[data-accion="continuar"]')) { Sonido.sfx.clic(); cerrarModal().then(fin); return; }
    const b = e.target.closest('.sel-op');
    if (!b || b.disabled || n >= total) return;
    const o = r.opciones[+b.dataset.k], [x, y] = centro(b);
    b.disabled = true;
    b.querySelector('.op-explica').textContent = o.explica || '';
    if (!o.correcta) { b.classList.add('elegida', 'mala'); fallar(x, y); return; }
    n++; b.classList.add('elegida', 'buena');
    Sonido.sfx.acierto(); vibrar(20);
    sumarPuntos(r.puntos || 10, x, y);
    if (o.barra) cambiarPlaneta({ [o.barra]: o.delta || 0 });
    cambiarEscena(o.escena);
    t.querySelector('.contador b').textContent = n;
    if (n === total) {
      $$('.sel-op', t).forEach(q => { if (!q.disabled) { q.disabled = true; q.classList.add('apagada'); } });
      mostrarCierre(t, r.cierre);
    }
  };
}

/* ── ordenar: tocar los pasos de una cadena en orden ── */
function retoOrdenar(r, fin) {
  const N = r.pasos.length;
  const mazo = barajar(r.pasos.map((p, i) => ({ ...p, i })));
  if (mazo.every((x, k) => x.i === k)) mazo.push(mazo.shift());
  const t = abrirModal(`${cabReto('🔗 Reto', r)}
    <ol class="cadena">${r.pasos.map((p, i) => `<li class="ranura" data-i="${i}"><span class="ranura-num">${i + 1}</span><span class="ranura-txt">?</span></li>`).join('')}</ol>
    <div class="mazo">${mazo.map(p => `<button class="pieza carta" data-i="${p.i}"><span class="pieza-icono" aria-hidden="true">${p.icono}</span><span>${esc(p.texto)}</span></button>`).join('')}</div>
    <p class="reto-ayuda">${esc(r.ayuda || '¿Qué pasa primero?')}</p><div class="reto-fin"></div>`, 'tarjeta-reto');
  let sig = 0;
  t.onclick = e => {
    if (e.target.closest('[data-accion="continuar"]')) { Sonido.sfx.clic(); cerrarModal().then(fin); return; }
    const b = e.target.closest('.carta');
    if (!b || b.disabled || sig >= N) return;
    const [x, y] = centro(b);
    if (+b.dataset.i !== sig) { sacudir(b); fallar(x, y); return; }
    const p = r.pasos[sig], ran = t.querySelector(`.ranura[data-i="${sig}"]`);
    ran.querySelector('.ranura-txt').innerHTML = `<span aria-hidden="true">${p.icono}</span> ${esc(p.texto)}`;
    ran.classList.add('puesta');
    b.disabled = true; b.classList.add('usada');
    Sonido.sfx.acierto(); vibrar(20);
    sumarPuntos(r.puntos || 10, x, y);
    sig++;
    if (sig < N) { t.querySelector('.reto-ayuda').textContent = '¿Y después?'; return; }
    if (r.efectos) cambiarPlaneta(r.efectos);
    cambiarEscena(r.escena);
    mostrarCierre(t, r.cierre);
  };
}

/* ── clasificar: mandar cada tarjeta a su grupo ── */
function retoClasificar(r, fin) {
  const items = barajar(r.items);
  const t = abrirModal(`${cabReto('🗂️ Reto', r)}
    <div class="clas-actual" aria-live="polite"></div>
    <div class="botes">${r.grupos.map(g => `<button class="bote" data-g="${g.id}"><span class="bote-icono" aria-hidden="true">${g.icono}</span>` +
      `<span class="bote-nombre">${esc(g.nombre)}</span><span class="bote-n">0</span></button>`).join('')}</div>
    <p class="reto-ayuda">${esc(r.ayuda || 'Tarjeta')} <b class="clas-cuenta"></b></p><div class="reto-fin"></div>`, 'tarjeta-reto');
  let i = 0, ocupado = false;
  const pintar = () => {
    const it = items[i];
    t.querySelector('.clas-actual').innerHTML = `<div class="clas-item"><span class="ci-icono" aria-hidden="true">${it.icono}</span><span>${esc(it.texto)}</span></div>`;
    t.querySelector('.clas-cuenta').textContent = `${i + 1} de ${items.length}`;
  };
  pintar();
  t.onclick = e => {
    if (e.target.closest('[data-accion="continuar"]')) { Sonido.sfx.clic(); cerrarModal().then(fin); return; }
    const b = e.target.closest('.bote');
    if (!b || b.disabled || ocupado || i >= items.length) return;
    const it = items[i], card = t.querySelector('.clas-item'), [x, y] = centro(b);
    if (b.dataset.g !== it.grupo) { sacudir(card); sacudir(b); fallar(x, y); return; }
    ocupado = true;
    const g = r.grupos.find(q => q.id === it.grupo);
    Sonido.sfx.acierto(); vibrar(20);
    sumarPuntos(r.puntos || 5, x, y);
    if (g.barra) cambiarPlaneta({ [g.barra]: g.delta || 0 });
    const n = b.querySelector('.bote-n'); n.textContent = +n.textContent + 1;
    b.classList.remove('pulso'); void b.offsetWidth; b.classList.add('pulso');
    card.classList.add('va');
    setTimeout(() => {
      i++; ocupado = false;
      if (i < items.length) { pintar(); return; }
      t.querySelector('.clas-actual').hidden = true;
      $$('.bote', t).forEach(q => { q.disabled = true; });
      mostrarCierre(t, r.cierre);
    }, 380);
  };
}

/* ───────── regreso al sendero: el mapa muestra lo que cambió ───────── */
let revT = null;
function volverAlSendero() {
  $('#ver-escena').hidden = true;
  const def = Z.def, idx = Z.i, p0 = Z.planeta0, h0 = Z.huellas0, s0 = salud(p0), s1 = salud();
  irA('p-mapa', '', () => {
    aplicarSalud(p0, true);
    montarMapa({ planeta: p0, huellas: h0 });
    $('#hud-salud').textContent = Math.round(s0) + '%';
    Sonido.musica('mapa');
    setTimeout(() => revelar(def, idx, s0, s1), 1150);
  });
}

function revelar(def, idx, s0, s1) {
  if (pantalla !== 'p-mapa') return;
  const app = $('#app'), cap = $('#mapa-capa');
  app.classList.add('revelando'); cap.classList.add('lento');
  aplicarSalud(E.planeta);
  aplicarEstadoMapa(E.planeta, E.huellas);
  contarSalud(s0, s1);
  const d = Math.round(s1) - Math.round(s0);
  const clase = d > 0 ? 'sube' : d < 0 ? 'baja' : 'igual';
  const titulo = { sube: 'El bosque recuperó color', baja: 'El bosque perdió color', igual: 'El bosque sigue igual' }[clase];
  const huella = def.huellas && def.huellas[E.huellas[def.id]];
  const b = $('#revelacion');
  b.className = 'revelacion ' + clase;
  b.innerHTML = `<p class="rev-cifra">🌎 ${Math.round(s0)}% <span aria-hidden="true">→</span> ${Math.round(s1)}%</p>` +
    `<p class="rev-titulo">${titulo}</p>${huella ? `<p class="rev-texto">${esc(huella)}</p>` : ''}`;
  b.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add('show')));
  (clase === 'baja' ? Sonido.sfx.empeora : Sonido.sfx.mejora)();
  clearTimeout(revT); revT = setTimeout(cerrarRevelacion, 5600);
  setTimeout(() => {
    app.classList.remove('revelando'); cap.classList.remove('lento');
    const sig = $(`#mapa-capa .nodo[data-i="${idx + 1}"]`);
    if (sig && sig.classList.contains('disponible')) { sig.classList.add('recien'); Sonido.sfx.desbloquear(); }
  }, 2900);
}
function cerrarRevelacion() {
  const b = $('#revelacion');
  b.classList.remove('show');
  setTimeout(() => { if (!b.classList.contains('show')) b.hidden = true; }, 320);
}
function contarSalud(a, b) {
  const el = $('#hud-salud'), t0 = performance.now(), dur = 2200;
  const paso = ahora => {
    const k = Math.min(1, (ahora - t0) / dur);
    el.textContent = Math.round(a + (b - a) * k) + '%';
    if (k < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
  pulso('.hud-planeta');
}

/* 2 o más de 3 buenas → regular; todas → buena */
function huellaPorConteo(buenas, total) {
  return buenas === total ? 'buena' : buenas * 2 >= total ? 'regular' : 'mala';
}

/* ── zona dañada: se repara (o empeora) en el mismo lugar donde se encontró ── */
function abrirAccion(o, el, faltan) {
  const ops = barajar(o.accion.opciones.map((p, k) => ({ ...p, k })));
  const t = abrirModal(`<div class="obj-grande"><svg viewBox="-55 -58 110 110">${OBJETOS[o.dibujo || o.id]}</svg></div>
    <p class="hallazgo">Encontraste una zona dañada</p><h2>${esc(o.titulo)}</h2><p>${esc(o.texto)}</p>
    <p class="accion-pregunta">${esc(o.accion.pregunta || '¿Qué hacemos aquí?')}</p>
    <div class="opciones">${ops.map(p => `<button class="opcion" data-k="${p.k}"><span class="op-icono" aria-hidden="true">${p.icono}</span><span>${esc(p.texto)}</span></button>`).join('')}</div>
    <div class="reto-fin"></div>`, 'tarjeta-reto');
  let hecho = false;
  t.onclick = e => {
    if (e.target.closest('[data-accion="seguir"]')) {
      Sonido.sfx.clic();
      cerrarModal().then(() => { if (faltan === 0) terminarExploracion(); });
      return;
    }
    const b = e.target.closest('.opcion');
    if (!b || hecho) return;
    hecho = true;
    const p = o.accion.opciones[+b.dataset.k], [x, y] = centro(b);
    $$('.opcion', t).forEach(q => { q.disabled = true; if (q !== b) q.classList.add('apagada'); });
    b.classList.add('elegida', p.tipo);
    Z.acciones[o.id] = p.tipo;
    Z.marcas.push({ f: [o.x, o.y, 70], tipo: p.tipo });
    const v = Object.values(Z.acciones);
    E.huellas[Z.def.id] = huellaPorConteo(v.filter(q => q === 'buena').length, Z.def.objetos.filter(q => q.accion).length);
    if (p.tipo === 'mala') fallar(x, y); else { Sonido.sfx.acierto(); vibrar(20); }
    sumarPuntos(p.puntos || 0, x, y);
    const cambios = cambiarPlaneta(p.efectos);
    cambiarEscena(p.escena);
    el.classList.add('hecho');
    const titulo = p.tipo === 'buena' ? '¡Buena decisión!' : 'Esto tuvo consecuencias';
    const f = t.querySelector('.reto-fin');
    f.innerHTML = `<div class="resultado ${p.tipo}"><p class="res-titulo">${titulo}</p><p>${esc(p.feedback)}</p>` +
      (cambios.length ? `<div class="cambios">${cambios.map(filaCambio).join('')}</div>` : '') +
      `</div><button class="btn btn-madera" data-accion="seguir">${faltan === 0 ? 'Continuar' : 'Seguir explorando'}</button>`;
    animarBarras(f);
    setTimeout(() => f.scrollIntoView({ behavior: REDUCIDO ? 'auto' : 'smooth', block: 'end' }), 60);
  };
}

/* ── plan: elegir una opción por necesidad y aprobar todo junto ── */
function retoPlan(r, fin) {
  const N = r.necesidades.length, elegido = {};
  const t = abrirModal(`${cabReto('📋 Plan', r)}
    <div class="plan">${r.necesidades.map((n, i) => `<div class="plan-fila">
      <p class="plan-nec"><span aria-hidden="true">${n.icono}</span> ${esc(n.nombre)}</p>
      <div class="plan-ops">${barajar(n.opciones.map((o, k) => ({ ...o, k }))).map(o =>
        `<button class="opcion plan-op" data-n="${i}" data-k="${o.k}" aria-pressed="false"><span class="op-icono" aria-hidden="true">${o.icono}</span>` +
        `<span class="op-txt">${esc(o.texto)}<small class="op-explica"></small></span></button>`).join('')}</div></div>`).join('')}</div>
    <div class="reto-fin"><button class="btn btn-madera" data-accion="aprobar" disabled>Aprobar el plan</button></div>`, 'tarjeta-reto');
  let aprobado = false;
  t.onclick = e => {
    if (e.target.closest('[data-accion="continuar"]')) { Sonido.sfx.clic(); cerrarModal().then(fin); return; }
    if (e.target.closest('[data-accion="aprobar"]')) { aprobar(); return; }
    const b = e.target.closest('.plan-op');
    if (!b || aprobado) return;
    Sonido.sfx.clic();
    elegido[b.dataset.n] = +b.dataset.k;
    $$(`.plan-op[data-n="${b.dataset.n}"]`, t).forEach(q => q.setAttribute('aria-pressed', String(q === b)));
    t.querySelector('[data-accion="aprobar"]').disabled = Object.keys(elegido).length < N;
  };
  function aprobar() {
    if (aprobado || Object.keys(elegido).length < N) return;
    aprobado = true;
    let buenas = 0;
    const efectos = {}, escenas = [];
    r.necesidades.forEach((n, i) => {
      const o = n.opciones[elegido[i]], b = t.querySelector(`.plan-op[data-n="${i}"][data-k="${elegido[i]}"]`);
      $$(`.plan-op[data-n="${i}"]`, t).forEach(q => { q.disabled = true; if (q !== b) q.classList.add('apagada'); });
      b.classList.add('elegida', o.tipo);
      b.querySelector('.op-explica').textContent = o.explica || '';
      if (o.tipo === 'buena') buenas++;
      for (const [k, d] of Object.entries(o.efectos || {})) efectos[k] = (efectos[k] || 0) + d;
      escenas.push(...[].concat(o.escena || []));
      if (o.foco) Z.marcas.push({ f: o.foco, tipo: o.tipo });
    });
    const tipo = huellaPorConteo(buenas, N), malas = N - buenas;
    E.huellas[Z.def.id] = tipo; guardar();
    const [x, y] = centro(t.querySelector('.plan'));
    if (malas) for (let k = 0; k < malas; k++) setTimeout(() => fallar(x, y), k * 420);
    else { Sonido.sfx.acierto(); vibrar(20); }
    sumarPuntos(buenas * (r.puntos || 10), x, y);
    const cambios = cambiarPlaneta(efectos);
    cambiarEscena(escenas);
    const f = t.querySelector('.reto-fin');
    f.innerHTML = `<div class="resultado ${tipo}"><p class="res-titulo">${esc((r.resultado || {})[tipo] || '')}</p><p>${esc(r.cierre)}</p>` +
      (cambios.length ? `<div class="cambios">${cambios.map(filaCambio).join('')}</div>` : '') +
      `</div><button class="btn btn-madera" data-accion="continuar">Continuar</button>`;
    animarBarras(f);
    setTimeout(() => f.scrollIntoView({ behavior: REDUCIDO ? 'auto' : 'smooth', block: 'end' }), 60);
  }
}

/* ───────── zona completada ───────── */
function completarZona() {
  Z.fase = 'fin';
  if (!E.completadas.includes(Z.def.id)) E.completadas.push(Z.def.id);
  guardar();
  Sonido.sfx.zona(); lluviaDeHojas();
  mostrarResumenZona();
}

function mostrarResumenZona() {
  $('#ver-escena').hidden = true;
  const ganados = E.puntos - Z.puntos0, s0 = Math.round(Z.salud0), s1 = Math.round(salud());
  const tipo = E.huellas[Z.def.id] || 'buena', f = Z.def.final;
  const titulo = typeof f.titulo === 'string' ? f.titulo : (f.titulo[tipo] || f.titulo.buena);
  const cara = { buena: 'feliz', regular: 'pensando', mala: 'triste' }[tipo];
  const t = abrirModal(`<button class="cerrar-x" data-accion="ver" aria-label="Cerrar y ver cómo quedó la zona">✕</button>
    <div class="zona-ok">${animal(personajeActual().animal, cara)}</div>
    <h2>${esc(titulo)}</h2><p>${esc(f.texto)}</p>
    <div class="chips"><span class="chip">⭐ +${ganados}</span><span class="chip">🔍 ${Z.encontrados.size}/${Z.def.objetos.length} objetos</span><span class="chip">❤ ${E.corazones}/3</span></div>
    <div class="salud-zona"><span>Salud del bosque</span><div class="barra ancha" style="--c:#4f9a5b"><i data-a="${s1}" style="width:${s0}%"></i></div><b>${s0}% → ${s1}%</b></div>
    <div class="botones-fin"><button class="btn btn-hoja" data-accion="ver">Ver cómo quedó</button><button class="btn btn-madera" data-accion="mapa">Volver al sendero</button></div>`, 'tarjeta-zona');
  animarBarras(t);
  t.onclick = e => {
    if (e.target.closest('[data-accion="ver"]')) { Sonido.sfx.clic(); verEscena(); return; }
    if (!e.target.closest('[data-accion="mapa"]')) return;
    Sonido.sfx.clic();
    cerrarModal();
    volverAlSendero();
  };
}

/* ── ver cómo quedó: se cierra la ventana y se puede recorrer la escena ── */
function verEscena() {
  cerrarModal().then(() => {
    if (!Z || Z.fase !== 'fin' || pantalla !== 'p-zona') return;
    const tipo = E.huellas[Z.def.id] || '', huella = Z.def.huellas && Z.def.huellas[tipo];
    const v = $('#ver-escena');
    v.className = 'ver-escena ' + tipo;
    v.innerHTML = `<div class="ver-texto"><p class="ver-titulo">Así quedó ${esc(minus(Z.def.nombre))}</p>${huella ? `<p>${esc(huella)}</p>` : ''}</div>` +
      `<div class="ver-botones"><button class="btn btn-hoja btn-chico" data-accion="resumen">Resumen</button>` +
      `<button class="btn btn-madera btn-chico" data-accion="mapa">Volver al sendero</button></div>`;
    v.hidden = false;
    marcarCambios();
    if (panLim > 40) {
      const a = $('#pista-paneo');
      a.innerHTML = '<span class="mano">👆</span> Desliza para ver los cambios';
      a.classList.add('show');
      setTimeout(() => a.classList.remove('show'), 2800);
    }
  });
}

/* encierra en un círculo cada lugar que cambió (verde si mejoró, rojo si empeoró) */
function marcarCambios() {
  const svg = $('#escena-capa svg');
  if (!svg) return;
  $$('.marca-cambio', svg).forEach(m => m.remove());
  if (!Z.marcas.length) return;
  panHacia(Z.marcas[0].f[0]);
  const ns = 'http://www.w3.org/2000/svg';
  Z.marcas.forEach(m => {
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'marca-cambio ' + m.tipo);
    g.setAttribute('transform', `translate(${m.f[0]} ${m.f[1]})`);
    ['mc-anillo', 'mc-sombra', 'mc-luz', 'mc-color'].forEach(c => {
      const ci = document.createElementNS(ns, 'circle');
      ci.setAttribute('class', c); ci.setAttribute('r', m.f[2] || 70);
      g.appendChild(ci);
    });
    svg.appendChild(g);
  });
}

/* ───────── final ───────── */
function puntajeMaximo() {
  let m = 30; /* bonus por conservar los 3 corazones */
  ZONAS.forEach(z => {
    if (z.pendiente) return;
    z.objetos.forEach(o => { m += (o.puntos || 0) + (o.accion ? Math.max(...o.accion.opciones.map(p => p.puntos || 0)) : 0); });
    z.retos.forEach(r => {
      const p = r.puntos || 10;
      if (r.tipo === 'relacionar') m += r.pares.length * p;
      if (r.tipo === 'seleccionar') m += r.opciones.filter(o => o.correcta).length * p;
      if (r.tipo === 'ordenar') m += r.pasos.length * p;
      if (r.tipo === 'clasificar') m += r.items.length * (r.puntos || 5);
      if (r.tipo === 'decision') m += Math.max(...r.opciones.map(o => o.puntos || 0));
      if (r.tipo === 'plan') m += r.necesidades.length * p;
    });
  });
  return m;
}

function irFinal() {
  if (!E.terminado) { E.bonusCorazones = E.corazones * 10; E.puntos += E.bonusCorazones; E.terminado = true; guardar(); }
  irA('p-final', '', () => { montarFinal(); Sonido.musica('final'); Sonido.sfx.fanfarria(); lluviaDeHojas(36); });
}

function montarFinal() {
  if (!$('#final-fondo').firstChild) $('#final-fondo').innerHTML = portada();
  $('#final-fondo svg').classList.add('saludable');
  /* el rango combina lo que aprendiste (puntos) y cómo dejaste el bosque (salud del planeta) */
  const pct = .5 * Math.min(1, E.puntos / puntajeMaximo()) + .5 * clamp((salud() - 20) / 65, 0, 1);
  const R = RANGOS.find(x => pct >= x.min), p = personajeActual();
  $('#final-contenido').innerHTML = `<div class="final-tarjeta">
    <div class="final-animal">${animal(p.animal, 'feliz')}</div>
    <h2>¡Aventura completada!</h2>
    <p class="final-guardian">Guardián: <b>${esc(E.nombre)}</b></p>
    <div class="rango"><span class="rango-icono" aria-hidden="true">${R.icono}</span><span class="rango-nombre">${R.nombre}</span></div>
    <div class="final-cifras">
      <div><b>${E.puntos}</b><span>puntos</span></div>
      <div><b>${E.corazones}/3</b><span>corazones</span></div>
      <div><b>${Math.round(salud())}%</b><span>salud del bosque</span></div>
    </div>
    ${E.bonusCorazones ? `<p class="bonus">Incluye +${E.bonusCorazones} ⭐ por los corazones que conservaste.</p>` : ''}
    <div class="final-barras">${BARRAS.map(b => filaBarra(b, E.planeta[b.id])).join('')}</div>
    <p class="final-msg">${R.mensaje}</p>
    <button class="btn btn-madera" id="btn-otra">Jugar otra vez</button>
  </div>`;
  $('#btn-otra').onclick = () => {
    Sonido.sfx.clic(); borrarPartida(); E = null; aplicarSalud();
    irA('p-personaje', '', () => { montarPersonaje(); Sonido.musica('inicio'); });
  };
}

/* ───────── eventos ───────── */
function conectar() {
  /* el audio se activa con el primer toque (regla de los navegadores) */
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => Sonido.iniciar(), true));

  const bs = $('#btn-sonido');
  const pintarSonido = () => { bs.textContent = Sonido.activo() ? '🔊' : '🔈'; bs.setAttribute('aria-label', Sonido.activo() ? 'Silenciar' : 'Activar sonido'); };
  pintarSonido();
  bs.onclick = () => { Sonido.alternar(); pintarSonido(); };

  $('#btn-comenzar').onclick = () => { Sonido.sfx.clic(); irA('p-personaje', '', montarPersonaje); };
  $('#btn-continuar').onclick = () => {
    E = cargar(); if (!E) return;
    Sonido.sfx.clic(); aplicarSalud();
    irA('p-mapa', '', () => { montarMapa(); Sonido.musica('mapa'); });
  };
  $('#btn-ayuda').onclick = () => { Sonido.sfx.clic(); mostrarAyuda(); };
  $('#btn-volver-inicio').onclick = () => { Sonido.sfx.clic(); irA('p-inicio', '', montarInicio); };

  $('#tarjetas').addEventListener('click', e => { const t = e.target.closest('.tarjeta'); if (t) elegirPersonaje(t.dataset.id); });
  $('#btn-entrar').onclick = entrarAlBosque;
  $('#input-nombre').addEventListener('keydown', e => { if (e.key === 'Enter') entrarAlBosque(); });
  $('#input-nombre').addEventListener('focus', e => e.target.select());

  /* mapa */
  const mapa = $('#mapa-capa');
  mapa.addEventListener('click', e => { const n = e.target.closest('.nodo'); if (n) tocarNodo(+n.dataset.i, n); });
  mapa.addEventListener('keydown', e => {
    const n = e.target.closest('.nodo');
    if (n && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tocarNodo(+n.dataset.i, n); }
  });

  $('#revelacion').onclick = cerrarRevelacion;
  $('#ver-escena').addEventListener('click', e => {
    if (e.target.closest('[data-accion="resumen"]')) { Sonido.sfx.clic(); mostrarResumenZona(); }
    else if (e.target.closest('[data-accion="mapa"]')) { Sonido.sfx.clic(); volverAlSendero(); }
  });

  /* HUD */
  $('#hud-planeta').onclick = e => { e.stopPropagation(); Sonido.sfx.clic(); alternarPanelPlaneta(); };
  document.addEventListener('click', e => { if (!e.target.closest('#panel-planeta, #hud-planeta')) cerrarPanelPlaneta(); });

  /* diálogo */
  $('#dialogo').addEventListener('click', avanzarDialogo);
  document.addEventListener('keydown', e => {
    if (dialogoAbierto() && !modalAbierto() && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); avanzarDialogo(); }
  });

  /* escena: arrastrar para panear, tocar para encontrar */
  const capa = $('#escena-capa');
  capa.addEventListener('pointerdown', e => { arrastre = { x0: e.clientX, p0: panX, movio: false }; });
  capa.addEventListener('pointermove', e => {
    if (!arrastre || panLim <= 0) return;
    const dx = e.clientX - arrastre.x0;
    if (!arrastre.movio && Math.abs(dx) > 10) { arrastre.movio = true; capa.classList.add('paneando'); $('#pista-paneo').classList.remove('show'); }
    if (arrastre.movio) { panX = clamp(arrastre.p0 + dx, -panLim, panLim); aplicarPan(); }
  });
  const soltar = () => { if (arrastre && arrastre.movio) ultimoArrastre = Date.now(); arrastre = null; capa.classList.remove('paneando'); };
  window.addEventListener('pointerup', soltar, true);
  window.addEventListener('pointercancel', soltar, true);
  capa.addEventListener('click', e => {
    if (Date.now() - ultimoArrastre < 90) return;
    const o = e.target.closest('.obj'); if (o) tocarObjeto(o.dataset.id, o);
  });
  capa.addEventListener('keydown', e => {
    const o = e.target.closest('.obj');
    if (o && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tocarObjeto(o.dataset.id, o); }
  });
  capa.addEventListener('focusin', e => { const o = e.target.closest('.obj'); if (o) { const d = Z && Z.def.objetos.find(x => x.id === o.dataset.id); if (d) panHacia(d.x); } });
  capa.addEventListener('wheel', e => {
    if (panLim <= 0) return;
    e.preventDefault();
    panX = clamp(panX - (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY), -panLim, panLim);
    aplicarPan();
  }, { passive: false });
  document.addEventListener('keydown', e => {
    if (pantalla !== 'p-zona' || modalAbierto() || panLim <= 0) return;
    if (e.key === 'ArrowLeft') { panX = clamp(panX + 80, -panLim, panLim); aplicarPan(); }
    if (e.key === 'ArrowRight') { panX = clamp(panX - 80, -panLim, panLim); aplicarPan(); }
  });

  window.addEventListener('resize', () => {
    if (pantalla === 'p-zona') ajustarEscena();
    if (pantalla === 'p-mapa' && E && esVertical() !== mapaVertical) montarMapa();
    if (redibujarReto) redibujarReto();
  });
}

/* ───────── arranque ───────── */
function arrancar() {
  conectar();
  aplicarSalud();
  montarInicio();
  Sonido.musica('inicio');
  if (PARAMS.has('final')) {
    const s = cargar();
    E = s || Object.assign(estadoNuevo(), { personaje: 'ingrid', nombre: 'Prueba', puntos: 72, corazones: 2 });
    aplicarSalud(); irFinal();
  }
}
document.addEventListener('DOMContentLoaded', arrancar);
