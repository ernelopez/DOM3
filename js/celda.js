export class Celda {
    constructor(numero) {
        this.numero = numero;
        this.valor = null;
        this.casilla = null;

        // Centro de la celda en pantalla
        this.x = 0;
        this.y = 0;
    }

    mostrar() {
        console.log(
            `Celda ${this.numero}: ` +
            `x=${this.x}, y=${this.y}, ` +
            `valor=${this.valor}`
        );
    }
}