// interaccion.js
import { Juego } from './juego.js';
import { LARGO_FICHA, ANCHO_FICHA, CANT_CASILLAS, ARCHIVO_CSV, FICHAS_POR_JUGADOR } from './config.js';

// -------------------------------------------------
// Conversión de coordenadas de pantalla a las del juego
// -------------------------------------------------
Juego.prototype.coordPantallaA_Juego = function(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (this.anchoPantalla / rect.width);
    const y = (clientY - rect.top) * (this.altoPantalla / rect.height);
    return [x, y];
};

// -------------------------------------------------
// Procesar clic en input de nombres
// -------------------------------------------------
Juego.prototype.procesarClickInput = function(x, y) {
    const centroX = Math.floor(this.anchoPantalla / 2);
    const centroY = Math.floor(this.altoPantalla / 2);

    const rectJ1 = { x: centroX - 80, y: centroY - 210, w: 350, h: 80 };
    const rectJ2 = { x: centroX - 80, y: centroY - 115, w: 350, h: 80 };

    if (x >= rectJ1.x && x <= rectJ1.x + rectJ1.w &&
        y >= rectJ1.y && y <= rectJ1.y + rectJ1.h) {
        this.ingresandoNombre = 1;
        this.nombreJugador1 = "";
    } else if (x >= rectJ2.x && x <= rectJ2.x + rectJ2.w &&
               y >= rectJ2.y && y <= rectJ2.y + rectJ2.h) {
        this.ingresandoNombre = 2;
        this.nombreJugador2 = "";
    } else {
        this.ingresandoNombre = 0;
    }
};

// -------------------------------------------------
// Procesar tecla en input de nombres
// -------------------------------------------------
Juego.prototype.procesarTeclaInput = function(evento) {
    if (this.mostrarConfirmacionSalir) {
        if (evento.key === 's' || evento.key === 'S') {
            return false;
        } else if (evento.key === 'n' || evento.key === 'N') {
            this.mostrarConfirmacionSalir = false;
        }
        return true;
    }

    if (evento.key === 'Enter') {
        if (this.nombreJugador1.trim().length > 0 && this.nombreJugador2.trim().length > 0) {
            this.detenerMusica();
            this.nombresIngresados = true;
            this.crearPartidaConNombres();
        }
    } else if (evento.key === 'Backspace') {
        if (this.ingresandoNombre === 1) {
            this.nombreJugador1 = this.nombreJugador1.slice(0, -1);
        } else if (this.ingresandoNombre === 2) {
            this.nombreJugador2 = this.nombreJugador2.slice(0, -1);
        }
    } else if (evento.key === 'Escape') {
        this.mostrarConfirmacionSalir = true;
    } else if (evento.key.length === 1) {
        if (this.ingresandoNombre === 1) {
            this.nombreJugador1 += evento.key;
        } else if (this.ingresandoNombre === 2) {
            this.nombreJugador2 += evento.key;
        }
    }

    return true;
};

