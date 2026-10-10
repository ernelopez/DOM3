// dibujo.js
import { Juego, COLOR_FONDO, COLOR_TEXTO, COLOR_TITULO,
         COLOR_JUGADOR1, COLOR_JUGADOR2,
         COLOR_CASILLA_VACIA, COLOR_CASILLA_DESTACADA,
         COLOR_TEXTO_BOTON } from './juego.js';
import { LARGO_FICHA, ANCHO_FICHA } from './config.js';

// -------------------------------------------------
// Utilidades de texto (reemplazo de pygame.font)
// -------------------------------------------------
function medirTexto(ctx, texto, fuente) {
    ctx.font = fuente;
    return ctx.measureText(texto).width;
}

function dibujarTexto(ctx, texto, x, y, fuente, color, centrado = false) {
    ctx.font = fuente;
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';

    // Calcular el alto real del texto
    const metricas = ctx.measureText(texto);
    const alto = metricas.actualBoundingBoxAscent + metricas.actualBoundingBoxDescent;
    const offsetY = metricas.actualBoundingBoxAscent - alto / 2;

    // Ajustar Y para que el centro del texto coincida con y
    const yAjustado = y + offsetY;

    if (centrado) {
        const ancho = ctx.measureText(texto).width;
        ctx.fillText(texto, x - ancho / 2, yAjustado);
    } else {
        ctx.fillText(texto, x, yAjustado);
    }
}

// -------------------------------------------------
// dibujar_input_nombres
// -------------------------------------------------
Juego.prototype.dibujarInputNombres = function() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    const centroX = Math.floor(this.anchoPantalla / 2);
    const centroY = Math.floor(this.altoPantalla / 2);

    const fuenteTitulo = `${this.tamanoFuenteGrande}px Junegull`;
    const fuenteInput = `${Math.floor(32 * this.escala)}px Junegull`;
    const fuenteNormal = `${this.tamanoFuente}px Junegull`;

    // Título
    dibujarTexto(ctx, "Dominó de fracciones y decimales", centroX, centroY - 450, fuenteTitulo, COLOR_TITULO, true);

    // Subtítulo
    dibujarTexto(ctx, "Ingresá los nombres de los jugadores", centroX, centroY - 300, fuenteInput, '#ffffff', true);

    // Etiquetas
    dibujarTexto(ctx, "Jugador 1:", centroX - 350, centroY - 170, fuenteInput, COLOR_JUGADOR1);
    dibujarTexto(ctx, "Jugador 2:", centroX - 350, centroY - 75, fuenteInput, COLOR_JUGADOR2);

    // Cajas de input
    const rectJ1 = { x: centroX - 80, y: centroY - 210, w: 350, h: 80 };
    const rectJ2 = { x: centroX - 80, y: centroY - 115, w: 350, h: 80 };

    // Caja J1
    ctx.strokeStyle = (this.ingresandoNombre === 1) ? '#c8c8c8' : '#505050';
    ctx.lineWidth = (this.ingresandoNombre === 1) ? 3 : 2;
    ctx.strokeRect(rectJ1.x, rectJ1.y, rectJ1.w, rectJ1.h);
    dibujarTexto(ctx, this.nombreJugador1, rectJ1.x + 15, rectJ1.y + 40, fuenteInput, COLOR_JUGADOR1);

    // Caja J2
    ctx.strokeStyle = (this.ingresandoNombre === 2) ? '#c8c8c8' : '#505050';
    ctx.lineWidth = (this.ingresandoNombre === 2) ? 3 : 2;
    ctx.strokeRect(rectJ2.x, rectJ2.y, rectJ2.w, rectJ2.h);
    dibujarTexto(ctx, this.nombreJugador2, rectJ2.x + 15, rectJ2.y + 40, fuenteInput, COLOR_JUGADOR2);

    // Cursor parpadeante
    const ahora = Date.now();
    if (ahora - this.ultimoParpadeo > 500) {
        this.mostrarCursor = !this.mostrarCursor;
        this.ultimoParpadeo = ahora;
    }

    if (this.mostrarCursor) {
        if (this.ingresandoNombre === 1) {
            const anchoTexto = medirTexto(ctx, this.nombreJugador1, fuenteInput);
            ctx.strokeStyle = COLOR_JUGADOR1;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(rectJ1.x + 15 + anchoTexto + 2, rectJ1.y + 15);
            ctx.lineTo(rectJ1.x + 15 + anchoTexto + 2, rectJ1.y + 65);
            ctx.stroke();
        } else if (this.ingresandoNombre === 2) {
            const anchoTexto = medirTexto(ctx, this.nombreJugador2, fuenteInput);
            ctx.strokeStyle = COLOR_JUGADOR2;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(rectJ2.x + 15 + anchoTexto + 2, rectJ2.y + 15);
            ctx.lineTo(rectJ2.x + 15 + anchoTexto + 2, rectJ2.y + 65);
            ctx.stroke();
        }
    }

    // Instrucciones
    dibujarTexto(ctx, "Hacé clic en una caja para editarla. Presioná ENTER para comenzar.",
                 centroX, centroY + 30, fuenteInput, '#c8c8c8', true);

    // Logo BAA
    if (this.imgBaa) {
        const escalaBaa = 0.5 * this.escala;
        const anchoBaa = Math.floor(this.imgBaa.width * escalaBaa);
        const altoBaa = Math.floor(this.imgBaa.height * escalaBaa);
        const yImagenes = this.altoPantalla - Math.floor(400 * this.escala);
        ctx.drawImage(this.imgBaa, centroX - anchoBaa / 2, yImagenes + altoBaa + 10, anchoBaa, altoBaa);
    }
};

