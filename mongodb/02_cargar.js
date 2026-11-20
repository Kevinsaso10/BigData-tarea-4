load(require('path').join(process.env.TAREA4_RAIZ, 'mongodb', 'comun.js'));
comprobarOrigen();
const datos = leerDatos();
for (const c of colecciones) {
    const n = lab[c].countDocuments({});
    if (n === 0) {
        const r = lab[c].insertMany(datos[c]);
        mostrar('INSERCION MASIVA ' + c,'db.'+c+'.insertMany(documentos)',{acknowledged:r.acknowledged,documentos:Object.keys(r.insertedIds).length});
    } else {
        afirmar(n === datos[c].length,'La colección '+c+' contiene un número inesperado. No se sobrescribió.');
        afirmar(datos[c].every(x=>lab[c].countDocuments({_id:x._id,origen})===1),'Identificadores inesperados.');
        print('Conjunto ya cargado en '+c+'; se conserva.');
    }
}
lab.clientes.createIndex({correo:1},{unique:true,name:'correo_unico'});
lab.equipos.createIndex({serie:1},{unique:true,name:'serie_unica'});
const resumen=conteos();
mostrar('CONTEOS DE LA BASE','db.coleccion.countDocuments({})',resumen);
afirmar(Object.values(resumen).reduce((a,b)=>a+b,0)===278,'Conteo inicial incorrecto.');
guardar('02_conteos',resumen);
