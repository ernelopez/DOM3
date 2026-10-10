// ficha.js

// -------------------------------------------------
// Fracción: numerador / denominador (con simplificación)
// -------------------------------------------------
export class Fraccion {
    constructor(num, den) {
        if (den === 0) {
            throw new Error("Denominador no puede ser 0");
        }
        const divisor = this.mcd(num, den);
        this.num = num / divisor;
        this.den = den / divisor;
    }

    mcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            const t = b;
            b = a % b;
            a = t;
        }
        return a || 1;
    }

    equals(otra) {
        if (!(otra instanceof Fraccion)) return false;
        return this.num * otra.den === otra.num * this.den;
    }

    toNumber() {
        return this.num / this.den;
    }

    toString() {
        return `${this.num}/${this.den}`;
    }
}


// -------------------------------------------------
// Parseo de un número string
// Devuelve { entero: string|null, num: string }
//   "50"   → { entero: null, num: "50" }
//   "0.50" → { entero: null, num: "0.50" }
//   "3y1"  → { entero: "3",  num: "1" }
// -------------------------------------------------
function parsearNumero(numStr) {
    numStr = String(numStr).trim();
    if (numStr.includes('y')) {
        const [entero, numFrac] = numStr.split('y');
        return { entero, num: numFrac };
    }
    return { entero: null, num: numStr };
}


// -------------------------------------------------
// Formateo de número (formato argentino, preservando ceros)
// -------------------------------------------------
function formatearNumero(numStr) {
    numStr = String(numStr).trim();

    let entero, decimales;
    if (numStr.includes('.')) {
        [entero, decimales] = numStr.split('.');
    } else {
        entero = numStr;
        decimales = null;
    }

    // Separador de miles MANUAL para preservar ceros originales
    let enteroFormateado;
    if (entero.length > 3) {
        enteroFormateado = "";
        const digitos = entero.split('').reverse();
        for (let i = 0; i < digitos.length; i++) {
            if (i > 0 && i % 3 === 0) {
                enteroFormateado = "." + enteroFormateado;
            }
            enteroFormateado = digitos[i] + enteroFormateado;
        }
    } else {
        enteroFormateado = entero;
    }

    if (decimales !== null) {
        return enteroFormateado + ',' + decimales;
    }
    return enteroFormateado;
}


// -------------------------------------------------
// Ficha
// -------------------------------------------------
export class Ficha {
    constructor(valor1, valor2) {
        // valor1 y valor2 son [numStr, denStr]
        // Ejemplos juego 2: ["50", "100"], ["0.50", "1"]
        // Ejemplos juego 3: ["3y1", "2"],    ["1.250", "1"]

        // -------------------------------------------------
        // Valores matemáticos
        // -------------------------------------------------
        this.valores = {};
        this.valores["O"] = this._aFraccion(valor1[0], valor1[1]);
        this.valores["E"] = this._aFraccion(valor2[0], valor2[1]);
        this.valores["N"] = null;
        this.valores["S"] = null;

        // -------------------------------------------------
        // Textos para mostrar
        // -------------------------------------------------
        this.textos = {};
        this.textos["O"] = this._formatearTexto(valor1[0], valor1[1]);
        this.textos["E"] = this._formatearTexto(valor2[0], valor2[1]);
        this.textos["N"] = null;
        this.textos["S"] = null;

        this.orientacion = "horizontal";
        this.casilla = null;
        this.estado = "pozo";
        this.duenio = null;
    }

    // -------------------------------------------------
    // Convierte (numStr, denStr) en Fraccion
    // Soporta enteros, decimales, fracciones simples y mixtas
    // -------------------------------------------------
    _aFraccion(numStr, denStr) {
        const { entero, num } = parsearNumero(numStr);
        const den = parseFloat(denStr);

        if (entero !== null) {
            // Fracción mixta: entero + num/den
            const parteEntera = parseFloat(entero);
            return new Fraccion(
                Math.round((parteEntera * den + parseFloat(num)) * 1000000),
                Math.round(den * 1000000)
            );
        }

        // Número simple (entero, decimal o fracción simple)
        return new Fraccion(
            Math.round(parseFloat(num) * 1000000),
            Math.round(den * 1000000)
        );
    }

    // -------------------------------------------------
    // Formatea el texto que se muestra en la ficha
    //   - Simple con den=1:   "0,50"
    //   - Simple con den≠1:   "50\n100"
    //   - Mixta:              "3|1\n2"
    // -------------------------------------------------
    _formatearTexto(numStr, denStr) {
        const { entero, num } = parsearNumero(numStr);
        const den = parseFloat(denStr);

        if (entero !== null) {
            // Fracción mixta
            const enteroFmt = formatearNumero(entero);
            const numFmt = formatearNumero(num);
            const denFmt = formatearNumero(denStr);
            return `${enteroFmt}|${numFmt}\n${denFmt}`;
        }

        // Número simple
        const numFmt = formatearNumero(num);

        if (den === 1) {
            return numFmt;
        } else {
            const denFmt = formatearNumero(denStr);
            return `${numFmt}\n${denFmt}`;
        }
    }

    girar_90() {
        const O = this.valores["O"];
        const E = this.valores["E"];
        const N = this.valores["N"];
        const S = this.valores["S"];

        const texto_O = this.textos["O"];
        const texto_E = this.textos["E"];
        const texto_N = this.textos["N"];
        const texto_S = this.textos["S"];

        this.valores["N"] = E;
        this.valores["O"] = N;
        this.valores["S"] = O;
        this.valores["E"] = S;

        this.textos["N"] = texto_E;
        this.textos["O"] = texto_N;
        this.textos["S"] = texto_O;
        this.textos["E"] = texto_S;

        if (this.orientacion === "horizontal") {
            this.orientacion = "vertical";
        } else {
            this.orientacion = "horizontal";
        }
    }

    mostrar_ficha() {
        console.log(
            this.orientacion,
            `O:${this.textos["O"]}`,
            `E:${this.textos["E"]}`,
            `N:${this.textos["N"]}`,
            `S:${this.textos["S"]}`
        );
    }

    mostrar_valores() {
        if (this.orientacion === "horizontal") {
            return `[${this.textos["O"]} | ${this.textos["E"]}]`.replace(/\n/g, '/');
        } else {
            return `[${this.textos["N"]} | ${this.textos["S"]}]`.replace(/\n/g, '/');
        }
    }

    toString() {
        return this.mostrar_valores();
    }
}