// -------------------------------------------------
// dibujar_valores_ficha (el texto de cada lado)
// -------------------------------------------------
Juego.prototype.dibujarValoresFicha = function(ficha, x, y, ancho, alto, factor = 1.0) {
    const ctx = this.ctx;

    // Fondo semitransparente
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillRect(x, y, ancho, alto);

    // Línea central
    const espacioBorde = Math.floor(5 * factor);
    const grosorLinea = Math.max(1, Math.floor(2 * factor));
    ctx.strokeStyle = '#505050';
    ctx.lineWidth = grosorLinea;
    ctx.beginPath();
    if (ficha.orientacion === 'horizontal') {
        ctx.moveTo(x + ancho / 2, y + espacioBorde);
        ctx.lineTo(x + ancho / 2, y + alto - espacioBorde);
    } else {
        ctx.moveTo(x + espacioBorde, y + alto / 2);
        ctx.lineTo(x + ancho - espacioBorde, y + alto / 2);
    }
    ctx.stroke();

    const tamanoFuenteBase = Math.max(8, Math.floor(this.tamanoFuenteFraccion * factor));

    // -------------------------------------------------
    // Dibuja un lado de la ficha:
    //   - "0,50"        → número solo
    //   - "50\n100"     → fracción simple
    //   - "3|1\n2"      → fracción mixta (entero + num/den)
    // -------------------------------------------------
    const dibujarFraccion = (texto, xCentro, yCentro) => {
        let entero = null, num = null, den = null;

        if (texto.includes('|')) {
            // Mixta: "3|1\n2"
            const [enteroStr, resto] = texto.split('|');
            entero = enteroStr;
            [num, den] = resto.split('\n');
        } else if (texto.includes('\n')) {
            // Fracción simple: "50\n100"
            [num, den] = texto.split('\n');
        } else {
            // Número solo: "0,50"
            num = texto;
        }

        // -------------------------------------------------
        // Calcular tamaño de fuente adecuado
        // -------------------------------------------------
        let fuente = `${tamanoFuenteBase}px Junegull`;
        ctx.font = fuente;

        const anchoEnt = entero ? ctx.measureText(entero).width : 0;
        const anchoNum = num ? ctx.measureText(num).width : 0;
        const anchoDen = den ? ctx.measureText(den).width : 0;
        const anchoMax = Math.max(anchoNum, anchoDen);

        const anchoDisponible = (ficha.orientacion === 'horizontal')
            ? (ancho / 2) - 10
            : ancho - 10;

        const anchoTotal = anchoEnt + anchoMax;
        let tamanoFuente = tamanoFuenteBase;

        if (anchoTotal > anchoDisponible && anchoTotal > 0) {
            const factorAjuste = anchoDisponible / anchoTotal;
            tamanoFuente = Math.max(8, Math.floor(tamanoFuenteBase * factorAjuste));
            fuente = `${tamanoFuente}px Junegull`;
            ctx.font = fuente;
        }

        // Recalcular anchos con la fuente final
        const anchoEntFinal = entero ? ctx.measureText(entero).width : 0;
        const anchoNumFinal = num ? ctx.measureText(num).width : 0;
        const anchoDenFinal = den ? ctx.measureText(den).width : 0;
        const anchoMaxFinal = Math.max(anchoNumFinal, anchoDenFinal);

        // -------------------------------------------------
        // Caso 1: número simple (sin denominador)
        // -------------------------------------------------
        if (den === null) {
            dibujarTexto(ctx, num, xCentro, yCentro, fuente, '#000000', true);
            return;
        }

        const altoTexto = tamanoFuente;
        const sepLineas = 0;
        const anchoLinea = anchoMaxFinal;
        const altoLinea = Math.max(1, Math.floor(2));

        const altoTotal = altoTexto * 2 + altoLinea + sepLineas * 2;
        const yInicio = yCentro - altoTotal / 2;

        // -------------------------------------------------
        // Caso 2: fracción simple (sin entero)
        // -------------------------------------------------
        if (entero === null) {
            // Numerador
            dibujarTexto(ctx, num, xCentro, yInicio + altoTexto / 2, fuente, '#000000', true);

            // Línea central
            const yLinea = yInicio + altoTexto + sepLineas;
            ctx.fillStyle = '#000000';
            ctx.fillRect(xCentro - anchoLinea / 2, yLinea, anchoLinea, altoLinea);

            // Denominador
            const yDen = yLinea + altoLinea + sepLineas + altoTexto / 2;
            dibujarTexto(ctx, den, xCentro, yDen, fuente, '#000000', true);
            return;
        }

        // -------------------------------------------------
        // Caso 3: fracción mixta (entero + num/den)
        // -------------------------------------------------
        const separacionEntero = Math.floor(8 * (tamanoFuente / tamanoFuenteBase));
        const anchoBloque = anchoEntFinal + separacionEntero + anchoMaxFinal;
        const xInicioBloque = xCentro - anchoBloque / 2;

        // Entero (alineado a la izquierda del bloque, centrado vertical)
        dibujarTexto(ctx, entero, xInicioBloque, yCentro, fuente, '#000000', false);

        // Centro X de la fracción
        const xCentroFrac = xInicioBloque + anchoEntFinal + separacionEntero + anchoMaxFinal / 2;

        // Numerador
        dibujarTexto(ctx, num, xCentroFrac, yInicio + altoTexto / 2, fuente, '#000000', true);

        // Línea central
        const yLinea = yInicio + altoTexto + sepLineas;
        ctx.fillStyle = '#000000';
        ctx.fillRect(xCentroFrac - anchoLinea / 2, yLinea, anchoLinea, altoLinea);

        // Denominador
        const yDen = yLinea + altoLinea + sepLineas + altoTexto / 2;
        dibujarTexto(ctx, den, xCentroFrac, yDen, fuente, '#000000', true);
    };

    if (ficha.orientacion === 'horizontal') {
        dibujarFraccion(ficha.textos['O'], x + ancho / 4, y + alto / 2);
        dibujarFraccion(ficha.textos['E'], x + 3 * ancho / 4, y + alto / 2);
    } else {
        dibujarFraccion(ficha.textos['N'], x + ancho / 2, y + alto / 4);
        dibujarFraccion(ficha.textos['S'], x + ancho / 2, y + 3 * alto / 4);
    }
};

