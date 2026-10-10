import { Casilla } from './casilla.js';
import { PosicionPosible } from './posicionPosible.js';
import {
    LARGO_FICHA,
    ANCHO_FICHA,
    MARGEN_TABLERO,
    CANT_CASILLAS,
    CANT_CASILLAS_TOP
} from './config.js';

export const CANT_CELDAS = 2 * CANT_CASILLAS;
export const CANT_CASILLAS_LAT = Math.floor(CANT_CASILLAS / 2) - CANT_CASILLAS_TOP;

export class Tablero {
    constructor() {
        this.casillas = [];
        this.celdas = new Array(CANT_CELDAS).fill(null);

        this.head_posible = new PosicionPosible();
        this.tail_posible = new PosicionPosible();

        this.crear_casillas();

        this.primera_jugada = true;
        this.lista_fichas_jugadas = [];
    }

    agregar_casilla(casilla) {
        casilla.calcular_posiciones_celdas(LARGO_FICHA, ANCHO_FICHA);

        this.casillas.push(casilla);

        this.celdas[casilla.celda1.numero] = casilla.celda1;
        this.celdas[casilla.celda2.numero] = casilla.celda2;
    }

    crear_casillas() {
        let numero = 0;

        // -------------------------
        // Superior
        // -------------------------
        let x = MARGEN_TABLERO + ANCHO_FICHA;
        let y = MARGEN_TABLERO;

        for (let i = 0; i < CANT_CASILLAS_TOP; i++) {
            const casilla = new Casilla(
                numero,
                "horizontal", 1,
                2 * numero,
                2 * numero + 1,
                x,
                y
            );
            this.agregar_casilla(casilla);
            numero += 1;
            x += LARGO_FICHA;
        }

        // -------------------------
        // Derecha
        // -------------------------
        x = MARGEN_TABLERO + ANCHO_FICHA + CANT_CASILLAS_TOP * LARGO_FICHA;
        y = MARGEN_TABLERO;

        for (let i = 0; i < CANT_CASILLAS_LAT; i++) {
            const casilla = new Casilla(
                numero,
                "vertical", 1,
                2 * numero,
                2 * numero + 1,
                x,
                y
            );
            this.agregar_casilla(casilla);
            numero += 1;
            y += LARGO_FICHA;
        }

        // -------------------------
        // Inferior
        // -------------------------
        x = MARGEN_TABLERO + ANCHO_FICHA + CANT_CASILLAS_TOP * LARGO_FICHA - LARGO_FICHA;
        y = MARGEN_TABLERO + CANT_CASILLAS_LAT * LARGO_FICHA - ANCHO_FICHA;

        for (let i = 0; i < CANT_CASILLAS_TOP; i++) {
            const casilla = new Casilla(
                numero,
                "horizontal", -1,
                2 * numero,
                2 * numero + 1,
                x,
                y
            );
            this.agregar_casilla(casilla);
            numero += 1;
            x -= LARGO_FICHA;
        }

        // -------------------------
        // Izquierda
        // -------------------------
        x = MARGEN_TABLERO;
        y = MARGEN_TABLERO + (CANT_CASILLAS_LAT - 1) * LARGO_FICHA;

        for (let i = 0; i < CANT_CASILLAS_LAT; i++) {
            const casilla = new Casilla(
                numero,
                "vertical", -1,
                2 * numero,
                2 * numero + 1,
                x,
                y
            );
            this.agregar_casilla(casilla);
            numero += 1;
            y -= LARGO_FICHA;
        }
    }

    colocar_primera_ficha(ficha, casilla) {
        // La orientación de la ficha debe coincidir con la de la casilla
        if (ficha.orientacion !== casilla.orientacion) {
            console.log("MAL");
            return false;
        }

        // -------------------------------------------------
        // Colocar la ficha
        // -------------------------------------------------
        casilla.ficha = ficha;
        ficha.casilla = casilla;
        ficha.estado = "tablero";

        // -------------------------------------------------
        // Guardar los valores de la ficha en las celdas
        // -------------------------------------------------
        if (casilla.orientacion === "horizontal") {
            casilla.celda1.valor = ficha.valores["O"];
            casilla.celda2.valor = ficha.valores["E"];
        } else {
            casilla.celda1.valor = ficha.valores["N"];
            casilla.celda2.valor = ficha.valores["S"];
        }

        // -------------------------------------------------
        // Crear posición posible para TAIL
        // -------------------------------------------------
        const casilla_tail = this.casillas[
            (casilla.numero - 1 + CANT_CASILLAS) % CANT_CASILLAS
        ];
        const celda_tail = this.celdas[casilla_tail.numero * 2 + 1];
        let valor_tail;
        if (casilla.numero < CANT_CASILLAS_TOP) {
            valor_tail = ficha.valores["O"];
        } else if (casilla.numero < CANT_CASILLAS_TOP + CANT_CASILLAS_LAT) {
            valor_tail = ficha.valores["N"];
        } else if (casilla.numero < CANT_CASILLAS_TOP + CANT_CASILLAS_LAT + CANT_CASILLAS_TOP) {
            valor_tail = ficha.valores["E"];
        } else {
            valor_tail = ficha.valores["S"];
        }

        this.tail_posible.inicializar(casilla_tail, celda_tail, valor_tail);

        // -------------------------------------------------
        // Crear posición posible para HEAD
        // -------------------------------------------------
        const casilla_head = this.casillas[
            (casilla.numero + 1) % CANT_CASILLAS
        ];
        const celda_head = this.celdas[casilla_head.numero * 2];
        let valor_head;
        if (casilla.numero < CANT_CASILLAS_TOP) {
            valor_head = ficha.valores["E"];
        } else if (casilla.numero < CANT_CASILLAS_TOP + CANT_CASILLAS_LAT) {
            valor_head = ficha.valores["S"];
        } else if (casilla.numero < CANT_CASILLAS_TOP + CANT_CASILLAS_LAT + CANT_CASILLAS_TOP) {
            valor_head = ficha.valores["O"];
        } else {
            valor_head = ficha.valores["N"];
        }

        this.head_posible.inicializar(casilla_head, celda_head, valor_head);

        // Guardar la jugada
        this.lista_fichas_jugadas.push([ficha, casilla]);
        this.primera_jugada = false;

        return true;
    }

