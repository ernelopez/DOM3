import { Ficha } from './ficha.js';

export class Pozo {
    constructor() {
        this.fichas = [];
    }

    // En Python el CSV se cargaba en el constructor.
    // En JS no podemos leer archivos de forma síncrona sin bloquear.
    // Así que separamos: creamos el pozo vacío y luego llamamos a cargar()
    // con el contenido del CSV ya leído.
    async cargar(archivo) {
        // 1. Descargar el archivo CSV
        const respuesta = await fetch(archivo);

        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar ${archivo}: ${respuesta.status}`);
        }

        // 2. Leer el texto
        const texto = await respuesta.text();

        // 3. Parsear el CSV manualmente (más simple que agregar una librería)
        const lineas = texto.trim().split('\n');
        const encabezados = lineas[0].split(',');

        // Verificar que las columnas sean las esperadas
        const idx_izq_num = encabezados.indexOf('izq_num');
        const idx_izq_den = encabezados.indexOf('izq_den');
        const idx_der_num = encabezados.indexOf('der_num');
        const idx_der_den = encabezados.indexOf('der_den');

        if (idx_izq_num === -1 || idx_izq_den === -1 || idx_der_num === -1 || idx_der_den === -1) {
            throw new Error('El CSV no tiene las columnas esperadas');
        }

        // 4. Crear las fichas
        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (linea === '') continue;

            const campos = linea.split(',');

            const ficha = new Ficha(
                [campos[idx_izq_num].trim(), campos[idx_izq_den].trim()],
                [campos[idx_der_num].trim(), campos[idx_der_den].trim()]
            );

            this.fichas.push(ficha);
        }

        // 5. Mezclar
        this.mezclar();
    }

    mezclar() {
        // Fisher-Yates shuffle
        for (let i = this.fichas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.fichas[i], this.fichas[j]] = [this.fichas[j], this.fichas[i]];
        }
    }

    sacar() {
        if (this.fichas.length === 0) {
            return null;
        }
        return this.fichas.pop();
    }

    cantidad() {
        return this.fichas.length;
    }
}