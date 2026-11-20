load(require('path').join(process.env.TAREA4_RAIZ, 'mongodb', 'comun.js'));
comprobarOrigen();
const equipos = new Map(lab.equipos.find().toArray().map(x=>[x._id,x]));
const clientes = new Set(lab.clientes.distinct('_id'));
const tecnicos = new Set(lab.tecnicos.distinct('_id'));
const errores=[];
for (const t of lab.tickets.find()) {
    if (!clientes.has(t.cliente_id) || !equipos.has(t.equipo_id) || !tecnicos.has(t.tecnico_id)) errores.push(t._id+': referencia ausente');
    else if (equipos.get(t.equipo_id).cliente_id!==t.cliente_id) errores.push(t._id+': propietario incoherente');
    const total=t.servicios.reduce((s,x)=>s+x.cantidad*x.precio_unitario_cop,0)+t.desplazamiento_cop;
    if(total!==t.total_cop) errores.push(t._id+': importe incoherente');
    if(t.estado==='cerrado' && (!(t.fecha_cierre instanceof Date) || t.fecha_cierre<t.fecha_apertura || !['pagado','pendiente'].includes(t.estado_pago))) errores.push(t._id+': cierre incoherente');
    if(t.estado!=='cerrado' && (t.fecha_cierre!==null || t.estado_pago!=='no_aplica')) errores.push(t._id+': pago o cierre en ticket no cerrado');
}
const salida={base:nombreBD,documentos:conteos(),errores,validacion_correcta:errores.length===0};
mostrar('CONTROL DE REFERENCIAS FECHAS E IMPORTES','Verificar cada ticket contra clientes, equipos, técnicos y suma de sus servicios.',salida);
guardar('08_integridad',salida);
afirmar(errores.length===0,'Falló el control de integridad.');