// -------------------------------------------------
// dibujar_ficha_tablero
// -------------------------------------------------
Juego.prototype.dibujarFichaTablero = function(ficha, x, y, ancho, alto, resaltada = false) {
    const ctx = this.ctx;
    const img = (ficha.orientacion === 'vertical') ? this.imgFrenteV : this.imgFrente;

    if (img) {
        ctx.drawImage(img, x, y, ancho, alto);
    } else {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x, y, ancho, alto);
    }

    if (resaltada) {
        ctx.strokeStyle = '#32ff32';
        ctx.lineWidth = Math.max(2, Math.floor(4 * this.escala));
        ctx.strokeRect(x, y, ancho, alto);
    }

    this.dibujarValoresFicha(ficha, x, y, ancho, alto);
};

// -------------------------------------------------
// dibujar_ficha_dorso
// -------------------------------------------------
Juego.prototype.dibujarFichaDorso = function(x, y, ancho, alto, orientacion = 'horizontal') {
    const ctx = this.ctx;
    const img = (orientacion === 'vertical') ? this.imgDorsoV : this.imgDorso;

    if (img) {
        ctx.drawImage(img, x, y, ancho, alto);
    } else {
        ctx.fillStyle = '#646464';
        ctx.fillRect(x, y, ancho, alto);
        ctx.strokeStyle = '#323232';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, ancho, alto);
    }
};

