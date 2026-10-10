import { CANT_CASILLAS, CANT_CASILLAS_TOP } from './config.js';

export const CANT_CELDAS = 2 * CANT_CASILLAS;
export const CANT_CASILLAS_LAT = Math.floor(CANT_CASILLAS / 2) - CANT_CASILLAS_TOP;

// Función auxiliar para generar un rango [inicio, fin)
function range(inicio, fin) {
    const resultado = [];
    for (let i = inicio; i < fin; i++) {
        resultado.push(i);
    }
    return resultado;
}

export const CASILLAS_TOP = range(0, CANT_CASILLAS_TOP);
export const CASILLAS_RIG = range(CANT_CASILLAS_TOP, CANT_CASILLAS_TOP + CANT_CASILLAS_LAT);
export const CASILLAS_DOW = CASILLAS_TOP.map(i => i + Math.floor(CANT_CASILLAS / 2));
export const CASILLAS_LEF = CASILLAS_RIG.map(i => i + Math.floor(CANT_CASILLAS / 2));

export const CELDAS_TOP = CASILLAS_TOP.flatMap(x => [x * 2, x * 2 + 1]);
export const CELDAS_RIG = CASILLAS_RIG.flatMap(x => [x * 2, x * 2 + 1]);
export const CELDAS_DOW = CASILLAS_DOW.flatMap(x => [x * 2, x * 2 + 1]);
export const CELDAS_LEF = CASILLAS_LEF.flatMap(x => [x * 2, x * 2 + 1]);


export class PosicionPosible {
    constructor() {
        // Casilla donde se puede colocar la ficha
        this.casilla = null;

        // Celda concreta de la casilla donde debe
        // caer el extremo que hace match
        this.celda = null;

        // Valor que debe coincidir
        this.valor = null;

        // Orientación que debe tener la ficha
        this.orientacion = null;

        // Posición de la ficha que debe matchear
        // esa celda: "O", "E", "N" o "S"
        this.posicion = null;
    }

    inicializar(casilla, celda, valor) {
        const direccion = casilla.orientacion;
        this.casilla = casilla;
        this.celda = celda;
        this.valor = valor;
        this.orientacion = direccion;

        if (direccion === "horizontal" && CELDAS_TOP.includes(celda.numero) && celda.numero % 2 === 0) {
            this.posicion = "O";
        } else if (direccion === "horizontal" && CELDAS_TOP.includes(celda.numero) && celda.numero % 2 === 1) {
            this.posicion = "E";
        } else if (direccion === "vertical" && CELDAS_RIG.includes(celda.numero) && celda.numero % 2 === 0) {
            this.posicion = "N";
        } else if (direccion === "vertical" && CELDAS_RIG.includes(celda.numero) && celda.numero % 2 === 1) {
            this.posicion = "S";
        } else if (direccion === "horizontal" && CELDAS_DOW.includes(celda.numero) && celda.numero % 2 === 0) {
            this.posicion = "E";
        } else if (direccion === "horizontal" && CELDAS_DOW.includes(celda.numero) && celda.numero % 2 === 1) {
            this.posicion = "O";
        } else if (direccion === "vertical" && CELDAS_LEF.includes(celda.numero) && celda.numero % 2 === 0) {
            this.posicion = "S";
        } else if (direccion === "vertical" && CELDAS_LEF.includes(celda.numero) && celda.numero % 2 === 1) {
            this.posicion = "N";
        }
    }

    mostrar() {
        console.log(`Casilla     : ${this.casilla.numero}`);
        console.log(`Celda       : ${this.celda.numero}`);
        console.log(`Debe haber  : ${this.valor}`);
        console.log(`Orientación : ${this.orientacion}`);
        console.log(`Posición    : ${this.posicion}`);
    }

    texto() {
        /** Devuelve el valor como fracción legible */
        return `${this.valor}`;
    }
}