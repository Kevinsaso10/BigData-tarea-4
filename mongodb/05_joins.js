load(require('path').join(process.env.TAREA4_RAIZ, 'mongodb', 'comun.js'));
comprobarOrigen();
const pipeline=[
 {$match:{_id:'TK-0001'}},
 {$lookup:{from:'clientes',localField:'cliente_id',foreignField:'_id',as:'cliente'}},
 {$lookup:{from:'equipos',localField:'equipo_id',foreignField:'_id',as:'equipo'}},
 {$lookup:{from:'tecnicos',localField:'tecnico_id',foreignField:'_id',as:'tecnico'}},
 {$project:{_id:1,estado:1,total_cop:1,cliente:{$arrayElemAt:['$cliente.nombre',0]},ciudad:{$arrayElemAt:['$cliente.ciudad',0]},equipo:{$arrayElemAt:['$equipo.tipo',0]},tecnico:{$arrayElemAt:['$tecnico.nombre',0]}}}
];
const detalle=lab.tickets.aggregate(pipeline).toArray();
mostrar('JOIN ENTRE CUATRO COLECCIONES','db.tickets.aggregate('+JSON.stringify(pipeline)+')',detalle);
const top=[{$match:{estado:'cerrado',estado_pago:'pagado'}},{$group:{_id:'$cliente_id',tickets:{$sum:1},cobrado_cop:{$sum:'$total_cop'}}},{$sort:{cobrado_cop:-1,_id:1}},{$limit:5},{$lookup:{from:'clientes',localField:'_id',foreignField:'_id',as:'cliente'}},{$project:{_id:1,tickets:1,cobrado_cop:1,nombre:{$arrayElemAt:['$cliente.nombre',0]},ciudad:{$arrayElemAt:['$cliente.ciudad',0]}}}];
const clientes=lab.tickets.aggregate(top).toArray();
mostrar('CLIENTES CON MAYOR IMPORTE COBRADO','db.tickets.aggregate('+JSON.stringify(top)+')',clientes);
guardar('05_joins',{detalle,clientes});
