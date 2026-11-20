// Utilidades para mongosh. Todas las consultas se limitan a la base del ejercicio.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const raiz = process.env.TAREA4_RAIZ;
if (!raiz) throw new Error('Ejecutar mediante los scripts PowerShell del proyecto.');
const nombreBD = process.env.TAREA4_BD || 'soporte_kevin_125_20261119';
if (!/^soporte_kevin_125_[A-Za-z0-9_]+$/.test(nombreBD)) throw new Error('Nombre de base fuera del espacio de este laboratorio.');
const lab = db.getSiblingDB(nombreBD);
const origen = 'sintetico_kevin_125_v1';
const colecciones = ['clientes', 'tecnicos', 'equipos', 'tickets'];
const carpetaSalida = process.env.TAREA4_SALIDA || path.join(raiz, 'evidencias', 'actual');
fs.mkdirSync(carpetaSalida, {recursive: true});

function afirmar(condicion, mensaje) { if (!condicion) throw new Error(mensaje); }
function guardar(nombre, datos) {
    fs.writeFileSync(path.join(carpetaSalida, nombre + '.json'), EJSON.stringify(datos, null, 2, {relaxed:true})+'\n', 'utf8');
}
function mostrar(titulo, codigo, resultado) {
    print('\n=== ' + titulo + ' ===');
    print('CODIGO: ' + codigo);
    print(EJSON.stringify(resultado, null, 2, {relaxed:true}));
    if (process.env.TAREA4_CAPTURAS === '1') print('__TAREA4_CAPTURA_LISTA_125__');
}
function conteos() { return Object.fromEntries(colecciones.map(c => [c, lab[c].countDocuments({})])); }
function comprobarOrigen() {
    for (const c of colecciones) afirmar(lab[c].countDocuments({origen: {$ne: origen}}) === 0, 'Se encontraron documentos ajenos al ejercicio en ' + c);
}
function leerDatos() {
    const fichero = path.join(raiz, 'datos', 'soporte_sintetico.json');
    const manifiesto = JSON.parse(fs.readFileSync(path.join(raiz, 'datos', 'manifiesto.json'), 'utf8'));
    afirmar(crypto.createHash('sha256').update(fs.readFileSync(fichero)).digest('hex') === manifiesto.sha256, 'La huella del conjunto no coincide.');
    const datos = JSON.parse(fs.readFileSync(fichero, 'utf8'));
    for (const ticket of datos.tickets) {
        ticket.fecha_apertura = new Date(ticket.fecha_apertura);
        ticket.fecha_cierre = ticket.fecha_cierre ? new Date(ticket.fecha_cierre) : null;
    }
    return datos;
}
