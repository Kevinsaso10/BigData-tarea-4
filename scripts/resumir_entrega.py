"""Prepara una copia de resultados reales y un paquete de código sin binarios."""
from pathlib import Path
import json
import shutil
import zipfile

ROOT=Path(__file__).resolve().parents[1]
session=Path((ROOT/'evidencias/ultima_sesion.txt').read_text(encoding='utf-8-sig').strip())
out=ROOT/'resultados_verificados'
out.mkdir(exist_ok=True)
for name in ['01_preparacion.json','02_conteos.json','03_crud.json','04_filtros.json','05_joins.json','06_agregaciones.json','07_indices.json','08_integridad.json','09_control_independiente.json']:
    shutil.copy2(session/name,out/name)
control=json.loads((ROOT/'datos/control_independiente.json').read_text(encoding='utf-8'))
f=control['finanzas']
def cop(n):return f'{n:,.0f}'.replace(',','.')
texto=f'''RESULTADOS VERIFICADOS Y CONCLUSIÓN INDIVIDUAL

Kevin Obed Tique Villada - Grupo 202016911_125
Caso: Sistema de soporte técnico y mantenimiento de equipos.

ESTADO DEL TRABAJO
Código ejecutado con MongoDB 8.0.38 y mongosh 2.14.2 en este equipo. Los conteos, estados, importes, promedios y agregados mensuales coinciden con un control independiente generado en Python. El control de referencias, propietarios de equipos, fechas y totales no encontró errores.

Estos resultados se conservan para preparar las evidencias. Todavía deben publicarse los aportes en el foro, tomarse las capturas y construirse/publicarse la presentación online individual. Este archivo no es el informe grupal.

BASE DE DATOS
30 clientes + 8 técnicos + 60 equipos + 180 tickets = 278 documentos sintéticos.
Las operaciones CRUD insertan, actualizan y eliminan solo tres tickets de demostración. Al finalizar permanecen los 278 documentos originales de negocio.

ESTADOS DE LOS 180 TICKETS
Abiertos: 23
En proceso: 23
En espera de repuesto: 23
Cerrados: 89
Cancelados: 22

IMPORTES Y PROMEDIOS
Tickets cerrados y pagados: {f['tickets_pagados']}
Tickets cerrados pendientes de pago: {f['tickets_pendientes_pago']}
Facturado en tickets cerrados: ${cop(f['facturado_cerrados_cop'])} COP
Cobrado en tickets cerrados y pagados: ${cop(f['cobrado_cop'])} COP
Por cobrar de tickets cerrados: ${cop(f['por_cobrar_cop'])} COP
Comprobación: facturado = cobrado + por cobrar.
Importe medio de tickets cerrados y pagados: ${f['ticket_medio_pagado_cop']:,.2f} COP
Tiempo medio de resolución de tickets cerrados: {f['horas_resolucion_media']:.2f} horas

Los cobros mensuales se agrupan por fecha de cierre en Bogotá. No se dispone de una fecha de pago bancaria separada; no se interpretan como flujo de caja por fecha de pago. Son cifras del conjunto sintético y no describen un servicio real.

ÍNDICE
El plan elegido para consultar los diez tickets en proceso más recientes contiene IXSCAN y PROJECTION_COVERED. En esta ejecución examinó 10 claves y 0 documentos completos. La referencia con recorrido natural forzado examinó 180 documentos. No es una medición de escalabilidad de Big Data.

CONCLUSIÓN INDIVIDUAL
La práctica permitió organizar clientes, equipos, técnicos y solicitudes con un modelo documental que combina referencias y servicios embebidos. Las consultas CRUD, los filtros, las uniones y las agregaciones permitieron verificar los estados de atención y separar lo facturado de lo cobrado. La validación del esquema y el control independiente ayudaron a comprobar la coherencia de los datos, mientras explain mostró el uso de un índice para una consulta concreta. Los resultados corresponden a datos sintéticos ejecutados localmente y no demuestran por sí solos rendimiento a gran escala.
'''
(ROOT/'docs/05_RESULTADOS_Y_CONCLUSION.txt').write_text(texto,encoding='utf-8')
estado={'autor':'Kevin Obed Tique Villada','grupo':'202016911_125','caso':'Sistema de soporte técnico y mantenimiento de equipos',
        'mongo_ejecutado':True,'control_independiente_correcto':True,'documentos':278,
        'sesion_fuente':session.name,'servidor':'8.0.38','shell':'2.14.2',
        'pendiente':['Publicar caso y avances en el foro','Tomar capturas de código y resultados','Publicar presentación online individual','Publicar enlace al repositorio','Coordinar investigación y consolidación grupal']}
(out/'ESTADO.json').write_text(json.dumps(estado,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
files=[p for p in ROOT.rglob('*') if p.is_file() and not any(part in ['runtime','evidencias','__pycache__'] for part in p.relative_to(ROOT).parts) and p.name!='local.json' and p.suffix!='.zip']
archive=ROOT.parent/'Tarea4_codigo_Kevin.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED) as z:
    for p in sorted(files):z.write(p,p.relative_to(ROOT).as_posix())
print(json.dumps({'archivo':str(archive),'ficheros':len(files),'bytes':archive.stat().st_size},ensure_ascii=False))
