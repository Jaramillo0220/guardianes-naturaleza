/* ══════════════════════════════════════════════════════════
   MAPA — el sendero que une las zonas del bosque.
   El mapa refleja las consecuencias de lo que hace el jugador:
   · Cada zona deja una HUELLA según la decisión que se tomó en ella
     (grupos .hv con clases si-buena / si-mala / si-regular / no-mala).
   · Cada barra del planeta controla algo concreto:
       biodiversidad → flores y mariposas          (.u-bio, aparecen si la barra ≥ t)
       calidad       → color del río y basura      (--rio y .u-basura, si la barra < t)
       clima         → neblina cálida              (capa .calor en index.html)
       suelo         → manchas secas en el pasto   (.u-seco, si la barra < t)
   El motor (juego.js) decide los valores con aplicarEstadoMapa().
   ══════════════════════════════════════════════════════════ */

function _suave(p) {
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] || p[i], b = p[i], c = p[i + 1], e = p[i + 2] || c;
    d += ` C${f1(b[0] + (c[0] - a[0]) / 6)} ${f1(b[1] + (c[1] - a[1]) / 6)} ${f1(c[0] - (e[0] - b[0]) / 6)} ${f1(c[1] - (e[1] - b[1]) / 6)} ${c[0]} ${c[1]}`;
  }
  return d;
}

/* punto de una curva Bézier cúbica */
function _bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [0, 1].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
}

const _hv = (clase, contenido) => `<g class="hv ${clase}">${contenido}</g>`;
const _umbral = (clase, t, contenido, retraso = 0) =>
  `<g class="${clase}" data-t="${Math.round(t)}" style="--d:${retraso.toFixed(2)}s">${contenido}</g>`;