// -------------------------------------------------
// Procesar clic en el juego (mouse down)
// -------------------------------------------------
Juego.prototype.procesarClickJuego = function(x, y) {
    // Si hay carteles abiertos, no procesar clics en botones
    if (this.mostrarAyuda || this.mostrarConfirmacionReinicio || this.mostrarConfirmacionSalir) {
        return;
    }

    // Botones
    for (const boton of this.botones) {
        if (boton.click(x, y)) {
            if (boton === this.botonRobar) {
                this.ejecutarRobar();
            } else if (boton === this.botonPasar) {
                this.ejecutarPasar();
            } else if (boton === this.botonReiniciar) {
                this.mostrarConfirmacionReinicio = true;
                this.mensajeConfirmacion = "¿Reiniciar partida?";
            } else if (boton === this.botonAyuda) {
                this.mostrarAyuda = !this.mostrarAyuda;
            } else if (boton === this.botonLupa) {
                console.log('🔵 Clic en botón LUPA');
                this.mostrarLupa = true;
                this.tiempoLupa = Date.now();
                this.reproducirSonido(this.sonidoClic);
            }
            return;
        }
    }

    // Seleccionar ficha
    const [ficha, jugador] = this.obtenerFichaEnPosicion(x, y);

    if (ficha !== null &&
        jugador === this.partida.jugador_actual() &&
        !this.partida.terminada) {

        if (!this.fichaInicialColocada && jugador === this.jugadorInicial) {
            if (ficha === this.fichaInicial) {
                this.fichaClickeada = ficha;
                this.posClickX = x;
                this.posClickY = y;
                this.fichaArrastrada = null;
                this.fichaSeleccionada = ficha;
            }
        } else {
            this.fichaClickeada = ficha;
            this.posClickX = x;
            this.posClickY = y;
            this.fichaArrastrada = null;
            this.fichaSeleccionada = ficha;
        }
    }
};

// -------------------------------------------------
// Procesar movimiento del mouse
// -------------------------------------------------
Juego.prototype.procesarMotionJuego = function(x, y) {
    if (this.fichaClickeada !== null && !this.partida.terminada) {
        const dx = x - this.posClickX;
        const dy = y - this.posClickY;

        if (dx * dx + dy * dy > 100) {
            this.fichaArrastrada = this.fichaClickeada;
            this.fichaClickeada = null;

            for (const pos of this.posicionesFichas.jugador1.concat(this.posicionesFichas.jugador2)) {
                if (pos.ficha === this.fichaArrastrada) {
                    this.offsetX = this.posClickX - pos.x;
                    this.offsetY = this.posClickY - pos.y;
                    break;
                }
            }

            this.actualizarPosicionesFichas();
            this.actualizarCasillasDestacadas(this.fichaArrastrada, this.partida.jugador_actual());
        }
    }

    if (this.fichaArrastrada !== null && !this.partida.terminada) {
        this.actualizarCasillasDestacadas(this.fichaArrastrada, this.partida.jugador_actual());
    }
};

// -------------------------------------------------
// Procesar soltar el mouse (colocar ficha)
// -------------------------------------------------
Juego.prototype.procesarSoltarFicha = function(x, y) {
    if (this.fichaClickeada !== null && !this.partida.terminada) {
        this.fichaClickeada.girar_90();
        this.reproducirSonido(this.sonidoGirar);
        this.offsetX = 0;
        this.offsetY = 0;
        this.actualizarPosicionesFichas();
        this.actualizarBotones();
        this.fichaClickeada = null;
        this.fichaSeleccionada = null;
        return;
    }

    if (this.fichaArrastrada === null || this.partida.terminada) {
        return;
    }

    const casilla = this.obtenerCasillaEnPosicion(x, y);

    if (!casilla || casilla.ficha !== null) {
        this.limpiarEstadoArrastre();
        return;
    }

    if (this.partida.tablero.primera_jugada) {
        this.colocarPrimeraFicha(casilla);
    } else {
        this.colocarFichaNormal(casilla);
    }

    this.limpiarEstadoArrastre();
};

