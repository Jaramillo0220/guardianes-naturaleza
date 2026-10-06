/* ══════════════════════════════════════════════════════════
   PERSONAJES — los cuatro guardianes del equipo
   animal(tipo, expresión, opciones) devuelve el SVG como texto.
   Tipos: conejo, gato, perro, zorro
   Expresiones: normal, feliz, sorprendido, triste, pensando
   Opciones: { retrato: true }  → solo la cabeza (para diálogos y HUD)
             { attrs: '...' }   → atributos extra para la etiqueta <svg>
   ══════════════════════════════════════════════════════════ */

const LINEA = '#4a3428';          /* contorno café de todo lo dibujado */
const OJO = '#2b211d';

const INTEGRANTES = [
  { id: 'itzel',     integrante: 'Itzel',     animal: 'conejo', especie: 'Conejo blanco' },
  { id: 'ingrid',    integrante: 'Ingrid',    animal: 'gato',   especie: 'Gatito anaranjado' },
  { id: 'sebastian', integrante: 'Sebastian', animal: 'perro',  especie: 'Perrito beige' },
  { id: 'gabriel',   integrante: 'Gabriel',   animal: 'zorro',  especie: 'Zorrito negro' },
];

const PIEL = {
  conejo: { base: '#fbf8f1', claro: '#ffffff', oreja: '#f7b6c2', raya: '#efe6d6' },
  gato:   { base: '#f4a259', claro: '#fff7ea', oreja: '#f7b6c2', raya: '#d9772c' },
  perro:  { base: '#e8cfa4', claro: '#fff7ea', oreja: '#b98b5a', raya: '#cfae7c' },
  zorro:  { base: '#34302f', claro: '#fbf8f1', oreja: '#fbf8f1', raya: '#1f1c1b' },
};