function _mancha(x, y, s) {
  return _en(x, y, s) + `<ellipse rx="34" ry="15" fill="#d8c287"/><ellipse cx="-6" cy="-2" rx="22" ry="9" fill="#e2cf98"/>` +
    `<path d="M-20 2 l8 -5 l6 4 l7 -6 M4 6 l6 -4 l8 3" stroke="#b39a5e" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
}

function _decorNodo(n) {
  const { x, y } = n;
  let g = '';
  switch (n.decor) {
    case 'casa':
      g += casa(x - 74, y + 6, .42, '#f3dfb8', '#c8644a', true) + casa(x + 72, y - 12, .38, '#e9cfa3', '#5a8fb5');
      g += _hv('no-mala', arbol(x + 40, y - 56, .4, 'med') + arbol(x - 40, y - 62, .36, 'cla'));
      g += _hv('si-mala', tocon(x + 40, y - 58, .5) + tocon(x - 40, y - 64, .45) + tocon(x + 6, y - 72, .4) + troncoCaido(x - 6, y - 44, .42));
      g += _hv('si-buena', arbol(x + 4, y - 78, .3, 'cla', true) + pino(x + 98, y - 44, .32, 'med') + arbol(x - 104, y - 32, .3, 'cla', true) + pino(x + 70, y - 84, .28, 'med'));
      break;
    case 'mariposa':
      g += arbol(x - 74, y - 2, .55, 'osc') + pino(x + 70, y - 4, .5, 'osc');
      g += _hv('no-mala', arbol(x + 6, y - 66, .45, 'med'));
      g += _hv('si-mala', carretera(`M${x - 140} ${y + 62} C ${x - 40} ${y + 22}, ${x + 40} ${y - 24}, ${x + 140} ${y - 58}`, 16) +
        tocon(x + 6, y - 70, .5) + tocon(x - 34, y - 52, .4));
      g += _hv('si-buena', pino(x - 30, y - 78, .34, 'med') + arbol(x + 48, y - 60, .32, 'cla', true) + pieza('venado', x + 58, y + 38, .3) +
        mariposa(x + 24, y - 100, .6, '#f6c453', .8));
      break;
    case 'rio': {
      const P = [[x - 210, y + 80], [x - 90, y + 22], [x + 60, y + 72], [x + 210, y - 24]];
      const d = `M${P[0][0]} ${P[0][1]} C ${P[1][0]} ${P[1][1]}, ${P[2][0]} ${P[2][1]}, ${P[3][0]} ${P[3][1]}`;
      g += `<path class="rio-agua" d="${d}" stroke="#7cc5e3" stroke-width="28" fill="none" stroke-linecap="round"/>`;
      g += `<path d="M${x - 124} ${y + 54} q14 -5 28 0 M${x + 74} ${y + 32} q14 -5 28 0" stroke="#e6f6fa" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>`;
      /* basura flotando: aparece cuando la calidad ambiental baja */
      [[.14, 62, 'bolsa'], [.36, 54, 'botella'], [.62, 46, 'bolsa'], [.86, 38, 'botella']].forEach(([t, umbral, tipo], k) => {
        const [bx, by] = _bez(...P, t);
        g += _umbral('u-basura', umbral, tipo === 'bolsa' ? bolsa(bx, by + 6, .5) : botella(bx, by + 2, .55), k * .25);
      });
      g += _hv('si-mala', `<path d="${d}" stroke="#6d5a38" stroke-width="14" fill="none" stroke-linecap="round" opacity=".45"/>` +
        fabrica(x - 176, y + 30, .32));
      g += _hv('si-buena', pez(x - 40, y + 40, .5) + pez(x + 110, y + 16, .45, '#f6c453', true) + nenufar(x + 30, y + 52, .6, '#f5a3c7'));
      break;
    }
    case 'viento':
      g += `<path d="M${x - 110} ${y + 40} Q${x} ${y - 72} ${x + 110} ${y + 40} Z" fill="#c9de8a"/>` +
        `<path d="M${x - 72} ${y - 30} q20 -10 40 0 t40 0 M${x + 22} ${y - 50} q16 -8 32 0" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".85"/>`;
      g += _hv('si-buena', aerogenerador(x - 80, y + 22, .34, 0) + aerogenerador(x + 82, y + 22, .34, 1.4) + aerogenerador(x + 44, y - 30, .28, 2.2));
      g += _hv('si-mala', fabrica(x + 96, y + 10, .36) + humo(x + 82, y - 34, 1, '#7d7a76'));
      break;
    case 'aldea':
      g += _hv('no-mala', arbol(x + 112, y - 30, .4, 'med') + pino(x - 112, y - 26, .4, 'osc') + arbol(x + 104, y + 24, .36, 'med'));
      g += casa(x - 52, y - 46, .32, '#e9cfa3', '#5a8fb5') + casa(x + 46, y - 52, .3, '#f3dfb8', '#7a9a52') +
        casa(x - 76, y + 4, .38, '#f1d9c0', '#8a6bb0') + casa(x + 74, y - 4, .4, '#f3dfb8', '#c8644a', true);
      g += _hv('si-buena', edificio(x - 4, y - 66, .32) + huerto(x - 96, y + 40, .45) + arbol(x + 40, y - 92, .3, 'cla', true));
      g += _hv('si-regular', casa(x + 112, y - 26, .3, '#e9cfa3', '#c8644a') + bomba(x - 104, y + 30, .5));
      g += _hv('si-mala', casa(x + 112, y - 30, .32, '#e9cfa3', '#c8644a') + casa(x + 108, y + 24, .3, '#f3dfb8', '#5a8fb5') +
        casa(x - 112, y - 24, .32, '#f1d9c0', '#7a9a52') + tocon(x + 136, y - 56, .4) + tocon(x - 130, y - 56, .4) + humo(x - 120, y - 70, .8, '#9a948c'));
      break;
    case 'seco':
      g += `<ellipse cx="${x}" cy="${y + 8}" rx="98" ry="58" fill="#e2c98e"/>`;
      g += _hv('si-buena', `<ellipse cx="${x}" cy="${y + 8}" rx="90" ry="50" fill="#c9d98f" opacity=".75"/>`);
      g += _hv('si-mala', `<ellipse cx="${x}" cy="${y + 8}" rx="122" ry="72" fill="#d9bd82"/>` + grietas(x - 70, y + 44, .9, '#a88d58') + grietas(x + 76, y - 34, .8, '#a88d58'));
      g += `<path d="M${x - 62} ${y + 22} l14 6 l8 -8 l12 4 M${x + 30} ${y + 36} l10 -6 l12 5 M${x + 44} ${y - 26} l-8 8 l6 10" stroke="#b89a5e" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
      g += _hv('no-buena', arbustoSeco(x + 66, y + 30, .7) + arbustoSeco(x - 72, y - 8, .6));
      g += _hv('si-buena', mezquite(x + 70, y + 34, .42) + maguey(x - 72, y + 4, .4) + nopal(x - 40, y - 34, .38) + mezquite(x + 46, y - 46, .34));
      g += _hv('si-regular', maguey(x - 70, y + 4, .38) + mezquite(x + 70, y + 34, .36, true));
      g += _hv('si-mala', pieza('chiva', x + 72, y + 30, .32) + pieza('chiva', x - 74, y - 2, .3) + tocon(x + 46, y - 44, .45));
      break;
  }
  return `<g class="huella-zona" data-z="${n.zid || ''}">${g}</g>`;
}