// -------------------------------------------------
// Procesar tecla en el juego
// -------------------------------------------------
Juego.prototype.procesarTeclaJuego = function(evento) {
    if (this.mostrarAyuda) {
        this.mostrarAyuda = false;
        return true;
    }

    if (evento.key === 'Escape') {
        if (this.mostrarConfirmacionReinicio) {
            this.mostrarConfirmacionReinicio = false;
            this.mensajeConfirmacion = "";
        } else if (this.mostrarConfirmacionSalir) {
            // no hacer nada
        } else {
            this.mostrarConfirmacionSalir = true;
        }
        return true;
    }

    if (evento.key === 's' || evento.key === 'S') {
        if (this.mostrarConfirmacionReinicio) {
            this.reiniciarPartida();
            this.mostrarConfirmacionReinicio = false;
            this.mensajeConfirmacion = "";
            this.nombresIngresados = false;
            return false;
        } else if (this.mostrarConfirmacionSalir) {
            return false;
        }
    }

    if (evento.key === 'n' || evento.key === 'N') {
        if (this.mostrarConfirmacionReinicio) {
            this.mostrarConfirmacionReinicio = false;
            this.mensajeConfirmacion = "";
        } else if (this.mostrarConfirmacionSalir) {
            this.mostrarConfirmacionSalir = false;
        }
        return true;
    }

    if (evento.key === 'g' || evento.key === 'G') {
        if (this.fichaSeleccionada !== null && !this.partida.terminada) {
            this.fichaSeleccionada.girar_90();
            this.reproducirSonido(this.sonidoGirar);
            this.actualizarPosicionesFichas();
            this.actualizarBotones();
        }
    }

    return true;
};

// -------------------------------------------------
// Buscar ficha en posición
// -------------------------------------------------
Juego.prototype.obtenerFichaEnPosicion = function(x, y) {
    const partida = this.partida;
    const jugadorActual = partida.jugador_actual();

    if (partida.ya_robo_en_turno && this.fichaRobadaActual !== null) {
        for (const pos of this.posicionesFichas.jugador1.concat(this.posicionesFichas.jugador2)) {
            if (pos.ficha === this.fichaRobadaActual &&
                x >= pos.x && x <= pos.x + pos.ancho &&
                y >= pos.y && y <= pos.y + pos.alto) {
                return [this.fichaRobadaActual, jugadorActual];
            }
        }
        return [null, null];
    }

    for (const pos of this.posicionesFichas.jugador1) {
        if (x >= pos.x && x <= pos.x + pos.ancho &&
            y >= pos.y && y <= pos.y + pos.alto) {
            return [pos.ficha, partida.jugadores[0]];
        }
    }

    for (const pos of this.posicionesFichas.jugador2) {
        if (x >= pos.x && x <= pos.x + pos.ancho &&
            y >= pos.y && y <= pos.y + pos.alto) {
            return [pos.ficha, partida.jugadores[1]];
        }
    }

    return [null, null];
};

// -------------------------------------------------
// Buscar casilla en posición
// -------------------------------------------------
Juego.prototype.obtenerCasillaEnPosicion = function(x, y) {
    const xAjustada = (x - this.offsetTableroX) / this.escala;
    const yAjustada = (y - this.offsetTableroY) / this.escala;

    for (const casilla of this.partida.tablero.casillas) {
        let ancho, alto;
        if (casilla.orientacion === 'horizontal') {
            ancho = LARGO_FICHA;
            alto = ANCHO_FICHA;
        } else {
            ancho = ANCHO_FICHA;
            alto = LARGO_FICHA;
        }

        if (xAjustada >= casilla.x && xAjustada <= casilla.x + ancho &&
            yAjustada >= casilla.y && yAjustada <= casilla.y + alto) {
            return casilla;
        }
    }

    return null;
};

// -------------------------------------------------
// Actualizar casillas destacadas (las que se iluminan)
// -------------------------------------------------
Juego.prototype.actualizarCasillasDestacadas = function(ficha, jugador) {
    this.casillasDestacadas = [];
    if (ficha === null) return;

    const casillaBajoMouse = this.obtenerCasillaEnPosicion(this.mouseX, this.mouseY);
    if (!casillaBajoMouse) return;
    if (casillaBajoMouse.ficha !== null) return;
    if (jugador !== this.partida.jugador_actual()) return;

    if (this.partida.tablero.primera_jugada) {
        if (casillaBajoMouse.orientacion === ficha.orientacion) {
            this.casillasDestacadas.push(casillaBajoMouse);
        }
    } else {
        const head = this.partida.tablero.head_posible.casilla;
        const tail = this.partida.tablero.tail_posible.casilla;

        if (casillaBajoMouse.numero === head.numero || casillaBajoMouse.numero === tail.numero) {
            if (casillaBajoMouse.orientacion === ficha.orientacion) {
                this.casillasDestacadas.push(casillaBajoMouse);
            }
        }
    }
};

