load(require('path').join(process.env.TAREA4_RAIZ, 'mongodb', 'comun.js'));
comprobarOrigen();
const ids = ['DEMO-125-01','DEMO-125-02','DEMO-125-03'];
afirmar(lab.tickets.countDocuments({_id:{$in:ids}})===0,'Hay una demostración interrumpida. Revisar sus tres IDs antes de repetir.');
const base = lab.tickets.findOne({_id:'TK-0001'});
afirmar(base,'Cargar los datos antes de ejecutar CRUD.');
const nuevo = id => ({...base,_id:id,prioridad:'baja',revisiones:0,etiquetas:['demostracion']});
const resultados = {};
try {
    resultados.insertOne=lab.tickets.insertOne(nuevo(ids[0]));
    mostrar('INSERT ONE','db.tickets.insertOne(documentoDemo)',resultados.insertOne);
    resultados.insertMany=lab.tickets.insertMany(ids.slice(1).map(nuevo));
    mostrar('INSERT MANY','db.tickets.insertMany([demo2, demo3])',resultados.insertMany);
    mostrar('SELECCION','db.tickets.findOne({_id:"DEMO-125-01"})',lab.tickets.findOne({_id:ids[0]}));
    const invalido = {...nuevo('INVALIDO-125'), total_cop:-1};
    let rechazo=false;
    try { lab.tickets.insertOne(invalido); }
    catch(e) { afirmar(e.code===121,'El error no fue de validación: '+e); rechazo=true; resultados.validacion={codigo:e.code,mensaje:e.errmsg||e.message}; }
    afirmar(rechazo,'No se rechazó el importe negativo.');
    mostrar('DOCUMENTO INVALIDO RECHAZADO','db.tickets.insertOne({...documento, total_cop:-1})',resultados.validacion);
    resultados.updateOne=lab.tickets.updateOne({_id:ids[0]},{$set:{prioridad:'alta'},$inc:{revisiones:1},$addToSet:{etiquetas:'revisado'}});
    mostrar('UPDATE ONE','db.tickets.updateOne({_id:"DEMO-125-01"}, {$set:{prioridad:"alta"}, $inc:{revisiones:1}, $addToSet:{etiquetas:"revisado"}})',resultados.updateOne);
    resultados.updateMany=lab.tickets.updateMany({_id:{$in:ids.slice(1)}},{$set:{prioridad:'media'}});
    mostrar('UPDATE MANY','db.tickets.updateMany({_id:{$in:["DEMO-125-02","DEMO-125-03"]}}, {$set:{prioridad:"media"}})',resultados.updateMany);
    mostrar('VERIFICACION DE CAMBIOS','db.tickets.find({_id:{$in:ids}}, {_id:1,prioridad:1,revisiones:1,etiquetas:1})',lab.tickets.find({_id:{$in:ids}},{_id:1,prioridad:1,revisiones:1,etiquetas:1}).sort({_id:1}).toArray());
    resultados.deleteOne=lab.tickets.deleteOne({_id:ids[0]});
    mostrar('DELETE ONE','db.tickets.deleteOne({_id:"DEMO-125-01"})',resultados.deleteOne);
    resultados.deleteMany=lab.tickets.deleteMany({_id:{$in:ids.slice(1)}});
    mostrar('DELETE MANY','db.tickets.deleteMany({_id:{$in:["DEMO-125-02","DEMO-125-03"]}})',resultados.deleteMany);
    afirmar(resultados.deleteOne.deletedCount===1 && resultados.deleteMany.deletedCount===2,'La eliminación no coincidió.');
} finally {
    // Solo limpia los tres documentos de demostración de este script.
    lab.tickets.deleteMany({_id:{$in:ids},origen});
}
resultados.conteos_finales=conteos();
afirmar(resultados.conteos_finales.tickets===180,'Los tickets de negocio no conservaron su conteo.');
mostrar('BASE CONSERVADA','db.tickets.countDocuments({})',resultados.conteos_finales);
guardar('03_crud',resultados);
