/* ══════════════════════════════════════════════════════════
   ZONAS — todo el contenido educativo vive aquí.
   El motor (juego.js) lee estos datos; para cambiar un texto,
   un objeto o una respuesta no hace falta tocar el motor.

   Barras del planeta: biodiversidad · calidad · clima · suelo
   Tipos de reto: 'relacionar', 'seleccionar', 'ordenar', 'clasificar', 'decision', 'plan'
   Un objeto con 'accion' se repara (o empeora) en el lugar al encontrarlo (zona 6).

   Campos útiles:
   · efectos: { barra: +n }   cuánto sube o baja cada barra
   · escena: 'clave'          al resolverse, la escena cambia
                              (grupos data-c="clave" en escenas.js; puede ser una lista)
   · foco: [x, y, radio]      dónde se marca el cambio al ver cómo quedó la zona
   · huellas                  frase que aparece en el mapa según la decisión
   · camaraX                  punto de la escena (0-800) donde empieza la cámara en celular
   · pendiente: true          la zona aparece en el mapa pero aún no se puede jugar
   ══════════════════════════════════════════════════════════ */

const ZONAS = [
  /* ═════════ ZONA 1 · Sociedad y naturaleza + actividades que generan impactos ═════════ */
  {
    id: 'claro',
    nombre: 'El claro del pueblo',
    tema: 'Sociedad y naturaleza, actividades que generan impactos',
    icono: '🏡', bioma: '#d4eba0', decor: 'casa',
    mapa: { h: [110, 500], v: [110, 735] },
    escena: 'claro', musica: 'claro', camaraX: 470,

    intro: [
      { expr: 'sorprendido', texto: '¡Mira! Este es el claro del pueblo. La gente que vive aquí depende del bosque.' },
      { expr: 'pensando', texto: 'Busca 3 cosas que el pueblo obtiene de la naturaleza. Explora la escena y toca lo que encuentres.' },
    ],
    objetivo: { icono: '🧺', texto: 'Recursos del bosque' },
    objetos: [
      { id: 'tronco', dibujo: 'tronco', x: 150, y: 408, escala: .85, puntos: 10,
        titulo: 'Madera', texto: 'Con la madera del bosque el pueblo construye sus casas y cocina. Es un recurso natural del que depende todos los días.' },
      { id: 'mazorca', dibujo: 'mazorca', x: 318, y: 404, escala: .68, puntos: 10,
        titulo: 'Maíz de la milpa', texto: 'Los cultivos necesitan suelo fértil y lluvia. Cuidar la naturaleza también es cuidar lo que comemos.' },
      { id: 'cantaro', dibujo: 'cantaro', x: 588, y: 452, escala: .8, puntos: 10,
        titulo: 'Agua del manantial', texto: 'Los árboles ayudan a que la lluvia se filtre y llegue a los manantiales. Sin bosque, el agua se vuelve escasa.' },
      { id: 'semilla', dibujo: 'semilla', x: 752, y: 404, escala: .7, puntos: 5, corazon: true, bonus: true,
        titulo: 'Una semilla', texto: 'Encontraste un tesoro extra. Una semilla guardada es un bosque que puede volver a crecer.' },
    ],

    antesDelReto: [
      { expr: 'feliz', texto: '¡Listo! La sociedad necesita a la naturaleza para vivir.' },
      { expr: 'triste', texto: 'Pero el pueblo creció y ahora la presiona. ¿Ves los tocones, el humo y la basura en el río?' },
    ],

    retos: [
      {
        tipo: 'relacionar',
        titulo: 'Une cada actividad con su impacto',
        enunciado: 'Estas actividades humanas están cambiando el claro.',
        ayuda: 'Toca una actividad y después su impacto.',
        puntos: 10,
        pares: [
          { a: { icono: '🪓', texto: 'Tala sin control' },            b: { icono: '🦋', texto: 'Animales sin hogar' },   barra: 'biodiversidad', delta: 3, escena: 'tala' },
          { a: { icono: '🗑️', texto: 'Tirar basura al río' },        b: { icono: '💧', texto: 'Agua contaminada' },     barra: 'calidad', delta: 3, escena: 'basura' },
          { a: { icono: '🏭', texto: 'Humo de fábricas' },            b: { icono: '🌡️', texto: 'Planeta más caliente' }, barra: 'clima', delta: 3, escena: 'humo' },
          { a: { icono: '🌾', texto: 'Sembrar sin dejar descansar el suelo' }, b: { icono: '🍂', texto: 'Suelo sin nutrientes' }, barra: 'suelo', delta: 3, escena: 'suelo' },
        ],
        cierre: 'A esto se le llama impacto ambiental: un cambio en la naturaleza causado por lo que hacemos.',
      },
      {
        tipo: 'decision',
        titulo: 'La escuela del pueblo',
        enunciado: 'El pueblo quiere construir una escuela y necesita madera. ¿Qué propones?',
        opciones: [
          { icono: '🪓', texto: 'Talar el bosque de al lado, es lo más rápido', tipo: 'mala', puntos: 0, escena: 'talamala', foco: [120, 300, 80],
            efectos: { biodiversidad: -10, suelo: -6, clima: -3 },
            feedback: 'La escuela se construye, pero muchos animales pierden su hogar y el suelo queda desprotegido.' },
          { icono: '🌳', texto: 'Cortar solo algunos árboles y plantar dos por cada uno', tipo: 'buena', puntos: 20, escena: 'reforestar', foco: [236, 362, 70],
            efectos: { biodiversidad: 8, suelo: 5, clima: 4 },
            feedback: 'Eso es usar los recursos sin agotarlos: el pueblo tiene su escuela y el bosque se recupera.' },
          { icono: '🚫', texto: 'Prohibir para siempre el uso de madera', tipo: 'regular', puntos: 5,
            efectos: {},
            feedback: 'Protege al bosque, pero el pueblo también necesita recursos. La clave es usarlos sin agotarlos.' },
        ],
      },
    ],

    final: {
      titulo: { buena: '¡El claro respira mejor!', regular: 'El claro sigue igual', mala: 'El claro perdió parte de su bosque' },
      texto: 'La sociedad depende de la naturaleza, y sus actividades pueden dañarla o cuidarla. Sigue el sendero.',
    },
    huellas: {
      buena: 'Crecen árboles nuevos junto al pueblo.',
      regular: 'El pueblo dejó de usar la madera del bosque.',
      mala: 'Quedaron tocones donde había bosque.',
    },
  },

  /* ═════════ ZONA 2 · Pérdida de biodiversidad ═════════ */
  {
    id: 'corazon',
    nombre: 'El corazón del bosque',
    tema: 'Pérdida de biodiversidad',
    icono: '🦋', bioma: '#6fae62', decor: 'mariposa',
    mapa: { h: [300, 420], v: [300, 630] },
    escena: 'bosque', musica: 'bosque', camaraX: 430,

    intro: [
      { expr: 'sorprendido', texto: 'Este es el corazón del bosque. Aquí viven muchísimas especies… aunque cada vez se ven menos.' },
      { expr: 'pensando', texto: 'Encuentra a 3 animales que dependen de este bosque. Algunos se esconden muy bien.' },
    ],
    objetivo: { icono: '🔍', texto: 'Animales escondidos' },
    objetos: [
      { id: 'venado', dibujo: 'venado', x: 650, y: 392, escala: .85, puntos: 10,
        titulo: 'Un cervatillo', texto: 'Necesita el bosque para esconderse y comer. Si su hábitat se destruye, no tiene a dónde ir.' },
      { id: 'nido', dibujo: 'nido', x: 176, y: 304, escala: .62, puntos: 10,
        titulo: 'Un nido', texto: 'Muchas aves crían a sus polluelos en árboles viejos. Sin árboles, no tienen dónde anidar.' },
      { id: 'abeja', dibujo: 'abeja', x: 505, y: 448, escala: .5, puntos: 10,
        titulo: 'Una abeja', texto: 'Las abejas polinizan las flores. Sin polinizadores, muchas plantas y cultivos no darían frutos ni semillas.' },
      { id: 'bellota', dibujo: 'bellota', x: 78, y: 470, escala: .5, puntos: 5, corazon: true, bonus: true,
        titulo: 'Una bellota', texto: 'De esta semilla puede nacer un encino. Plantar especies nativas ayuda a que el bosque se recupere.' },
    ],

    antesDelReto: [
      { expr: 'feliz', texto: 'Cada especie cumple una función. Juntas forman la biodiversidad del bosque.' },
      { expr: 'triste', texto: 'Pero la tala y la caza las están haciendo desaparecer. ¡Hay que ayudarlas!' },
    ],

    retos: [
      {
        tipo: 'seleccionar',
        titulo: '¿Qué ayuda a la biodiversidad?',
        enunciado: 'Elige las 3 acciones que sí ayudan a recuperarla.',
        puntos: 10,
        opciones: [
          { icono: '🌱', texto: 'Reforestar con árboles nativos', correcta: true, barra: 'biodiversidad', delta: 3, escena: 'reforestar',
            explica: 'Dan alimento y refugio a la fauna local.' },
          { icono: '🛡️', texto: 'Declarar el bosque área natural protegida', correcta: true, barra: 'biodiversidad', delta: 3, escena: 'protegida',
            explica: 'Así se limita la tala y la construcción.' },
          { icono: '🚫', texto: 'Prohibir la caza ilegal', correcta: true, barra: 'biodiversidad', delta: 3, escena: 'animales',
            explica: 'Las poblaciones de animales pueden recuperarse.' },
          { icono: '🌵', texto: 'Traer plantas de otro país que crecen rápido',
            explica: 'Las especies invasoras desplazan a las nativas.' },
          { icono: '🪓', texto: 'Quitar los árboles viejos y huecos',
            explica: 'Esos árboles son el hogar de aves e insectos.' },
          { icono: '🧴', texto: 'Fumigar todo el bosque contra insectos',
            explica: 'También mata a polinizadores como las abejas.' },
        ],
        cierre: 'Proteger los hábitats y las especies nativas es la mejor forma de frenar la pérdida de biodiversidad.',
      },
      {
        tipo: 'decision',
        titulo: 'La nueva carretera',
        enunciado: 'El pueblo necesita una carretera para llegar al hospital, y el camino más corto cruza el bosque. ¿Qué propones?',
        opciones: [
          { icono: '🛣️', texto: 'Construirla derecho por el bosque, es más barato', tipo: 'mala', puntos: 0, escena: 'carretera', foco: [420, 486, 95],
            efectos: { biodiversidad: -10, suelo: -4, clima: -3 },
            feedback: 'El bosque queda partido en dos. Los animales ya no pueden moverse para buscar alimento o pareja, y muchos mueren al cruzar.' },
          { icono: '🌉', texto: 'Construirla por la orilla, con puentes verdes para que crucen los animales', tipo: 'buena', puntos: 20, escena: 'corredor', foco: [420, 496, 95],
            efectos: { biodiversidad: 9, suelo: 3, clima: 3 },
            feedback: 'Los pasos de fauna mantienen conectado el hábitat: el pueblo tiene su carretera y los animales siguen moviéndose.' },
          { icono: '🚧', texto: 'No construir nada; el bosque es más importante', tipo: 'regular', puntos: 5,
            efectos: {},
            feedback: 'El bosque se salva, pero el pueblo sigue sin llegar al hospital. El reto es que convivan ambos.' },
        ],
      },
    ],

    final: {
      titulo: { buena: '¡La vida regresa al bosque!', regular: 'El bosque resiste', mala: 'El bosque quedó partido en dos' },
      texto: 'La biodiversidad se pierde cuando destruimos hábitats. Protegerlos permite que las especies se recuperen.',
    },
    huellas: {
      buena: 'Los animales cruzan por los puentes verdes.',
      regular: 'El corazón del bosque se quedó como estaba.',
      mala: 'Una carretera partió el corazón del bosque.',
    },
  },

  /* ═════════ ZONA 3 · Contaminación ═════════ */
  {
    id: 'rio',
    nombre: 'El río de los sauces',
    tema: 'Contaminación',
    icono: '💧', bioma: '#a6d8ea', decor: 'rio',
    mapa: { h: [240, 245], v: [120, 520] },
    escena: 'rio', musica: 'rio', camaraX: 420,

    intro: [
      { expr: 'triste', texto: 'Este río daba agua y peces al pueblo. Ahora huele raro y tiene basura.' },
      { expr: 'pensando', texto: 'Saca del río 3 residuos que lo están contaminando.' },
    ],
    objetivo: { icono: '🗑️', texto: 'Residuos fuera del río' },
    objetos: [
      { id: 'botella', dibujo: 'botella', x: 515, y: 476, escala: .6, puntos: 10, efectos: { calidad: 2 },
        titulo: 'Botella de plástico', texto: 'El plástico tarda cientos de años en degradarse. Se rompe en pedacitos, los microplásticos, que terminan dentro de los peces.' },
      { id: 'lata', dibujo: 'lata', x: 268, y: 440, escala: .58, puntos: 10, efectos: { calidad: 2 },
        titulo: 'Lata de aluminio', texto: 'El aluminio se puede reciclar una y otra vez. Tirada en el río, solo se oxida y estorba.' },
      { id: 'pila', dibujo: 'pila', x: 668, y: 482, escala: .55, puntos: 10, efectos: { calidad: 2, suelo: 2 },
        titulo: 'Pila usada', texto: 'Las pilas tienen metales tóxicos que contaminan el agua y el suelo. Se deben llevar a un centro de acopio.' },
      { id: 'gota', dibujo: 'gota', x: 396, y: 420, escala: .42, puntos: 5, corazon: true, bonus: true,
        titulo: 'Agua limpia', texto: 'Encontraste una gota limpia. Cuidar el agua es cuidar a todos los seres vivos del bosque.' },
    ],

    antesDelReto: [
      { expr: 'feliz', texto: '¡El río ya se ve mejor! Pero la contaminación no solo llega al agua.' },
      { expr: 'pensando', texto: 'También ensucia el aire y el suelo. ¿Sabes distinguirlas?' },
    ],

    retos: [
      {
        tipo: 'clasificar',
        titulo: '¿Qué se contamina?',
        enunciado: 'Toca dónde termina cada contaminante.',
        puntos: 5,
        grupos: [
          { id: 'aire', icono: '💨', nombre: 'Aire', barra: 'calidad', delta: 2 },
          { id: 'agua', icono: '💧', nombre: 'Agua', barra: 'calidad', delta: 2 },
          { id: 'suelo', icono: '🌱', nombre: 'Suelo', barra: 'suelo', delta: 2 },
        ],
        items: [
          { icono: '🚗', texto: 'Humo del escape de los autos', grupo: 'aire' },
          { icono: '🔥', texto: 'Quemar basura al aire libre', grupo: 'aire' },
          { icono: '🍳', texto: 'Tirar aceite de cocina al fregadero', grupo: 'agua' },
          { icono: '🧼', texto: 'Detergentes de las casas que llegan al río', grupo: 'agua' },
          { icono: '🔋', texto: 'Pilas enterradas en un terreno', grupo: 'suelo' },
          { icono: '🚮', texto: 'Un basurero a cielo abierto', grupo: 'suelo' },
        ],
        cierre: 'La contaminación es cualquier sustancia que altera el aire, el agua o el suelo y daña a los seres vivos.',
      },
      {
        tipo: 'decision',
        titulo: 'La fábrica río arriba',
        enunciado: 'La fábrica tira su agua sucia al río, pero es la principal fuente de trabajo del pueblo. ¿Qué propones?',
        opciones: [
          { icono: '🌊', texto: 'Que siga así; el río se lleva la suciedad', tipo: 'mala', puntos: 0, escena: 'sucio', foco: [420, 440, 110],
            efectos: { calidad: -10, biodiversidad: -5 },
            feedback: 'El río no se lleva la contaminación: la reparte río abajo. Los peces mueren y el agua deja de servir para beber o regar.' },
          { icono: '♻️', texto: 'Que limpie su agua en una planta de tratamiento antes de devolverla', tipo: 'buena', puntos: 20, escena: ['tratamiento', 'sindescarga'], foco: [214, 318, 85],
            efectos: { calidad: 10, biodiversidad: 4 },
            feedback: 'La fábrica sigue dando trabajo y el río se recupera. ¡Hasta regresaron los peces!' },
          { icono: '🔒', texto: 'Cerrar la fábrica para siempre', tipo: 'regular', puntos: 5, escena: ['cerrada', 'sindescarga', 'humo'], foco: [140, 300, 75],
            efectos: { calidad: 4 },
            feedback: 'El río mejora, pero muchas familias se quedan sin trabajo. El desarrollo sustentable busca producir sin contaminar.' },
        ],
      },
    ],

    final: {
      titulo: { buena: '¡El río vuelve a correr limpio!', regular: 'El río respira un poco', mala: 'El río sigue enfermo' },
      texto: 'Lo que tiramos al agua, al aire o al suelo no desaparece: termina afectando a otros seres vivos.',
    },
    huellas: {
      buena: 'El río corre limpio y regresaron los peces.',
      regular: 'La fábrica cerró y el río mejoró un poco.',
      mala: 'El río se volvió café río abajo.',
    },
  },

  /* ═════════ ZONA 4 · Cambio climático ═════════ */
  {
    id: 'colina',
    nombre: 'La colina del viento',
    tema: 'Cambio climático',
    icono: '🌡️', bioma: '#e9dc8e', decor: 'viento',
    mapa: { h: [450, 165], v: [295, 410] },
    escena: 'colina', musica: 'colina', camaraX: 380,

    intro: [
      { expr: 'sorprendido', texto: '¡Qué calor! Cada año los veranos aquí son más largos y llueve menos.' },
      { expr: 'pensando', texto: 'Busca 3 fuentes de gases que están calentando el planeta.' },
    ],
    objetivo: { icono: '🌡️', texto: 'Fuentes de gases' },
    objetos: [
      { id: 'auto', dibujo: 'auto', x: 300, y: 442, escala: .6, puntos: 10,
        titulo: 'Escape de un auto', texto: 'Al quemar gasolina, los autos liberan dióxido de carbono (CO₂), el principal gas que calienta el planeta.' },
      { id: 'vaca', dibujo: 'vaca', x: 494, y: 384, escala: .62, puntos: 10,
        titulo: 'Ganado', texto: 'Al digerir el pasto, las vacas producen metano, un gas que atrapa todavía más calor que el CO₂.' },
      { id: 'quema', dibujo: 'quema', x: 640, y: 452, escala: .66, puntos: 10,
        titulo: 'Quema de pastizal', texto: 'Quemar pastizales o basura libera CO₂ y humo. Además, se pierden plantas que absorbían ese gas.' },
      { id: 'bici', dibujo: 'bici', x: 36, y: 446, escala: .5, puntos: 5, corazon: true, bonus: true,
        titulo: 'Una bicicleta', texto: 'Moverse en bici o caminando no libera gases. ¡Cada viaje cuenta!' },
    ],

    antesDelReto: [
      { expr: 'normal', texto: 'Esos gases forman una capa que atrapa el calor del Sol, como el techo de un invernadero.' },
      { expr: 'pensando', texto: '¿Puedes ordenar cómo pasa?' },
    ],

    retos: [
      {
        tipo: 'ordenar',
        titulo: 'Así se calienta el planeta',
        enunciado: 'Toca los pasos en el orden en que ocurren.',
        puntos: 10,
        pasos: [
          { icono: '⛽', texto: 'Quemamos gasolina, carbón y gas' },
          { icono: '💨', texto: 'Se liberan gases como el CO₂' },
          { icono: '🌫️', texto: 'Los gases atrapan el calor en la atmósfera' },
          { icono: '🌡️', texto: 'Sube la temperatura: más sequías y lluvias extremas' },
        ],
        efectos: { clima: 4 },
        cierre: 'Esto es el efecto invernadero aumentado, la principal causa del cambio climático actual.',
      },
      {
        tipo: 'decision',
        titulo: 'Más luz para el pueblo',
        enunciado: 'El pueblo creció y necesita más electricidad. ¿De dónde la sacarías?',
        opciones: [
          { icono: '🏭', texto: 'Construir una planta que queme carbón', tipo: 'mala', puntos: 0, escena: 'carbon', foco: [724, 330, 105],
            efectos: { clima: -10, calidad: -6 },
            feedback: 'Hay luz, pero la planta lanza mucho CO₂ y humo. El calor y la mala calidad del aire aumentan.' },
          { icono: '🌬️', texto: 'Poner aerogeneradores en la colina y paneles solares', tipo: 'buena', puntos: 20, escena: 'renovable', foco: [566, 214, 115],
            efectos: { clima: 10, calidad: 5 },
            feedback: '¡La colina del viento hace honor a su nombre! La energía renovable da luz sin emitir gases.' },
          { icono: '💡', texto: 'Seguir igual y pedir que ahorren luz', tipo: 'regular', puntos: 5,
            efectos: { clima: 2 },
            feedback: 'Ahorrar energía ayuda, pero no alcanza si cada vez se necesita más y se sigue quemando combustible.' },
        ],
      },
    ],

    final: {
      titulo: { buena: '¡La colina se refresca!', regular: 'Un pequeño respiro para el clima', mala: 'El calor sigue subiendo' },
      texto: 'Los gases de efecto invernadero causan el cambio climático. Usar energías limpias reduce las emisiones.',
    },
    huellas: {
      buena: 'Los aerogeneradores giran en la colina del viento.',
      regular: 'La colina sigue igual.',
      mala: 'Una planta de carbón echa humo junto a la colina.',
    },
  },

  /* ═════════ ZONA 5 · Fenómenos poblacionales (versión corta) ═════════ */
  {
    id: 'aldea',
    nombre: 'La aldea que crece',
    tema: 'Fenómenos poblacionales',
    icono: '🏘️', bioma: '#ecd2a6', decor: 'aldea',
    mapa: { h: [610, 320], v: [120, 300] },
    escena: 'aldea', musica: 'aldea', camaraX: 360,

    intro: [
      { expr: 'sorprendido', texto: '¡Cuánta gente! En pocos años la aldea pasó de 50 a 200 familias. Busca 2 señales de ese crecimiento.' },
    ],
    objetivo: { icono: '👀', texto: 'Señales del crecimiento' },
    objetos: [
      { id: 'maleta', dibujo: 'maleta', x: 176, y: 456, escala: .55, puntos: 10,
        titulo: 'Familias que llegan', texto: 'Mucha gente se muda del campo a la ciudad buscando trabajo. Esta migración hace crecer muy rápido a las ciudades.' },
      { id: 'pozo', dibujo: 'pozo', x: 452, y: 440, escala: .6, puntos: 10,
        titulo: 'Un pozo casi seco', texto: 'Con cuatro veces más familias se saca más agua de la que la lluvia alcanza a reponer.' },
    ],

    antesDelReto: [
      { expr: 'pensando', texto: 'Más personas necesitan más casas, agua y comida. ¿Cómo debería crecer la aldea?' },
    ],

    retos: [
      {
        tipo: 'plan',
        titulo: 'El plan de la aldea',
        enunciado: 'Elige cómo cubrir cada necesidad de las 200 familias.',
        puntos: 10,
        necesidades: [
          { icono: '🏠', nombre: 'Vivienda', opciones: [
            { icono: '🪓', texto: 'Construir casas nuevas dentro del bosque', tipo: 'mala', escena: 'expansion', foco: [690, 360, 110],
              efectos: { biodiversidad: -6, clima: -2 }, explica: 'La mancha urbana destruye el hábitat de muchas especies.' },
            { icono: '🏢', texto: 'Edificios de pocos pisos dentro de la aldea', tipo: 'buena', escena: 'compacta', foco: [346, 318, 68],
              efectos: { biodiversidad: 5, clima: 2 }, explica: 'Crecer hacia arriba ocupa menos suelo y conserva el bosque.' },
          ]},
          { icono: '💧', nombre: 'Agua', opciones: [
            { icono: '🕳️', texto: 'Abrir más pozos y sacar toda el agua posible', tipo: 'mala', escena: 'pozos', foco: [476, 452, 72],
              efectos: { calidad: -4, suelo: -5 }, explica: 'Si se saca más agua de la que llueve, los acuíferos se agotan.' },
            { icono: '🌧️', texto: 'Captar agua de lluvia y reparar las fugas', tipo: 'buena', escena: 'lluvia', foco: [572, 398, 46],
              efectos: { calidad: 4, suelo: 3 }, explica: 'Se aprovecha la lluvia y no se desperdicia el agua.' },
          ]},
          { icono: '🌽', nombre: 'Comida', opciones: [
            { icono: '🔥', texto: 'Quemar bosque para abrir más parcelas', tipo: 'mala', escena: 'desmonte', foco: [130, 318, 100],
              efectos: { biodiversidad: -5, suelo: -4, clima: -3 }, explica: 'Se pierde bosque y, en pocos años, el suelo deja de producir.' },
            { icono: '🥕', texto: 'Huertos familiares y rotación de cultivos', tipo: 'buena', escena: 'huertos', foco: [288, 470, 58],
              efectos: { suelo: 5, biodiversidad: 3 }, explica: 'Producen más en el mismo espacio y cuidan el suelo.' },
          ]},
        ],
        resultado: { buena: '¡Un plan sustentable!', regular: 'Un plan a medias', mala: 'Un plan que agota los recursos' },
        cierre: 'Cuando la población crece, también crece la presión sobre el agua, el suelo y los bosques. Cómo crecemos marca la diferencia.',
      },
    ],

    final: {
      titulo: { buena: '¡Una aldea que crece con cuidado!', regular: 'Una aldea a medio camino', mala: 'La aldea se comió al bosque' },
      texto: 'El crecimiento de la población aumenta la demanda de recursos. Planear cómo crecer reduce la presión sobre la naturaleza.',
    },
    huellas: {
      buena: 'La aldea creció hacia arriba y el bosque sigue en pie.',
      regular: 'La aldea creció, pero gastó parte de sus recursos.',
      mala: 'Casas y parcelas nuevas se comieron el bosque.',
    },
  },

  /* ═════════ ZONA 6 · Desertificación (versión corta) ═════════
     Aquí no hay reto aparte: cada zona dañada se repara (o empeora) en el lugar. */
  {
    id: 'seco',
    nombre: 'El borde seco',
    tema: 'Desertificación',
    icono: '🏜️', bioma: '#e8cf94', decor: 'seco',
    mapa: { h: [770, 445], v: [295, 195] },
    escena: 'seco', musica: 'seco', camaraX: 400,

    intro: [
      { expr: 'triste', texto: 'Aquí antes había pastos y mezquites. Ahora la tierra se degrada y cada año produce menos.' },
      { expr: 'pensando', texto: 'Encuentra las 3 zonas dañadas y decide cómo reparar cada una.' },
    ],
    objetivo: { icono: '🩹', texto: 'Zonas dañadas' },
    objetos: [
      { id: 'carcava', dibujo: 'carcava', x: 214, y: 432, escala: .8, puntos: 5,
        titulo: 'Suelo arrastrado por la lluvia', texto: 'Sin plantas que lo sujeten, la lluvia se lleva la tierra fértil y abre zanjas llamadas cárcavas.',
        accion: { opciones: [
          { icono: '🪨', texto: 'Hacer terrazas y barreras de piedra para frenar el agua', tipo: 'buena', puntos: 10, escena: 'terrazas',
            efectos: { suelo: 6, calidad: 2 }, feedback: 'El agua corre más despacio, se filtra y deja de arrastrar el suelo.' },
          { icono: '🤷', texto: 'Dejarla así; es solo un poco de tierra', tipo: 'mala', puntos: 0, escena: 'erosion',
            efectos: { suelo: -6 }, feedback: 'Con cada lluvia la zanja crece. Formar un centímetro de suelo fértil puede tardar cientos de años.' },
        ]}},
      { id: 'chiva', dibujo: 'chiva', x: 520, y: 394, escala: .62, puntos: 5,
        titulo: 'Demasiado ganado', texto: 'Cuando hay más animales de los que el terreno aguanta, se comen las plantas antes de que vuelvan a crecer.',
        accion: { opciones: [
          { icono: '🔄', texto: 'Rotar el ganado entre potreros para que el pasto descanse', tipo: 'buena', puntos: 10, escena: 'pastoreo',
            efectos: { suelo: 5, biodiversidad: 3 }, feedback: 'Mientras un potrero descansa, el pasto se recupera y protege el suelo.' },
          { icono: '🐐', texto: 'Traer todavía más animales para producir más', tipo: 'mala', puntos: 0, escena: 'sobrepastoreo',
            efectos: { suelo: -6, biodiversidad: -3 }, feedback: 'El sobrepastoreo deja el suelo desnudo, y el viento y la lluvia se lo llevan.' },
        ]}},
      { id: 'suelo', dibujo: 'suelo', x: 690, y: 452, escala: .75, puntos: 5,
        titulo: 'Tierra sin plantas', texto: 'Aquí talaron los mezquites. Sin sombra ni raíces, el sol y el viento resecan el suelo.',
        accion: { opciones: [
          { icono: '🌵', texto: 'Plantar mezquites, magueyes y nopales nativos', tipo: 'buena', puntos: 10, escena: 'reforestar',
            efectos: { suelo: 5, clima: 3, biodiversidad: 3 }, feedback: 'Las plantas nativas aguantan la sequía, dan sombra y sus raíces sujetan el suelo.' },
          { icono: '🪓', texto: 'Cortar los últimos mezquites para hacer carbón', tipo: 'mala', puntos: 0, escena: 'tala',
            efectos: { suelo: -5, clima: -3, biodiversidad: -3 }, feedback: 'Sin vegetación, la tierra pierde su fertilidad y la zona se vuelve cada vez más árida.' },
        ]}},
    ],

    antesDelReto: [],
    retos: [],

    final: {
      titulo: { buena: '¡La tierra vuelve a producir!', regular: 'El borde seco resiste', mala: 'La tierra se sigue degradando' },
      texto: 'La desertificación es la degradación de la tierra en zonas secas: pierde fertilidad y vegetación por el mal manejo humano y por el clima.',
    },
    huellas: {
      buena: 'Mezquites y terrazas protegen el borde seco.',
      regular: 'El borde seco se recuperó solo en parte.',
      mala: 'El borde seco se volvió más árido.',
    },
  },
];

const META = { icono: '🏆', nombre: 'Resultado final', bioma: '#f6e7a8', mapa: { h: [905, 235], v: [205, 85] } };

const RANGOS = [
  { min: .9, icono: '🏆', nombre: 'Guardián Maestro', mensaje: 'Cuidaste cada rincón del bosque y tomaste decisiones que lo hicieron florecer.' },
  { min: .7, icono: '🌿', nombre: 'Guardián Ambiental', mensaje: 'Entendiste cómo lo que hacemos cambia la naturaleza, y casi siempre elegiste cuidarla.' },
  { min: .5, icono: '🍃', nombre: 'Protector de la Naturaleza', mensaje: 'Vas por buen camino. Algunas decisiones dejaron huella, pero el bosque sigue en pie gracias a ti.' },
  { min: 0,  icono: '🌱', nombre: 'Aprendiz de Guardián', mensaje: 'Todo guardián empieza como semilla. Juega otra vez y mira cómo cambia el bosque con otras decisiones.' },
];