function _nodoSVG(n, i) {
  const est = n.estado, lw = Math.max(112, n.nombre.length * 8.3 + 28);
  const extra = est === 'bloqueado' ? ' (bloqueada)' : est === 'completada' ? ' (completada)' : '';
  let g = `<g class="nodo ${est}" data-i="${i}" transform="translate(${n.x} ${n.y})" role="button" tabindex="0" aria-label="${n.nombre}${extra}">`;
  g += `<circle class="anillo" r="40" fill="none" stroke="#fff6c4" stroke-width="5"/>`;
  g += `<g class="nodo-disco"><circle r="34" fill="${est === 'completada' ? '#dcefb4' : '#f1f7e8'}" stroke="${LINEA}" stroke-width="4"/>` +
    `<circle r="27" fill="${n.bioma}" opacity=".55"/><text y="11" text-anchor="middle" font-size="30">${n.icono}</text></g>`;
  if (est === 'completada') g += `<g transform="translate(25 -25)"><circle r="12" fill="#5f9e5a" stroke="${LINEA}" stroke-width="3"/>` +
    `<path d="M-5 0 L-1 4 L6 -4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  if (est === 'bloqueado') g += `<g transform="translate(24 -22)"><rect x="-9" y="-4" width="18" height="15" rx="3" fill="#d8c09a" stroke="${LINEA}" stroke-width="2.5"/>` +
    `<path d="M-5 -4 V-9 Q0 -16 5 -9 V-4" stroke="${LINEA}" stroke-width="2.5" fill="none"/></g>`;
  g += `<g transform="translate(0 58)"><rect x="${-lw / 2}" y="-14" width="${lw}" height="28" rx="14" fill="#f1f7e8" stroke="${LINEA}" stroke-width="2.5"/>` +
    `<text y="5.5" text-anchor="middle" class="nodo-nombre">${n.nombre}</text></g>`;
  return g + '</g>';
}

/* o = { vertical, nodos:[{x,y,zid,icono,nombre,estado,bioma,decor}], jugador, animal } */
function dibujarMapa(o) {
  const W = o.vertical ? 420 : 1000, H = o.vertical ? 820 : 600, r = rng(o.vertical ? 31 : 17);
  const pts = o.nodos.map(n => [n.x, n.y]);
  const muestras = [];
  for (let i = 0; i < pts.length - 1; i++)
    for (let t = 0; t <= 1; t += .1) muestras.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]);
  const libre = (x, y, d) => muestras.every(([a, b]) => (a - x) ** 2 + (b - y) ** 2 > d * d);
  const lejosDeNodos = (x, y, d) => o.nodos.every(n => (n.x - x) ** 2 + (n.y - y) ** 2 > d * d);
  const buscar = (dSenda, dNodo, intentos = 60) => {
    for (let k = 0; k < intentos; k++) {
      const x = 20 + r() * (W - 40), y = 30 + r() * (H - 60);
      if (libre(x, y, dSenda) && lejosDeNodos(x, y, dNodo)) return [x, y];
    }
    return null;
  };

  let p = `<svg class="mapa-paisaje saludable" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="overflow:visible" xmlns="http://www.w3.org/2000/svg"><defs>`;
  o.nodos.forEach((n, i) => {
    p += `<radialGradient id="bio${i}"><stop offset="0" stop-color="${n.bioma}"/><stop offset=".55" stop-color="${n.bioma}" stop-opacity=".75"/><stop offset="1" stop-color="${n.bioma}" stop-opacity="0"/></radialGradient>`;
  });
  p += `</defs><rect x="${-W}" y="${-H}" width="${W * 3}" height="${H * 3}" fill="#8fc472"/>`;
  for (let k = 0; k < 70; k++)
    p += `<ellipse cx="${f1(-W * .5 + r() * W * 2)}" cy="${f1(-H * .3 + r() * H * 1.6)}" rx="${f1(30 + r() * 60)}" ry="${f1(12 + r() * 24)}" fill="#9fcf80" opacity=".55"/>`;

  /* manchas secas: se ven mientras el suelo esté por debajo de su umbral */
  for (let k = 0; k < 16; k++) {
    const q = buscar(40, 80); if (!q) continue;
    p += _umbral('u-seco', 34 + r() * 42, _mancha(q[0], q[1], .7 + r() * .6), r() * 1.2);
  }
  o.nodos.forEach((n, i) => { p += `<circle cx="${n.x}" cy="${n.y}" r="${o.vertical ? 90 : 104}" fill="url(#bio${i})"/>`; });
  o.nodos.forEach(n => { p += _decorNodo(n); });

  const d = _suave(pts);
  p += `<path d="${d}" stroke="#d6bf86" stroke-width="32" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  p += `<path d="${d}" stroke="#eddcad" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  p += `<path d="${d}" stroke="#d2ba80" stroke-width="5" stroke-dasharray="2 16" fill="none" stroke-linecap="round"/>`;

  const arboles = [];
  for (let k = 0; k < (o.vertical ? 80 : 110); k++) {
    const x = -W * .45 + r() * W * 1.9, y = -50 + r() * (H + 80), q = r();
    if (libre(x, y, 58) && lejosDeNodos(x, y, 115)) arboles.push([x, y, q]);
  }
  arboles.sort((a, b) => a[1] - b[1]).forEach(([x, y, q]) => {
    p += q < .45 ? pino(x, y, .36 + q * .3, q < .2 ? 'osc' : 'med') : arbol(x, y, .34 + q * .25, q > .8 ? 'cla' : 'med');
  });

  /* flores y mariposas: aparecen conforme sube la biodiversidad */
  for (let k = 0; k < 48; k++) {
    const q = buscar(30, 60); if (!q) continue;
    p += _umbral('u-bio', 22 + r() * 72, flor(q[0], q[1], ['#f5a3c7', '#f6c453', '#fff', '#c9b6f0'][k % 4], .9), r() * 1.4);
  }
  [48, 56, 64, 72, 80, 88].forEach((t, k) => {
    const q = buscar(50, 100); if (!q) return;
    p += _umbral('u-bio', t, mariposa(q[0], q[1], .7, ['#f5a3c7', '#f6c453', '#c9b6f0'][k % 3], k * .7), .4 + k * .2);
  });
  p += `</svg>`;

  let n = `<svg class="mapa-nodos" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`;
  o.nodos.forEach((nd, i) => { n += _nodoSVG(nd, i); });
  const j = o.nodos[o.jugador];
  n += `<g transform="translate(${j.x - 30} ${j.y - 118})" pointer-events="none"><g class="ficha">${animal(o.animal, 'feliz', { attrs: 'width="60" height="79"' })}</g></g>`;
  return p + n + `</svg>`;
}