function _ojos(e) {
  const brillo = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`;
  if (e === 'feliz')
    return [78, 122].map(x => `<path d="M${x - 10} 105 Q${x} 93 ${x + 10} 105" stroke="${OJO}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`).join('');
  if (e === 'sorprendido')
    return [78, 122].map(x => `<ellipse cx="${x}" cy="101" rx="9.5" ry="12.5" fill="${OJO}"/>${brillo(x + 4, 95, 4.4)}${brillo(x - 3, 107, 2)}`).join('');
  if (e === 'triste')
    return [78, 122].map(x => `<ellipse cx="${x}" cy="105" rx="7.5" ry="9" fill="${OJO}"/>${brillo(x + 3, 101, 3)}`).join('') +
      `<path d="M66 93 L88 87" stroke="${OJO}" stroke-width="3.2" stroke-linecap="round"/>` +
      `<path d="M112 87 L134 93" stroke="${OJO}" stroke-width="3.2" stroke-linecap="round"/>` +
      `<path d="M89 112 q-4 7 0 9 q4 -2 0 -9 z" fill="#8fd0f0"/>`;
  if (e === 'pensando')
    return [80, 124].map(x => `<ellipse cx="${x}" cy="101" rx="7.5" ry="10" fill="${OJO}"/>${brillo(x + 2, 95, 3.4)}`).join('') +
      `<path d="M112 86 Q123 81 134 86" stroke="${OJO}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return [78, 122].map(x => `<ellipse cx="${x}" cy="102" rx="8" ry="10.5" fill="${OJO}"/>${brillo(x + 3.5, 97.5, 3.4)}${brillo(x - 3, 107, 1.6)}`).join('');
}

function _boca(e) {
  if (e === 'feliz')
    return `<path d="M90 117 Q100 131 110 117 Z" fill="#c8505f" stroke="${LINEA}" stroke-width="2.4" stroke-linejoin="round"/>` +
      `<path d="M95 123 Q100 128 105 123 Q100 121 95 123 Z" fill="#f28c9c"/>`;
  if (e === 'sorprendido') return `<ellipse cx="100" cy="122" rx="5" ry="6.5" fill="#c8505f" stroke="${LINEA}" stroke-width="2.2"/>`;
  if (e === 'triste') return `<path d="M92 125 Q100 118 108 125" stroke="${LINEA}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  if (e === 'pensando') return `<path d="M95 121 Q101 118 107 120" stroke="${LINEA}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  return `<path d="M100 115 Q97 121 91 119 M100 115 Q103 121 109 119" stroke="${LINEA}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
}

function _nariz(t) {
  if (t === 'perro' || t === 'zorro')
    return `<ellipse cx="100" cy="111" rx="7.5" ry="5.2" fill="#2a1f1b"/><ellipse cx="97.5" cy="109.5" rx="2.2" ry="1.3" fill="#fff" opacity=".7"/>`;
  return `<path d="M95 108.5 Q100 105.5 105 108.5 Q102.5 113.5 100 113.5 Q97.5 113.5 95 108.5 Z" fill="#ef8fa3"/>`;
}

const _COLA = {
  conejo: (P, st) => `<circle cx="147" cy="198" r="15" fill="${P.claro}" ${st}/>`,
  gato: (P, st) => `<path d="M136 192 C 176 190, 184 140, 162 126 C 152 120, 143 132, 152 139 C 165 149, 162 172, 134 176 Z" fill="${P.base}" ${st}/>` +
    `<path d="M160 133 l8 -4 M165 152 l9 1 M156 170 l7 5" stroke="${P.raya}" stroke-width="4" stroke-linecap="round"/>`,
  perro: (P, st) => `<path d="M138 186 Q172 176 168 148 Q163 142 157 148 Q158 168 134 172 Z" fill="${P.base}" ${st}/>`,
  zorro: (P, st) => `<path d="M134 198 C 190 204, 200 140, 170 116 C 152 104, 138 122, 150 134 C 166 150, 164 178, 130 176 Z" fill="${P.base}" ${st}/>` +
    `<path d="M170 116 C 156 106, 141 118, 148 131 C 156 136, 170 134, 179 126 C 177 121, 174 118, 170 116 Z" fill="${P.claro}"/>`,
};

const _OREJAS = {
  conejo: (P, st) => [[-10, 76], [10, 124]].map(([r, x]) =>
      `<g transform="rotate(${r} ${x} 50)"><ellipse cx="${x}" cy="8" rx="16" ry="40" fill="${P.base}" ${st}/><ellipse cx="${x}" cy="12" rx="8" ry="28" fill="${P.oreja}"/></g>`).join('') +
    `<path d="M88 47 Q90 31 100 40 Q108 29 112 47 Z" fill="${P.base}" ${st}/>`,
  gato: (P, st) => `<path d="M50 74 L46 22 L92 50 Z" fill="${P.base}" ${st}/><path d="M56 64 L54 34 L82 52 Z" fill="${P.oreja}"/>` +
    `<path d="M150 74 L154 22 L108 50 Z" fill="${P.base}" ${st}/><path d="M144 64 L146 34 L118 52 Z" fill="${P.oreja}"/>`,
  zorro: (P, st) => `<path d="M48 78 L38 8 L98 46 Z" fill="${P.base}" ${st}/><path d="M55 66 L47 25 L84 49 Z" fill="${P.oreja}" opacity=".92"/>` +
    `<path d="M152 78 L162 8 L102 46 Z" fill="${P.base}" ${st}/><path d="M145 66 L153 25 L116 49 Z" fill="${P.oreja}" opacity=".92"/>`,
  perro: (P, st) => `<path d="M50 62 Q24 70 28 114 Q32 136 52 128 Q60 104 64 72 Z" fill="${P.oreja}" ${st}/>` +
    `<path d="M150 62 Q176 70 172 114 Q168 136 148 128 Q140 104 136 72 Z" fill="${P.oreja}" ${st}/>`,
};

function _marcas(t, P) {
  if (t === 'conejo') return `<ellipse cx="100" cy="118" rx="17" ry="11" fill="#fff"/>`;
  if (t === 'gato') return `<ellipse cx="100" cy="119" rx="23" ry="15" fill="${P.claro}"/>` +
    `<g stroke="${P.raya}" stroke-width="4.5" stroke-linecap="round"><path d="M100 46 V60"/><path d="M87 49 L89 61"/><path d="M113 49 L111 61"/><path d="M43 92 L55 94"/><path d="M157 92 L145 94"/></g>`;
  if (t === 'perro') return `<ellipse cx="122" cy="98" rx="17" ry="16" fill="${P.raya}" opacity=".8"/><ellipse cx="100" cy="121" rx="27" ry="18" fill="${P.claro}"/>`;
  if (t === 'zorro') return `<path d="M45 99 Q61 88 82 95 L100 108 L118 95 Q139 88 155 99 Q152 138 100 143 Q48 138 45 99 Z" fill="${P.claro}"/>` +
    `<path d="M88 58 Q100 50 112 58" stroke="#4a4544" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  return '';
}