// -------------------------------------------------
// dibujar_ficha_mano
// -------------------------------------------------
Juego.prototype.dibujarFichaMano = function(ficha, x, y, seleccionada, jugador, esTurno) {
    let mostrarFrente = false;

    if (!this.fichaInicialColocada) {
        if (jugador === this.jugadorInicial && ficha === this.fichaInicial) {
            mostrarFrente = true;
        }
    } else {
        if (esTurno) mostrarFrente = true;
    }

    let ancho, alto, dx = 0, dy = 0;
    if (ficha.orientacion === 'horizontal') {
        ancho = this.largoFicha;
        alto = this.anchoFicha;
    } else {
        ancho = this.anchoFicha;
        alto = this.largoFicha;
        dy = Math.floor((this.anchoFicha - this.largoFicha) / 2);
    }

    const ctx = this.ctx;

    if (mostrarFrente) {
        const img = (ficha.orientacion === 'vertical') ? this.imgFrenteV : this.imgFrente;
        if (img) ctx.drawImage(img, x + dx, y + dy, ancho, alto);
        if (seleccionada) {
            ctx.strokeStyle = '#64c8ff';
            ctx.lineWidth = Math.max(2, Math.floor(4 * this.escala));
            ctx.strokeRect(x + dx, y + dy, ancho, alto);
        }
        this.dibujarValoresFicha(ficha, x + dx, y + dy, ancho, alto);
    } else {
        const img = (ficha.orientacion === 'vertical') ? this.imgDorsoV : this.imgDorso;
        if (img) ctx.drawImage(img, x, y, ancho, alto);
    }
};

// -------------------------------------------------
// dibujar_ficha_arrastrada
// -------------------------------------------------
Juego.prototype.dibujarFichaArrastrada = function(ficha, x, y) {
    const factor = 2;
    let ancho, alto, dx = 0, dy = 0;

    if (ficha.orientacion === 'horizontal') {
        ancho = this.largoFicha * factor;
        alto = this.anchoFicha * factor;
    } else {
        ancho = this.anchoFicha * factor;
        alto = this.largoFicha * factor;
        dx = Math.floor((this.largoFicha - this.anchoFicha) / 2) * factor;
        dy = Math.floor((this.anchoFicha - this.largoFicha) / 2) * factor;
    }

    const img = (ficha.orientacion === 'vertical') ? this.imgFrenteVOriginal : this.imgFrenteOriginal;
    if (img) this.ctx.drawImage(img, x + dx, y + dy, ancho, alto);
    this.dibujarValoresFicha(ficha, x + dx, y + dy, ancho, alto, factor);
};

// -------------------------------------------------
// dibujar_pozo
// -------------------------------------------------
Juego.prototype.dibujarPozo = function() {
    const fichasPozo = this.partida.pozo.fichas;
    if (fichasPozo.length === 0) return;

    const centroX =     Math.floor(this.anchoPantalla / 2);
    const centroY = Math.floor(this.altoPantalla / 2);

    const porFila = 6;
    const separacion = Math.floor(5 * this.escala);
    const ancho = this.anchoFicha;
    const alto = this.largoFicha;

    const totalAncho = porFila * (ancho + separacion);
    const totalAlto = (Math.floor(fichasPozo.length / porFila) + 1) * (alto + separacion);

    const inicioX = centroX - Math.floor(totalAncho / 2);
    const inicioY = centroY - Math.floor(totalAlto / 2);

    const maxMostrar = 30;
    const total = Math.min(fichasPozo.length, maxMostrar);

    for (let i = 0; i < total; i++) {
        const fila = Math.floor(i / porFila);
        const columna = i % porFila;
        const x = inicioX + columna * (ancho + separacion);
        const y = inicioY + fila * (alto + separacion);
        this.dibujarFichaDorso(x, y, ancho, alto, 'vertical');
    }

    const fuente = `${this.tamanoFuente}px Junegull`;
    dibujarTexto(this.ctx, `Pozo: ${fichasPozo.length} fichas`,
                 centroX, inicioY - Math.floor(30 * this.escala), fuente, '#c8c8c8', true);
};

