/* ══════════════════════════════════════════════════════════
   ESCENAS — todo el bosque dibujado en SVG (sin imágenes)
   · Piezas sueltas: árboles, arbustos, casas, río…
   · Escenas completas: portada, claro (zona 1)
   · Objetos escondidos y el mapa del sendero
   Las escenas miden 800 × 600 y se recortan para llenar la pantalla.
   ══════════════════════════════════════════════════════════ */

const TONO = {
  osc: { base: '#2f6b4b', sombra: '#245a3f', luz: '#3f8259' },
  med: { base: '#4f9a5b', sombra: '#3e8450', luz: '#6cb169' },
  cla: { base: '#86c06d', sombra: '#6fab5c', luz: '#a6d483' },
  lej: { base: '#a8cf96', sombra: '#97c086', luz: '#bddcab' },
};
const ESTRELLA = 'M0 -10 L2.6 -2.6 L10 0 L2.6 2.6 L0 10 L-2.6 2.6 L-10 0 L-2.6 -2.6 Z';

/* números aleatorios con semilla: la escena se dibuja igual cada vez */
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const f1 = n => +n.toFixed(1);
const _circ = (l, c) => l.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join('');
const _en = (x, y, s) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${s})">`;

/* ───────── piezas del bosque ───────── */
function arbol(x, y, s, t = 'med', borde = false) {
  const c = TONO[t], copa = [[0, -62, 30], [-25, -46, 22], [25, -46, 22], [-4, -84, 20]];
  let g = _en(x, y, s);
  g += `<path d="M-7 2 L-5 -40 L5 -40 L7 2 Z" fill="#7a5236"${borde ? ` stroke="${LINEA}" stroke-width="3"` : ''}/>`;
  if (borde) g += _circ(copa.map(([a, b, r]) => [a, b, r + 3]), LINEA);
  g += _circ(copa, c.sombra) + _circ(copa.map(([a, b, r]) => [a - 2, b - 5, r - 3]), c.base);
  g += `<circle cx="-13" cy="-76" r="7" fill="${c.luz}" opacity=".85"/>`;
  return g + '</g>';
}

function pino(x, y, s, t = 'osc') {
  const c = TONO[t];
  let g = _en(x, y, s) + `<rect x="-5" y="-18" width="10" height="20" rx="3" fill="#6b4a32"/>`;
  [[-54, -16, 33], [-78, -44, 27], [-100, -70, 20]].forEach(([top, bot, w]) => {
    g += `<path d="M0 ${top} L${-w} ${bot} L${w} ${bot} Z" fill="${c.sombra}" stroke="${c.sombra}" stroke-width="8" stroke-linejoin="round"/>`;
    g += `<path d="M-1 ${top + 3} L${-w + 6} ${bot - 6} L${w - 10} ${bot - 6} Z" fill="${c.base}" stroke="${c.base}" stroke-width="5" stroke-linejoin="round"/>`;
  });
  return g + '</g>';
}

function arbusto(x, y, s, t = 'med', borde = false) {
  const c = TONO[t], b = [[-19, -12, 15], [0, -20, 19], [19, -12, 15]];
  let g = _en(x, y, s);
  if (borde) g += _circ(b.map(([a, y2, r]) => [a, y2, r + 3]), LINEA);
  g += _circ(b, c.sombra) + _circ(b.map(([a, y2, r]) => [a - 1, y2 - 4, r - 3]), c.base);
  return g + `<circle cx="-6" cy="-28" r="5" fill="${c.luz}" opacity=".85"/></g>`;
}

function arbustoSeco(x, y, s) {
  return _en(x, y, s) + `<path d="M0 0 L-4 -22 M0 0 L6 -26 M-2 -10 L-16 -20 M3 -14 L16 -24 M-4 -22 L-10 -30 M6 -26 L2 -34" stroke="#8a6a44" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
}

function flor(x, y, c, s = 1) {
  let g = _en(x, y, s) + `<path d="M0 0 V12" stroke="#4f8f4a" stroke-width="2"/>`;
  for (let k = 0; k < 5; k++) {
    const a = k * 72 * Math.PI / 180;
    g += `<circle cx="${f1(Math.cos(a) * 4.5)}" cy="${f1(Math.sin(a) * 4.5)}" r="3.6" fill="${c}"/>`;
  }
  return g + `<circle r="2.6" fill="#f6c453"/></g>`;
}

function pasto(x, y, s = 1, c = '#4a8a45') {
  return _en(x, y, s) + `<path d="M-7 0 Q-6 -9 -10 -15 M0 0 Q0 -12 2 -20 M7 0 Q7 -8 11 -13" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;
}

function hongo(x, y, s = 1) {
  return _en(x, y, s) +
    `<path d="M-5 0 L-4 -10 L4 -10 L5 0 Z" fill="#f6ead2" stroke="${LINEA}" stroke-width="2"/>` +
    `<path d="M-14 -9 Q-13 -26 0 -26 Q13 -26 14 -9 Z" fill="#e2574c" stroke="${LINEA}" stroke-width="2" stroke-linejoin="round"/>` +
    `<circle cx="-5" cy="-17" r="2.6" fill="#fff"/><circle cx="5" cy="-20" r="2" fill="#fff"/><circle cx="7" cy="-12" r="1.8" fill="#fff"/></g>`;
}

function nube(x, y, s = 1) {
  return _en(x, y, s) + _circ([[0, 0, 18], [20, -8, 22], [42, 0, 17], [21, 6, 18]], '#ffffff').replace(/fill="#ffffff"/g, 'fill="#ffffff" opacity=".92"') + '</g>';
}

function humo(x, y, s = 1, c = '#d9d4cc') {
  let g = '';
  for (let k = 0; k < 3; k++) {
    const b = `dur="3s" begin="${k}s" repeatCount="indefinite"`;
    g += `<circle cx="${x}" cy="${y}" r="${5 * s}" fill="${c}" opacity="0">` +
      `<animate attributeName="cy" values="${y};${y - 46 * s}" ${b}/><animate attributeName="cx" values="${x};${x + 14 * s}" ${b}/>` +
      `<animate attributeName="r" values="${5 * s};${14 * s}" ${b}/><animate attributeName="opacity" values="0;.85;0" ${b}/></circle>`;
  }
  return g;
}

function casa(x, y, s, muro, techo, chimenea = false) {
  let g = _en(x, y, s);
  if (chimenea) g += `<rect x="14" y="-74" width="10" height="20" fill="#9a6a45" stroke="${LINEA}" stroke-width="2.5"/>` + humo(19, -78, .8);
  g += `<rect x="-30" y="-42" width="60" height="42" rx="3" fill="${muro}" stroke="${LINEA}" stroke-width="2.5"/>`;
  g += `<path d="M-38 -40 L0 -70 L38 -40 Z" fill="${techo}" stroke="${LINEA}" stroke-width="2.5" stroke-linejoin="round"/>`;
  g += `<path d="M-8 0 V-18 Q0 -26 8 -18 V0 Z" fill="#8a5a3a" stroke="${LINEA}" stroke-width="2"/>`;
  g += `<rect x="12" y="-32" width="12" height="11" rx="2" fill="#fff1bf" stroke="${LINEA}" stroke-width="2"/>`;
  g += `<rect x="-24" y="-32" width="10" height="10" rx="2" fill="#fff1bf" stroke="${LINEA}" stroke-width="2"/>`;
  return g + '</g>';
}

function fabrica(x, y, s) {
  let g = _en(x, y, s);
  g += `<rect x="-38" y="-118" width="16" height="70" fill="#8f7f74" stroke="${LINEA}" stroke-width="2.5"/>`;
  g += `<rect x="-38" y="-108" width="16" height="6" fill="#c8644a"/>`;
  g += `<g data-c="humo">${humo(-30, -124, 1.4, '#8d8a86')}</g>`;
  g += `<path d="M-50 0 V-50 L-30 -64 V-50 L-10 -64 V-50 L10 -64 V-50 L30 -64 V0 Z" fill="#b2a497" stroke="${LINEA}" stroke-width="2.5" stroke-linejoin="round"/>`;
  g += [-40, -20, 0, 18].map(wx => `<rect x="${wx}" y="-36" width="10" height="12" rx="2" fill="#6f655d"/>`).join('');
  return g + '</g>';
}

function tocon(x, y, s) {
  return _en(x, y, s) +
    `<path d="M-16 0 L-14 -16 L14 -16 L16 0 Z" fill="#8a5d3b" stroke="${LINEA}" stroke-width="2.5" stroke-linejoin="round"/>` +
    `<ellipse cx="0" cy="-16" rx="14" ry="5" fill="#e3bf8c" stroke="${LINEA}" stroke-width="2.5"/>` +
    `<ellipse cx="0" cy="-16" rx="7" ry="2.4" fill="none" stroke="#b98a5a" stroke-width="1.5"/></g>`;
}

function troncoCaido(x, y, s) {
  return _en(x, y, s) +
    `<rect x="-36" y="-14" width="64" height="16" rx="8" fill="#8a5d3b" stroke="${LINEA}" stroke-width="2.5"/>` +
    `<ellipse cx="28" cy="-6" rx="6" ry="8" fill="#e3bf8c" stroke="${LINEA}" stroke-width="2.5"/></g>`;
}

function bolsa(x, y, s) {
  return _en(x, y, s) +
    `<path d="M-12 0 Q-17 -14 -6 -20 L-3 -25 L3 -25 L6 -20 Q17 -14 12 0 Z" fill="#4a4d55" stroke="${LINEA}" stroke-width="2.2" stroke-linejoin="round"/>` +
    `<path d="M-3 -25 l-4 -5 M3 -25 l4 -5" stroke="#4a4d55" stroke-width="2.5" stroke-linecap="round"/></g>`;
}

function botella(x, y, s) {
  return _en(x, y, s) + `<g transform="rotate(72)"><rect x="-6" y="-16" width="12" height="22" rx="5" fill="#cdeef7" stroke="${LINEA}" stroke-width="2"/>` +
    `<rect x="-3" y="-22" width="6" height="7" rx="1.5" fill="#4fa3d1" stroke="${LINEA}" stroke-width="1.6"/></g></g>`;
}

function rocas(x, y, s) {
  return _en(x, y, s) +
    `<path d="M-30 0 Q-32 -18 -14 -20 Q-2 -22 0 -8 Q2 0 -8 2 Z" fill="#a9a59c" stroke="${LINEA}" stroke-width="2.2"/>` +
    `<path d="M-4 2 Q-6 -14 10 -15 Q26 -14 24 2 Z" fill="#bdb8ae" stroke="${LINEA}" stroke-width="2.2"/></g>`;
}

function juncos(x, y, s) {
  return _en(x, y, s) +
    `<path d="M-8 0 Q-9 -24 -12 -40 M0 0 Q0 -28 2 -46 M8 0 Q9 -22 13 -36 M-3 0 Q-16 -18 -22 -28 M4 0 Q16 -16 22 -24" stroke="#5c8f3e" stroke-width="3" fill="none" stroke-linecap="round"/>` +
    `<rect x="-1" y="-48" width="5" height="14" rx="2.5" fill="#8a5a3a"/><rect x="-15" y="-42" width="5" height="12" rx="2.5" fill="#8a5a3a"/></g>`;
}

