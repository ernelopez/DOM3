// juego.js
import { Partida } from './partida.js';
import {
    LARGO_FICHA, ANCHO_FICHA, MARGEN_TABLERO
} from './config.js';

// -------------------------------------------------
// Colores
// -------------------------------------------------
export const COLOR_FONDO = '#282828';
export const COLOR_BOTON = '#464646';
export const COLOR_BOTON_HOVER = '#646464';
export const COLOR_TEXTO_BOTON = '#ffffff';
export const COLOR_CASILLA_VACIA = '#ffffc8';
export const COLOR_CASILLA_DESTACADA = '#32c832';
export const COLOR_JUGADOR1 = '#c86464';
export const COLOR_JUGADOR2 = '#6496dc';
export const COLOR_TEXTO = '#ffffff';
export const COLOR_TITULO = '#ffffc8';

export const ANCHO_PANTALLA = 1200;
export const ALTO_PANTALLA = 750;

export const ARCHIVO_FUENTE = 'junegull.ttf';


// -------------------------------------------------
// Clase Boton
// -------------------------------------------------
export class Boton {
    constructor(x, y, ancho, alto, texto, imagen = null,
                color = COLOR_BOTON, colorHover = COLOR_BOTON_HOVER) {
        this.x = x;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
        this.texto = texto;
        this.imagen = imagen;
        this.color = color;
        this.colorHover = colorHover;
        this.activo = true;
    }

    estaSobre(mouseX, mouseY) {
        return mouseX >= this.x && mouseX <= this.x + this.ancho &&
               mouseY >= this.y && mouseY <= this.y + this.alto;
    }

    click(mouseX, mouseY) {
        return this.activo && this.estaSobre(mouseX, mouseY);
    }
}


// -------------------------------------------------
// Clase principal Juego
// -------------------------------------------------
export class Juego {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Tamaño lógico del juego (se actualiza al tamaño real del canvas)
        this.anchoPantalla = ANCHO_PANTALLA;
        this.altoPantalla = ALTO_PANTALLA;

        // Nombres de jugadores
        this.nombreJugador1 = "Jugador 1";
        this.nombreJugador2 = "Jugador 2";
        this.nombresIngresados = false;
        this.ingresandoNombre = 0;   // 0: ninguno, 1: J1, 2: J2

        // Estado de partida (se completa después de cargar el CSV)
        this.partida = null;
        this.fichaInicial = null;
        this.jugadorInicial = null;
        this.fichaInicialColocada = false;

        // Estado del juego (interacción)
        this.fichaSeleccionada = null;
        this.fichaArrastrada = null;
        this.fichaRobadaActual = null;
        this.fichaClickeada = null;
        this.posClickX = 0;
        this.posClickY = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.casillasDestacadas = [];

        // Mensajes
        this.mensaje = "";
        this.tiempoMensaje = 0;
        this.mensajeColor = COLOR_TEXTO;

        // Carteles
        this.mostrarConfirmacionReinicio = false;
        this.mensajeConfirmacion = "";
        this.mostrarAyuda = false;
        this.mostrarConfirmacionSalir = false;

        // Lupa
        this.mostrarLupa = false;
        this.tiempoLupa = 0;

        // Posiciones de fichas en la mano
        this.posicionesFichas = {
            jugador1: [],
            jugador2: []
        };

        // Reglas
        this.cambioReglaError = true;

        // Configuración de escala
        this.escala = 1;
        this.largoFicha = LARGO_FICHA;
        this.anchoFicha = ANCHO_FICHA;

        // Imágenes
        this.imgFrenteOriginal = null;
        this.imgFrenteVOriginal = null;
        this.imgDorsoOriginal = null;
        this.imgDorsoVOriginal = null;
        this.imgFrente = null;
        this.imgFrenteV = null;
        this.imgDorso = null;
        this.imgDorsoV = null;
        this.imgBotonRobar = null;
        this.imgBotonPasar = null;
        this.imgBotonReset = null;
        this.imgBotonAyuda = null;
        this.imgBaa = null;

        // Sonidos
        this.sonidoWin = null;
        this.sonidoGirar = null;
        this.sonidoClic = null;
        this.sonidoCoin = null;
        this.sonidoError = null;
        this.musicaFondo = null;

        // Fuentes
        this.fuente = null;
        this.fuenteGrande = null;
        this.fuenteFraccion = null;
        this.fuenteInput = null;
        this.fuenteInstrucciones = null;

        // Botones
        this.botones = [];
        this.botonRobar = null;
        this.botonPasar = null;
        this.botonReiniciar = null;
        this.botonAyuda = null;
        this.botonLupa = null;

        // Offset del tablero
        this.offsetTableroX = 0;
        this.offsetTableroY = 0;

        // Mouse
        this.mouseX = 0;
        this.mouseY = 0;
        this.mousePresionado = false;