// -------------------------------------------------
// dibujar_tablero
// -------------------------------------------------
Juego.prototype.dibujarTablero = function() {
    const ctx = this.ctx;

    for (const casilla of this.partida.tablero.casillas) {
        const x = Math.floor(casilla.x * this.escala) + this.offsetTableroX;
        const y = Math.floor(casilla.y * this.escala) + this.offsetTableroY;

        let ancho, alto;
        if (casilla.orientacion === 'horizontal') {
            ancho = this.largoFicha;
            alto = this.anchoFicha;
        } else {
            ancho = this.anchoFicha;
            alto = this.largoFicha;
        }

        if (casilla.ficha !== null) {
            const destacada = this.casillasDestacadas.includes(casilla);
            this.dibujarFichaTablero(casilla.ficha, x, y, ancho, alto, destacada);
        } else {
            if (this.casillasDestacadas.includes(casilla)) {
                ctx.fillStyle = COLOR_CASILLA_DESTACADA;
                ctx.fillRect(x, y, ancho, alto);
            } else {
                ctx.strokeStyle = COLOR_CASILLA_VACIA;
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, ancho, alto);
            }
        }
    }
};

// -------------------------------------------------
// dibujar_mensajes (título + turno/ganador)
// -------------------------------------------------
Juego.prototype.dibujarMensajes = function() {
    const centroX = Math.floor(this.anchoPantalla / 2);
    const fuenteTitulo2 = `${this.tamanoFuenteGrande}px Junegull`;
    //const fuenteTitulo2 = `${Math.floor(36 * this.escala)}px Junegull`;
    const yTitulo1 = Math.floor(130 * this.escala);
    const yTitulo2 = Math.floor(170 * this.escala);

    dibujarTexto(this.ctx, "Dominó de", centroX, yTitulo1, fuenteTitulo2, COLOR_TITULO, true);
    dibujarTexto(this.ctx, "fracciones y decimales", centroX, yTitulo2, fuenteTitulo2, COLOR_TITULO, true);

    let texto = "";
    let color = COLOR_TEXTO;

    // ¿Hay mensaje temporal?
    const hayMensaje = this.mensaje && (Date.now() - this.tiempoMensaje < 1500);
    if (!hayMensaje && this.mensaje) this.mensaje = "";

    if (hayMensaje) {
        texto = this.mensaje;
        color = this.mensajeColor;
    } else if (this.partida.terminada) {
        if (this.partida.ganador) {
            const esJ1 = this.partida.ganador === this.partida.jugadores[0];
            color = esJ1 ? COLOR_JUGADOR1 : COLOR_JUGADOR2;
            const nombre = esJ1 ? this.nombreJugador1 : this.nombreJugador2;
            texto = `¡${nombre} GANÓ!`;
        } else {
            texto = "EMPATE";
        }
    } else {
        const jugador = this.partida.jugador_actual();
        const esJ1 = jugador === this.partida.jugadores[0];
        color = esJ1 ? COLOR_JUGADOR1 : COLOR_JUGADOR2;
        const nombre = esJ1 ? this.nombreJugador1 : this.nombreJugador2;
        texto = `Turno: ${nombre}`;
    }

    const fuenteGrande = `${this.tamanoFuenteGrande}px Junegull`;
    const yTurno = Math.floor(150 * this.escala) + Math.floor(400 * this.escala);
    dibujarTexto(this.ctx, texto, centroX, yTurno, fuenteGrande, color, true);
};

