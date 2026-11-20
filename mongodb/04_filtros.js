load(require('path').join(process.env.TAREA4_RAIZ, 'mongodb', 'comun.js'));
comprobarOrigen();
const consultas = [
 ['FILTRO DE ESTADO Y PRIORIDAD',{estado:{$in:['abierto','en_proceso']},prioridad:'alta'}],
 ['RANGO MONETARIO',{total_cop:{$gte:100000,$lte:200000}}],
 ['OPERADOR OR',{$or:[{prioridad:'alta'},{etiquetas:'domicilio'}]}],
 ['FILTRO DE ARREGLOS', {servicios:{$elemMatch:{cantidad:{$gte:1},precio_unitario_cop:{$gte:150000}}}}],
 ['EXISTENCIA Y DESIGUALDAD',{fecha_cierre:{$exists:true,$ne:null},estado:'cerrado'}],
 ['ETIQUETAS CON ALL',{etiquetas:{$all:['prueba','domicilio']}}]
];
const salida=[];
for (const [titulo,filtro] of consultas) {
    const resultados=lab.tickets.find(filtro,{_id:1,estado:1,prioridad:1,total_cop:1}).sort({total_cop:-1,_id:1}).limit(5).toArray();
    const total=lab.tickets.countDocuments(filtro);
    mostrar(titulo,'db.tickets.find('+JSON.stringify(filtro)+').sort({total_cop:-1,_id:1}).limit(5)',{coincidencias:total,muestra:resultados});
    salida.push({titulo,filtro,coincidencias:total,muestra:resultados});
}
mostrar('REGEX EN CLIENTES','db.clientes.find({ciudad:{$regex:"^B",$options:"i"}}, {nombre:1,ciudad:1})',lab.clientes.find({ciudad:{$regex:'^B',$options:'i'}},{nombre:1,ciudad:1}).limit(10).toArray());
mostrar('VALORES DISTINTOS','db.tickets.distinct("estado")',lab.tickets.distinct('estado'));
guardar('04_filtros',salida);
