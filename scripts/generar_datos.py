"""Genera datos sintéticos y controles independientes, sin dependencias externas."""
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'datos'
DATA.mkdir(exist_ok=True)
ORIGEN = 'sintetico_kevin_125_v1'
state = 125


def rand(n):
    global state
    state = (1664525 * state + 1013904223) % 2**32
    return state % n


def fecha(value):
    return value.isoformat(timespec='seconds').replace('+00:00', 'Z')


ciudades = ['Bogotá', 'Medellín', 'Cali', 'Ibagué', 'Pereira', 'Barranquilla']
clientes = [{'_id': f'CLI-{i:03}', 'nombre': f'Cliente de prueba {i:03}',
             'ciudad': ciudades[(i-1) % len(ciudades)], 'segmento': ['persona', 'pyme', 'educativo'][(i-1) % 3],
             'correo': f'cliente{i:03}@example.invalid', 'origen': ORIGEN} for i in range(1, 31)]
tecnicos = [{'_id': f'TEC-{i:02}', 'nombre': f'Técnico de prueba {i:02}',
             'especialidades': ['hardware', 'software', 'redes'], 'activo': True,
             'origen': ORIGEN} for i in range(1, 9)]
equipos = [{'_id': f'EQ-{i:03}', 'cliente_id': clientes[(i-1) % 30]['_id'],
            'tipo': ['portatil', 'escritorio', 'impresora', 'router'][(i-1) % 4],
            'marca': ['Marca Alfa', 'Marca Beta', 'Marca Gamma'][(i-1) % 3],
            'serie': f'SIM-125-{i:04}', 'garantia': i % 3 == 0, 'origen': ORIGEN} for i in range(1, 61)]
catalogo = [('diagnostico', 45000), ('mantenimiento', 95000), ('instalacion_software', 125000),
            ('respaldo_datos', 85000), ('reparacion_hardware', 185000), ('configuracion_red', 115000)]
estados = ['abierto', 'en_proceso', 'espera_repuesto', 'cerrado', 'cerrado', 'cerrado', 'cerrado', 'cancelado']
tickets = []
for i in range(180):
    eq = equipos[rand(len(equipos))]
    servicio, precio = catalogo[rand(len(catalogo))]
    apertura = datetime(2026, 1, 1, 14, tzinfo=timezone.utc) + timedelta(days=(i * 7) % 288, hours=rand(8))
    estado = estados[i % len(estados)]
    cerrado = estado == 'cerrado'
    detalles = [{'servicio': servicio, 'cantidad': 1, 'precio_unitario_cop': precio}]
    if i % 4 == 0:
        detalles.append({'servicio': 'insumo_repuesto', 'cantidad': 1 + i % 2, 'precio_unitario_cop': 30000 + 5000*(i % 5)})
    desplazamiento = 15000 if i % 5 == 0 else 0
    total = sum(x['cantidad']*x['precio_unitario_cop'] for x in detalles) + desplazamiento
    cierre = apertura + timedelta(hours=3 + rand(90)) if cerrado else None
    tickets.append({'_id': f'TK-{i+1:04}', 'cliente_id': eq['cliente_id'], 'equipo_id': eq['_id'],
                    'tecnico_id': tecnicos[rand(len(tecnicos))]['_id'], 'estado': estado,
                    'prioridad': ['baja', 'media', 'alta'][i % 3], 'fecha_apertura': fecha(apertura),
                    'fecha_cierre': fecha(cierre) if cierre else None,
                    'estado_pago': ('pendiente' if i % 5 == 0 else 'pagado') if cerrado else 'no_aplica',
                    'servicios': detalles, 'desplazamiento_cop': desplazamiento, 'total_cop': total,
                    'etiquetas': ['prueba', 'domicilio' if desplazamiento else 'taller'],
                    'revisiones': 0, 'origen': ORIGEN})

dataset = {'clientes': clientes, 'tecnicos': tecnicos, 'equipos': equipos, 'tickets': tickets}
dataset_path = DATA / 'soporte_sintetico.json'
dataset_path.write_text(json.dumps(dataset, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

conteos = {k: len(v) for k, v in dataset.items()}
cerrados = [t for t in tickets if t['estado'] == 'cerrado']
pagados = [t for t in cerrados if t['estado_pago'] == 'pagado']
pendientes_pago = [t for t in cerrados if t['estado_pago'] == 'pendiente']
duraciones = [(datetime.fromisoformat(t['fecha_cierre']) - datetime.fromisoformat(t['fecha_apertura'])).total_seconds()/3600 for t in cerrados]
por_mes = defaultdict(lambda: {'tickets_pagados': 0, 'cobrado_cop': 0})
for t in pagados:
    # Los cierres almacenados están en UTC; el agrupamiento del laboratorio usa Bogotá.
    mes = (datetime.fromisoformat(t['fecha_cierre']) - timedelta(hours=5)).strftime('%Y-%m')
    por_mes[mes]['tickets_pagados'] += 1
    por_mes[mes]['cobrado_cop'] += t['total_cop']
control = {'origen': ORIGEN, 'semilla': 125, 'documentos': conteos, 'total_documentos': sum(conteos.values()),
           'estados': dict(sorted(Counter(t['estado'] for t in tickets).items())),
           'finanzas': {'tickets_cerrados': len(cerrados), 'tickets_pagados': len(pagados),
                        'tickets_pendientes_pago': len(pendientes_pago),
                        'facturado_cerrados_cop': sum(t['total_cop'] for t in cerrados),
                        'cobrado_cop': sum(t['total_cop'] for t in pagados),
                        'por_cobrar_cop': sum(t['total_cop'] for t in pendientes_pago),
                        'ticket_medio_pagado_cop': sum(t['total_cop'] for t in pagados)/len(pagados),
                        'horas_resolucion_media': sum(duraciones)/len(duraciones)},
           'cobros_por_mes': [{'mes': m, **x} for m,x in sorted(por_mes.items())],
           'alcance': 'Datos sintéticos. Importes enteros en COP. Cerrado define facturado; cerrado y pagado define cobrado.'}
(DATA / 'control_independiente.json').write_text(json.dumps(control, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
manifest = {'archivo': dataset_path.name, 'sha256': hashlib.sha256(dataset_path.read_bytes()).hexdigest(),
            'origen': ORIGEN, 'conteos': conteos, 'fecha_preparacion': '2026-11-19'}
(DATA / 'manifiesto.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps({'documentos': conteos, 'total': sum(conteos.values()), 'sha256': manifest['sha256']}, ensure_ascii=False))
