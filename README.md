# 🌿 Guardianes de la Naturaleza

Juego web educativo para la exposición de **Desarrollo Sustentable**:
*Impacto de las actividades humanas sobre la naturaleza*.

Hecho con HTML, CSS y JavaScript puros: no necesita instalar nada ni compilar.

## Cómo abrirlo

- **Rápido:** doble clic en `index.html`.
- **En VS Code:** abre la carpeta y usa la extensión *Live Server* (clic derecho en `index.html` → *Open with Live Server*). Así se recarga solo cada vez que guardas.

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `guardianes-naturaleza`).
2. Sube **todo el contenido de esta carpeta** (que `index.html` quede en la raíz del repositorio).
3. En el repositorio: **Settings → Pages → Branch: `main` / `(root)` → Save**.
4. En uno o dos minutos queda en `https://TU-USUARIO.github.io/guardianes-naturaleza/`.
5. Genera un QR de esa liga para que los espectadores entren desde su celular.

## Estructura

```
index.html        Todas las pantallas (inicio, personaje, mapa, zona, final)
css/style.css     Estilos, animaciones y diseño para celular
fonts/            Tipografías incluidas (Gluten y Andika, licencia OFL)
js/personajes.js  Los cuatro animalitos dibujados en SVG y sus expresiones
js/escenas.js     Fondos de cada zona y objetos escondidos
js/mapa.js        El mapa del sendero y cómo muestra las consecuencias
js/audio.js       Música y efectos generados en el navegador (sin archivos)
js/zonas.js       ★ TODO EL CONTENIDO: textos, objetos, retos y respuestas
js/juego.js       Motor: estado, corazones, puntos, planeta, retos y final
```

## Editar el contenido

Todo lo educativo está en **`js/zonas.js`**. Ahí se pueden cambiar diálogos, textos de objetos,
pares del reto de unir, opciones de las decisiones, puntos y efectos en las barras del planeta,
sin tocar el resto del código.

Barras del planeta: `biodiversidad`, `calidad`, `clima`, `suelo`.

Tipos de reto: `relacionar`, `seleccionar`, `ordenar`, `clasificar`, `decision` y `plan`.
En la zona 6 no hay reto aparte: cada objeto tiene una `accion` y se repara (o empeora) en el lugar.

## Cómo se ven las consecuencias

- **En la zona:** al acertar o decidir, la escena cambia en ese momento (árboles que crecen o se talan, río que se limpia o se ensucia, aerogeneradores o planta de carbón).
- **En el mapa:** al volver al sendero, el mapa aparece como estaba antes de entrar y en dos segundos cambia al nuevo estado, con un aviso de lo que pasó.
  - Cada zona deja una huella según la decisión tomada.
  - Biodiversidad → flores y mariposas · Calidad ambiental → color del río y basura flotando · Clima → neblina cálida · Suelo → manchas secas.
  - El color general del bosque depende del promedio de las cuatro barras.
- **Al terminar cada misión:** la ventana de resultados se puede cerrar (✕ o **Ver cómo quedó**) para recorrer la escena. Los lugares que cambiaron se marcan con un círculo verde si mejoraron y rojo si empeoraron.
- **Rango final:** combina los puntos y la salud del planeta, así que jugar bien los retos no basta si las decisiones dañaron el bosque.

## Para probar

- `index.html?libre` → todas las zonas abiertas.
- `index.html?final` → salta directo a la pantalla final.
- El progreso se guarda en el navegador. Para empezar de cero: botón **Jugar otra vez** o **Comenzar aventura**.

## Estado

| Zona | Tema | Estado |
|---|---|---|
| 🏡 El claro del pueblo | Sociedad y naturaleza, actividades que generan impactos | ✅ Lista |
| 🦋 El corazón del bosque | Pérdida de biodiversidad | ✅ Lista |
| 💧 El río de los sauces | Contaminación | ✅ Lista |
| 🌡️ La colina del viento | Cambio climático | ✅ Lista |
| 🏘️ La aldea que crece | Fenómenos poblacionales | ✅ Lista (versión corta) |
| 🏜️ El borde seco | Desertificación | ✅ Lista (versión corta) |

Equipo: Itzel 🐰 · Ingrid 🐱 · Sebastian 🐶 · Gabriel 🦊
# guardianes-naturaleza