// -------------------------------------------------
// dibujar_ayuda_cartel
// -------------------------------------------------
Juego.prototype.dibujarAyudaCartel = function() {
    if (!this.mostrarAyuda) return;
    const ctx = this.ctx;

    // Fondo oscuro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    const anchoCartel = Math.floor(950 * this.escala);
    const altoCartel = Math.floor(600 * this.escala);
    const xCartel = Math.floor((this.anchoPantalla - anchoCartel) / 2);
    const yCartel = Math.floor((this.altoPantalla - altoCartel) / 2);

    // Cartel
    ctx.fillStyle = '#323232';
    ctx.fillRect(xCartel, yCartel, anchoCartel, altoCartel);
    ctx.strokeStyle = '#969696';
    ctx.lineWidth = 2;
    ctx.strokeRect(xCartel, yCartel, anchoCartel, altoCartel);

    // Título
    const fuenteTitulo = `${this.tamanoFuenteGrande}px Junegull`;
    dibujarTexto(ctx, "Instrucciones", this.anchoPantalla / 2,
                 yCartel + Math.floor(30 * this.escala), fuenteTitulo, '#ffffff', true);

    // Línea
    ctx.strokeStyle = '#969696';
    ctx.beginPath();
    ctx.moveTo(xCartel + 20, yCartel + 60);
    ctx.lineTo(xCartel + anchoCartel - 20, yCartel + 60);
    ctx.stroke();

    // Instrucciones
    const fuenteInstrucciones = `${Math.floor(22 * this.escala)}px Junegull`;
    const instrucciones = [
        "1. Cada jugador recibe 6 fichas. Comienza el jugador que tenga la mayor ficha con dos",
        "expresiones equivalentes.",
        "",
        "2. En su turno, cada jugador debe colocar una ficha que tenga un número equivalente al",
        "que aparece en alguno de los extremos de la cadena. Podés girar una ficha haciendo clic",
        "sobre ella o con la tecla G.",
        "",
        "3. Si no podés ubicar ninguna ficha, debés robar una ficha del pozo (botón celeste). Si la",
        "ficha robada sirve, podés colocarla. Si no sirve, tenés que pasar el turno (botón verde).",
        "",
        "4. Final del juego: gana el jugador que se quede sin fichas primero. Si un jugador no puede",
        "colocar y el pozo está vacío, pierde.",
        "",
        "¡Atención! Si jugás una ficha que no encaja, perdés tu turno."
    ];

    let yTexto = yCartel + Math.floor(85 * this.escala);
    for (const linea of instrucciones) {
        dibujarTexto(ctx, linea, xCartel + 25, yTexto, fuenteInstrucciones, '#dcdcdc');
        yTexto += Math.floor(25 * this.escala);
    }

    // Créditos
    yTexto += Math.floor(15 * this.escala);
    ctx.strokeStyle = '#646464';
    ctx.beginPath();
    ctx.moveTo(xCartel + 20, yTexto);
    ctx.lineTo(xCartel + anchoCartel - 20, yTexto);
    ctx.stroke();
    yTexto += Math.floor(20 * this.escala);

    const fuenteCreditos = `${this.tamanoFuente}px Junegull`;
    const creditos = [
        "Territorio de Juegos - Escuelas en Foco Matemática",
        "Coordinación general: Gloria Rodríguez",
        "Diseño y desarrollo: Andrea Pallai y Ernesto López"
    ];
    for (const linea of creditos) {
        dibujarTexto(ctx, linea, this.anchoPantalla / 2, yTexto, fuenteCreditos, COLOR_TITULO, true);
        yTexto += Math.floor(28 * this.escala);
    }

    const fuenteCerrar = `${this.tamanoFuente}px Junegull`;
    dibujarTexto(ctx, "Presioná la tecla ENTER para cerrar",
                 this.anchoPantalla / 2,
                 yCartel + altoCartel - Math.floor(35 * this.escala),
                 fuenteCerrar, '#969696', true);
};

