import { Tablero } from './tablero.js';
import { Pozo } from './pozo.js';
import { Jugador } from './jugador.js';
import { Fraccion } from './ficha.js';

export class Partida {
    constructor(fichas_por_jugador = 6) {
        // Tablero
        this.tablero = new Tablero();

        // Pozo (vacío hasta que se cargue el CSV con await)
        this.pozo = new Pozo();

        // Jugadores
        this.jugadores = [
            new Jugador("Jugador 1"),
            new Jugador("Jugador 2")
        ];

        // Turno: índice de jugadores
        this.turno = 0;

        // Estado de la partida
        this.terminada = false;
        this.ganador = null;

        // Flag: el jugador actual ya robó en este turno?
        this.ya_robo_en_turno = false;
        this.ficha_robada = null;

        // Cantidad de fichas por jugador
        this.fichas_por_jugador = fichas_por_jugador;
    }

    // Se llama DESPUÉS del constructor, cuando el pozo ya está cargado
    repartir_fichas() {
        for (const jugador of this.jugadores) {
            for (let i = 0; i < this.fichas_por_jugador; i++) {
                const ficha = this.pozo.sacar();
                if (ficha !== null) {
                    jugador.recibir_ficha(ficha);
                }
            }
        }
    }

    jugador_actual() {
        return this.jugadores[this.turno];
    }

    cambiar_turno() {
        this.turno = (this.turno + 1) % this.jugadores.length;
        this.ya_robo_en_turno = false;
        this.ficha_robada = null;
    }

    puede_jugar(jugador) {
        if (jugador.cantidad_fichas() === 0) {
            return false;
        }

        if (this.tablero.primera_jugada) {
            return true;
        }

        const valor_head = this.tablero.head_posible.valor;
        const valor_tail = this.tablero.tail_posible.valor;

        for (const ficha of jugador.fichas) {
            for (const valor of Object.values(ficha.valores)) {
                if (valor !== null) {
                    if (valor.equals(valor_head) || valor.equals(valor_tail)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    puede_robar(jugador = null) {
        if (jugador === null) {
            jugador = this.jugador_actual();
        }

        if (this.ya_robo_en_turno) {
            return false;
        }

        if (this.pozo.cantidad() === 0) {
            return false;
        }

        return true;
    }

    robar_ficha(jugador = null) {
        if (jugador === null) {
            jugador = this.jugador_actual();
        }

        if (!this.puede_robar(jugador)) {
            return null;
        }

        const ficha = this.pozo.sacar();
        if (ficha === null) {
            return null;
        }

        jugador.recibir_ficha(ficha);
        this.ya_robo_en_turno = true;
        this.ficha_robada = ficha;

        return ficha;
    }

    pasar_turno(jugador = null) {
        if (jugador === null) {
            jugador = this.jugador_actual();
        }

        if (!this.ya_robo_en_turno) {
            return false;
        }

        this.cambiar_turno();
        return true;
    }

    jugar_ficha(ficha, casilla) {
        const jugador = this.jugador_actual();

        if (!jugador.fichas.includes(ficha)) {
            return false;
        }

        let colocada;
        if (this.tablero.primera_jugada) {
            colocada = this.tablero.colocar_primera_ficha(ficha, casilla);
        } else {
            colocada = this.tablero.colocar_ficha(ficha, casilla);
        }

        if (!colocada) {
            return false;
        }

        jugador.sacar_ficha(ficha);

        // --- VERIFICAR GANADOR ---
        if (jugador.cantidad_fichas() === 0) {
            this.terminada = true;
            this.ganador = jugador;
            return true;
        }

        this.cambiar_turno();
        return true;
    }

    partida_bloqueada() {
        for (const jugador of this.jugadores) {
            if (this.puede_jugar(jugador) || this.puede_robar(jugador)) {
                return false;
            }
        }
        return true;
    }

    obtener_ganador_por_menos_fichas() {
        const j1 = this.jugadores[0];
        const j2 = this.jugadores[1];

        if (j1.cantidad_fichas() < j2.cantidad_fichas()) {
            return j1;
        } else if (j2.cantidad_fichas() < j1.cantidad_fichas()) {
            return j2;
        }

        // Empate en cantidad: por suma de valores
        let suma_j1 = 0;
        for (const ficha of j1.fichas) {
            for (const valor of Object.values(ficha.valores)) {
                if (valor !== null) {
                    suma_j1 += valor.toNumber();
                }
            }
        }

        let suma_j2 = 0;
        for (const ficha of j2.fichas) {
            for (const valor of Object.values(ficha.valores)) {
                if (valor !== null) {
                    suma_j2 += valor.toNumber();
                }
            }
        }

        if (suma_j1 < suma_j2) {
            return j1;
        } else if (suma_j2 < suma_j1) {
            return j2;
        } else {
            return null;
        }
    }

    verificar_fin_partida() {
        if (this.terminada) {
            return true;
        }

        if (this.tablero.primera_jugada) {
            return false;
        }

        const jugador = this.jugador_actual();

        // Caso 1: El jugador no puede jugar y el pozo está vacío (pierde)
        if (this.pozo.cantidad() === 0 && !this.puede_jugar(jugador)) {
            this.terminada = true;
            for (const j of this.jugadores) {
                if (j !== jugador) {
                    this.ganador = j;
                    break;
                }
            }
            return true;
        }

        // Caso 2: Ambos jugadores están bloqueados
        if (this.partida_bloqueada()) {
            this.terminada = true;
            this.ganador = this.obtener_ganador_por_menos_fichas();
            return true;
        }

        return false;
    }

    determinar_ficha_inicial() {
        let mejor_ficha = null;
        let mejor_jugador = null;
        let mejor_valor = -1;
        let encontre_doble = false;

        for (const jugador of this.jugadores) {
            for (const ficha of jugador.fichas) {
                // Verificar si es doble
                if (ficha.valores["O"].equals(ficha.valores["E"])) {
                    const valor_doble = ficha.valores["O"].toNumber();
                    if (!encontre_doble || valor_doble > mejor_valor) {
                        mejor_ficha = ficha;
                        mejor_jugador = jugador;
                        mejor_valor = valor_doble;
                        encontre_doble = true;
                    }
                }
            }
        }

        // Si no se encontraron dobles, buscar la ficha con mayor suma
        if (!encontre_doble) {
            for (const jugador of this.jugadores) {
                for (const ficha of jugador.fichas) {
                    const suma = ficha.valores["O"].toNumber() + ficha.valores["E"].toNumber();
                    if (suma > mejor_valor) {
                        mejor_ficha = ficha;
                        mejor_jugador = jugador;
                        mejor_valor = suma;
                    }
                }
            }
        }

        return [mejor_ficha, mejor_jugador];
    }

    colocar_ficha_inicial(ficha, casilla) {
        const jugador = this.jugador_actual();

        if (!jugador.fichas.includes(ficha)) {
            return false;
        }

        const colocada = this.tablero.colocar_primera_ficha(ficha, casilla);
        if (!colocada) {
            return false;
        }

        jugador.sacar_ficha(ficha);
        return true;
    }
}