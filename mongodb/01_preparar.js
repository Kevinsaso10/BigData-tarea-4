load(require('path').join(process.env.TAREA4_RAIZ, 'mongodb', 'comun.js'));
comprobarOrigen();
const id = {bsonType:'string'};
const dinero = {bsonType:['int','long','double','decimal'], minimum:0};
const esquemas = {
    clientes:{bsonType:'object', required:['_id','nombre','ciudad','segmento','correo','origen'], properties:{_id:id,nombre:id,ciudad:id,segmento:{enum:['persona','pyme','educativo']},correo:id,origen:{enum:[origen]}}},
    tecnicos:{bsonType:'object', required:['_id','nombre','especialidades','activo','origen'], properties:{_id:id,nombre:id,especialidades:{bsonType:'array',minItems:1,items:id},activo:{bsonType:'bool'},origen:{enum:[origen]}}},
    equipos:{bsonType:'object', required:['_id','cliente_id','tipo','marca','serie','garantia','origen'], properties:{_id:id,cliente_id:id,tipo:{enum:['portatil','escritorio','impresora','router']},marca:id,serie:id,garantia:{bsonType:'bool'},origen:{enum:[origen]}}},
    tickets:{bsonType:'object', required:['_id','cliente_id','equipo_id','tecnico_id','estado','prioridad','fecha_apertura','fecha_cierre','estado_pago','servicios','desplazamiento_cop','total_cop','origen'], properties:{
        _id:id,cliente_id:id,equipo_id:id,tecnico_id:id,estado:{enum:['abierto','en_proceso','espera_repuesto','cerrado','cancelado']},
        prioridad:{enum:['baja','media','alta']},fecha_apertura:{bsonType:'date'},fecha_cierre:{bsonType:['date','null']},
        estado_pago:{enum:['no_aplica','pendiente','pagado']},origen:{enum:[origen]},
        servicios:{bsonType:'array',minItems:1,items:{bsonType:'object',required:['servicio','cantidad','precio_unitario_cop'],properties:{servicio:id,cantidad:{bsonType:['int','long','double'],minimum:1},precio_unitario_cop:dinero}}},
        desplazamiento_cop:dinero,total_cop:dinero,etiquetas:{bsonType:'array',items:id}
    }}
};
for (const c of colecciones) {
    let validator = {$jsonSchema:esquemas[c]};
    if (c === 'tickets') validator = {$and:[validator, {$expr:{$eq:['$total_cop',{$add:[{$sum:{$map:{input:'$servicios',as:'s',in:{$multiply:['$$s.cantidad','$$s.precio_unitario_cop']}}}},'$desplazamiento_cop']}]}}]};
    if (!lab.getCollectionNames().includes(c)) lab.createCollection(c,{validator,validationLevel:'strict',validationAction:'error'});
    else afirmar(lab.runCommand({collMod:c,validator,validationLevel:'strict',validationAction:'error'}).ok === 1,'No se actualizó el validador.');
}
mostrar('CREACION Y VALIDACION','db.createCollection(nombre, {validator: {$jsonSchema: ...}})',lab.getCollectionInfos().filter(x=>colecciones.includes(x.name)).map(x=>({coleccion:x.name,validacion:x.options.validationAction,validator:x.options.validator})));
guardar('01_preparacion',{servidor:lab.version(),base:nombreBD,colecciones:colecciones});
