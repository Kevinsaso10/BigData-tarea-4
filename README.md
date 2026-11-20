# Soporte técnico y mantenimiento de equipos con MongoDB

Kevin Obed Tique Villada. Grupo 202016911_125. Big Data, Tarea 4.

Práctica individual con MongoDB Community 8.0.38 y mongosh 2.14.2 en Windows. Cuatro colecciones y 278 documentos sintéticos. Los instaladores portables se obtienen de MongoDB y se comprueban con las huellas oficiales registradas en `config/versiones.json`.

## Inicio

```powershell
.\scripts\instalar_mongodb.ps1
.\scripts\control_mongodb.ps1 iniciar
.\scripts\ejecutar_consultas.ps1 -Paso todos
py .\scripts\verificar_resultados.py
```

La instalación local ya está preparada en este equipo. El primer paso solo se necesita para instalar o reconstruir los binarios. El servidor escucha en 127.0.0.1:27017 y utiliza una carpeta de datos de este proyecto. Los scripts no crean un servicio de inicio automático.

El script ejecutar_consultas.ps1 comprueba la conexión e inicia el motor automáticamente si está detenido. En modo -Capturas también espera Enter después de mostrar la conexión.

## Datos y modelo

| Colección | Documentos |
|---|---:|
| clientes | 30 |
| tecnicos | 8 |
| equipos | 60 |
| tickets | 180 |

El modelo completo está en `docs/02_CASO_Y_MODELO.md`. El archivo original y su SHA256 están en `datos/`. El dominio example.invalid evita usar contactos reales.

## Consultas

Los ocho archivos de `mongodb/` incluyen preparación y validación, carga, CRUD, filtros, joins, agregaciones, índices e integridad. Las salidas de cada ejecución se guardan en una carpeta nueva de `evidencias/`. La prueba CRUD elimina únicamente sus tres documentos DEMO-125 y conserva los datos de negocio.

Puede usarse otra base propia sin borrar la anterior:

```powershell
.\scripts\ejecutar_consultas.ps1 -Paso todos -NombreBD soporte_kevin_125_capturas
```

Los scripts limitan el nombre de la base al prefijo del laboratorio. Si una colección contiene datos ajenos o conteos inesperados, se detienen antes de reemplazarlos.

## Indicadores

Facturado corresponde a tickets cerrados. Cobrado exige estado cerrado y pago pagado. Por cobrar corresponde a tickets cerrados pendientes de pago. El agrupamiento mensual usa la fecha de cierre en Bogotá; no hay fecha bancaria de pago. Son convenciones del conjunto de prueba.

La comparación de índices utiliza un recorrido natural forzado como referencia y el plan que MongoDB elige después de crear un índice compuesto. Con 180 tickets no se presenta como un benchmark de Big Data.

## Evidencias académicas

Para mostrar cada resultado con una pausa para capturarlo:

```powershell
.\scripts\ejecutar_consultas.ps1 -Paso todos -Capturas
```

El modo `-Capturas` mantiene cada salida visible hasta pulsar Enter. Puede usarse también con un paso individual, por ejemplo `-Paso crud -Capturas`. Se puede subir por el texto para resultados largos. Sin esa opción, la ejecución automática sigue disponible.

Publicar el caso con `docs/01_APORTE_INICIAL_FORO.txt`. Seguir `docs/03_CAPTURAS_Y_ENTREGA.txt` para tomar las capturas reales y completar la presentación online individual. Este paquete preparado no sustituye la participación en el foro ni el informe grupal.

Las 30 capturas (0 a 29) se revisaron el 20 de noviembre de 2026. Los resultados reales de esa sesión y el control independiente se conservan en `resultados_verificados/`.

Repositorio de Tarea 4: https://github.com/Kevinsaso10/BigData-tarea-4

Presentación individual: https://docs.google.com/presentation/d/1oCLMiYtcBUR8oZHv71eMQ6p8kTLsX8W2r_DqcL-jqIM/edit

La presentación contiene el caso, el modelo, sus campos, los resultados y un anexo con las capturas originales. Su acceso público mediante enlace debe ser activado por el propietario. Este repositorio incluye el código, datos sintéticos, resultados, las 30 capturas originales y una copia PDF de la presentación.

### Consultar las evidencias

- [Presentación en PDF](presentacion/Tarea4_Presentacion_Kevin.pdf)
- [Capturas 0 a 29](evidencias/Capturas_Kevin/)
- [Modelo de datos y campos](docs/02_CASO_Y_MODELO.md)
- [Resultados y conclusión individual](docs/05_RESULTADOS_Y_CONCLUSION.txt)
- [Control independiente](resultados_verificados/09_control_independiente.json)

Para repetir la comprobación de los resultados guardados:

```powershell
py .\scripts\verificar_resultados.py .\resultados_verificados
```

## Detener

```powershell
.\scripts\control_mongodb.ps1 detener
```

Para uso académico local. Datos sintéticos y acceso limitado al equipo. No representa una instalación de producción ni una prueba de alta disponibilidad.