    mostrar_casillas() {
        console.log("\n=== CASILLAS ===\n");
        for (const casilla of this.casillas) {
            console.log(
                `${String(casilla.numero).padStart(2)}  ` +
                `${casilla.orientacion.padEnd(10)}  ` +
                `(${String(casilla.x).padStart(3)},${String(casilla.y).padStart(3)})  ` +
                `celdas=(${String(casilla.celda1.numero).padStart(2)},${String(casilla.celda2.numero).padStart(2)})`
            );
        }
    }

    mostrar_celdas() {
        console.log("\n=== CELDAS ===\n");
        for (const celda of this.celdas) {
            console.log(
                `${String(celda.numero).padStart(2)}  ` +
                `(${celda.x.toFixed(1)},${celda.y.toFixed(1)})  ` +
                `casilla=${String(celda.casilla.numero).padStart(2)}`
            );
        }
    }

    puede_colocar(ficha, casilla) {
        // -------------------------------------------------
        // Chequeo si coincide con head_posible
        // -------------------------------------------------
        if (
            casilla.numero === this.head_posible.casilla.numero &&
            ficha.orientacion === this.head_posible.orientacion
        ) {
            const hv = this.head_posible.valor;
            const hp = this.head_posible.posicion;
            const fv = ficha.valores[hp];

            if (hv.equals(fv)) {
                return [this.head_posible, "head"];
            }
        }

        // -------------------------------------------------
        // Chequeo si coincide con tail_posible
        // -------------------------------------------------
        if (
            casilla.numero === this.tail_posible.casilla.numero &&
            ficha.orientacion === this.tail_posible.orientacion
        ) {
            const tv = this.tail_posible.valor;
            const tp = this.tail_posible.posicion;
            const fv = ficha.valores[tp];

            if (tv.equals(fv)) {
                return [this.tail_posible, "tail"];
            }
        }

        // -------------------------------------------------
        // No se puede colocar
        // -------------------------------------------------
        return [null, null];
    }

    colocar_ficha(ficha, casilla) {
        const [posible, extremo] = this.puede_colocar(ficha, casilla);

        // 1. Verificar que la jugada sea válida
        if (!posible) {
            return false;
        }

        let nuevo_valor;
        if (posible.posicion === "N") {
            nuevo_valor = ficha.valores["S"];
        } else if (posible.posicion === "S") {
            nuevo_valor = ficha.valores["N"];
        } else if (posible.posicion === "E") {
            nuevo_valor = ficha.valores["O"];
        } else {
            nuevo_valor = ficha.valores["E"];
        }

        // 3. Colocar la ficha
        casilla.ficha = ficha;
        ficha.casilla = casilla;
        ficha.estado = "tablero";

        // 4. Copiar valores a las celdas
        if (casilla.orientacion === "horizontal") {
            casilla.celda1.valor = ficha.valores["O"];
            casilla.celda2.valor = ficha.valores["E"];
        } else {
            casilla.celda1.valor = ficha.valores["N"];
            casilla.celda2.valor = ficha.valores["S"];
        }

        // 5. Actualizar la posición posible correspondiente
        if (extremo === "tail") {
            const nueva_casilla = this.casillas[
                (casilla.numero - 1 + CANT_CASILLAS) % CANT_CASILLAS
            ];
            const nueva_celda = this.celdas[nueva_casilla.numero * 2 + 1];
            this.tail_posible.inicializar(nueva_casilla, nueva_celda, nuevo_valor);
        } else {
            const nueva_casilla = this.casillas[
                (casilla.numero + 1) % CANT_CASILLAS
            ];
            const nueva_celda = this.celdas[nueva_casilla.numero * 2];
            this.head_posible.inicializar(nueva_casilla, nueva_celda, nuevo_valor);
        }

        this.lista_fichas_jugadas.push([ficha, casilla]);
        return true;
    }

    // En Python había un método con el mismo nombre que el atributo.
    // En JS no se puede. Lo renombramos a `obtener_jugadas`.
    obtener_jugadas() {
        const jugadas = [];
        for (const casilla of this.casillas) {
            if (casilla.ficha !== null) {
                jugadas.push([
                    casilla.numero,
                    casilla.ficha,
                    casilla.celda1.numero,
                    casilla.celda2.numero
                ]);
            }
        }
        return jugadas;
    }
}