        // Cursor parpadeante
        this.ultimoParpadeo = 0;
        this.mostrarCursor = true;
    }

    // -------------------------------------------------
    // Carga de recursos
    // -------------------------------------------------
    async cargarRecursos() {
        // Fuente
        const fontFace = new FontFace('Junegull', 'url(fonts/junegull.ttf)');
        await fontFace.load();
        document.fonts.add(fontFace);

        // Imágenes
        this.imgFrenteOriginal = await this.cargarImagen('assets/ficha.png');
        this.imgFrenteVOriginal = await this.cargarImagen('assets/ficha_v.png');
        this.imgDorsoOriginal = await this.cargarImagen('assets/dorso12.png');
        this.imgDorsoVOriginal = await this.cargarImagen('assets/dorso12_v.png');
        this.imgBaa = await this.cargarImagen('assets/BAA2.png');

        this.imgBotonRobar = await this.cargarImagen('assets/boton_robar.png');
        this.imgBotonPasar = await this.cargarImagen('assets/boton_pasar.png');
        this.imgBotonReset = await this.cargarImagen('assets/boton_reset.png');
        this.imgBotonAyuda = await this.cargarImagen('assets/boton_ayuda.png');

        // Sonidos
        this.sonidoWin = new Audio('sonidos/win.mp3');
        this.sonidoGirar = new Audio('sonidos/girar.mp3');
        this.sonidoClic = new Audio('sonidos/clic.mp3');
        this.sonidoCoin = new Audio('sonidos/coin.mp3');
        this.sonidoError = new Audio('sonidos/error.mp3');
        this.musicaFondo = new Audio('sonidos/loop.mp3');
        this.musicaFondo.loop = true;
    }

    cargarImagen(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
            img.src = src;
        });
    }

    // -------------------------------------------------
    // Cálculo de escala y fuentes
    // -------------------------------------------------
    recalcularTamanos() {
        const escalaX = this.anchoPantalla / ANCHO_PANTALLA;
        const escalaY = this.altoPantalla / ALTO_PANTALLA;
        this.escala = Math.min(escalaX, escalaY);

        this.largoFicha = Math.floor(LARGO_FICHA * this.escala);
        this.anchoFicha = Math.floor(ANCHO_FICHA * this.escala);

        this.tamanoFuente = Math.max(12, Math.floor(24 * this.escala));
        this.tamanoFuenteGrande = Math.max(16, Math.floor(48 * this.escala));
        this.tamanoFuenteFraccion = Math.max(10, Math.floor(20 * this.escala));

        // Escalar imágenes al tamaño de ficha normal
        this.imgFrente = this.escalarImagen(this.imgFrenteOriginal, this.largoFicha, this.anchoFicha);
        this.imgFrenteV = this.escalarImagen(this.imgFrenteVOriginal, this.anchoFicha, this.largoFicha);
        this.imgDorso = this.escalarImagen(this.imgDorsoOriginal, this.largoFicha, this.anchoFicha);
        this.imgDorsoV = this.escalarImagen(this.imgDorsoVOriginal, this.anchoFicha, this.largoFicha);

        console.log(`📐 Escalado: ${this.escala.toFixed(2)}x`);
        console.log(`   Ficha: ${this.largoFicha}x${this.anchoFicha}`);
        console.log(`   Canvas: ${this.anchoPantalla}x${this.altoPantalla}`);
    }

    escalarImagen(img, ancho, alto) {
        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, ancho, alto);
        return canvas;
    }

    // -------------------------------------------------
    // Crear botones
    // -------------------------------------------------
    crearBotones() {
        this.botones = [];

        const altoBoton = Math.floor(50 * this.escala);
        const anchoBoton = Math.floor(200 * this.escala);
        const separacion = Math.floor(20 * this.escala);

        const centroX = Math.floor(this.anchoPantalla / 2);
        const yBoton = Math.floor(this.altoPantalla / 2 + 220 * this.escala);

        this.botonRobar = new Boton(
            centroX - anchoBoton - Math.floor(separacion / 2),
            yBoton,
            anchoBoton, altoBoton,
            "Robar del pozo",
            this.imgBotonRobar
        );
        this.botones.push(this.botonRobar);

        this.botonPasar = new Boton(
            centroX + Math.floor(separacion / 2),
            yBoton,
            anchoBoton, altoBoton,
            "Pasar turno",
            this.imgBotonPasar
        );
        this.botones.push(this.botonPasar);

        // Reiniciar (abajo a la derecha)
        const xReiniciar = this.anchoPantalla - Math.floor(150 * this.escala) - Math.floor(30 * this.escala);
        const yReiniciar = this.altoPantalla - Math.floor(75 * this.escala);
        const anchoReiniciar = Math.floor(150 * this.escala);
        const altoReiniciar = Math.floor(50 * this.escala);

        this.botonReiniciar = new Boton(
            xReiniciar, yReiniciar,
            anchoReiniciar, altoReiniciar,
            "Reiniciar",
            this.imgBotonReset
        );
        this.botones.push(this.botonReiniciar);

        // Ayuda (arriba de Reiniciar)
        const xAyuda = this.anchoPantalla - Math.floor(150 * this.escala) - Math.floor(30 * this.escala);
        const yAyuda = this.altoPantalla - Math.floor(120 * this.escala);
        const anchoAyuda = Math.floor(150 * this.escala);
        const altoAyuda = Math.floor(50 * this.escala);

        this.botonAyuda = new Boton(
            xAyuda, yAyuda,
            anchoAyuda, altoAyuda,
            "Ayuda",
            this.imgBotonAyuda
        );
        this.botones.push(this.botonAyuda);

        // Lupa (arriba de Ayuda)
        const xLupa = this.anchoPantalla - Math.floor(150 * this.escala) - Math.floor(30 * this.escala);
        const yLupa = this.altoPantalla - Math.floor(165 * this.escala);
        const anchoLupa = Math.floor(150 * this.escala);
        const altoLupa = Math.floor(50 * this.escala);

        this.botonLupa = new Boton(
            xLupa, yLupa,
            anchoLupa, altoLupa,
            "Lupa",
            this.imgBotonAyuda   // misma imagen que el botón de ayuda
        );
        this.botones.push(this.botonLupa);
    }

    // -------------------------------------------------
    // Estado de botones según partida
    // -------------------------------------------------
    actualizarBotones() {
        if (!this.partida) return;
        const partida = this.partida;
        const jugador = partida.jugador_actual();
        const yaRobo = partida.ya_robo_en_turno;
        const puedeRobar = partida.puede_robar(jugador);

        this.botonRobar.activo = !yaRobo && puedeRobar && !partida.terminada && this.fichaInicialColocada;
        this.botonPasar.activo = yaRobo && !partida.terminada;
        this.botonReiniciar.activo = true;
        this.botonAyuda.activo = true;
        this.botonLupa.activo = true;
    }

    // -------------------------------------------------
    // Offset del tablero
    // -------------------------------------------------
    calcularOffsetTablero() {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (const casilla of this.partida.tablero.casillas) {
            if (casilla.x < minX) minX = casilla.x;
            if (casilla.x + LARGO_FICHA > maxX) maxX = casilla.x + LARGO_FICHA;
            if (casilla.y < minY) minY = casilla.y;
            if (casilla.y + ANCHO_FICHA > maxY) maxY = casilla.y + ANCHO_FICHA;
        }

        const centroX = (minX + maxX) / 2;
        const centroY = (minY + maxY) / 2;

        const offsetX = Math.floor(this.anchoPantalla / 2) - Math.floor(centroX * this.escala);
        const offsetY = Math.floor(this.altoPantalla / 2) - Math.floor(centroY * this.escala);

        const mediaFicha = Math.floor((ANCHO_FICHA / 2) * this.escala);
        this.offsetTableroX = offsetX + mediaFicha;
        this.offsetTableroY = offsetY;
    }

    // -------------------------------------------------
    // Posiciones de fichas en la mano
    // -------------------------------------------------
    actualizarPosicionesFichas() {
        if (!this.partida) return;

        this.posicionesFichas = { jugador1: [], jugador2: [] };

        const margen = Math.floor(30 * this.escala);
        const yInicial = Math.floor(80 * this.escala);
        const maxPorColumna = 11;
        const separacion = Math.floor(8 * this.escala);
        const separacionColumnas = Math.floor(15 * this.escala);

        const espacioFijoAlto = this.anchoFicha + separacion;
        const espacioFijoAncho = this.largoFicha + separacion + separacionColumnas;

        const calcularPosicion = (ficha, i, xBase, direccion) => {
            if (ficha === this.fichaArrastrada) return null;

            let ancho, alto;
            if (ficha.orientacion === "horizontal") {
                ancho = this.largoFicha;
                alto = this.anchoFicha;
            } else {
                ancho = this.anchoFicha;
                alto = this.largoFicha;
            }

            const fila = i % maxPorColumna;
            const columna = Math.floor(i / maxPorColumna);

            let x;
            if (direccion === "izquierda") {
                x = xBase + columna * espacioFijoAncho;
            } else {
                x = xBase - columna * espacioFijoAncho;
            }

            let y = yInicial + fila * espacioFijoAlto;

            if (ficha.orientacion === "vertical") {
                x = x + Math.floor((this.largoFicha - this.anchoFicha) / 2);
            }

            return { ficha, x, y, ancho, alto };
        };

        for (let i = 0; i < this.partida.jugadores[0].fichas.length; i++) {
            const pos = calcularPosicion(this.partida.jugadores[0].fichas[i], i, margen, "izquierda");
            if (pos) this.posicionesFichas.jugador1.push(pos);
        }

        const xDerecha = this.anchoPantalla - margen - this.largoFicha;
        for (let i = 0; i < this.partida.jugadores[1].fichas.length; i++) {
            const pos = calcularPosicion(this.partida.jugadores[1].fichas[i], i, xDerecha, "derecha");
            if (pos) this.posicionesFichas.jugador2.push(pos);
        }
    }
}