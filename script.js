/*
 * Datos del negocio. Es lo único que hay que cambiar para actualizar el
 * teléfono, el horario o las comunas: el resto de la página los toma de aquí.
 */
const CONFIG = {
  nombre: 'Javier',
  telefono: '+56 9 4296 0390', // con WhatsApp
  comunas: ['Temuco', 'Padre Las Casas'],
  // Horario confirmado por Javier (2026-10-10), también para urgencias.
  // 0 = domingo, 1 = lunes … 6 = sábado. Un día que no aparece es un día sin atención.
  horario: {
    1: ['10:00', '22:00'],
    2: ['10:00', '22:00'],
    3: ['10:00', '22:00'],
    4: ['10:00', '22:00'],
    5: ['10:00', '22:00'],
    6: ['08:00', '13:00'],
  },
  // Feriados nacionales: no se atiende. Fuente: feriados.cl, revisado el 2026-10-10.
  // Confirmar el 21-06-2027 y el 17-09-2027 cuando salga el decreto; agregar 2028 a fines de 2027.
  feriados: [
    '2026-10-12', '2026-10-31', '2026-11-01', '2026-12-08', '2026-12-25',
    '2027-01-01', '2027-03-26', '2027-03-27', '2027-05-01', '2027-05-21', '2027-06-21',
    '2027-06-28', '2027-07-16', '2027-08-15', '2027-09-17', '2027-09-18', '2027-09-19',
    '2027-10-11', '2027-10-31', '2027-11-01', '2027-12-08', '2027-12-25',
  ],
  experienciaDesde: 2010, // año en que empezó en el área eléctrica; los años se calculan solos
  fotoPerfil: 'fotos/javier.jpg', // foto para «Sobre mí»; vacía = recuadro con la inicial
  fotoPerfilEnfoque: '50% 18%', // qué parte de la foto se ve en el recuadro (horizontal vertical)
  fotoPerfilTexto: 'Javier con casco, lentes de seguridad, arnés y chaleco reflectante',
  mensajeInicial: 'Hola Javier, vi tu página web.',
  sitio: 'https://javier-electricista-temuco.github.io/', // dirección pública cuando la página esté publicada
  // Fotos de trabajos: se guardan en la carpeta fotos/ y se anotan aquí. «lugar» es el texto
  // chico bajo el título (tipo de trabajo o comuna). Si la lista queda vacía, la sección no se publica.
  // Fotos aprobadas por Javier el 2026-10-10 (la de canalización va recortada para no mostrar a otra persona).
  trabajos: [
    { foto: 'fotos/trabajo-lampara-colgante.jpg', titulo: 'Lámpara colgante de madera', lugar: 'Iluminación' },
    { foto: 'fotos/trabajo-aplique-pared.jpg', titulo: 'Aplique de pared', lugar: 'Iluminación' },
    { foto: 'fotos/trabajo-plafon-bano.jpg', titulo: 'Plafón LED en baño', lugar: 'Iluminación' },
    { foto: 'fotos/trabajo-extractor-bano.jpg', titulo: 'Extractor de baño', lugar: 'Instalación' },
    { foto: 'fotos/trabajo-tablero.jpg', titulo: 'Tablero eléctrico', lugar: 'Instalación' },
    { foto: 'fotos/trabajo-canalizacion.jpg', titulo: 'Canalización a la vista', lugar: 'Instalación' },
  ],
};

const ZONA_HORARIA = 'America/Santiago';
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const DIAS_SCHEMA = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

const digitos = CONFIG.telefono.replace(/\D/g, '');
const esBorrador = /0{6,}/.test(digitos);

const $$ = (selector) => document.querySelectorAll(selector);
const aMinutos = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const enlaceWhatsApp = (texto) => `https://wa.me/${digitos}?text=${encodeURIComponent(texto)}`;
const mayuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

