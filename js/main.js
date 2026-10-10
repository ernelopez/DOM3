// main.js
import { Juego } from './juego.js';
import './dibujo.js';
import './interaccion.js';

async function iniciar() {
    const canvas = document.getElementById('canvas');
    const juego = new Juego(canvas);
    window.juego = juego;

    // --- Manejar el botón de pantalla completa ---
    document.getElementById('btn-pantalla-completa').addEventListener('click', () => {
        const contenedor = document.getElementById('contenedor');
        if (contenedor.requestFullscreen) {
            contenedor.requestFullscreen();
        } else if (contenedor.webkitRequestFullscreen) {
            contenedor.webkitRequestFullscreen();
        } else if (contenedor.msRequestFullscreen) {
            contenedor.msRequestFullscreen();
        }
        document.getElementById('mensaje-pantalla-completa').style.display = 'none';

        if (juego.nombresIngresados === false) {
            juego.iniciarMusica();
        }

        // Reajustar el canvas al entrar en pantalla completa
        setTimeout(() => ajustarCanvas(canvas, juego), 100);
    });

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            document.getElementById('mensaje-pantalla-completa').style.display = 'flex';
        }
        // Reajustar el canvas al salir de pantalla completa
        setTimeout(() => ajustarCanvas(canvas, juego), 100);
    });

    // --- Cargar recursos ---
    await juego.cargarRecursos();

    // --- Ajustar canvas y calcular todo ---
    ajustarCanvas(canvas, juego);
    window.addEventListener('resize', () => ajustarCanvas(canvas, juego));
    juego.crearBotones();

    // --- Bucle de input de nombres ---
    let enInput = true;

    // --- Eventos de teclado ---
    window.addEventListener('keydown', async (evento) => {
        if (enInput) {
            const continuar = juego.procesarTeclaInput(evento);
            if (!continuar) {
                juego.detenerMusica();
                return;
            }
            if (juego.nombresIngresados) {
                enInput = false;
                juego.detenerMusica();
            }
        } else {
            if (!juego.partida) return;
            const continuar = juego.procesarTeclaJuego(evento);
            if (!continuar) {
                if (!juego.nombresIngresados) {
                    enInput = true;
                } else {
                    juego.detenerMusica();
                }
            }
        }
    });

    // --- Eventos del mouse ---
    canvas.addEventListener('mousedown', (evento) => {
        if (evento.button !== 0) return;
        const [x, y] = juego.coordPantallaA_Juego(evento.clientX, evento.clientY);
        juego.mouseX = x;
        juego.mouseY = y;
        juego.mousePresionado = true;

        if (enInput) {
            juego.procesarClickInput(x, y);
        } else {
            juego.procesarClickJuego(x, y);
        }
    });

    canvas.addEventListener('mousemove', (evento) => {
        const [x, y] = juego.coordPantallaA_Juego(evento.clientX, evento.clientY);
        juego.mouseX = x;
        juego.mouseY = y;

        if (!enInput && juego.partida) {
            juego.procesarMotionJuego(x, y);
        }
    });

    canvas.addEventListener('mouseup', (evento) => {
        if (evento.button !== 0) return;
        const [x, y] = juego.coordPantallaA_Juego(evento.clientX, evento.clientY);
        juego.mouseX = x;
        juego.mouseY = y;
        juego.mousePresionado = false;

        if (!enInput && juego.partida) {
            juego.procesarSoltarFicha(x, y);
        }
    });

    // --- Bucle de render ---
    function bucle() {
        if (enInput) {
            juego.dibujarInputNombres();
        } else if (juego.partida) {
            juego.dibujarJuego();
        }
        requestAnimationFrame(bucle);
    }

    bucle();
}

// -------------------------------------------------
// Ajuste del canvas al tamaño de la pantalla
// -------------------------------------------------
function ajustarCanvas(canvas, juego) {
    const anchoCSS = window.innerWidth;
    const altoCSS = window.innerHeight;

    // Calcular el tamaño del canvas manteniendo la proporción 1200:750
    const ratioBase = 1200 / 750;
    const ratioVentana = anchoCSS / altoCSS;

    let anchoVisual, altoVisual;
    if (ratioVentana > ratioBase) {
        altoVisual = altoCSS;
        anchoVisual = Math.floor(altoCSS * ratioBase);
    } else {
        anchoVisual = anchoCSS;
        altoVisual = Math.floor(anchoCSS / ratioBase);
    }

    const dpr = window.devicePixelRatio || 1;

    const anchoInterno = Math.floor(anchoVisual * dpr);
    const altoInterno = Math.floor(altoVisual * dpr);

    canvas.width = anchoInterno;
    canvas.height = altoInterno;
    canvas.style.width = anchoVisual + 'px';
    canvas.style.height = altoVisual + 'px';

    // Actualizar el tamaño lógico del juego al tamaño real del canvas
    juego.anchoPantalla = anchoInterno;
    juego.altoPantalla = altoInterno;

    // Recalcular todo
    juego.recalcularTamanos();
    juego.crearBotones();
    // juego.calcularOffsetTablero();
    // juego.actualizarPosicionesFichas();
        // Si ya hay partida, recalcular posiciones
    if (juego.partida) {
        juego.calcularOffsetTablero();
        juego.actualizarPosicionesFichas();
    }
}

// -------------------------------------------------
// Arrancar cuando el DOM esté listo
// -------------------------------------------------
window.addEventListener('load', () => {
    iniciar().catch(err => {
        console.error("Error al iniciar el juego:", err);
    });
});