function brote(x, y, s) {
  return _en(x, y, s) + `<g class="brote-crece"><path d="M0 0 Q1 -12 0 -22" stroke="#4f8f3a" stroke-width="3" fill="none" stroke-linecap="round"/>` +
    `<path d="M0 -12 Q-14 -20 -16 -8 Q-7 -6 0 -12 Z" fill="#8fd06a" stroke="${LINEA}" stroke-width="1.8"/>` +
    `<path d="M0 -18 Q12 -30 17 -17 Q8 -13 0 -18 Z" fill="#a6dc7c" stroke="${LINEA}" stroke-width="1.8"/></g></g>`;
}

function maiz(x, y, s) {
  return _en(x, y, s) +
    `<path d="M0 0 V-56" stroke="#5e9a3c" stroke-width="4" stroke-linecap="round"/>` +
    `<path d="M0 -12 Q-20 -18 -26 -8 M0 -24 Q18 -32 26 -22 M0 -36 Q-18 -44 -22 -36 M0 -46 Q14 -56 18 -50" stroke="#6fb04a" stroke-width="5" fill="none" stroke-linecap="round"/>` +
    `<path d="M0 -56 l-4 -8 M0 -56 l4 -8 M0 -56 v-9" stroke="#e1c05a" stroke-width="2" stroke-linecap="round"/></g>`;
}

function mariposa(x, y, s, c, retraso = 0) {
  return _en(x, y, s) + `<g class="mariposa-vuelo" style="animation-delay:${retraso}s"><g class="mariposa">` +
    `<ellipse cx="-7" cy="-4" rx="8" ry="10" fill="${c}"/><ellipse cx="7" cy="-4" rx="8" ry="10" fill="${c}"/>` +
    `<ellipse cx="-5" cy="7" rx="5" ry="6" fill="${c}" opacity=".8"/><ellipse cx="5" cy="7" rx="5" ry="6" fill="${c}" opacity=".8"/>` +
    `<rect x="-1.5" y="-10" width="3" height="20" rx="1.5" fill="${LINEA}"/></g></g></g>`;
}

function sauce(x, y, s, soloRamas = false) {
  let g = _en(x, y, s);
  if (!soloRamas) {
    g += `<path d="M-10 2 L-7 -58 L7 -58 L10 2 Z" fill="#7a5236"/>`;
    g += `<path d="M-4 -50 Q-20 -62 -30 -70 M4 -52 Q18 -64 30 -72" stroke="#7a5236" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    g += _circ([[0, -92, 48], [-40, -76, 32], [40, -76, 32]], '#5f9a4e') + _circ([[-4, -98, 40], [-36, -82, 24], [34, -82, 24]], '#79b462');
  }
  for (let k = -6; k <= 6; k++) {
    const xx = k * 8, largo = 46 + (6 - Math.abs(k)) * 5 + (k % 2 ? 10 : 0), d = k < 0 ? -1 : 1;
    g += `<path d="M${xx} -78 Q${xx + d * 5} ${-78 + largo / 2} ${xx + d * 9} ${-78 + largo}" stroke="${soloRamas ? '#86c06d' : '#4f8a42'}" stroke-width="${soloRamas ? 4 : 5}" fill="none" stroke-linecap="round"/>`;
  }
  return g + '</g>';
}

function nenufar(x, y, s, florC) {
  let g = _en(x, y, s) + `<path d="M0 0 L16 -3 A18 9 0 1 1 15 4 Z" fill="#6fae5a" stroke="#4f8a42" stroke-width="2"/>`;
  if (florC) g += `<g transform="translate(-4 -4)"><path d="M0 -8 Q5 -2 0 2 Q-5 -2 0 -8 Z M-7 -3 Q-1 -1 0 2 Q-6 2 -7 -3 Z M7 -3 Q1 -1 0 2 Q6 2 7 -3 Z" fill="${florC}" stroke="${LINEA}" stroke-width="1.2"/></g>`;
  return g + '</g>';
}

function pez(x, y, s, c = '#f28b3c', espejo = false) {
  return _en(x, y, s) + `<g transform="${espejo ? 'scale(-1 1) ' : ''}rotate(-28)">` +
    `<path d="M14 0 L26 -9 L24 0 L26 9 Z" fill="${c}" stroke="${LINEA}" stroke-width="2" stroke-linejoin="round"/>` +
    `<ellipse cx="0" cy="0" rx="16" ry="9" fill="${c}" stroke="${LINEA}" stroke-width="2.2"/>` +
    `<circle cx="-8" cy="-2" r="2.2" fill="${OJO}"/><path d="M-1 -8 Q3 0 -1 8" stroke="${LINEA}" stroke-width="1.4" fill="none" opacity=".5"/></g>` +
    `<path d="M-30 16 q4 -8 8 0 M24 18 q4 -8 8 0" stroke="#d9f1fa" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`;
}

function paca(x, y, s) {
  return _en(x, y, s) + `<rect x="-26" y="-30" width="52" height="30" rx="12" fill="#e9c46a" stroke="${LINEA}" stroke-width="2.5"/>` +
    `<path d="M-18 -22 h12 M-2 -14 h14 M-16 -8 h10 M6 -24 h12" stroke="#c99a3a" stroke-width="2" stroke-linecap="round"/>` +
    `<path d="M-26 -16 h52" stroke="#b9862f" stroke-width="2.5"/></g>`;
}

function cerca(x1, x2, y, s = 1) {
  let g = `<path d="M${x1} ${y - 14 * s} H${x2} M${x1} ${y - 6 * s} H${x2}" stroke="#a3764a" stroke-width="${3 * s}"/>`;
  for (let x = x1; x <= x2; x += 22 * s) g += `<rect x="${f1(x - 2.5 * s)}" y="${f1(y - 20 * s)}" width="${5 * s}" height="${20 * s}" rx="1.5" fill="#8a5d3b"/>`;
  return g;
}

function letrero(x, y, s, texto) {
  const w = texto.length * 7.4 + 20;
  return _en(x, y, s) + `<rect x="-3" y="-30" width="6" height="30" fill="#7a5236"/>` +
    `<rect x="${-w / 2}" y="-52" width="${w}" height="26" rx="5" fill="#d9b07a" stroke="${LINEA}" stroke-width="2.5"/>` +
    `<text y="-34.5" text-anchor="middle" font-family="Andika, Verdana, sans-serif" font-weight="700" font-size="13" fill="${LINEA}">${texto}</text></g>`;
}

function aerogenerador(x, y, s, retraso = 0) {
  let g = _en(x, y, s) + `<path d="M-5 0 L-2 -112 L2 -112 L5 0 Z" fill="#f4f6f8" stroke="${LINEA}" stroke-width="2"/>`;
  g += `<g transform="translate(0 -112)"><g>`;
  for (const a of [0, 120, 240]) g += `<path transform="rotate(${a})" d="M0 0 C 5 -12, 5 -44, 0 -62 C -4 -44, -4 -12, 0 0 Z" fill="#ffffff" stroke="${LINEA}" stroke-width="1.8"/>`;
  g += `<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4.5s" begin="${-retraso}s" repeatCount="indefinite"/></g>`;
  g += `<circle r="5.5" fill="#dfe5ea" stroke="${LINEA}" stroke-width="2"/></g>`;
  return g + '</g>';
}

function panelSolar(x, y, s) {
  let g = _en(x, y, s) + `<path d="M-2 0 V-14 M14 0 V-20" stroke="#8f8f8f" stroke-width="3"/>`;
  g += `<path d="M-24 -12 L16 -26 L26 -12 L-14 2 Z" fill="#3e6fb0" stroke="${LINEA}" stroke-width="2" stroke-linejoin="round"/>`;
  g += `<path d="M-19 -5 L21 -19 M-7 -16 L4 -1 M5 -20 L15 -5" stroke="#9cc8f0" stroke-width="1.4"/>`;
  return g + '</g>';
}

function plantaTratamiento(x, y, s) {
  return _en(x, y, s) +
    `<ellipse cx="-34" cy="-6" rx="22" ry="9" fill="#6cc3e6" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<ellipse cx="14" cy="-4" rx="20" ry="8" fill="#8fd4ee" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<path d="M-34 -6 m-10 0 q10 -5 20 0" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>` +
    `<rect x="38" y="-38" width="34" height="36" rx="3" fill="#e6efe9" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<path d="M36 -38 L55 -50 L74 -38 Z" fill="#5f9e5a" stroke="${LINEA}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<path d="M48 -24 l4 4 l8 -9" stroke="#3f8450" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

function solCaliente(x, y, r) {
  let g = `<circle cx="${x}" cy="${y}" r="${r * 1.9}" fill="#ffd27a" opacity=".22"><animate attributeName="r" values="${r * 1.8};${r * 2.05};${r * 1.8}" dur="3.2s" repeatCount="indefinite"/></circle>`;
  g += `<circle cx="${x}" cy="${y}" r="${r * 1.35}" fill="#ffc46a" opacity=".35"/>`;
  return g + `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffb648"/><circle cx="${x - r * .3}" cy="${y - r * .3}" r="${r * .45}" fill="#ffd27a" opacity=".7"/>`;
}

function carretera(d, ancho) {
  return `<path d="${d}" stroke="${LINEA}" stroke-width="${ancho + 5}" fill="none" stroke-linecap="round"/>` +
    `<path d="${d}" stroke="#8f8b86" stroke-width="${ancho}" fill="none" stroke-linecap="round"/>` +
    `<path d="${d}" stroke="#f6d75a" stroke-width="3" stroke-dasharray="14 12" fill="none"/>`;
}

const pieza = (dibujo, x, y, s = 1) => _en(x, y, s) + OBJETOS[dibujo] + '</g>';

function mezquite(x, y, s, seco = false) {
  let g = _en(x, y, s);
  g += `<path d="M-3 0 Q-8 -20 -2 -34 Q4 -46 -6 -58 M1 -30 Q18 -40 26 -54 M-4 -44 Q-20 -50 -30 -62" stroke="#6b4a32" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const c1 = seco ? '#b5a26a' : '#8fa64e', c2 = seco ? '#c9b67a' : '#a8bd62';
  const copa = seco ? [[-30, -64, 15, 6], [26, -57, 13, 5], [-6, -62, 9, 4]] : [[-30, -66, 26, 10], [24, -60, 24, 10], [-4, -74, 30, 11], [6, -62, 20, 8]];
  g += copa.map(([cx, cy, rx, ry]) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c1}"/><ellipse cx="${cx - 3}" cy="${cy - 3}" rx="${f1(rx * .7)}" ry="${f1(ry * .6)}" fill="${c2}"/>`).join('');
  return g + '</g>';
}

function maguey(x, y, s) {
  const hojas = [[-42, -10], [-32, -34], [-13, -48], [0, -54], [13, -48], [32, -34], [42, -10]];
  return _en(x, y, s) + hojas.map(([hx, hy]) =>
    `<path d="M-5 0 Q${f1(hx * .35 - 6)} ${f1(hy * .55)} ${hx} ${hy} Q${f1(hx * .35 + 6)} ${f1(hy * .55)} 5 0 Z" fill="#7fae9a" stroke="${LINEA}" stroke-width="1.8" stroke-linejoin="round"/>`).join('') + '</g>';
}

