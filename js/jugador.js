export class Jugador {
    constructor(nombre) {
        this.nombre = nombre;
        this.fichas = [];
    }

    recibir_ficha(ficha) {
        this.fichas.push(ficha);

        ficha.estado = "mano";
        ficha.duenio = this;
    }

    sacar_ficha(ficha) {
        const indice = this.fichas.indexOf(ficha);

        if (indice === -1) {
            return false;
        }

        this.fichas.splice(indice, 1);

        ficha.duenio = null;

        return true;
    }

    cantidad_fichas() {
        return this.fichas.length;
    }

    mostrar_fichas() {
        console.log(`\n=== FICHAS DE ${this.nombre.toUpperCase()} ===`);

        for (let i = 0; i < this.fichas.length; i++) {
            const ficha = this.fichas[i];
            console.log(`${i}: ${ficha.mostrar_valores()}`);
        }
    }
}