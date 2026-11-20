load(require('path').join(process.env.TAREA4_RAIZ, 'mongodb', 'comun.js'));
comprobarOrigen();
const consulta=()=>lab.tickets.find({estado:'en_proceso'},{_id:1,estado:1,fecha_apertura:1}).sort({fecha_apertura:-1,_id:1}).limit(10);
const natural=consulta().hint({$natural:1}).explain('executionStats');
lab.tickets.createIndex({estado:1,fecha_apertura:-1,_id:1},{name:'idx_estado_fecha_id'});
const elegido=consulta().explain('executionStats');
function resumir(x) { return {plan:x.queryPlanner.winningPlan,devueltos:x.executionStats.nReturned,documentos_examinados:x.executionStats.totalDocsExamined,claves_examinadas:x.executionStats.totalKeysExamined}; }
const resultado={referencia_recorrido_natural_forzado:resumir(natural),plan_elegido_por_mongodb:resumir(elegido),nota:'Referencia con hint({$natural:1}) frente al plan elegido tras crear índice. No es un benchmark de Big Data.'};
mostrar('INDICE Y EXPLAIN','db.tickets.createIndex({estado:1,fecha_apertura:-1,_id:1}); db.tickets.find({estado:"en_proceso"}).sort({fecha_apertura:-1,_id:1}).limit(10).explain("executionStats")',resultado);
guardar('07_indices',resultado);