// -------------------------------------------------
// Ejecutar robar
// -------------------------------------------------
Juego.prototype.ejecutarRobar = function() {
    if (!this.partida.ya_robo_en_turno &&
        !this.partida.terminada &&
        this.fichaInicialColocada) {

        const ficha = this.partida.robar_ficha();
        if (ficha) {
            this.reproducirSonido(this.sonidoClic);
            this.fichaRobadaActual = ficha;
            this.fichaSeleccionada = ficha;
            this.actualizarPosicionesFichas();
            this.actualizarBotones();
        }
    }
};

// -------------------------------------------------
// Ejecutar pasar
// -------------------------------------------------
Juego.prototype.ejecutarPasar = function() {
    if (this.partida.ya_robo_en_turno && !this.partida.terminada) {
        this.reproducirSonido(this.sonidoClic);
        this.partida.pasar_turno();
        this.fichaSeleccionada = null;
        this.fichaArrastrada = null;
        this.fichaRobadaActual = null;
        this.casillasDestacadas = [];
        this.actualizarPosicionesFichas();
        this.actualizarBotones();
        this.verificarYMostrarFinPartida();
    }
};

// -------------------------------------------------
// Colocar primera ficha
// -------------------------------------------------
Juego.prototype.colocarPrimeraFicha = function(casilla) {
    if (this.fichaArrastrada.orientacion !== casilla.orientacion) {
        return;
    }

    const exito = this.partida.jugar_ficha(this.fichaArrastrada, casilla);
    if (exito) {
        this.mostrarExitoColocacion();
    }
};

// -------------------------------------------------
// Colocar ficha normal
// -------------------------------------------------
Juego.prototype.colocarFichaNormal = function(casilla) {
    const head = this.partida.tablero.head_posible.casilla;
    const tail = this.partida.tablero.tail_posible.casilla;

    if (casilla.numero !== head.numero && casilla.numero !== tail.numero) {
        return;
    }

    if (this.fichaArrastrada.orientacion !== casilla.orientacion) {
        return;
    }

    const [posible, _] = this.partida.tablero.puede_colocar(this.fichaArrastrada, casilla);

    if (!posible) {
        this.mostrarMensajeVisible("La ficha no encaja");
        this.reproducirSonido(this.sonidoError);

        if (this.cambioReglaError) {
            this.partida.cambiar_turno();
            this.fichaSeleccionada = null;
            this.fichaArrastrada = null;
            this.fichaRobadaActual = null;
            this.casillasDestacadas = [];
            this.actualizarPosicionesFichas();
            this.actualizarBotones();
            this.verificarYMostrarFinPartida();
        }
        return;
    }

    const exito = this.partida.jugar_ficha(this.fichaArrastrada, casilla);
    if (exito) {
        this.mostrarExitoColocacion();
    }
};

// -------------------------------------------------
// Mostrar éxito de colocación
// -------------------------------------------------
Juego.prototype.mostrarExitoColocacion = function() {
    this.reproducirSonido(this.sonidoCoin);

    if (this.fichaArrastrada === this.fichaInicial && !this.fichaInicialColocada) {
        this.fichaInicialColocada = true;
    }

    this.fichaRobadaActual = null;
    this.actualizarPosicionesFichas();
    this.actualizarBotones();
    this.verificarYMostrarFinPartida();
};

// -------------------------------------------------
// Limpiar estado de arrastre
// -------------------------------------------------
Juego.prototype.limpiarEstadoArrastre = function() {
    this.fichaArrastrada = null;
    this.fichaSeleccionada = null;
    this.casillasDestacadas = [];
    this.actualizarPosicionesFichas();
    this.actualizarBotones();
    this.fichaClickeada = null;
};

