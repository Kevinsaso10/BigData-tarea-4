# Sistema de soporte técnico y mantenimiento de equipos

Autor: Kevin Obed Tique Villada. Big Data, grupo 202016911_125. Tarea 4.

## Problema y objetivo

Un servicio de soporte necesita relacionar las solicitudes con los propietarios de los equipos y con los técnicos responsables. Debe consultar el estado de atención, conocer el trabajo pendiente y distinguir lo facturado de lo cobrado. El objetivo del ejercicio es implementar ese modelo documental y obtener indicadores mediante consultas MongoDB.

Los datos son sintéticos y no representan personas, técnicos, empresas o cobros reales. El tamaño del conjunto sirve para comprobar las operaciones solicitadas; no demuestra escalabilidad de Big Data.

## Colecciones y campos

| Colección | Documentos | Campos principales |
|---|---:|---|
| clientes | 30 | _id, nombre, ciudad, segmento, correo, origen |
| tecnicos | 8 | _id, nombre, especialidades, activo, origen |
| equipos | 60 | _id, cliente_id, tipo, marca, serie, garantia, origen |
| tickets | 180 | _id, cliente_id, equipo_id, tecnico_id, estado, prioridad, fecha_apertura, fecha_cierre, estado_pago, servicios, desplazamiento_cop, total_cop, etiquetas, revisiones, origen |

Se almacenan 278 documentos de negocio. Cada cliente puede tener varios equipos y tickets. Cada equipo puede aparecer en varios tickets. Un técnico puede atender varios tickets. Las referencias se comprueban en el script `08_integridad.js`; MongoDB no añade automáticamente claves foráneas.

## Datos embebidos y referencias

El arreglo `servicios` se incorpora al ticket porque sus líneas se consultan junto con la solicitud. Cada línea conserva el nombre del servicio, la cantidad y su precio unitario en COP. Los precios son una instantánea del servicio registrado. El total del ticket se calcula como la suma de cantidad por precio de sus líneas, más el desplazamiento.

Clientes, equipos y técnicos se mantienen en colecciones separadas para evitar copiar sus datos completos en cada ticket. Las consultas con `$lookup` recuperan la información relacionada. Las especialidades y etiquetas son arreglos que permiten demostrar consultas sobre datos multivaluados.

## Reglas de calidad

- Los importes de prueba se expresan en pesos colombianos enteros y no negativos.
- La validación JSON Schema exige campos y tipos de datos. Una expresión adicional verifica el total de las líneas y el desplazamiento.
- El control de integridad verifica referencias, propietario del equipo, fechas y combinación de estado de atención y pago.
- Un ticket cerrado tiene fecha de cierre posterior o igual a su apertura y pago `pagado` o `pendiente`.
- Un ticket que no está cerrado tiene fecha de cierre nula y estado de pago `no_aplica` en este modelo.
- El correo y la serie del equipo tienen índices únicos. Los correos usan el dominio reservado example.invalid.

## Definición de indicadores

Facturado corresponde al total de los tickets cerrados. Cobrado corresponde únicamente a tickets cerrados y pagados. Por cobrar corresponde a tickets cerrados con pago pendiente. Estas son convenciones operativas del conjunto de prueba, no una política contable universal.

El promedio de resolución usa todos los tickets cerrados, incluidos los pendientes de pago, y mide horas transcurridas entre apertura y cierre. Los cobros mensuales se agrupan por fecha de cierre en America/Bogota; el modelo no registra una fecha de pago separada, por lo que no describe el flujo de caja por fecha bancaria.

## Operaciones y alcance

Los scripts cubren creación y validación, insertMany, insertOne, findOne, find, actualización individual y múltiple, eliminación individual y múltiple, filtros de comparación, arreglos, expresiones regulares, joins con `$lookup`, conteos, sumas, promedios y revisión de índices con explain.

La prueba CRUD trabaja con tres tickets identificados como DEMO-125. Los crea, actualiza y elimina en la misma sesión. Los 180 tickets de negocio permanecen y las agregaciones posteriores se ejecutan sobre el mismo conjunto. Esta decisión permite repetir el ejercicio y comprobar que las cifras conservan su base de comparación.