function nopal(x, y, s) {
  const penca = (cx, cy, rx, ry, rot) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${cx} ${cy})" fill="#7fb04f" stroke="${LINEA}" stroke-width="2"/>`;
  return _en(x, y, s) + penca(0, -18, 12, 18, 0) + penca(-14, -44, 10, 15, -25) + penca(14, -46, 10, 15, 22) + penca(0, -64, 8, 12, 0) +
    `<g fill="#dfeab0"><circle cx="-4" cy="-22" r="1.4"/><circle cx="4" cy="-12" r="1.4"/><circle cx="-14" cy="-46" r="1.3"/><circle cx="15" cy="-48" r="1.3"/><circle cx="1" cy="-64" r="1.2"/></g>` +
    `<circle cx="-21" cy="-57" r="4" fill="#e2574c" stroke="${LINEA}" stroke-width="1.4"/><circle cx="21" cy="-59" r="3.6" fill="#f5a3c7" stroke="${LINEA}" stroke-width="1.4"/></g>`;
}

function edificio(x, y, s) {
  let g = _en(x, y, s) + `<rect x="-40" y="-100" width="80" height="100" rx="3" fill="#f1d9c0" stroke="${LINEA}" stroke-width="2.6"/>`;
  g += `<rect x="-44" y="-106" width="88" height="8" rx="2" fill="#c8644a" stroke="${LINEA}" stroke-width="2.4"/>`;
  for (let f = 0; f < 3; f++) for (let c = 0; c < 3; c++)
    if (!(f === 2 && c === 1)) g += `<rect x="${-30 + c * 22}" y="${-90 + f * 27}" width="15" height="15" rx="2" fill="#fff1bf" stroke="${LINEA}" stroke-width="1.8"/>`;
  g += `<path d="M-8 0 V-20 Q0 -27 8 -20 V0 Z" fill="#8a5a3a" stroke="${LINEA}" stroke-width="2"/>`;
  g += `<circle cx="-30" cy="-110" r="6" fill="#7fc25a"/><circle cx="-20" cy="-112" r="5" fill="#a6d483"/><circle cx="28" cy="-110" r="6" fill="#7fc25a"/>`;
  return g + '</g>';
}

function cisterna(x, y, s) {
  return _en(x, y, s) + `<rect x="-12" y="-30" width="24" height="30" rx="5" fill="#3e6fb0" stroke="${LINEA}" stroke-width="2.2"/>` +
    `<ellipse cx="0" cy="-30" rx="12" ry="4" fill="#5a8fd0" stroke="${LINEA}" stroke-width="2"/>` +
    `<path d="M-6 -18 h12 M-6 -10 h12" stroke="#9cc8f0" stroke-width="2"/><path d="M12 -26 h8 v-22" stroke="#9aa4ac" stroke-width="3" fill="none"/></g>`;
}

function bomba(x, y, s) {
  return _en(x, y, s) + `<ellipse cx="0" cy="2" rx="17" ry="4.5" fill="#cbb27a"/><path d="M-12 2 l6 -2 l5 2 M4 2 l6 -2" stroke="#a88d58" stroke-width="1.6" fill="none"/>` +
    `<path d="M6 -26 h12 v6" stroke="${LINEA}" stroke-width="7" fill="none"/><path d="M6 -26 h12 v6" stroke="#7d8a96" stroke-width="4" fill="none"/>` +
    `<rect x="-6" y="-36" width="12" height="36" rx="3" fill="#7d8a96" stroke="${LINEA}" stroke-width="2.2"/>` +
    `<path d="M-3 -36 L-22 -48" stroke="${LINEA}" stroke-width="4" stroke-linecap="round"/></g>`;
}