// -------------------------------------------------
// dibujar_confirmacion_reinicio (y salir)
// -------------------------------------------------
Juego.prototype.dibujarConfirmacionReinicio = function() {
    if (!this.mostrarConfirmacionReinicio && !this.mostrarConfirmacionSalir) return;
    const ctx = this.ctx;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    const anchoCartel = Math.floor(550 * this.escala);
    const altoCartel = Math.floor(180 * this.escala);
    const xCartel = Math.floor((this.anchoPantalla - anchoCartel) / 2);
    const yCartel = Math.floor((this.altoPantalla - altoCartel) / 2);

    ctx.fillStyle = '#323232';
    ctx.fillRect(xCartel, yCartel, anchoCartel, altoCartel);
    ctx.strokeStyle = '#969696';
    ctx.lineWidth = 2;
    ctx.strokeRect(xCartel, yCartel, anchoCartel, altoCartel);

    const fuenteGrande = `${this.tamanoFuenteGrande}px Junegull`;
    let texto;
    if (this.mostrarConfirmacionSalir) {
        texto = "¿Querés salir del juego?";
    } else {
        texto = this.mensajeConfirmacion;
    }

    dibujarTexto(ctx, texto, this.anchoPantalla / 2,
                 yCartel + Math.floor(60 * this.escala), fuenteGrande, '#ffffff', true);

    const fuenteNormal = `${this.tamanoFuente}px Junegull`;
    dibujarTexto(ctx, "Presioná S para Sí, N para No", this.anchoPantalla / 2,
                 yCartel + Math.floor(120 * this.escala), fuenteNormal, '#c8c8c8', true);
};

// -------------------------------------------------
// dibujar_etiquetas_jugadores
// -------------------------------------------------
Juego.prototype.dibujarEtiquetasJugadores = function() {
    const fuente = `${this.tamanoFuente}px Junegull`;
    dibujarTexto(this.ctx, this.nombreJugador1,
                 Math.floor(30 * this.escala), Math.floor(50 * this.escala),
                 fuente, COLOR_JUGADOR1);
    const anchoJ2 = medirTexto(this.ctx, this.nombreJugador2, fuente);
    dibujarTexto(this.ctx, this.nombreJugador2,
                 this.anchoPantalla - Math.floor(30 * this.escala) - anchoJ2,
                 Math.floor(50 * this.escala), fuente, COLOR_JUGADOR2);
};

// -------------------------------------------------
// dibujar_logo_baa
// -------------------------------------------------
Juego.prototype.dibujarLogoBaa = function() {
    if (!this.imgBaa) return;
    const escalaBaa = 0.25 * this.escala;
    const anchoBaa = Math.floor(this.imgBaa.width * escalaBaa);
    const altoBaa = Math.floor(this.imgBaa.height * escalaBaa);
    const x = Math.floor(20 * this.escala);
    const y = this.altoPantalla - altoBaa - Math.floor(30 * this.escala);
    this.ctx.drawImage(this.imgBaa, x, y, anchoBaa, altoBaa);
};

// -------------------------------------------------
// dibujar_botones
// -------------------------------------------------
Juego.prototype.dibujarBotones = function() {
    const ctx = this.ctx;

    for (const boton of this.botones) {
        if (boton.imagen) {
            ctx.drawImage(boton.imagen, boton.x, boton.y, boton.ancho, boton.alto);
        } else {
            const sobre = boton.estaSobre(this.mouseX, this.mouseY);
            ctx.fillStyle = (sobre && boton.activo) ? boton.colorHover : boton.color;
            ctx.fillRect(boton.x, boton.y, boton.ancho, boton.alto);
            ctx.strokeStyle = '#969696';
            ctx.lineWidth = 2;
            ctx.strokeRect(boton.x, boton.y, boton.ancho, boton.alto);
        }

        if (boton.texto) {
            const fuente = `${Math.floor(24 * this.escala)}px Junegull`;
            const colorTexto = boton.activo ? COLOR_TEXTO_BOTON : '#b4b4b4';
            dibujarTexto(ctx, boton.texto,
                         boton.x + boton.ancho / 2 - 2,
                         boton.y + boton.alto / 2 - 2,
                         fuente, colorTexto, true);
        }
    }
};