/* Agrupa los días seguidos con el mismo horario: lunes a viernes 10:00–22:00, sábado 08:00–13:00. */
function gruposDeHorario() {
  const grupos = [];
  ORDEN_SEMANA.forEach((dia) => {
    const horas = CONFIG.horario[dia];
    const ultimo = grupos[grupos.length - 1];
    if (horas && ultimo && ultimo.horas.join() === horas.join() && ORDEN_SEMANA.indexOf(ultimo.hasta) === ORDEN_SEMANA.indexOf(dia) - 1) {
      ultimo.hasta = dia;
    } else if (horas) {
      grupos.push({ desde: dia, hasta: dia, horas });
    }
  });
  return grupos;
}

function textoHorario(corto) {
  const partes = gruposDeHorario().map(({ desde, hasta, horas }) => {
    const nombres = corto ? DIAS_CORTOS : DIAS;
    const dias = desde === hasta ? nombres[desde] : `${nombres[desde]} a ${nombres[hasta]}`;
    return corto ? `${mayuscula(dias)} ${horas[0]}–${horas[1]}` : `${dias} de ${horas[0]} a ${horas[1]}`;
  });
  if (corto) return partes.join(' · ');
  return mayuscula(partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}` : partes[0]);
}

function rellenarDatos() {
  // data-wa-texto agrega un mensaje propio al saludo (por ejemplo, el problema que el cliente tocó).
  $$('[data-wa]').forEach((a) => {
    const extra = a.dataset.waTexto;
    a.href = enlaceWhatsApp(extra ? `${CONFIG.mensajeInicial} ${extra}` : CONFIG.mensajeInicial);
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-tel]').forEach((a) => { a.href = `tel:+${digitos}`; });

  const principal = gruposDeHorario()[0];
  const textos = {
    '[data-tel-texto]': CONFIG.telefono,
    '[data-horario]': textoHorario(false),
    '[data-horario-corto]': textoHorario(true),
    '[data-anio]': String(new Date().getFullYear()),
    '[data-anios]': String(new Date().getFullYear() - CONFIG.experienciaDesde),
    // Atributos antiguos que todavía usan las plantillas de referencia (plantillas/).
    '[data-dias]': mayuscula(`${DIAS[principal.desde]} a ${DIAS[principal.hasta]}`),
    '[data-abre]': principal.horas[0],
    '[data-cierre]': principal.horas[1],
  };
  for (const [selector, texto] of Object.entries(textos)) {
    $$(selector).forEach((el) => { el.textContent = texto; });
  }
}

/* ---------- Estado "atendiendo ahora", siempre con la hora de Chile ---------- */
function ahoraEnChile() {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const valor = (tipo) => partes.find((p) => p.type === tipo).value;
  return {
    fecha: `${valor('year')}-${valor('month')}-${valor('day')}`,
    dia: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(valor('weekday')),
    minutos: Number(valor('hour')) * 60 + Number(valor('minute')),
  };
}

/* Fecha (AAAA-MM-DD) y día de la semana, n días después de `fecha`. */
function sumarDias(fecha, n) {
  const [a, m, d] = fecha.split('-').map(Number);
  const f = new Date(Date.UTC(a, m - 1, d + n));
  return { fecha: f.toISOString().slice(0, 10), dia: f.getUTCDay(), diaDelMes: f.getUTCDate() };
}

const esFeriado = (fecha) => CONFIG.feriados.includes(fecha);
const horasDelDia = (fecha, dia) => (esFeriado(fecha) ? null : CONFIG.horario[dia] || null);

function proximaApertura({ fecha, dia, minutos }) {
  const hoy = horasDelDia(fecha, dia);
  if (hoy && minutos < aMinutos(hoy[0])) return `hoy a las ${hoy[0]}`;
  for (let i = 1; i <= 21; i++) {
    const otro = sumarDias(fecha, i);
    const horas = horasDelDia(otro.fecha, otro.dia);
    if (!horas) continue;
    if (i === 1) return `mañana a las ${horas[0]}`;
    const cuando = i < 7 ? `el ${DIAS[otro.dia]}` : `el ${DIAS[otro.dia]} ${otro.diaDelMes}`;
    return `${cuando} a las ${horas[0]}`;
  }
  return 'pronto';
}

function actualizarEstado() {
  const ahora = ahoraEnChile();
  const hoy = horasDelDia(ahora.fecha, ahora.dia);
  const feriado = esFeriado(ahora.fecha);
  const abierto = Boolean(hoy) && ahora.minutos >= aMinutos(hoy[0]) && ahora.minutos < aMinutos(hoy[1]);
  let titulo = 'Fuera de horario';
  if (abierto) titulo = 'Atendiendo ahora';
  else if (feriado) titulo = 'Hoy es feriado';
  const detalle = abierto ? `hasta las ${hoy[1]}` : `vuelvo ${proximaApertura(ahora)}`;
  let horasDeHoy = 'HOY CERRADO';
  if (feriado) horasDeHoy = 'FERIADO';
  else if (hoy) horasDeHoy = `HOY ${hoy[0]}–${hoy[1]}`;
  $$('[data-horario-hoy]').forEach((el) => { el.textContent = horasDeHoy; });

  $$('[data-estado]').forEach((el) => {
    el.classList.toggle('is-abierto', abierto);
    el.classList.toggle('is-cerrado', !abierto);
    const fuerte = document.createElement('strong');
    fuerte.textContent = titulo;
    el.querySelector('[data-estado-texto]').replaceChildren(fuerte, ` · ${detalle}`);
  });

  const tablero = document.querySelector('[data-tablero]');
  tablero?.classList.toggle('is-abierto', abierto);
  tablero?.classList.toggle('is-cerrado', !abierto);
  $$('[data-estado-tablero]').forEach((el) => {
    el.textContent = abierto ? 'EN SERVICIO' : 'FUERA DE HORARIO';
  });
}

/* Las palancas parten abajo y suben una tras otra al cargar la página. */
function encenderTablero() {
  const tablero = document.querySelector('[data-tablero]');
  if (!tablero) return;
  requestAnimationFrame(() => requestAnimationFrame(() => tablero.classList.add('is-on')));
}

/* En el teléfono, la barra con WhatsApp y Llamar aparece cuando los botones
   de la portada ([data-acciones]) y la sección de contacto no están a la vista. */
function barraMovil() {
  const barra = document.querySelector('[data-barra-movil]');
  if (!barra) return;
  if (!('IntersectionObserver' in window)) {
    barra.classList.add('is-visible');
    return;
  }
  barra.inert = true;
  const visibles = new Set();
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => (e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target)));
    const mostrar = visibles.size === 0;
    barra.classList.toggle('is-visible', mostrar);
    barra.inert = !mostrar;
  });
  $$('[data-acciones], #contacto').forEach((el) => observador.observe(el));
}

/* El formulario no envía nada a ningún servidor: arma el texto y abre WhatsApp. */
function formularioWhatsApp() {
  const form = document.querySelector('[data-form-wa]');
  if (!form) return;
  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const datos = new FormData(form);
    const partes = [CONFIG.mensajeInicial];
    if (datos.get('servicio')) partes.push(`Necesito ayuda con ${datos.get('servicio')}.`);
    if (datos.get('comuna')) partes.push(`Estoy en ${datos.get('comuna')}.`);
    const detalle = String(datos.get('detalle') || '').trim();
    if (detalle) partes.push(detalle);

    const url = enlaceWhatsApp(partes.join(' '));
    const ventana = window.open(url, '_blank');
    if (ventana) ventana.opener = null;
    else window.location.href = url;
  });
}

/* Imagen con carga diferida: `loading` tiene que ir ANTES que `src`; si no, el navegador
   empieza a descargarla apenas recibe la dirección, aunque esté lejos en la página. */
function crearImagen(src, alt) {
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.decoding = 'async';
  img.alt = alt;
  img.src = src;
  return img;
}

/* Foto de «Sobre mí»: si no hay, queda el recuadro con la inicial. */
function fotoPerfil() {
  const marco = document.querySelector('[data-foto-perfil]');
  if (!marco || !CONFIG.fotoPerfil) return;
  const img = crearImagen(CONFIG.fotoPerfil, CONFIG.fotoPerfilTexto || `${CONFIG.nombre}, electricista`);
  if (CONFIG.fotoPerfilEnfoque) img.style.objectPosition = CONFIG.fotoPerfilEnfoque;
  marco.textContent = '';
  marco.append(img);
  marco.closest('.sobre__foto')?.classList.add('con-foto');
}

/* ---------- Galería de trabajos ---------- */
const FOTOS_EJEMPLO = [
  ['Cambio de tablero', 'Casa en Temuco'],
  ['Iluminación LED', 'Local en Padre Las Casas'],
  ['Enchufes nuevos', 'Departamento en Temuco'],
  ['Focos exteriores', 'Casa en Padre Las Casas'],
  ['Reparación de una falla', 'Casa en Temuco'],
  ['Conexión de encimera', 'Casa en Temuco'],
];

function fotoDeEjemplo(numero) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs><pattern id="r" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#343A45"/></pattern></defs>
    <rect width="800" height="600" fill="#1E2229"/><rect width="800" height="600" fill="url(#r)"/>
    <path transform="translate(336 196) scale(4)" d="M18 4 8 18h7l-1 10 10-14h-7l1-10z" fill="#FFC21A"/>
    <text x="400" y="372" fill="#A9B0BC" font-family="sans-serif" font-size="26" text-anchor="middle">Foto de ejemplo ${numero}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/* Sin fotos reales la sección no aparece; solo en el computador (localhost)
   se muestran fotos de ejemplo para ver cómo queda. */
function galeria() {
  const seccion = document.querySelector('[data-galeria-seccion]');
  const grilla = document.querySelector('[data-galeria]');
  if (!seccion || !grilla) return;

  let fotos = CONFIG.trabajos;
  if (!fotos.length) {
    if (!['localhost', '127.0.0.1'].includes(location.hostname)) return;
    fotos = FOTOS_EJEMPLO.map(([titulo, lugar], i) => ({ foto: fotoDeEjemplo(i + 1), titulo, lugar }));
    // El aviso se crea aquí y no va escrito en el HTML: así nunca llega a la página publicada.
    const aviso = document.createElement('p');
    aviso.className = 'galeria__aviso';
    aviso.textContent = 'Vista previa con fotos de ejemplo. Esta sección se publica solo cuando agregues tus fotos reales.';
    grilla.before(aviso);
  }
  seccion.hidden = false;
  $$('[data-galeria-enlace]').forEach((el) => { el.hidden = false; });

  const descripcion = (f) => [f.titulo, f.lugar].filter(Boolean).join(' · ');
  grilla.replaceChildren(...fotos.map((f, i) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'galeria__item';
    boton.setAttribute('aria-label', `Ver foto: ${descripcion(f)}`);
    const img = crearImagen(f.foto, '');
    const texto = document.createElement('span');
    texto.className = 'galeria__texto';
    const titulo = document.createElement('strong');
    titulo.textContent = f.titulo || '';
    const lugar = document.createElement('span');
    lugar.textContent = f.lugar || '';
    texto.append(titulo, lugar);
    boton.append(img, texto);
    boton.addEventListener('click', () => abrir(i));
    return boton;
  }));

  const visor = document.querySelector('[data-visor]');
  if (!visor) return;
  const imagen = visor.querySelector('[data-visor-img]');
  let actual = 0;
  const mostrar = (i) => {
    actual = (i + fotos.length) % fotos.length;
    const f = fotos[actual];
    imagen.src = f.foto;
    imagen.alt = descripcion(f);
    visor.querySelector('[data-visor-txt]').textContent = descripcion(f);
    visor.querySelector('[data-visor-cuenta]').textContent = `${actual + 1} / ${fotos.length}`;
  };
  function abrir(i) {
    // Navegadores sin <dialog> (iOS anterior a 15.4): se abre la foto sola.
    if (typeof visor.showModal !== 'function') {
      window.open(fotos[i].foto, '_blank', 'noopener');
      return;
    }
    mostrar(i);
    visor.showModal();
  }
  visor.querySelector('[data-visor-cerrar]').addEventListener('click', () => visor.close());
  visor.querySelector('[data-visor-prev]').addEventListener('click', () => mostrar(actual - 1));
  visor.querySelector('[data-visor-sig]').addEventListener('click', () => mostrar(actual + 1));
  visor.addEventListener('click', (e) => { if (e.target === visor) visor.close(); });
  visor.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') mostrar(actual - 1);
    if (e.key === 'ArrowRight') mostrar(actual + 1);
  });
  // Deslizar con el dedo para cambiar de foto.
  let inicioX = null;
  imagen.addEventListener('pointerdown', (e) => { inicioX = e.clientX; });
  imagen.addEventListener('pointerup', (e) => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    inicioX = null;
    if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
  });
}

/* ---------- Carruseles en el teléfono ----------
   Las secciones con data-carrusel pasan solas cada 5 s y se quedan quietas mientras el dedo
   está encima. No avanzan si están pausadas con el botón, fuera de la vista, con una foto
   abierta, con el foco del teclado dentro o con «reducir movimiento». En computador no cambian. */
const INTERVALO_CARRUSEL = 5000;
// :focus-visible no existe antes de iOS 15.4 y ahí querySelector lanzaría un error; se usa :focus.
const SELECTOR_FOCO = (() => {
  try { document.querySelector(':focus-visible'); return ':focus-visible'; } catch { return ':focus'; }
})();

function crearCarrusel(pista) {
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activo = false;
  let pausado = reducido;
  let tocando = false;
  let visible = false;
  let actual = 0;
  let temporizador = null;
  let esperaScroll = null;

  const items = () => [...pista.children];
  const controles = document.createElement('div');
  controles.className = 'carrusel__controles';
  controles.hidden = true;
  const puntos = document.createElement('div');
  puntos.className = 'carrusel__puntos';
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'carrusel__pausa';
  controles.append(puntos, boton);
  pista.after(controles);

  function pintarBoton() {
    // Solo cambia el nombre («Pausar» / «Reanudar»): sumarle aria-pressed lo haría leer contradictorio.
    boton.setAttribute('aria-label', pausado ? `Reanudar: ${pista.dataset.carrusel}` : `Pausar: ${pista.dataset.carrusel}`);
    boton.innerHTML = `<svg class="ic" aria-hidden="true"><use href="#${pausado ? 'i-play' : 'i-pausa'}"/></svg>`;
  }
  function marcar() {
    [...puntos.children].forEach((p, i) => {
      if (i === actual) p.setAttribute('aria-current', 'true');
      else p.removeAttribute('aria-current');
    });
  }
  function ir(i) {
    const item = items()[i];
    if (!item) return;
    actual = i;
    pista.scrollTo({ left: item.offsetLeft - (pista.clientWidth - item.offsetWidth) / 2, behavior: reducido ? 'auto' : 'smooth' });
    marcar();
  }
  function pintarPuntos() {
    const total = items().length;
    puntos.replaceChildren(...items().map((_, i) => {
      const p = document.createElement('button');
      p.type = 'button';
      p.className = 'carrusel__punto';
      p.setAttribute('aria-label', `Ir a ${i + 1} de ${total}`);
      p.addEventListener('click', () => { ir(i); reiniciar(); });
      return p;
    }));
    marcar();
  }
  function masCercano() {
    const centro = pista.scrollLeft + pista.clientWidth / 2;
    let mejor = 0;
    let distancia = Infinity;
    items().forEach((item, i) => {
      const d = Math.abs(item.offsetLeft + item.offsetWidth / 2 - centro);
      if (d < distancia) { distancia = d; mejor = i; }
    });
    return mejor;
  }
  const puedeAvanzar = () => activo && !pausado && !tocando && visible && !document.hidden
    && !document.querySelector('dialog[open]') && !pista.querySelector(SELECTOR_FOCO);
  function reiniciar() {
    clearInterval(temporizador);
    if (!activo) return;
    temporizador = setInterval(() => {
      if (puedeAvanzar() && items().length > 1) ir((actual + 1) % items().length);
    }, INTERVALO_CARRUSEL);
  }

  // Dedo encima: quieto. Se usan eventos táctiles porque el navegador cancela los de puntero
  // apenas empieza a deslizar, aunque el dedo siga apoyado.
  pista.addEventListener('touchstart', () => { tocando = true; }, { passive: true });
  ['touchend', 'touchcancel'].forEach((tipo) => pista.addEventListener(tipo, () => { tocando = false; reiniciar(); }, { passive: true }));
  pista.addEventListener('scroll', () => {
    clearTimeout(esperaScroll);
    esperaScroll = setTimeout(() => { actual = masCercano(); marcar(); }, 120);
  }, { passive: true });
  boton.addEventListener('click', () => { pausado = !pausado; pintarBoton(); reiniciar(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.intersectionRatio >= 0.5; }, { threshold: [0, 0.5, 1] }).observe(pista);
  } else {
    visible = true;
  }

  return {
    activar() {
      if (activo || !items().length) return;
      activo = true;
      pista.classList.add('es-carrusel');
      // Un <div> no tiene función propia y los lectores de pantalla ignorarían su nombre; una lista sí la tiene.
      if (pista.tagName !== 'UL') pista.setAttribute('role', 'group');
      pista.setAttribute('aria-roledescription', 'carrusel');
      pista.setAttribute('aria-label', pista.dataset.carrusel);
      controles.hidden = false;
      pintarPuntos();
      pintarBoton();
      reiniciar();
    },
    desactivar() {
      activo = false;
      clearInterval(temporizador);
      pista.classList.remove('es-carrusel');
      if (pista.tagName !== 'UL') pista.removeAttribute('role');
      pista.removeAttribute('aria-roledescription');
      pista.removeAttribute('aria-label');
      controles.hidden = true;
    },
  };
}

function carruseles() {
  const telefono = matchMedia('(max-width: 759px)');
  const lista = [...$$('[data-carrusel]')].map(crearCarrusel);
  const aplicar = () => lista.forEach((c) => (telefono.matches ? c.activar() : c.desactivar()));
  if (telefono.addEventListener) telefono.addEventListener('change', aplicar);
  else telefono.addListener(aplicar); // iOS 13 y anteriores
  aplicar();
}

/* Ficha para Google (negocio local). No se publica mientras el teléfono sea de ejemplo. */
function datosEstructurados() {
  if (esBorrador) return;
  // Un bloque por cada horario distinto (lunes a viernes, sábado) y los próximos feriados como cerrados.
  const porHorario = new Map();
  ORDEN_SEMANA.filter((d) => CONFIG.horario[d]).forEach((d) => {
    const clave = CONFIG.horario[d].join('-');
    porHorario.set(clave, [...(porHorario.get(clave) || []), DIAS_SCHEMA[d]]);
  });
  const hoy = ahoraEnChile().fecha;
  const ficha = {
    '@context': 'https://schema.org',
    '@type': 'Electrician',
    name: `${CONFIG.nombre} · Electricista`,
    telephone: `+${digitos}`,
    url: CONFIG.sitio || location.origin + location.pathname,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Temuco',
      addressRegion: 'La Araucanía',
      addressCountry: 'CL',
    },
    areaServed: CONFIG.comunas.map((name) => ({ '@type': 'City', name })),
    // Perfiles en redes sociales: se toman de los enlaces de la página, así no hay que anotarlos dos veces.
    sameAs: [...$$('[data-red]')].map((a) => a.href),
    paymentAccepted: 'Efectivo, transferencia bancaria',
    currenciesAccepted: 'CLP',
    openingHoursSpecification: [...porHorario].map(([clave, dias]) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: dias,
      opens: clave.split('-')[0],
      closes: clave.split('-')[1],
    })),
    specialOpeningHoursSpecification: CONFIG.feriados.filter((f) => f >= hoy).map((f) => ({
      '@type': 'OpeningHoursSpecification',
      validFrom: f,
      validThrough: f,
      opens: '00:00',
      closes: '00:00',
    })),
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(ficha);
  document.head.append(script);
}

rellenarDatos();
actualizarEstado();
setInterval(actualizarEstado, 60_000);
encenderTablero();
barraMovil();
formularioWhatsApp();
fotoPerfil();
galeria();
carruseles(); // después de galeria(), que crea las fotos
datosEstructurados();