function huerto(x, y, s) {
  let g = _en(x, y, s) + `<rect x="-36" y="-12" width="72" height="16" rx="4" fill="#8a5d3b" stroke="${LINEA}" stroke-width="2.4"/>`;
  [-27, -16, -5, 6, 17, 28].forEach((k, i) => {
    g += `<path d="M${k} -11 q-5 -9 -8 -10 M${k} -11 q5 -10 9 -10" stroke="#5aa54a" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      `<circle cx="${k}" cy="-13" r="2.6" fill="${['#e2574c', '#f28b3c', '#7fc25a'][i % 3]}"/>`;
  });
  return g + '</g>';
}

function banca(x, y, s) {
  return _en(x, y, s) + `<path d="M-20 -8 v10 M20 -8 v10" stroke="${LINEA}" stroke-width="3.5"/>` +
    `<rect x="-28" y="-14" width="56" height="7" rx="2" fill="#a2714b" stroke="${LINEA}" stroke-width="2"/>` +
    `<path d="M-22 -14 v-8 M22 -14 v-8" stroke="${LINEA}" stroke-width="3"/><rect x="-28" y="-28" width="56" height="7" rx="2" fill="#a2714b" stroke="${LINEA}" stroke-width="2"/></g>`;
}

function parada(x, y, s) {
  return _en(x, y, s) + `<path d="M0 0 V-58" stroke="${LINEA}" stroke-width="6"/><path d="M0 0 V-58" stroke="#9aa4ac" stroke-width="3.5"/>` +
    `<rect x="-17" y="-80" width="34" height="24" rx="5" fill="#3e6fb0" stroke="${LINEA}" stroke-width="2.2"/>` +
    `<rect x="-10" y="-74" width="20" height="10" rx="2" fill="#fff"/><circle cx="-5" cy="-62" r="2.5" fill="#fff"/><circle cx="5" cy="-62" r="2.5" fill="#fff"/></g>`;
}

function puesto(x, y, s) {
  let g = _en(x, y, s) + `<path d="M-30 0 V-46 M30 0 V-46" stroke="#7a5236" stroke-width="4"/>`;
  g += `<rect x="-34" y="-24" width="68" height="24" rx="3" fill="#c49a66" stroke="${LINEA}" stroke-width="2.4"/>`;
  g += `<circle cx="-18" cy="-28" r="6" fill="#f28b3c" stroke="${LINEA}" stroke-width="1.6"/><circle cx="-6" cy="-29" r="6" fill="#e2574c" stroke="${LINEA}" stroke-width="1.6"/>` +
    `<circle cx="8" cy="-28" r="6" fill="#7fc25a" stroke="${LINEA}" stroke-width="1.6"/><circle cx="20" cy="-28" r="6" fill="#f6c453" stroke="${LINEA}" stroke-width="1.6"/>`;
  g += `<path d="M-40 -46 L40 -46 L36 -60 L-36 -60 Z" fill="#fff" stroke="${LINEA}" stroke-width="2.4" stroke-linejoin="round"/>`;
  for (let k = -32; k < 36; k += 16) g += `<path d="M${k} -46 L${k + 8} -46 L${k + 7.4} -60 L${k + .8} -60 Z" fill="#e2574c"/>`;
  return g + '</g>';
}

function grietas(x, y, s, c = '#b39a5e') {
  return _en(x, y, s) + `<path d="M-30 0 l10 -4 l8 6 l10 -5 l9 7 l12 -6 M-12 2 l-4 8 M8 4 l4 8 M18 -2 l6 -6" stroke="${c}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

/* ───────── objetos que se esconden en las zonas (centrados en 0,0) ───────── */
const _leno = (x, y, c) => `<rect x="${x}" y="${y}" width="56" height="20" rx="10" fill="${c}"/>` +
  `<circle cx="${x + 46}" cy="${y + 10}" r="10" fill="#e7c08f"/><circle cx="${x + 46}" cy="${y + 10}" r="4.5" fill="none" stroke="#c49a66" stroke-width="1.6"/>`;

const OBJETOS = {
  tronco: `<g stroke="${LINEA}" stroke-width="2.6" stroke-linejoin="round">${_leno(-36, 6, '#9a6a45')}${_leno(-26, -13, '#8a5d3b')}${_leno(-32, -32, '#a2714b')}</g>`,
  cantaro: `<g stroke="${LINEA}" stroke-width="2.6" stroke-linejoin="round">` +
    `<path d="M-17 -22 Q-30 -4 -24 13 Q-17 30 0 30 Q17 30 24 13 Q30 -4 17 -22 Z" fill="#d07a4a"/>` +
    `<rect x="-14" y="-32" width="28" height="11" rx="4" fill="#bf6a3d"/><ellipse cx="0" cy="-32" rx="14" ry="4.5" fill="#62bde3"/></g>` +
    `<path d="M-24 2 Q0 12 24 2" stroke="#f2c27a" stroke-width="3" fill="none"/><path d="M-20 12 Q0 21 20 12" stroke="#f2c27a" stroke-width="2" fill="none" opacity=".7"/>` +
    `<path d="M15 -50 q-6 9 0 12 q6 -3 0 -12 z" fill="#62bde3" stroke="${LINEA}" stroke-width="2"/>`,
  mazorca: `<path d="M-4 30 Q-28 8 -16 -24 Q-10 0 0 22 Z" fill="#7fb24f" stroke="${LINEA}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<ellipse cx="3" cy="-4" rx="13" ry="30" fill="#f6c84a" stroke="${LINEA}" stroke-width="2.6"/>` +
    (() => { let k = ''; for (let yy = -24; yy <= 16; yy += 7) for (const xx of [-4, 3, 10]) if (!(Math.abs(yy) > 18 && xx !== 3)) k += `<circle cx="${xx}" cy="${yy}" r="2.4" fill="#e3a12c"/>`; return k; })() +
    `<path d="M8 30 Q30 8 20 -20 Q14 2 4 22 Z" fill="#8fc25c" stroke="${LINEA}" stroke-width="2.4" stroke-linejoin="round"/>`,
  semilla: `<ellipse cx="0" cy="12" rx="15" ry="11" fill="#a0693f" stroke="${LINEA}" stroke-width="2.6"/>` +
    `<path d="M-6 9 Q0 5 6 9" stroke="#c48a58" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    `<path d="M0 2 Q0 -12 0 -20" stroke="#4f9a5b" stroke-width="3.5" stroke-linecap="round"/>` +
    `<path d="M0 -12 Q-17 -24 -20 -9 Q-9 -6 0 -12 Z" fill="#7fc25a" stroke="${LINEA}" stroke-width="2.2" stroke-linejoin="round"/>` +
    `<path d="M0 -17 Q15 -31 20 -16 Q9 -11 0 -17 Z" fill="#9ed36f" stroke="${LINEA}" stroke-width="2.2" stroke-linejoin="round"/>`,
  gota: `<path d="M0 -30 Q20 -4 18 10 Q16 28 0 28 Q-16 28 -18 10 Q-20 -4 0 -30 Z" fill="#62bde3" stroke="${LINEA}" stroke-width="2.6"/>` +
    `<ellipse cx="-7" cy="6" rx="4" ry="7" fill="#fff" opacity=".6"/>`,
  /* zona 2 · biodiversidad */
  venado: `<g transform="translate(4 4)"><path d="M-2 18 v18 M6 18 v20 M22 16 v20 M30 14 v20" stroke="#a86b3c" stroke-width="5.5" stroke-linecap="round"/>` +
    `<ellipse cx="14" cy="8" rx="27" ry="16" fill="#c98a55" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<g fill="#fff4e0"><circle cx="8" cy="2" r="2.6"/><circle cx="19" cy="6" r="2.3"/><circle cx="29" cy="0" r="2"/><circle cx="15" cy="13" r="2"/><circle cx="25" cy="12" r="1.8"/></g>` +
    `<path d="M39 0 q8 -3 4 6 z" fill="#fff4e0" stroke="${LINEA}" stroke-width="2"/>` +
    `<path d="M-6 2 Q-12 -10 -16 -18" stroke="#c98a55" stroke-width="13" stroke-linecap="round"/>` +
    `<ellipse cx="-31" cy="-35" rx="7" ry="12" transform="rotate(-42 -31 -35)" fill="#c98a55" stroke="${LINEA}" stroke-width="2.2"/>` +
    `<ellipse cx="-4" cy="-37" rx="7" ry="12" transform="rotate(38 -4 -37)" fill="#c98a55" stroke="${LINEA}" stroke-width="2.2"/>` +
    `<ellipse cx="-31" cy="-35" rx="3.2" ry="7" transform="rotate(-42 -31 -35)" fill="#f7b6c2"/><ellipse cx="-4" cy="-37" rx="3.2" ry="7" transform="rotate(38 -4 -37)" fill="#f7b6c2"/>` +
    `<ellipse cx="-18" cy="-22" rx="16" ry="14.5" fill="#c98a55" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<ellipse cx="-25" cy="-15" rx="8.5" ry="6.5" fill="#fff4e0"/><ellipse cx="-30" cy="-17" rx="3.4" ry="2.4" fill="#2a1f1b"/>` +
    `<ellipse cx="-14" cy="-25" rx="3.6" ry="4.4" fill="${OJO}"/><circle cx="-12.6" cy="-26.8" r="1.4" fill="#fff"/>` +
    `<ellipse cx="-9" cy="-16" rx="4" ry="2.4" fill="#f59fb0" opacity=".65"/></g>`,
  abeja: `<ellipse cx="-6" cy="-15" rx="9" ry="13" transform="rotate(-22 -6 -15)" fill="#e8f6ff" stroke="${LINEA}" stroke-width="2"/>` +
    `<ellipse cx="9" cy="-16" rx="9" ry="13" transform="rotate(22 9 -16)" fill="#e8f6ff" stroke="${LINEA}" stroke-width="2"/>` +
    `<path d="M21 2 l9 0 l-9 5 z" fill="${LINEA}"/>` +
    `<ellipse cx="0" cy="2" rx="22" ry="15" fill="#f6c84a" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<path d="M-1 -12 Q-5 2 -1 16 M10 -11 Q6 2 10 14" stroke="#3a2a22" stroke-width="5.5" fill="none"/>` +
    `<path d="M-14 -10 q-5 -10 -12 -12 M-8 -12 q-1 -10 -5 -15" stroke="${LINEA}" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    `<circle cx="-26" cy="-22" r="2.6" fill="${LINEA}"/><circle cx="-13" cy="-27" r="2.6" fill="${LINEA}"/>` +
    `<circle cx="-12" cy="-1" r="3" fill="${OJO}"/><circle cx="-11" cy="-2.2" r="1.1" fill="#fff"/>` +
    `<path d="M-16 5 q3 3 6 0" stroke="${LINEA}" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="-17" cy="2" rx="3" ry="2" fill="#f59fb0" opacity=".7"/>`,
  nido: `<ellipse cx="0" cy="-2" rx="31" ry="9" fill="#6b4428" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<ellipse cx="-14" cy="-6" rx="7" ry="9" fill="#bfe3f2" stroke="${LINEA}" stroke-width="2"/>` +
    `<circle cx="6" cy="-14" r="14" fill="#f6d75a" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<path d="M-2 -28 q2 -6 6 -3 q1 -5 5 -1" stroke="${LINEA}" stroke-width="2" fill="#f6d75a"/>` +
    `<circle cx="1" cy="-17" r="2.4" fill="${OJO}"/><circle cx="11" cy="-17" r="2.4" fill="${OJO}"/>` +
    `<path d="M3 -12 L9 -12 L6 -7 Z" fill="#f28b3c" stroke="${LINEA}" stroke-width="1.6" stroke-linejoin="round"/>` +
    `<path d="M-31 -2 Q-29 22 0 24 Q29 22 31 -2 Q0 8 -31 -2 Z" fill="#a0693f" stroke="${LINEA}" stroke-width="2.6" stroke-linejoin="round"/>` +
    `<path d="M-26 5 Q0 15 26 5 M-21 13 Q0 21 21 13 M-34 0 l-6 -4 M32 2 l7 -3" stroke="#c48a58" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  bellota: `<path d="M8 -26 Q24 -36 30 -22 Q20 -18 8 -26 Z" fill="#7fc25a" stroke="${LINEA}" stroke-width="2"/>` +
    `<ellipse cx="0" cy="8" rx="15" ry="19" fill="#c98a4a" stroke="${LINEA}" stroke-width="2.6"/>` +
    `<ellipse cx="-6" cy="6" rx="3.5" ry="8" fill="#e3ad6e" opacity=".7"/>` +
    `<path d="M-20 -5 Q-19 -24 0 -24 Q19 -24 20 -5 Q0 1 -20 -5 Z" fill="#8a5d3b" stroke="${LINEA}" stroke-width="2.6" stroke-linejoin="round"/>` +
    `<path d="M-12 -20 l8 12 M-2 -23 l9 14 M8 -22 l7 11 M-15 -12 l6 -10 M-4 -7 l9 -15 M8 -6 l7 -12" stroke="#6b4428" stroke-width="1.4" opacity=".7"/>` +
    `<path d="M0 -24 q2 -8 7 -10" stroke="#6b4a32" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  /* zona 3 · contaminación */
  botella: `<g transform="rotate(-58)"><path d="M-11 -12 Q-13 -6 -13 2 L-13 28 Q-13 32 -9 32 L9 32 Q13 32 13 28 L13 2 Q13 -6 11 -12 L6 -19 L6 -25 L-6 -25 L-6 -19 Z" fill="#cdeef7"/>` +
    `<rect x="-13" y="5" width="26" height="12" fill="#62bde3"/>` +
    `<path d="M-11 -12 Q-13 -6 -13 2 L-13 28 Q-13 32 -9 32 L9 32 Q13 32 13 28 L13 2 Q13 -6 11 -12 L6 -19 L6 -25 L-6 -25 L-6 -19 Z" fill="none" stroke="${LINEA}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<rect x="-7" y="-32" width="14" height="8" rx="2" fill="#4fa3d1" stroke="${LINEA}" stroke-width="2"/>` +
    `<path d="M-7 -6 V24" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/></g>`,
  lata: `<g transform="rotate(16)"><rect x="-15" y="-24" width="30" height="46" rx="5" fill="#d6dde3"/>` +
    `<rect x="-15" y="-11" width="30" height="18" fill="#e2574c"/><path d="M-9 -4 q9 -6 18 0" stroke="#fff" stroke-width="2.5" fill="none"/>` +
    `<rect x="-15" y="-24" width="30" height="46" rx="5" fill="none" stroke="${LINEA}" stroke-width="2.6"/>` +
    `<ellipse cx="0" cy="-24" rx="15" ry="4.5" fill="#b8c2ca" stroke="${LINEA}" stroke-width="2"/>` +
    `<rect x="-3" y="-28" width="8" height="4" rx="2" fill="#9aa4ac" stroke="${LINEA}" stroke-width="1.4"/>` +
    `<path d="M-15 10 l7 3 l-7 4 M15 -16 l-6 3 l6 3" stroke="${LINEA}" stroke-width="1.8" fill="none" stroke-linejoin="round"/></g>`,
  pila: `<g transform="rotate(-26)"><rect x="-12" y="-26" width="24" height="50" rx="5" fill="#3a3d45"/>` +
    `<rect x="-12" y="-26" width="24" height="17" fill="#e0a03a"/>` +
    `<rect x="-12" y="-26" width="24" height="50" rx="5" fill="none" stroke="${LINEA}" stroke-width="2.6"/>` +
    `<rect x="-4.5" y="-33" width="9" height="7" rx="1.5" fill="#c9ccd2" stroke="${LINEA}" stroke-width="2"/>` +
    `<path d="M0 -22 v9 M-4.5 -17.5 h9" stroke="#fff" stroke-width="2.6"/><path d="M-4 12 h8" stroke="#fff" stroke-width="2.6"/></g>` +
    `<path d="M18 16 q-6 9 0 12 q6 -3 0 -12 z M8 28 q-4 6 0 8 q4 -2 0 -8 z" fill="#9bd36b" stroke="${LINEA}" stroke-width="1.6"/>`,
  /* zona 4 · cambio climático */
  auto: `<g transform="translate(-10 4)"><g fill="#a9a29a" opacity=".9"><circle cx="46" cy="6" r="7"/><circle cx="55" cy="-4" r="9"/><circle cx="62" cy="-16" r="7"/></g>` +
    `<rect x="35" y="7" width="8" height="5" rx="1.5" fill="#8f8f8f" stroke="${LINEA}" stroke-width="1.4"/>` +
    `<path d="M-38 14 Q-40 0 -30 -2 L-20 -4 Q-14 -19 0 -19 L12 -19 Q22 -19 26 -4 L32 -2 Q39 0 37 14 Z" fill="#e2574c" stroke="${LINEA}" stroke-width="2.6" stroke-linejoin="round"/>` +
    `<path d="M-14 -5 Q-10 -15 -2 -15 L-2 -5 Z M3 -15 L10 -15 Q18 -15 21 -5 L3 -5 Z" fill="#cdeef7" stroke="${LINEA}" stroke-width="2" stroke-linejoin="round"/>` +
    `<circle cx="-22" cy="16" r="8.5" fill="#3a3d45" stroke="${LINEA}" stroke-width="2.4"/><circle cx="-22" cy="16" r="3" fill="#c9ccd2"/>` +
    `<circle cx="22" cy="16" r="8.5" fill="#3a3d45" stroke="${LINEA}" stroke-width="2.4"/><circle cx="22" cy="16" r="3" fill="#c9ccd2"/>` +
    `<circle cx="-35" cy="5" r="3" fill="#fff1bf" stroke="${LINEA}" stroke-width="1.5"/></g>`,
  quema: `<g fill="#a9a29a" opacity=".85"><circle cx="4" cy="-48" r="8"/><circle cx="14" cy="-60" r="10"/><circle cx="6" cy="-74" r="8"/></g>` +
    `<path d="M-26 14 Q-14 2 -6 14 M6 16 Q14 0 26 14" stroke="#c9a85a" stroke-width="3" fill="none" stroke-linecap="round"/>` +
    `<rect x="-24" y="12" width="48" height="10" rx="5" transform="rotate(14)" fill="#8a5d3b" stroke="${LINEA}" stroke-width="2.2"/>` +
    `<rect x="-24" y="12" width="48" height="10" rx="5" transform="rotate(-14)" fill="#9a6a45" stroke="${LINEA}" stroke-width="2.2"/>` +
    `<path d="M0 -38 Q18 -18 13 -1 Q10 11 0 11 Q-10 11 -13 -1 Q-18 -18 0 -38 Z" fill="#f28b3c" stroke="${LINEA}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<path d="M-14 -10 Q-26 -4 -18 8 Q-12 10 -10 2 Z M14 -12 Q26 -4 18 8 Q12 10 10 2 Z" fill="#e2574c" stroke="${LINEA}" stroke-width="2" stroke-linejoin="round"/>` +
    `<path d="M0 -20 Q8 -10 6 0 Q4 6 0 6 Q-4 6 -6 0 Q-8 -10 0 -20 Z" fill="#f6d75a"/>`,
  vaca: `<g transform="translate(2 0)"><path d="M-4 20 v14 M8 22 v14 M24 22 v14 M34 20 v14" stroke="${LINEA}" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M40 2 q10 4 6 18" stroke="${LINEA}" stroke-width="2.4" fill="none"/>` +
    `<ellipse cx="14" cy="8" rx="29" ry="18" fill="#ffffff" stroke="${LINEA}" stroke-width="2.6"/>` +
    `<path d="M6 -6 q10 -4 14 4 q-4 10 -14 6 z M26 8 q10 0 8 10 q-8 2 -10 -4 z" fill="#3a3530"/>` +
    `<path d="M-30 -24 q-4 -8 2 -10 M-12 -24 q4 -8 -2 -10" stroke="#f4e6c4" stroke-width="4" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="-38" cy="-14" rx="8" ry="4.5" transform="rotate(-20 -38 -14)" fill="#ffffff" stroke="${LINEA}" stroke-width="2"/>` +
    `<ellipse cx="-4" cy="-15" rx="8" ry="4.5" transform="rotate(20 -4 -15)" fill="#ffffff" stroke="${LINEA}" stroke-width="2"/>` +
    `<ellipse cx="-21" cy="-10" rx="16" ry="15" fill="#ffffff" stroke="${LINEA}" stroke-width="2.6"/>` +
    `<path d="M-12 -22 q8 2 6 10 q-6 0 -6 -10 z" fill="#3a3530"/>` +
    `<ellipse cx="-22" cy="0" rx="12" ry="8" fill="#f6b6c2" stroke="${LINEA}" stroke-width="2"/>` +
    `<ellipse cx="-26" cy="0" rx="1.8" ry="2.4" fill="${LINEA}"/><ellipse cx="-18" cy="0" rx="1.8" ry="2.4" fill="${LINEA}"/>` +
    `<circle cx="-27" cy="-13" r="2.8" fill="${OJO}"/><circle cx="-15" cy="-13" r="2.8" fill="${OJO}"/>` +
    `<circle cx="-26" cy="-14.2" r="1" fill="#fff"/><circle cx="-14" cy="-14.2" r="1" fill="#fff"/></g>`,
  bici: `<g fill="none" stroke-linecap="round" stroke-linejoin="round">` +
    `<circle cx="-22" cy="12" r="16" stroke="${LINEA}" stroke-width="3.4"/><circle cx="22" cy="12" r="16" stroke="${LINEA}" stroke-width="3.4"/>` +
    `<path d="M-22 12 L-22 -4 M-22 12 L-9 24 M22 12 L36 6 M22 12 L22 28" stroke="#b8b0a8" stroke-width="1.4"/>` +
    `<path d="M-22 12 L-6 -10 L14 -10 L22 12 M-6 -10 L2 12 L14 -10 M2 12 L-22 12" stroke="#3f9cc4" stroke-width="4.2"/>` +
    `<path d="M-8 -12 L-10 -20 M-16 -21 h12" stroke="${LINEA}" stroke-width="3.6"/>` +
    `<path d="M14 -10 L11 -22 h9" stroke="${LINEA}" stroke-width="3.4"/></g>` +
    `<path d="M24 -26 h18 l-3 14 h-12 z" fill="#d9b07a" stroke="${LINEA}" stroke-width="2"/>` +
    `<circle cx="30" cy="-30" r="4" fill="#f5a3c7"/><circle cx="37" cy="-29" r="3.4" fill="#f6c453"/>`,
  /* zona 5 · fenómenos poblacionales */
  maleta: `<circle cx="-16" cy="24" r="4" fill="#3a3d45"/><circle cx="16" cy="24" r="4" fill="#3a3d45"/>` +
    `<path d="M-10 -18 v-8 q0 -5 5 -5 h10 q5 0 5 5 v8" stroke="${LINEA}" stroke-width="3.5" fill="none"/>` +
    `<rect x="-27" y="-18" width="54" height="40" rx="7" fill="#c8644a" stroke="${LINEA}" stroke-width="2.6"/>` +
    `<path d="M-14 -18 V22 M14 -18 V22" stroke="#9e4a35" stroke-width="3"/>` +
    `<circle cx="-2" cy="0" r="6.5" fill="#f6c453" stroke="${LINEA}" stroke-width="1.6"/>` +
    `<rect x="4" y="6" width="14" height="9" rx="2" transform="rotate(-12 11 10)" fill="#5aa9d4" stroke="${LINEA}" stroke-width="1.4"/>` +
    `<path d="M-22 -10 l6 6" stroke="#fff" stroke-width="2.5" opacity=".5" stroke-linecap="round"/>`,
  pozo: `<path d="M-26 -4 V-44 M26 -4 V-44" stroke="${LINEA}" stroke-width="8"/><path d="M-26 -4 V-44 M26 -4 V-44" stroke="#7a5236" stroke-width="5"/>` +
    `<path d="M0 -44 V-24" stroke="#a3764a" stroke-width="2"/><path d="M-7 -24 h14 l-2 10 h-10 z" fill="#9aa4ac" stroke="${LINEA}" stroke-width="1.8"/>` +
    `<path d="M-36 -40 L0 -58 L36 -40 Z" fill="#c8644a" stroke="${LINEA}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<path d="M-30 -2 L-30 26 Q0 34 30 26 L30 -2 Z" fill="#bdb8ae" stroke="${LINEA}" stroke-width="2.6"/>` +
    `<path d="M-30 8 Q0 15 30 8 M-30 18 Q0 25 30 18 M-14 -1 v10 M12 -1 v10 M-2 11 v10 M-20 20 v8 M20 20 v8" stroke="#958f84" stroke-width="1.8" fill="none"/>` +
    `<ellipse cx="0" cy="-2" rx="30" ry="8" fill="#5a4a3a" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<ellipse cx="0" cy="0" rx="17" ry="3.6" fill="#c9a86a"/><path d="M-10 0 l5 -1.5 l4 2 l6 -1.5" stroke="#9c7f4c" stroke-width="1.2" fill="none"/>`,
  /* zona 6 · desertificación */
  carcava: `<path d="M-50 10 Q-42 -12 0 -12 Q44 -14 52 8 Q44 26 0 26 Q-44 28 -50 10 Z" fill="#d6b97c" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<path d="M-36 -2 L-24 4 L-13 -2 L0 10 L12 3 L26 13 L42 8 L35 18 L22 14 L8 22 L-6 13 L-19 16 L-31 8 Z" fill="#7d5f3c" stroke="${LINEA}" stroke-width="2" stroke-linejoin="round"/>` +
    `<path d="M-25 7 L-11 5 L1 15 L18 13 L30 15" stroke="#5e4529" stroke-width="2" fill="none"/>` +
    `<g fill="#a9a59c" stroke="${LINEA}" stroke-width="1.2"><ellipse cx="-42" cy="12" rx="4" ry="3"/><ellipse cx="44" cy="0" rx="5" ry="3.5"/><ellipse cx="18" cy="-6" rx="3" ry="2.4"/></g>`,
  chiva: `<ellipse cx="0" cy="30" rx="46" ry="8" fill="#cdb07a" opacity=".85"/>` +
    `<path d="M-40 29 l2 -10 M-36 29 l4 -12 M-32 29 l-1 -9" stroke="#b39a5e" stroke-width="2" stroke-linecap="round"/>` +
    `<path d="M-10 14 v15 M0 16 v14 M18 16 v14 M26 14 v15" stroke="${LINEA}" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M32 -2 l9 -7" stroke="${LINEA}" stroke-width="3" stroke-linecap="round"/>` +
    `<ellipse cx="10" cy="4" rx="27" ry="15" fill="#f4f1ea" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<path d="M16 -7 q11 -2 13 9 q-9 4 -13 -9 z" fill="#b9b3a6"/>` +
    `<path d="M-20 -6 q-3 -12 7 -15 M-13 -4 q2 -11 12 -11" stroke="#c9b48a" stroke-width="4" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="-9" cy="0" rx="9" ry="4" transform="rotate(20 -9 0)" fill="#f4f1ea" stroke="${LINEA}" stroke-width="2"/>` +
    `<ellipse cx="-22" cy="8" rx="11.5" ry="14" transform="rotate(-28 -22 8)" fill="#f4f1ea" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<path d="M-33 19 l-2 9 l6 -5 z" fill="#d8d2c4" stroke="${LINEA}" stroke-width="1.4"/>` +
    `<path d="M-27 4 q3 2.5 6 0" stroke="${OJO}" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="-31" cy="15" rx="2" ry="1.4" fill="${LINEA}"/><ellipse cx="-20" cy="11" rx="3" ry="1.8" fill="#f59fb0" opacity=".6"/>`,
  suelo: `<ellipse cx="0" cy="14" rx="48" ry="16" fill="#cfb47c" stroke="${LINEA}" stroke-width="2.4"/>` +
    `<path d="M-36 12 l10 -4 l8 6 l10 -5 l9 7 l12 -6 l12 4 M-22 22 l6 -7 M6 24 l4 -9 M22 8 l8 8" stroke="#9c7f4c" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<g transform="translate(16 10) scale(.75)"><path d="M-16 0 L-14 -16 L14 -16 L16 0 Z" fill="#8a5d3b" stroke="${LINEA}" stroke-width="2.5" stroke-linejoin="round"/>` +
    `<ellipse cx="0" cy="-16" rx="14" ry="5" fill="#e3bf8c" stroke="${LINEA}" stroke-width="2.5"/></g>` +
    `<path d="M-18 12 L-22 -10 M-18 12 L-12 -14 M-20 0 L-32 -8 M-15 -4 L-4 -12 M-22 -10 L-28 -18" stroke="#8a6a44" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
};

/* ───────── escena: portada ───────── */
function portada() {
  const r = rng(11);
  let s = `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">`;
  s += `<defs><linearGradient id="po-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd6c4"/><stop offset=".55" stop-color="#dff0c9"/></linearGradient>` +
    `<radialGradient id="po-sol" cx=".22" cy=".02" r=".7"><stop offset="0" stop-color="#fff7d1"/><stop offset="1" stop-color="#fff7d1" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect width="800" height="600" fill="url(#po-cielo)"/><rect width="800" height="600" fill="url(#po-sol)"/>`;
  s += nube(470, 70, 1.1) + nube(640, 125, .8) + nube(90, 150, .7);
  s += `<path d="M0 300 Q130 238 270 276 Q410 228 545 270 Q690 232 800 266 V600 H0 Z" fill="#b3d5a0"/>`;
  for (let x = -10; x < 820; x += 26 + r() * 18) {
    const y = 292 + r() * 12, k = .38 + r() * .14;
    s += r() < .5 ? pino(x, y, k, 'lej') : arbol(x, y, k, 'lej');
  }
  s += `<path d="M0 352 Q200 316 400 340 Q610 314 800 344 V600 H0 Z" fill="#93c774"/>`;
  s += arbol(250, 392, .9, 'cla') + pino(300, 380, .7, 'med') + arbol(560, 388, .95, 'cla') + pino(515, 378, .65, 'med');
  s += `<g class="rayos">` + [[40, 170], [190, 300], [330, 420]].map(([a, b]) => `<path d="M170 -40 L${a} 640 L${b} 640 Z" fill="#fffbe2"/>`).join('') + `</g>`;
  s += `<path d="M300 600 Q370 520 392 450 Q404 400 398 360 Q406 356 412 360 Q426 410 440 460 Q470 540 540 600 Z" fill="#e8d7a8"/>`;
  s += `<path d="M0 455 Q140 425 290 452 L300 600 H0 Z" fill="#76b35e"/><path d="M800 450 Q660 428 520 455 L540 600 H800 Z" fill="#76b35e"/>`;
  s += pino(150, 545, 2.1, 'osc') + arbol(60, 590, 2.7, 'osc') + pino(660, 550, 2, 'med') + arbol(748, 595, 2.7, 'osc');
  s += arbusto(232, 560, 1.3, 'med') + arbusto(590, 570, 1.4, 'med') + hongo(268, 548, 1.1) + hongo(545, 560, .9);
  [[200, 520, '#f5a3c7'], [330, 560, '#fff'], [480, 540, '#f6c453'], [612, 520, '#f5a3c7'], [360, 500, '#f6c453'], [452, 575, '#f5a3c7']]
    .forEach(([x, y, c]) => { s += flor(x, y, c, 1.2); });
  for (let k = 0; k < 14; k++) s += pasto(20 + r() * 760, 470 + r() * 125, 1 + r() * .5);
  s += mariposa(330, 250, 1, '#f5a3c7', 0) + mariposa(505, 225, .85, '#f6c453', 1.3);
  return s + '</svg>';
}

/* ───────── escena: zona 1 · el claro del pueblo ─────────
   "objetos" llega desde el motor y se dibuja ANTES del frente,
   así los arbustos, el maíz y los juncos los tapan a medias.   */
function claro(objetos = '') {
  const r = rng(5);
  let s = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">`;
  s += `<defs><linearGradient id="cl-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6dccd"/><stop offset=".5" stop-color="#e4f2cc"/></linearGradient></defs>`;
  s += `<rect width="800" height="600" fill="url(#cl-cielo)"/>`;
  s += `<circle cx="680" cy="78" r="56" fill="#fff4b8" opacity=".35"/><circle cx="680" cy="78" r="34" fill="#fff4b8"/>`;
  s += nube(120, 80, .9) + nube(420, 60, .7) + nube(300, 150, .6) + nube(540, 120, .75);
  s += `<g class="pajaros" fill="none" stroke="#3f5a4a" stroke-width="2.2" stroke-linecap="round">` +
       `<path d="M360 190 q6 -6 12 0 q6 -6 12 0"/><path d="M392 172 q5 -5 10 0 q5 -5 10 0"/><path d="M470 205 q5 -5 10 0 q5 -5 10 0"/></g>`;
  s += `<path d="M0 250 Q140 200 300 236 Q450 196 600 232 Q720 206 800 226 V600 H0 Z" fill="#b3d5a0"/>`;
  for (let x = -10; x < 820; x += 24 + r() * 18) {
    const y = 262 + r() * 10, k = .32 + r() * .12;
    s += r() < .5 ? pino(x, y, k, 'lej') : arbol(x, y, k, 'lej');
  }
  s += `<path d="M0 300 Q200 276 420 292 Q620 274 800 296 V600 H0 Z" fill="#9bcb7a"/>`;
  /* bosque de la izquierda */
  s += pino(30, 330, 1.25, 'osc') + arbol(-8, 366, 1.4, 'osc');
  s += `<g data-c="talamala"><g class="antes">${arbol(92, 324, 1.15, 'med')}${pino(146, 318, .95, 'osc')}</g>` +
       `<g class="despues">${tocon(92, 326, 1.1)}${tocon(146, 320, .95)}${troncoCaido(120, 336, .8)}</g></g>`;
  /* zona talada */
  s += tocon(212, 352, 1) + tocon(252, 340, .85) + tocon(236, 374, 1.05) + troncoCaido(282, 380, .9);
  s += `<g data-c="tala"><g class="despues">${brote(196, 366, 1)}${brote(270, 352, .9)}${brote(222, 388, 1.1)}</g></g>`;
  s += `<g data-c="reforestar"><g class="despues"><g class="brote-crece">${arbol(232, 352, .42, 'cla', true)}${pino(262, 368, .4, 'med')}${arbol(204, 382, .38, 'cla', true)}</g></g></g>`;
  /* milpa */
  s += `<path d="M292 352 L436 346 L446 432 L284 440 Z" fill="#b98a5a"/>`;
  s += `<g stroke="#a3764a" stroke-width="3" stroke-linecap="round"><path d="M296 366 L438 360"/><path d="M292 384 L440 378"/><path d="M290 402 L442 396"/><path d="M288 420 L444 414"/></g>`;
  s += `<g data-c="suelo"><g class="despues">` + [[300, 366], [296, 384], [292, 402], [290, 420]].map(([x, y]) =>
    `<path d="M${x} ${y} L${x + 146} ${y - 6}" stroke="#7fbf5a" stroke-width="7" stroke-linecap="round" stroke-dasharray="4 7"/>`).join('') + `</g></g>`;
  for (let x = 302; x <= 430; x += 22) s += maiz(x, 370, .62) + maiz(x + 10, 394, .7);
  /* pueblo */
  s += casa(400, 316, 1, '#f3dfb8', '#c8644a', true) + casa(488, 300, .85, '#e9cfa3', '#5a8fb5') + casa(542, 334, .75, '#f1d9c0', '#8a6bb0', true);
  /* derecha: árboles y fábrica */
  s += arbol(612, 302, .9, 'med') + fabrica(714, 312, 1) + pino(792, 334, 1.2, 'osc');
  /* río con basura en la orilla */
  s += `<path d="M420 600 C 470 520, 560 482, 640 476 C 700 472, 760 454, 800 442 L800 500 C 760 508, 712 522, 660 532 C 600 546, 540 572, 520 600 Z" fill="#7cc5e3"/>`;
  s += `<path d="M560 522 q12 -4 24 0 M650 500 q10 -4 20 0 M722 488 q10 -3 20 0 M500 572 q10 -4 20 0" stroke="#d9f1fa" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  s += `<g data-c="basura"><g class="antes">${bolsa(684, 470, .9)}${botella(720, 464, .9)}${bolsa(628, 480, .7)}</g>` +
       `<g class="despues">${flor(650, 474, '#fff', 1)}${flor(700, 466, '#f5a3c7', 1)}</g></g>`;
  s += rocas(566, 466, 1);
  /* objetos escondidos */
  s += objetos;
  /* frente: no recibe toques, así el objeto tapado se puede tocar igual */
  s += `<g class="frente">`;
  s += arbusto(184, 438, 1.05, 'med', true);
  s += maiz(300, 432, .95) + maiz(328, 438, 1) + maiz(372, 438, 1) + maiz(410, 432, .9);
  s += juncos(608, 478, 1.1) + juncos(570, 486, .9);
  s += hongo(772, 422, 1.15) + pasto(742, 420, 1.2) + pasto(790, 424, 1);
  s += arbusto(30, 612, 1.7, 'osc') + arbusto(250, 616, 1.3, 'med') + arbusto(800, 612, 1.6, 'med');
  s += flor(120, 560, '#f5a3c7', 1.2) + flor(300, 585, '#f6c453', 1.1) + flor(430, 560, '#fff', 1.1);
  for (let k = 0; k < 10; k++) s += pasto(r() * 420, 470 + r() * 120, 1 + r() * .5);
  s += `</g>`;
  return s + '</svg>';
}

const pajarito = (x, y, s, c) => _en(x, y, s) +
  `<path d="M9 -2 l10 -5 l-3 8 z" fill="${c}" stroke="${LINEA}" stroke-width="1.6" stroke-linejoin="round"/>` +
  `<ellipse cx="0" cy="0" rx="11" ry="8" fill="${c}" stroke="${LINEA}" stroke-width="2"/>` +
  `<circle cx="-8" cy="-6" r="6.5" fill="${c}" stroke="${LINEA}" stroke-width="2"/>` +
  `<path d="M-14 -7 l-6 2 l6 2 z" fill="#f28b3c"/><circle cx="-9.5" cy="-7.5" r="1.6" fill="${OJO}"/></g>`;

/* ───────── escena: zona 2 · el corazón del bosque ───────── */
function bosque(objetos = '') {
  const r = rng(23);
  let s = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">`;
  s += `<defs><linearGradient id="bo-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86c4ad"/><stop offset=".55" stop-color="#cfe8bd"/></linearGradient></defs>`;
  s += `<rect width="800" height="600" fill="url(#bo-cielo)"/>`;
  s += nube(560, 70, .7) + nube(160, 110, .6) + nube(380, 150, .5);
  s += `<path d="M0 226 Q200 186 400 212 Q600 184 800 210 V600 H0 Z" fill="#9cc98a"/>`;
  for (let x = -10; x < 820; x += 20 + r() * 14) { const y = 240 + r() * 10, k = .4 + r() * .14; s += r() < .55 ? pino(x, y, k, 'lej') : arbol(x, y, k, 'lej'); }
  s += `<path d="M0 282 Q220 258 420 274 Q620 254 800 276 V600 H0 Z" fill="#8cc173"/>`;
  for (let x = -20; x < 830; x += 44 + r() * 26) { const y = 300 + r() * 12, k = .6 + r() * .22; s += r() < .5 ? pino(x, y, k, 'med') : arbol(x, y, k, 'med'); }
  s += `<path d="M0 328 Q240 310 420 324 Q620 308 800 330 V600 H0 Z" fill="#7fb466"/>`;
  s += `<g class="rayos">` + [[90, 230], [360, 500], [560, 690]].map(([a, b]) => `<path d="M330 -40 L${a} 640 L${b} 640 Z" fill="#fffbe2"/>`).join('') + `</g>`;
  /* árboles grandes */
  s += pino(26, 476, 1.6, 'osc') + arbol(150, 452, 1.9, 'osc') + arbol(722, 432, 1.25, 'med') + pino(784, 482, 1.75, 'osc');
  /* claro talado */
  s += tocon(300, 404, 1) + tocon(348, 392, .85) + tocon(396, 412, 1.05) + tocon(330, 434, .9) + troncoCaido(432, 442, .9);
  /* prado con flores */
  for (let k = 0; k < 16; k++) s += flor(452 + r() * 120, 436 + r() * 40, ['#f5a3c7', '#f6c453', '#fff', '#c9b6f0'][k % 4], .9 + r() * .4);
  /* cambios que provoca el jugador */
  s += `<g data-c="reforestar"><g class="despues"><g class="brote-crece">${arbol(318, 398, .32, 'cla', true)}${pino(372, 406, .34, 'med')}${arbol(412, 432, .3, 'cla', true)}${arbol(354, 444, .28, 'cla', true)}</g></g></g>`;
  s += `<g data-c="protegida"><g class="despues">${letrero(236, 482, .85, 'Área natural protegida')}</g></g>`;
  s += `<g data-c="animales"><g class="despues">${pajarito(348, 380, .9, '#e2574c')}${pajarito(396, 400, .85, '#5aa9d4')}` +
       `${mariposa(400, 330, .9, '#f5a3c7', .2)}${mariposa(520, 360, .8, '#f6c453', .9)}${mariposa(620, 320, .85, '#c9b6f0', 1.5)}</g></g>`;
  s += `<g data-c="carretera"><g class="despues">${carretera('M-20 492 C 200 472, 520 514, 820 482', 46)}${pieza('auto', 560, 494, .6)}` +
       `${tocon(470, 468, .8)}${tocon(612, 472, .9)}${tocon(256, 474, .75)}</g></g>`;
  s += `<g data-c="corredor"><g class="despues">${carretera('M-20 530 C 260 510, 540 542, 820 518', 40)}` +
       `<path d="M316 562 Q324 496 352 486 L448 486 Q476 496 484 562 Z" fill="#8fc472" stroke="${LINEA}" stroke-width="3" stroke-linejoin="round"/>` +
       `<path d="M360 562 Q400 506 440 562 Z" fill="#4c5c4a"/>` +
       `${arbusto(350, 492, .55, 'med')}${arbusto(452, 494, .5, 'cla')}${pieza('venado', 404, 470, .5)}${letrero(566, 500, .75, 'Paso de fauna')}</g></g>`;
  /* objetos escondidos */
  s += objetos;
  /* frente */
  s += `<g class="frente">`;
  s += _circ([[150, 330, 22], [192, 326, 18], [170, 342, 16]], TONO.osc.sombra) + _circ([[148, 326, 17], [190, 322, 13]], TONO.osc.base);
  s += flor(492, 470, '#f5a3c7', 1.7) + flor(518, 464, '#fff', 1.6) + flor(506, 480, '#f6c453', 1.5);
  s += arbusto(648, 456, 1.75, 'med', true) + arbusto(70, 508, .95, 'cla');
  s += arbusto(30, 616, 1.8, 'osc') + arbusto(262, 620, 1.3, 'med') + arbusto(560, 622, 1.2, 'med') + arbusto(800, 612, 1.7, 'osc');
  s += hongo(110, 520, 1) + hongo(690, 500, .9);
  for (let k = 0; k < 12; k++) s += pasto(r() * 800, 480 + r() * 110, 1 + r() * .5, '#3f7a3e');
  s += `</g>`;
  return s + '</svg>';
}

/* ───────── escena: zona 3 · el río de los sauces ───────── */
const RIO_Z3 = 'M40 300 C 200 306, 320 340, 420 392 C 520 444, 592 512, 632 600 L350 600 C 330 520, 270 452, 190 412 C 130 382, 80 362, 30 354 Z';

function rio(objetos = '') {
  const r = rng(41);
  let s = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">`;
  s += `<defs><linearGradient id="ri-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6d6d2"/><stop offset=".5" stop-color="#e2f0d2"/></linearGradient></defs>`;
  s += `<rect width="800" height="600" fill="url(#ri-cielo)"/>`;
  s += nube(300, 80, .8) + nube(560, 120, .7) + nube(700, 60, .6);
  s += `<path d="M0 238 Q160 200 340 228 Q520 196 800 232 V600 H0 Z" fill="#b5d49e"/>`;
  for (let x = 180; x < 820; x += 22 + r() * 16) { const y = 252 + r() * 8, k = .32 + r() * .12; s += r() < .5 ? pino(x, y, k, 'lej') : arbol(x, y, k, 'lej'); }
  s += `<path d="M0 278 Q200 262 420 276 Q620 262 800 280 V600 H0 Z" fill="#a3cd86"/>`;
  /* fábrica río arriba y su tubo */
  s += fabrica(118, 292, .7);
  s += `<path d="M140 290 Q142 306 120 314 L96 320" stroke="${LINEA}" stroke-width="10" fill="none" stroke-linecap="round"/>` +
       `<path d="M140 290 Q142 306 120 314 L96 320" stroke="#9a9a96" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  /* pueblo en la orilla derecha */
  s += casa(664, 346, .72, '#f3dfb8', '#c8644a', true) + casa(738, 332, .62, '#e9cfa3', '#5a8fb5') + casa(792, 354, .66, '#f1d9c0', '#8a6bb0');
  s += arbol(560, 340, .7, 'med') + arbol(612, 332, .55, 'cla');
  /* el río */
  s += `<path d="${RIO_Z3}" fill="#8fb39a" stroke="#6f9a76" stroke-width="4"/>`;
  s += `<g data-c="sucio"><g class="despues"><path d="${RIO_Z3}" fill="#8a7448" opacity=".72"/>${bolsa(470, 520, .7)}${botella(580, 560, .8)}${bolsa(300, 420, .6)}` +
       `<g fill="#e9e2c8" opacity=".8"><ellipse cx="380" cy="430" rx="12" ry="4"/><ellipse cx="520" cy="490" rx="16" ry="5"/><ellipse cx="240" cy="380" rx="10" ry="3.5"/></g></g></g>`;
  s += `<g data-c="cerrada"><g class="despues"><path d="${RIO_Z3}" fill="#93c4c6" opacity=".65"/>${letrero(150, 330, .7, 'Cerrado')}</g></g>`;
  s += `<g data-c="tratamiento"><g class="despues"><path d="${RIO_Z3}" fill="#6cc3e6" opacity=".9"/>${plantaTratamiento(206, 304, .55)}` +
       `<path d="M96 320 q-6 8 2 14 q8 6 2 14" stroke="#9ee0f5" stroke-width="5" fill="none" stroke-linecap="round"/>` +
       `${pez(470, 498, .9)}${pez(330, 404, .7, '#f6c453', true)}${pez(560, 572, .8, '#e2574c')}</g></g>`;
  s += `<path d="M150 344 q14 -5 28 0 M300 392 q14 -5 28 0 M420 440 q14 -5 28 0 M470 520 q14 -5 28 0 M520 576 q14 -5 28 0" stroke="#e6f6fa" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`;
  s += `<g data-c="sindescarga"><g class="antes"><ellipse cx="170" cy="344" rx="78" ry="15" fill="#6f5f3e" opacity=".5"/>` +
       `<ellipse cx="250" cy="372" rx="54" ry="11" fill="#6f5f3e" opacity=".32"/>` +
       `<path d="M96 320 q-6 8 2 14 q8 6 2 14" stroke="#5c4f34" stroke-width="5" fill="none" stroke-linecap="round"/>` +
       `<g fill="#e9e2c8" opacity=".7"><circle cx="140" cy="342" r="3"/><circle cx="176" cy="348" r="2.4"/><circle cx="210" cy="340" r="2"/></g></g></g>`;
  /* sauces y nenúfares */
  s += sauce(40, 470, .95) + sauce(250, 478, 1.15) + sauce(704, 432, 1.1);
  s += nenufar(390, 438, 1, '#f5a3c7') + nenufar(432, 456, .8) + nenufar(356, 456, .7);
  /* objetos escondidos */
  s += objetos;
  /* frente */
  s += `<g class="frente">`;
  s += sauce(250, 478, 1.15, true);
  s += juncos(494, 504, 1.1) + juncos(538, 498, .95) + rocas(694, 508, 1.15);
  s += arbusto(20, 612, 1.6, 'osc') + arbusto(800, 614, 1.6, 'med') + arbusto(720, 600, 1, 'cla');
  s += flor(110, 540, '#f5a3c7', 1.1) + flor(180, 560, '#fff', 1) + flor(700, 560, '#f6c453', 1.1);
  for (let k = 0; k < 8; k++) s += pasto(20 + r() * 260, 480 + r() * 100, 1 + r() * .4);
  for (let k = 0; k < 5; k++) s += pasto(660 + r() * 140, 470 + r() * 110, 1 + r() * .4);
  s += `</g>`;
  return s + '</svg>';
}

/* ───────── escena: zona 4 · la colina del viento ───────── */
function colina(objetos = '') {
  const r = rng(57);
  let s = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">`;
  s += `<defs><linearGradient id="co-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1c98a"/><stop offset=".5" stop-color="#fbeec6"/></linearGradient></defs>`;
  s += `<rect width="800" height="600" fill="url(#co-cielo)"/>`;
  s += solCaliente(690, 92, 40);
  s += `<g stroke="#f6d39a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"><path d="M40 196 q20 -8 40 0 t40 0"/><path d="M220 168 q16 -7 32 0 t32 0"/><path d="M420 190 q18 -7 36 0 t36 0"/></g>`;
  s += `<path d="M0 252 Q180 214 360 240 Q560 210 800 244 V600 H0 Z" fill="#d6d38e"/>`;
  for (let x = -10; x < 820; x += 34 + r() * 30) { const y = 262 + r() * 8, k = .3 + r() * .1; s += r() < .4 ? pino(x, y, k, 'lej') : arbol(x, y, k, 'lej'); }
  s += `<path d="M0 300 Q200 286 400 298 Q600 284 800 300 V600 H0 Z" fill="#b8cd78"/>`;
  /* la colina */
  s += `<path d="M250 600 L250 446 Q396 232 560 220 Q704 212 812 296 V600 Z" fill="#b2c56a"/>`;
  s += `<path d="M320 370 Q440 252 560 238 Q660 232 740 268" stroke="#c9d886" stroke-width="12" fill="none" stroke-linecap="round" opacity=".75"/>`;
  s += `<g stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".75">` +
       `<path d="M420 300 q26 -12 52 0 t52 0"><animate attributeName="opacity" values=".8;.15;.8" dur="3s" repeatCount="indefinite"/></path>` +
       `<path d="M580 280 q22 -10 44 0 t44 0"><animate attributeName="opacity" values=".2;.8;.2" dur="3.4s" repeatCount="indefinite"/></path>` +
       `<path d="M520 350 q20 -9 40 0"><animate attributeName="opacity" values=".7;.1;.7" dur="2.6s" repeatCount="indefinite"/></path></g>`;
  /* pueblo, árboles y potrero */
  s += arbol(16, 424, .9, 'cla') + arbol(282, 362, .66, 'cla');
  s += casa(66, 392, .75, '#f3dfb8', '#c8644a') + casa(148, 378, .66, '#e9cfa3', '#5a8fb5') + casa(226, 396, .7, '#f1d9c0', '#8a6bb0');
  s += cerca(340, 540, 414, 1);
  s += carretera('M-20 438 C 180 426, 300 454, 430 478 C 540 498, 660 508, 820 492', 34);
  for (let k = 0; k < 7; k++) s += pasto(330 + r() * 200, 360 + r() * 40, .9, '#7f9a46');
  /* cambios que provoca el jugador */
  s += `<g data-c="renovable"><g class="despues">${aerogenerador(470, 272, .9, 0)}${aerogenerador(566, 244, 1, 1.3)}${aerogenerador(662, 256, .9, 2.4)}` +
       `${panelSolar(404, 344, .9)}${panelSolar(446, 330, .9)}${panelSolar(58, 352, .42)}${panelSolar(222, 356, .4)}</g></g>`;
  s += `<g data-c="carbon"><g class="despues"><rect width="800" height="320" fill="#8a7a6a" opacity=".22"/>${fabrica(724, 410, 1.15)}` +
       `${humo(700, 270, 2.2, '#6d6a66')}${humo(752, 300, 1.6, '#7d7a76')}</g></g>`;
  /* objetos escondidos */
  s += objetos;
  /* frente */
  s += `<g class="frente">`;
  s += arbusto(286, 474, 1.2, 'cla', true) + paca(502, 410, 1.15) + paca(536, 418, .8) + rocas(650, 480, 1.25);
  s += flor(30, 474, '#f5a3c7', 1.2) + flor(52, 470, '#f6c453', 1.1) + pasto(18, 474, 1.2) + pasto(62, 476, 1);
  s += arbusto(24, 618, 1.6, 'med') + arbusto(800, 616, 1.6, 'med');
  for (let k = 0; k < 10; k++) s += pasto(r() * 800, 500 + r() * 90, 1 + r() * .4, '#6f8f3e');
  s += `</g>`;
  return s + '</svg>';
}

/* ───────── escena: zona 5 · la aldea que crece ───────── */
function aldea(objetos = '') {
  const r = rng(71);
  let s = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">`;
  s += `<defs><linearGradient id="al-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d8cf"/><stop offset=".5" stop-color="#eaf3d2"/></linearGradient></defs>`;
  s += `<rect width="800" height="600" fill="url(#al-cielo)"/>`;
  s += nube(140, 90, .8) + nube(600, 70, .7) + nube(380, 150, .55);
  s += `<path d="M0 236 Q180 204 360 228 Q560 200 800 232 V600 H0 Z" fill="#b8d6a0"/>`;
  for (let x = -10; x < 820; x += 24 + r() * 16) { const y = 250 + r() * 8, k = .32 + r() * .12; s += r() < .5 ? pino(x, y, k, 'lej') : arbol(x, y, k, 'lej'); }
  s += `<path d="M0 282 Q200 268 420 280 Q620 266 800 284 V600 H0 Z" fill="#a7cf88"/>`;
  /* bosque al fondo, a la izquierda: se quema si eligen abrir parcelas */
  let bosqueIzq = '';
  for (let x = 10; x < 260; x += 34) bosqueIzq += (x / 34) % 2 < 1 ? pino(x, 322 + r() * 8, .62 + r() * .2, 'med') : arbol(x, 320 + r() * 8, .6 + r() * .2, 'med');
  s += `<g data-c="desmonte"><g class="antes">${bosqueIzq}</g><g class="despues">` +
       `<path d="M-10 330 Q120 300 270 322 L270 346 Q120 340 -10 352 Z" fill="#a98458"/>` +
       `${tocon(40, 334, .55)}${tocon(110, 326, .5)}${tocon(180, 330, .55)}${tocon(240, 336, .5)}${humo(90, 300, 1.3, '#9a948c')}${humo(200, 306, 1.1, '#9a948c')}</g></g>`;
  /* milpa */
  s += `<path d="M30 362 L232 354 L240 412 L22 420 Z" fill="#c49a66"/>`;
  s += `<g stroke="#a3764a" stroke-width="3" stroke-linecap="round"><path d="M34 376 L234 368"/><path d="M30 392 L236 384"/><path d="M26 408 L238 400"/></g>`;
  for (let x = 46; x <= 222; x += 26) s += maiz(x, 384, .5) + maiz(x + 12, 404, .55);
  /* bosque a la derecha: se tala si construyen casas en él */
  s += `<g data-c="expansion"><g class="antes">${pino(626, 352, 1, 'osc')}${arbol(686, 342, 1.05, 'med')}${pino(744, 358, 1.1, 'osc')}${arbol(796, 350, 1, 'med')}` +
       `${arbol(652, 404, .9, 'med')}${pino(720, 414, .95, 'osc')}${arbol(784, 422, 1, 'med')}</g>` +
       `<g class="despues">${tocon(616, 356, .6)}${tocon(796, 352, .6)}${casa(646, 362, .55, '#e9cfa3', '#5a8fb5')}${casa(708, 352, .5, '#f1d9c0', '#8a6bb0')}` +
       `${casa(768, 366, .55, '#f3dfb8', '#c8644a')}${casa(674, 412, .6, '#f3dfb8', '#7a9a52')}${casa(746, 422, .58, '#e9cfa3', '#c8644a')}${tocon(712, 440, .6)}</g></g>`;
  /* la aldea: fila de atrás */
  s += casa(296, 346, .6, '#e9cfa3', '#5a8fb5') + casa(358, 338, .55, '#f1d9c0', '#8a6bb0') + casa(420, 344, .6, '#f3dfb8', '#7a9a52', true) +
       casa(484, 340, .55, '#e9cfa3', '#c8644a') + casa(546, 348, .6, '#f1d9c0', '#5a8fb5');
  s += `<g data-c="compacta"><g class="despues"><g class="brote-crece">${edificio(352, 384, .95)}</g>${arbol(286, 398, .45, 'cla', true)}${arbol(590, 392, .42, 'cla', true)}</g></g>`;
  /* fila de enfrente */
  s += casa(284, 410, .78, '#f3dfb8', '#c8644a') + casa(374, 414, .7, '#e9cfa3', '#8a6bb0') + casa(536, 408, .8, '#f1d9c0', '#5a8fb5', true);
  s += `<g data-c="lluvia"><g class="despues">${cisterna(318, 410, .8)}${cisterna(408, 414, .7)}${cisterna(572, 410, .8)}` +
       `<g transform="translate(470 130)">${nube(-30, 0, 1)}<g stroke="#7fb7d8" stroke-width="3" stroke-linecap="round"><path d="M-30 26 l-6 16"/><path d="M-6 30 l-6 16"/><path d="M18 26 l-6 16"/></g></g></g></g>`;
  /* plaza con el pozo */
  s += `<ellipse cx="452" cy="452" rx="94" ry="22" fill="#e6d7ad" stroke="#cdbb8a" stroke-width="2"/>`;
  s += `<g data-c="pozos"><g class="despues">${grietas(420, 462, 1)}${grietas(500, 456, .9)}${bomba(388, 456, .8)}${bomba(516, 450, .8)}${bomba(566, 466, .75)}</g></g>`;
  s += carretera('M-20 506 C 200 492, 520 524, 820 500', 30);
  s += `<g data-c="huertos"><g class="despues">${huerto(256, 470, .7)}${huerto(318, 476, .7)}${huerto(614, 476, .65)}</g></g>`;
  s += parada(134, 488, .9);
  /* objetos escondidos */
  s += objetos;
  /* frente */
  s += `<g class="frente">`;
  s += banca(184, 492, 1) + puesto(488, 474, .85);
  s += arbusto(24, 616, 1.6, 'med') + arbusto(800, 616, 1.6, 'med') + arbusto(250, 610, 1.1, 'cla');
  s += flor(60, 540, '#f5a3c7', 1.1) + flor(720, 548, '#f6c453', 1.1) + flor(420, 568, '#fff', 1);
  for (let k = 0; k < 10; k++) s += pasto(r() * 800, 520 + r() * 70, 1 + r() * .4);
  s += `</g>`;
  return s + '</svg>';
}

/* ───────── escena: zona 6 · el borde seco ───────── */
function seco(objetos = '') {
  const r = rng(83);
  let s = `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">`;
  s += `<defs><linearGradient id="se-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0cf98"/><stop offset=".5" stop-color="#f9ecd2"/></linearGradient></defs>`;
  s += `<rect width="800" height="600" fill="url(#se-cielo)"/>`;
  s += solCaliente(150, 94, 34);
  s += `<path d="M0 254 L70 252 L92 226 L196 224 L216 250 L400 252 L420 232 L500 230 L520 252 L800 250 V600 H0 Z" fill="#d6b27a"/>`;
  s += `<path d="M0 270 Q200 258 400 268 Q600 256 800 270 V600 H0 Z" fill="#dcc08a"/>`;
  s += `<path d="M0 292 Q200 280 400 290 Q600 278 800 292 V600 H0 Z" fill="#e2c88e"/>`;
  /* el último borde verde del bosque */
  s += arbol(-8, 336, .95, 'cla') + pino(44, 340, .7, 'med') + arbusto(84, 350, .8, 'cla');
  /* vegetación seca y grietas */
  s += mezquite(338, 362, .7, true) + mezquite(612, 336, .6, true) + nopal(430, 370, .55) + maguey(292, 382, .42) + maguey(470, 352, .36);
  for (let k = 0; k < 9; k++) s += arbustoSeco(120 + r() * 640, 360 + r() * 160, .7 + r() * .4);
  for (let k = 0; k < 14; k++) s += grietas(r() * 800, 380 + r() * 200, .8 + r() * .6, '#c4a670');
  s += cerca(440, 640, 366, .9);
  s += rocas(120, 420, .8);
  /* cambios que provoca el jugador, en el mismo lugar de cada zona dañada */
  let terr = `<ellipse cx="0" cy="10" rx="56" ry="20" fill="#c9b07a"/>`;
  [-14, 0, 14].forEach((dy, k) => {
    for (let x = -44 + k * 4; x <= 44 - k * 4; x += 11) terr += `<ellipse cx="${x}" cy="${dy + 6}" rx="6" ry="4" fill="#b8b2a6" stroke="${LINEA}" stroke-width="1.3"/>`;
    terr += pasto(-30 + k * 10, dy + 2, .8, '#6f9a46') + pasto(10 + k * 6, dy + 2, .8, '#6f9a46') + pasto(32 - k * 8, dy + 2, .7, '#6f9a46');
  });
  s += `<g data-c="terrazas"><g class="despues">${_en(214, 432, 1)}${terr}</g>${flor(180, 424, '#f6c453', .8)}${flor(250, 446, '#f5a3c7', .8)}</g></g>`;
  s += `<g data-c="erosion"><g class="despues">${_en(214, 436, 1.5)}${OBJETOS.carcava}</g>${grietas(150, 470, 1.2, '#9c7f4c')}${grietas(280, 468, 1.1, '#9c7f4c')}</g></g>`;
  s += `<g data-c="pastoreo"><g class="despues"><ellipse cx="520" cy="414" rx="96" ry="22" fill="#b6cf78"/>` +
       `${pasto(470, 416, 1.2, '#5f9a46')}${pasto(500, 424, 1.1, '#5f9a46')}${pasto(570, 418, 1.2, '#5f9a46')}${pasto(600, 410, 1, '#5f9a46')}` +
       `${flor(450, 420, '#f6c453', .9)}${flor(590, 426, '#fff', .9)}${pieza('chiva', 538, 398, .55)}</g></g>`;
  s += `<g data-c="sobrepastoreo"><g class="despues"><ellipse cx="520" cy="420" rx="110" ry="22" fill="#cdb07a"/>` +
       `${pieza('chiva', 452, 398, .5)}${pieza('chiva', 600, 404, .55)}${pieza('chiva', 520, 412, .52)}${humo(560, 418, .9, '#e6d3a8')}</g></g>`;
  s += `<g data-c="reforestar"><g class="despues"><ellipse cx="690" cy="466" rx="74" ry="18" fill="#c3d58a"/>` +
       `<g class="brote-crece">${mezquite(700, 466, .9)}${maguey(644, 476, .55)}${nopal(746, 478, .65)}</g></g></g>`;
  s += `<g data-c="tala"><g class="despues"><ellipse cx="690" cy="468" rx="80" ry="18" fill="#cbb07a"/>` +
       `${grietas(672, 470, 1.4, '#9c7f4c')}${tocon(652, 470, .7)}${tocon(712, 462, .65)}${tocon(744, 476, .6)}</g></g>`;
  /* objetos escondidos */
  s += objetos;
  /* frente */
  s += `<g class="frente">`;
  s += nopal(262, 474, .7) + rocas(566, 430, 1) + maguey(640, 494, .5);
  s += rocas(30, 600, 1.4) + rocas(790, 596, 1.3);
  for (let k = 0; k < 8; k++) s += pasto(r() * 800, 520 + r() * 70, 1 + r() * .4, '#b39a5e');
  s += `</g>`;
  return s + '</svg>';
}

const ESCENAS = { portada, claro, bosque, rio, colina, aldea, seco };