function animal(tipo, expr = 'normal', o = {}) {
  const P = PIEL[tipo] || PIEL.gato;
  const st = `stroke="${LINEA}" stroke-width="3.5" stroke-linejoin="round"`;
  const vb = o.retrato ? '24 22 152 136' : '0 -36 200 262';
  let s = `<svg class="animal animal-${tipo}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"${o.attrs ? ' ' + o.attrs : ''}>`;

  if (!o.retrato) {
    s += `<g class="cola">${_COLA[tipo](P, st)}</g>`;
    /* cuerpo, pecho, brazos y patas */
    s += `<ellipse cx="100" cy="174" rx="46" ry="40" fill="${P.base}" ${st}/>`;
    if (tipo !== 'conejo') s += `<ellipse cx="100" cy="182" rx="25" ry="27" fill="${P.claro}"/>`;
    s += `<ellipse cx="63" cy="178" rx="11" ry="15" fill="${P.base}" ${st} transform="rotate(20 63 178)"/>`;
    s += `<ellipse cx="137" cy="178" rx="11" ry="15" fill="${P.base}" ${st} transform="rotate(-20 137 178)"/>`;
    s += `<ellipse cx="80" cy="212" rx="17" ry="10" fill="${P.base}" ${st}/><ellipse cx="120" cy="212" rx="17" ry="10" fill="${P.base}" ${st}/>`;
    s += `<path d="M74 213 v4 M80 213 v5 M86 213 v4 M114 213 v4 M120 213 v5 M126 213 v4" stroke="${LINEA}" stroke-width="1.8" stroke-linecap="round" opacity=".45"/>`;
    /* pañuelo de guardián: todos lo llevan, es el "uniforme" del equipo */
    s += `<path d="M58 136 Q100 160 142 136 L136 150 Q118 160 100 188 Q82 160 64 150 Z" fill="#5f9e5a" ${st}/>`;
    s += `<path d="M100 173 Q91 164 100 153 Q109 164 100 173 Z" fill="#cde89a"/><path d="M100 171 L100 157" stroke="#3f7a45" stroke-width="1.5"/>`;
  }

  if (tipo !== 'perro') s += _OREJAS[tipo](P, st);
  s += `<ellipse cx="100" cy="94" rx="60" ry="52" fill="${P.base}" ${st}/>`;
  s += _marcas(tipo, P);
  s += `<ellipse cx="60" cy="117" rx="9.5" ry="5.5" fill="#f59fb0" opacity="${expr === 'triste' ? .3 : .6}"/>` +
       `<ellipse cx="140" cy="117" rx="9.5" ry="5.5" fill="#f59fb0" opacity="${expr === 'triste' ? .3 : .6}"/>`;
  s += _ojos(expr) + _nariz(tipo) + _boca(expr);
  if (tipo === 'perro') s += _OREJAS.perro(P, st);
  return s + '</svg>';
}
