"""Contrasta los resultados reales de MongoDB con el control independiente."""
from pathlib import Path
import json
import math
import sys

ROOT=Path(__file__).resolve().parents[1]
carpeta=Path(sys.argv[1]) if len(sys.argv)>1 else Path((ROOT/'evidencias/ultima_sesion.txt').read_text(encoding='utf-8-sig').strip())
control=json.loads((ROOT/'datos/control_independiente.json').read_text(encoding='utf-8'))
actual=json.loads((carpeta/'06_agregaciones.json').read_text(encoding='utf-8'))
integridad=json.loads((carpeta/'08_integridad.json').read_text(encoding='utf-8'))
assert actual['conteos']==control['documentos'], 'Conteos distintos'
assert {x['_id']:x['tickets'] for x in actual['estados']}==control['estados'], 'Estados distintos'
fin={x['_id']:x for x in actual['finanzas']}
exp=control['finanzas']
assert fin['pagado']['tickets']==exp['tickets_pagados']
assert fin['pendiente']['tickets']==exp['tickets_pendientes_pago']
assert fin['pagado']['importe_cop']==exp['cobrado_cop']
assert fin['pendiente']['importe_cop']==exp['por_cobrar_cop']
assert sum(x['importe_cop'] for x in actual['finanzas'])==exp['facturado_cerrados_cop']
assert math.isclose(fin['pagado']['importe_medio_cop'],exp['ticket_medio_pagado_cop'],abs_tol=1e-6)
assert math.isclose(actual['horas'][0]['horas_media'],exp['horas_resolucion_media'],abs_tol=1e-9)
assert [{'mes':x['_id'],'tickets_pagados':x['tickets_pagados'],'cobrado_cop':x['cobrado_cop']} for x in actual['meses']]==control['cobros_por_mes']
assert integridad['validacion_correcta'] and not integridad['errores']
resultado={'verificado':True,'documentos':control['total_documentos'],'tickets':control['documentos']['tickets'],
           'coinciden':['conteos','estados','importes','promedios','meses','referencias','fechas','totales_por_items'],
           'fuente':'Ejecución real de MongoDB contrastada con control Python independiente.'}
(carpeta/'09_control_independiente.json').write_text(json.dumps(resultado,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(resultado,ensure_ascii=False))