// -------------------------------------------------
// dibujar_fichas_lupa (agranda HEAD y TAIL)
// -------------------------------------------------
Juego.prototype.dibujarFichasLupa = function() {
    console.log('🔵 dibujarFichasLupa se ejecuta');

    const factor = 2.0;

    if (!this.partida.tablero.lista_fichas_jugadas ||
        this.partida.tablero.lista_fichas_jugadas.length === 0) {
        console.log('   ⚠️ No hay fichas jugadas');
        return;
    }

    const CANT_CASILLAS = this.partida.tablero.casillas.length;

    console.log('   CANT_CASILLAS:', CANT_CASILLAS);
    console.log('   head_posible.casilla.numero:', this.partida.tablero.head_posible.casilla.numero);
    console.log('   tail_posible.casilla.numero:', this.partida.tablero.tail_posible.casilla.numero);

    const numHead = (this.partida.tablero.head_posible.casilla.numero - 1 + CANT_CASILLAS) % CANT_CASILLAS;
    const numTail = (this.partida.tablero.tail_posible.casilla.numero + 1) % CANT_CASILLAS;

    console.log('   casilla HEAD (calculada):', numHead);
    console.log('   casilla TAIL (calculada):', numTail);

    const casillaHead = this.partida.tablero.casillas[numHead];
    const casillaTail = this.partida.tablero.casillas[numTail];

    console.log('   casillaHead.ficha:', casillaHead ? casillaHead.ficha : 'casilla null');
    console.log('   casillaTail.ficha:', casillaTail ? casillaTail.ficha : 'casilla null');

    for (const casilla of [casillaHead, casillaTail]) {
        if (!casilla || casilla.ficha === null) {
            console.log('   ⚠️ Saltando casilla (null o sin ficha)');
            continue;
        }

        console.log('   ✅ Dibujando ficha agrandada en casilla', casilla.numero);

        const ficha = casilla.ficha;

        let anchoBase, altoBase;
        if (casilla.orientacion === 'horizontal') {
            anchoBase = this.largoFicha;
            altoBase = this.anchoFicha;
        } else {
            anchoBase = this.anchoFicha;
            altoBase = this.largoFicha;
        }

        const ancho = anchoBase * factor;
        const alto = altoBase * factor;

        const xBase = Math.floor(casilla.x * this.escala) + this.offsetTableroX;
        const yBase = Math.floor(casilla.y * this.escala) + this.offsetTableroY;

        const x = xBase + (anchoBase - ancho) / 2;
        const y = yBase + (altoBase - alto) / 2;

        const img = (casilla.orientacion === 'vertical')
            ? this.imgFrenteVOriginal
            : this.imgFrenteOriginal;
        if (img) {
            this.ctx.drawImage(img, x, y, ancho, alto);
        }

        this.ctx.strokeStyle = '#ffc832';
        this.ctx.lineWidth = Math.max(2, Math.floor(4 * this.escala));
        this.ctx.strokeRect(x, y, ancho, alto);

        this.dibujarValoresFicha(ficha, x, y, ancho, alto, factor);
    }
};

// -------------------------------------------------
// dibujar_juego (todo junto)
// -------------------------------------------------
Juego.prototype.dibujarJuego = function() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = COLOR_FONDO;
    ctx.fillRect(0, 0, this.anchoPantalla, this.altoPantalla);

    this.dibujarMensajes();
    this.dibujarPozo();
    this.dibujarTablero();
    this.dibujarLogoBaa();
    this.dibujarEtiquetasJugadores();

    // Fichas en la mano
    const jugadorActual = this.partida.jugador_actual();
    for (const [id, posiciones] of Object.entries(this.posicionesFichas)) {
        const jugador = (id === 'jugador1') ? this.partida.jugadores[0] : this.partida.jugadores[1];
        const esTurno = (jugadorActual === jugador);

        for (const pos of posiciones) {
            const esSeleccionada = pos.ficha === this.fichaSeleccionada && pos.ficha !== this.fichaArrastrada;
            this.dibujarFichaMano(pos.ficha, pos.x, pos.y, esSeleccionada, jugador, esTurno);
        }
    }

    // Botones
    this.dibujarBotones();

    // Carteles
    this.dibujarAyudaCartel();
    this.dibujarConfirmacionReinicio();

    // Ficha arrastrada (encima de todo)
    if (this.fichaArrastrada !== null) {
        this.dibujarFichaArrastrada(this.fichaArrastrada,
            this.mouseX - this.offsetX,
            this.mouseY - this.offsetY);
    }

    // Fichas agrandadas por la lupa (encima de todo)
    if (this.mostrarLupa) {
        console.log('🔵 mostrarLupa está activo');
        if (Date.now() - this.tiempoLupa >= 3000) {
            this.mostrarLupa = false;
        } else {
            this.dibujarFichasLupa();
        }
    }
};