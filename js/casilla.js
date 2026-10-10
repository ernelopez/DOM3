import { Celda } from './celda.js';
import { CANT_CASILLAS, CANT_CASILLAS_TOP } from './config.js';

export class Casilla {
    constructor(numero, orientacion, sentido, celda1, celda2, x, y) {
        this.numero = numero;
        this.orientacion = orientacion;
        // +1: el recorrido coincide con la geometría
        // -1: el recorrido es inverso a la geometría
        this.sentido = sentido;

        // Esquina superior izquierda de la casilla
        this.x = x;
        this.y = y;

        // celda1 será O ó N; celda2 será E ó S
        if (sentido === 1) {
            this.celda1 = new Celda(celda1);
            this.celda2 = new Celda(celda2);
        } else {
            this.celda1 = new Celda(celda2);
            this.celda2 = new Celda(celda1);
        }

        this.celda1.casilla = this;
        this.celda2.casilla = this;

        this.ficha = null;
    }

    calcular_posiciones_celdas(largo_ficha, ancho_ficha) {
        if (this.orientacion === "horizontal") {
            if (this.sentido === 1) {
                this.celda1.x = this.x + ancho_ficha / 2;
                this.celda1.y = this.y + ancho_ficha / 2;

                this.celda2.x = this.x + largo_ficha - ancho_ficha / 2;
                this.celda2.y = this.y + ancho_ficha / 2;
            } else {
                this.celda2.x = this.x + ancho_ficha / 2;
                this.celda2.y = this.y + ancho_ficha / 2;

                this.celda1.x = this.x + largo_ficha - ancho_ficha / 2;
                this.celda1.y = this.y + ancho_ficha / 2;
            }
        } else {
            if (this.sentido === 1) {
                this.celda1.x = this.x + ancho_ficha / 2;
                this.celda1.y = this.y + ancho_ficha / 2;

                this.celda2.x = this.x + ancho_ficha / 2;
                this.celda2.y = this.y + largo_ficha - ancho_ficha / 2;
            } else {
                this.celda2.x = this.x + ancho_ficha / 2;
                this.celda2.y = this.y + ancho_ficha / 2;

                this.celda1.x = this.x + ancho_ficha / 2;
                this.celda1.y = this.y + largo_ficha - ancho_ficha / 2;
            }
        }

        // Parche para trocar los centros de las de abajo y a la izquierda
        if (this.sentido === -1) {
            [this.celda1.x, this.celda2.x] = [this.celda2.x, this.celda1.x];
            [this.celda1.y, this.celda2.y] = [this.celda2.y, this.celda1.y];
        }
    }

    casilla_siguiente_head(tablero) {
        return tablero.casillas[(this.numero + 1) % CANT_CASILLAS];
    }

    casilla_siguiente_tail(tablero) {
        return tablero.casillas[(this.numero - 1) % CANT_CASILLAS];
    }
}