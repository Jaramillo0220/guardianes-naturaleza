/* ══════════════════════════════════════════════════════════
   AUDIO — música y efectos generados con Web Audio.
   No usa archivos: todo se sintetiza en el navegador.
   Sonido.musica('nombre')  Sonido.sfx.acierto()  Sonido.alternar()
   ══════════════════════════════════════════════════════════ */

const Sonido = (() => {
  const BOOST = 2.2;            /* refuerzo para bocinas de celular */
  let ctx = null, master = null, ruido = null, encendido = true, pendiente = null;
  let mus = { timer: null, p: null, i: 0, vuelta: 0, inicio: 0, nombre: null };
  try { encendido = localStorage.getItem('gdn_sonido') !== '0'; } catch (e) {}

  const mf = m => 440 * Math.pow(2, (m - 69) / 12);
  const acorde = (b, notas, v = .013, d = 3.6) => notas.map(m => ({ b, m, d, v, w: 'sine' }));
  const melodia = (lista, v = .036, w = 'triangle') => lista.map(([b, m, d = 1]) => ({ b, m, d, v, w }));

  /* b = pulso, m = nota MIDI, d = duración en pulsos, v = volumen, w = onda, k = percusión */
  const PATRONES = {
    inicio: { bpm: 92, len: 16, ev: [
      ...acorde(0, [60, 64, 67]), ...acorde(4, [57, 60, 64]), ...acorde(8, [53, 57, 60]), ...acorde(12, [55, 59, 62]),
      ...melodia([[0, 48, 3], [4, 45, 3], [8, 41, 3], [12, 43, 3]], .045, 'sine'),
      ...melodia([[0, 76], [1, 79], [2, 81, 1.6], [4, 79], [5, 76], [6, 72, 1.6], [8, 74], [9, 76], [10, 79], [11, 84, 1.4], [12, 81], [13, 79], [14, 74, 2]]),
      { b: 3, k: 'pajaro' }, { b: 10.5, k: 'pajaro' },
    ]},
    mapa: { bpm: 80, len: 16, ev: [
      ...melodia([[0, 48, 1.6], [2, 55, 1.6], [4, 45, 1.6], [6, 52, 1.6], [8, 41, 1.6], [10, 48, 1.6], [12, 43, 1.6], [14, 50, 1.6]], .04, 'sine'),
      ...melodia([[1, 72, 1.2], [3, 76, 1.2], [5, 74, 1.4], [9, 69, 1.2], [11, 72, 1.2], [13, 74, 1.2], [15, 76, 1]], .032),
      { b: 6.5, k: 'pajaro' }, { b: 14.5, k: 'pajaro' },
    ]},
    claro: { bpm: 96, len: 16, ev: [
      ...acorde(0, [65, 69, 72], .012), ...acorde(4, [60, 64, 67], .012), ...acorde(8, [62, 67, 71], .012), ...acorde(12, [64, 69, 72], .012),
      ...melodia([[0, 53, 2], [4, 48, 2], [8, 55, 2], [12, 57, 2]], .045, 'sine'),
      ...melodia([[0, 72], [1, 74], [2, 77, 1.4], [3.5, 76, .5], [4, 72, 1.6], [6, 67, 1.6], [8, 71], [9, 74], [10, 79, 1.6], [12, 76], [13, 74], [14, 72, 2]], .034),
      { b: 1.5, k: 'madera' }, { b: 5.5, k: 'madera' }, { b: 9.5, k: 'madera' }, { b: 13.5, k: 'madera' },
      { b: 7, k: 'pajaro' },
    ]},
    /* corazón del bosque: tranquilo y misterioso (re dórico) */
    bosque: { bpm: 74, len: 16, ev: [
      ...acorde(0, [62, 65, 69], .012), ...acorde(4, [60, 64, 67], .012), ...acorde(8, [62, 65, 69], .012), ...acorde(12, [64, 67, 71], .012),
      ...melodia([[0, 50, 3.6], [4, 48, 3.6], [8, 50, 3.6], [12, 52, 3.6]], .042, 'sine'),
      ...melodia([[0, 74, 1.5], [2, 77, 1], [3, 76, .8], [4, 72, 2.5], [8, 74, 1], [9, 76, 1], [10, 81, 1.8], [12, 79, 1.2], [13.5, 76, .8], [14, 74, 2]], .03),
      { b: 2.5, k: 'pajaro' }, { b: 11, k: 'pajaro' }, { b: 15, k: 'madera' },
    ]},
    /* río: arpegio que corre, un poco tenso (la menor) */
    rio: { bpm: 92, len: 16, ev: [
      ...melodia([[0, 57], [.5, 60], [1, 64], [1.5, 69], [2, 64], [2.5, 60], [3, 57], [3.5, 60],
                  [4, 53], [4.5, 57], [5, 60], [5.5, 65], [6, 60], [6.5, 57], [7, 53], [7.5, 57],
                  [8, 55], [8.5, 59], [9, 62], [9.5, 67], [10, 62], [10.5, 59], [11, 55], [11.5, 59],
                  [12, 52], [12.5, 56], [13, 59], [13.5, 64], [14, 59], [14.5, 56], [15, 52], [15.5, 56]].map(([b, m]) => [b, m, .7]), .022, 'sine'),
      ...melodia([[0, 45, 3.6], [4, 41, 3.6], [8, 43, 3.6], [12, 40, 3.6]], .045, 'sine'),
      ...melodia([[2, 76, 1.4], [6, 77, 1.4], [10, 74, 1.4], [14, 71, 1.6]], .026),
      { b: 1, k: 'gota' }, { b: 7, k: 'gota' }, { b: 12.5, k: 'gota' },
    ]},
    /* colina: pulso de alerta (mi menor) */
    colina: { bpm: 108, len: 8, ev: [
      ...melodia([[0, 40, .4], [.5, 40, .4], [1, 40, .4], [1.5, 40, .4], [2, 43, .4], [2.5, 43, .4], [3, 43, .4], [3.5, 43, .4],
                  [4, 36, .4], [4.5, 36, .4], [5, 36, .4], [5.5, 36, .4], [6, 38, .4], [6.5, 38, .4], [7, 39, .4], [7.5, 39, .4]], .05, 'triangle'),
      ...melodia([[0, 76, 1.5], [2, 79, 1.5], [4, 72, 1.5], [6, 74, .9], [7, 75, .9]], .026, 'square'),
      { b: 0, k: 'hat' }, { b: 1, k: 'hat' }, { b: 2, k: 'hat' }, { b: 3, k: 'hat' }, { b: 4, k: 'hat' }, { b: 5, k: 'hat' }, { b: 6, k: 'hat' }, { b: 7, k: 'hat' },
    ]},
    /* aldea: alegre y con prisa (do mayor, tipo marimba) */
    aldea: { bpm: 104, len: 8, ev: [
      ...melodia([[0, 48, .9], [1, 55, .9], [2, 45, .9], [3, 52, .9], [4, 41, .9], [5, 48, .9], [6, 43, .9], [7, 50, .9]], .045, 'sine'),
      ...melodia([[0, 72, .4], [.5, 76, .4], [1, 79, .4], [1.5, 76, .4], [2, 81, .6], [3, 79, .4], [3.5, 76, .4],
                  [4, 77, .4], [4.5, 76, .4], [5, 74, .4], [5.5, 72, .4], [6, 74, .6], [7, 79, .7]], .03),
      { b: .5, k: 'madera' }, { b: 1.5, k: 'madera' }, { b: 2.5, k: 'madera' }, { b: 3.5, k: 'madera' },
      { b: 4.5, k: 'madera' }, { b: 5.5, k: 'madera' }, { b: 6.5, k: 'madera' }, { b: 7.5, k: 'madera' },
    ]},
    /* borde seco: lento, con viento y pocas notas (re menor) */
    seco: { bpm: 62, len: 16, ev: [
      ...melodia([[0, 38, 7.6], [8, 36, 7.6]], .05, 'sine'),
      ...acorde(0, [62, 65, 69], .01, 7.6), ...acorde(8, [60, 64, 67], .01, 7.6),
      ...melodia([[1, 74, 1.6], [3, 72, 1], [4, 69, 2.4], [9, 70, 1.6], [11, 69, 1], [12, 65, 3]], .028),
      { b: 0, k: 'viento' }, { b: 8, k: 'viento' },
    ]},
    final: { bpm: 108, len: 8, ev: [
      ...melodia([[0, 48, 2], [2, 41, 2], [4, 43, 2], [6, 48, 2]], .05, 'sine'),
      ...melodia([[0, 72, .5], [.5, 76, .5], [1, 79, .5], [1.5, 84, .5], [2, 72, .5], [2.5, 77, .5], [3, 81, .5], [3.5, 84, .5],
                  [4, 71, .5], [4.5, 74, .5], [5, 79, .5], [5.5, 83, .5], [6, 72, .5], [6.5, 76, .5], [7, 79, .5], [7.5, 84, .8]], .03),
      { b: 0, k: 'hat' }, { b: 1, k: 'hat' }, { b: 2, k: 'hat' }, { b: 3, k: 'hat' }, { b: 4, k: 'hat' }, { b: 5, k: 'hat' }, { b: 6, k: 'hat' }, { b: 7, k: 'hat' },
    ]},
  };
  Object.values(PATRONES).forEach(p => p.ev.sort((a, b) => a.b - b.b));

  function iniciar() {
    if (ctx) { desbloquear(); return; }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = encendido ? 1 : 0;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 8; comp.attack.value = .003; comp.release.value = .2;
      master.connect(comp); comp.connect(ctx.destination);
      desbloquear();
      if (pendiente && encendido) { const n = pendiente; pendiente = null; musica(n); }
    } catch (e) { ctx = null; }
  }

  /* Los navegadores móviles a veces suspenden el audio aunque se cree en un toque. */
  function desbloquear() {
    if (!ctx || ctx.state === 'running') return;
    try { const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); } catch (e) {}
    ctx.resume().then(() => { if (mus.nombre) { const n = mus.nombre; mus.nombre = null; musica(n); } }).catch(() => {});
  }

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {}); else ctx.resume().catch(() => {});
  });

  function tono(f, dur, vol, tipo = 'sine', cuando = 0) {
    if (!ctx || !encendido) return;
    try {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + cuando;
      o.type = tipo; o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol * BOOST, t + .01);
      g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
    } catch (e) {}
  }

  function _ruido() {
    if (!ruido) {
      ruido = ctx.createBuffer(1, Math.floor(ctx.sampleRate * .3), ctx.sampleRate);
      const d = ruido.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return ruido;
  }

  function voz(t, ev, bpm) {
    try {
      if (ev.k === 'pajaro') {
        [0, .12].forEach(dt => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(2600, t + dt); o.frequency.exponentialRampToValueAtTime(3900, t + dt + .07);
          g.gain.setValueAtTime(0, t + dt); g.gain.linearRampToValueAtTime(.012 * BOOST, t + dt + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dt + .09);
          o.connect(g); g.connect(master); o.start(t + dt); o.stop(t + dt + .1);
        });
        return;
      }
      if (ev.k === 'viento') {
        const fuente = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        fuente.buffer = _ruido(); fuente.loop = true;
        f.type = 'bandpass'; f.Q.value = 1.4;
        f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(900, t + 1.6); f.frequency.linearRampToValueAtTime(350, t + 3.4);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022 * BOOST, t + 1.2); g.gain.linearRampToValueAtTime(0, t + 3.6);
        fuente.connect(f); f.connect(g); g.connect(master); fuente.start(t); fuente.stop(t + 3.7);
        return;
      }
      if (ev.k === 'gota') {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(600, t + .09);
        g.gain.setValueAtTime(.03 * BOOST, t); g.gain.exponentialRampToValueAtTime(.0001, t + .12);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + .13);
        return;
      }
      if (ev.k === 'madera') {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'triangle'; o.frequency.setValueAtTime(1100, t); o.frequency.exponentialRampToValueAtTime(700, t + .05);
        g.gain.setValueAtTime(.03 * BOOST, t); g.gain.exponentialRampToValueAtTime(.0001, t + .07);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + .08);
        return;
      }
      if (ev.k === 'hat') {
        const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        s.buffer = _ruido(); f.type = 'highpass'; f.frequency.value = 7000;
        g.gain.setValueAtTime(.025 * BOOST, t); g.gain.exponentialRampToValueAtTime(.001, t + .05);
        s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + .08);
        return;
      }
      const o = ctx.createOscillator(), g = ctx.createGain(), d = (ev.d || 1) * (60 / bpm);
      o.type = ev.w || 'sine'; o.frequency.value = mf(ev.m);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime((ev.v || .04) * BOOST, t + .02);
      g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .06);
    } catch (e) {}
  }

  function musica(nombre) {
    if (!PATRONES[nombre]) return;
    if (!ctx || !encendido) { pendiente = nombre; return; }
    if (mus.nombre === nombre && mus.timer) return;
    detener();
    mus = { timer: null, p: PATRONES[nombre], i: 0, vuelta: 0, inicio: ctx.currentTime + .1, nombre };
    mus.timer = setInterval(_tick, 30);
  }

  function detener() {
    if (mus.timer) clearInterval(mus.timer);
    mus.timer = null; mus.nombre = null;
  }

  function _tick() {
    if (!ctx || !mus.p) return;
    const p = mus.p, spb = 60 / p.bpm, adelante = ctx.currentTime + .2;
    let guarda = 0;
    while (guarda++ < 80) {
      const ev = p.ev[mus.i], t = mus.inicio + (mus.vuelta * p.len + ev.b) * spb;
      if (t > adelante) break;
      if (t >= ctx.currentTime - .03) voz(t, ev, p.bpm);     /* lo atrasado se salta */
      mus.i++;
      if (mus.i >= p.ev.length) { mus.i = 0; mus.vuelta++; }
    }
  }

  function alternar() {
    encendido = !encendido;
    try { localStorage.setItem('gdn_sonido', encendido ? '1' : '0'); } catch (e) {}
    if (master) master.gain.value = encendido ? 1 : 0;
    if (encendido) {
      if (ctx && ctx.state === 'suspended') ctx.resume();
      if (pendiente) { const n = pendiente; pendiente = null; musica(n); }
    } else {
      const n = mus.nombre; detener(); pendiente = n;
    }
    return encendido;
  }

  const sfx = {
    clic: () => tono(660, .06, .02),
    letra: () => { if (Math.random() < .55) tono(700 + Math.random() * 80, .04, .007); },
    encontrar: () => [988, 1319, 1568, 1976].forEach((f, i) => tono(f, .22, .04, 'sine', i * .06)),
    acierto: () => { tono(784, .14, .05, 'triangle'); tono(1175, .24, .05, 'triangle', .1); },
    regular: () => { tono(659, .16, .045, 'triangle'); tono(784, .22, .04, 'triangle', .12); },
    error: () => { tono(233, .18, .045, 'square'); tono(185, .28, .045, 'square', .14); },
    corazon: () => [784, 988, 1175, 1568].forEach((f, i) => tono(f, .2, .045, 'sine', i * .07)),
    bloqueo: () => tono(196, .14, .04, 'triangle'),
    desbloquear: () => [523, 784, 1047].forEach((f, i) => tono(f, .32, .05, 'triangle', i * .09)),
    zona: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, .38, .05, 'triangle', i * .1)),
    fanfarria: () => [[523, 0], [659, .12], [784, .24], [1047, .36], [784, .6], [1047, .72], [1319, .9]].forEach(([f, t]) => tono(f, .42, .055, 'triangle', t)),
    mejora: () => [[392, 0], [523, .16], [659, .32], [784, .48], [1047, .7]].forEach(([f, t]) => tono(f, .6, .045, 'sine', t)),
    empeora: () => [[392, 0], [349, .22], [311, .44], [262, .7]].forEach(([f, t]) => tono(f, .5, .04, 'triangle', t)),
  };

  return { iniciar, musica, detener, alternar, activo: () => encendido, sfx };
})();