// -------------------------------------------------
// Verificar y mostrar fin de partida
// -------------------------------------------------
Juego.prototype.verificarYMostrarFinPartida = function() {
    if (this.partida.terminada) {
        if (this.partida.ganador) {
            this.reproducirSonido(this.sonidoWin);
        }
        this.actualizarBotones();
        return true;
    }

    this.partida.verificar_fin_partida();
    if (this.partida.terminada) {
        if (this.partida.ganador) {
            this.reproducirSonido(this.sonidoWin);
        }
        this.actualizarBotones();
        return true;
    }

    return false;
};

// -------------------------------------------------
// Mostrar mensaje visible (con tiempo)
// -------------------------------------------------
Juego.prototype.mostrarMensajeVisible = function(texto, color = null) {
    this.mensaje = texto;
    this.tiempoMensaje = Date.now();
    this.mensajeColor = color || '#ffffff';
};

// -------------------------------------------------
// Reproducir sonido (maneja autoplay)
// -------------------------------------------------
Juego.prototype.reproducirSonido = function(audio) {
    if (!audio) return;
    try {
        audio.currentTime = 0;
        audio.play().catch(() => { /* ignorar errores de autoplay */ });
    } catch (e) { /* ignorar */ }
};

Juego.prototype.detenerMusica = function() {
    if (this.musicaFondo) {
        this.musicaFondo.pause();
    }
};

Juego.prototype.iniciarMusica = function() {
    if (this.musicaFondo) {
        this.musicaFondo.play().catch(() => { /* ignorar */ });
    }
};

// -------------------------------------------------
// Crear partida con nombres
// -------------------------------------------------
Juego.prototype.crearPartidaConNombres = async function() {
    this.partida = new (await import('./partida.js')).Partida(FICHAS_POR_JUGADOR);
    await this.partida.pozo.cargar(ARCHIVO_CSV);
    this.partida.repartir_fichas();

    this.partida.jugadores[0].nombre = this.nombreJugador1;
    this.partida.jugadores[1].nombre = this.nombreJugador2;

    const [fichaInicial, jugadorInicial] = this.partida.determinar_ficha_inicial();
    this.fichaInicial = fichaInicial;
    this.jugadorInicial = jugadorInicial;
    this.fichaInicialColocada = false;

    this.partida.turno = this.partida.jugadores.indexOf(jugadorInicial);

    this.calcularOffsetTablero();
    this.actualizarPosicionesFichas();
    this.actualizarBotones();
};

// -------------------------------------------------
// Reiniciar partida
// -------------------------------------------------
Juego.prototype.reiniciarPartida = async function() {
    this.partida = new (await import('./partida.js')).Partida(FICHAS_POR_JUGADOR);
    await this.partida.pozo.cargar(ARCHIVO_CSV);
    this.partida.repartir_fichas();

    this.partida.jugadores[0].nombre = this.nombreJugador1;
    this.partida.jugadores[1].nombre = this.nombreJugador2;

    const [fichaInicial, jugadorInicial] = this.partida.determinar_ficha_inicial();
    this.fichaInicial = fichaInicial;
    this.jugadorInicial = jugadorInicial;
    this.fichaInicialColocada = false;

    this.partida.turno = this.partida.jugadores.indexOf(jugadorInicial);

    this.fichaSeleccionada = null;
    this.fichaArrastrada = null;
    this.fichaRobadaActual = null;
    this.fichaClickeada = null;
    this.casillasDestacadas = [];
    this.mensaje = "";
    this.tiempoMensaje = 0;
    this.offsetX = 0;
    this.offsetY = 0;

    this.calcularOffsetTablero();
    this.actualizarPosicionesFichas();
    this.actualizarBotones();
    this.iniciarMusica();
};