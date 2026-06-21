# API Reference — Pablo Mella Backend

## Patrón general de respuestas

El backend NO usa wrapper estándar. Tres tipos de respuesta:

- **Lista**: array directo `[]` → usar `data` directamente
- **Detalle con partes**: objeto con keys `{ edificio, apartamentos }` → destructurar
- **Con mensaje**: `{ mensaje: "...", entidad: {} }` → usar `data.entidad`

---

## AUTH `/api/auth`

### POST /login — RESPUESTA PLANA (caso especial)

```json
{ "_id", "nombre", "email", "rol", "apartamentoId", "esDirectiva", "cargoDirectiva", "telefono", "token" }
```

**Frontend:** `const { token, ...usuario } = data`

### POST /register — igual que login

### GET /perfil — objeto usuario con populate de apartamento+edificio

### PUT /cambiar-password — `{ mensaje }`

---

## EDIFICIOS `/api/edificios`

| Endpoint | Respuesta                    | Frontend                 |
| -------- | ---------------------------- | ------------------------ |
| GET /    | array directo                | `const edificios = data` |
| GET /:id | `{ edificio, apartamentos }` | destructurar             |
| POST /   | `{ mensaje, edificio }`      | `data.edificio`          |

---

## APARTAMENTOS `/api/apartamentos`

| Endpoint                   | Respuesta                  | Frontend            |
| -------------------------- | -------------------------- | ------------------- |
| GET /edificio/:id          | array directo              | `const apts = data` |
| GET /disponibles           | array directo              | `const apts = data` |
| GET /:id                   | objeto directo             | `const apt = data`  |
| PUT /:id/asignar-residente | `{ mensaje, apartamento }` | `data.apartamento`  |

---

## CUOTAS `/api/cuotas`

| Endpoint                | Respuesta                                                                                    | Frontend              |
| ----------------------- | -------------------------------------------------------------------------------------------- | --------------------- |
| GET /                   | array directo                                                                                | `const cuotas = data` |
| GET /:id                | `{ cuota, pagos, resumen }`                                                                  | destructurar          |
| GET /resumen/:mes/:anio | `{ mes, anio, cuota, totalRecaudado, totalApartamentos, totalPagaron, totalMorosos, pagos }` | destructurar          |
| POST /                  | `{ mensaje, cuota }`                                                                         | `data.cuota`          |

---

## PAGOS `/api/pagos`

| Endpoint             | Respuesta                                                             | Frontend             |
| -------------------- | --------------------------------------------------------------------- | -------------------- |
| GET /pendientes      | array directo con populate                                            | `const pagos = data` |
| GET /mispagos        | `{ pagos, resumen: { esMoroso, mesesDeuda, multasPendientes } }`      | destructurar         |
| GET /moroso/:id      | `{ esMoroso, mesesDeuda, multasPendientes, detalle, mensaje }`        | destructurar         |
| GET /apartamento/:id | array directo                                                         | `const pagos = data` |
| POST /               | FormData + comprobante obligatorio                                    | `{ mensaje, pago }`  |
| PUT /:id/verificar   | `{ estado, motivoRechazo }` ⚠️ motivoRechazo obligatorio si rechazado | `{ mensaje, pago }`  |

---

## GASTOS `/api/gastos`

| Endpoint     | Respuesta                                                        | Frontend             |
| ------------ | ---------------------------------------------------------------- | -------------------- |
| GET /        | `{ gastos, totalGastos }`                                        | destructurar         |
| GET /resumen | `{ resumen: [{_id: categoria, total, cantidad}], totalGeneral }` | destructurar         |
| POST /       | FormData, factura opcional                                       | `{ mensaje, gasto }` |
| DELETE /:id  | `{ mensaje }`                                                    | —                    |

---

## ANUNCIOS `/api/anuncios`

| Endpoint            | Respuesta              | Frontend                   |
| ------------------- | ---------------------- | -------------------------- |
| GET /               | array directo          | `const anuncios = data`    |
| GET /emergencias    | array directo          | `const emergencias = data` |
| POST /              | `{ mensaje, anuncio }` | `data.anuncio`             |
| PUT /:id/desactivar | `{ mensaje, anuncio }` | —                          |
| DELETE /:id         | `{ mensaje }`          | —                          |

---

## MANTENIMIENTO `/api/mantenimiento`

| Endpoint             | Respuesta                  | Frontend                   |
| -------------------- | -------------------------- | -------------------------- |
| GET /                | array directo con populate | `const solicitudes = data` |
| GET /mis-solicitudes | array directo              | `const solicitudes = data` |
| POST /               | FormData, foto opcional    | `{ mensaje, solicitud }`   |
| PUT /:id             | `{ estado, nota }`         | `{ mensaje, solicitud }`   |

---

## INCIDENCIAS `/api/incidencias`

| Endpoint | Respuesta                                                              | Frontend                  |
| -------- | ---------------------------------------------------------------------- | ------------------------- |
| GET /    | array directo ⚠️ anónimas tienen `reportadoPor: { nombre: "Anónimo" }` | `const inc = data`        |
| POST /   | JSON `{ descripcion, anonimo }`                                        | `{ mensaje, incidencia }` |
| PUT /:id | `{ estado }`                                                           | `{ mensaje, incidencia }` |

---

## MULTAS `/api/multas`

| Endpoint        | Respuesta                                    | Frontend              |
| --------------- | -------------------------------------------- | --------------------- |
| GET /           | array directo con populate                   | `const multas = data` |
| GET /mis-multas | array directo                                | `const multas = data` |
| POST /          | JSON `{ apartamentoId, descripcion, monto }` | `{ mensaje, multa }`  |
| PUT /:id/pagar  | FormData ⚠️ comprobantePago obligatorio      | `{ mensaje, multa }`  |
| PUT /:id/anular | sin body                                     | `{ mensaje, multa }`  |

---

## RESERVAS `/api/reservas`

| Endpoint           | Respuesta                                                                    | Frontend                |
| ------------------ | ---------------------------------------------------------------------------- | ----------------------- |
| GET /              | array directo con populate                                                   | `const reservas = data` |
| GET /mis-reservas  | array directo                                                                | `const reservas = data` |
| GET /calendario    | array directo `{ espacio, fecha, horaInicio, horaFin, estado }`              | `const dias = data`     |
| POST /             | JSON `{ espacio, fecha, horaInicio, horaFin, descripcion }` ⚠️ 403 si moroso | `{ mensaje, reserva }`  |
| PUT /:id/verificar | `{ estado, motivoRechazo }` ⚠️ motivoRechazo obligatorio si rechazada        | `{ mensaje, reserva }`  |
| PUT /:id/cancelar  | sin body                                                                     | `{ mensaje, reserva }`  |

---

## ASAMBLEAS `/api/asambleas`

| Endpoint      | Respuesta                                                            | Frontend                 |
| ------------- | -------------------------------------------------------------------- | ------------------------ |
| GET /         | array directo (sin votaciones)                                       | `const asambleas = data` |
| GET /:id      | `{ asamblea, votaciones }`                                           | destructurar             |
| POST /        | JSON `{ titulo, fecha, hora, lugar, agenda: [] }` todos obligatorios | `{ mensaje, asamblea }`  |
| PUT /:id/acta | FormData con `acta`                                                  | `{ mensaje, asamblea }`  |

---

## VOTACIONES `/api/votaciones`

| Endpoint            | Respuesta                                                      | Frontend                                        |
| ------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| GET /:id/resultados | `{ votacion, totalVotos, resultados: {"Sí":3}, yaVote: true }` | destructurar                                    |
| POST /              | JSON `{ asambleaId, pregunta, opciones: [] }`                  | `{ mensaje, votacion }`                         |
| POST /:id/votar     | JSON `{ opcion }` ⚠️ falla si ya votó                          | `{ mensaje }`                                   |
| PUT /:id/cerrar     | sin body                                                       | `{ mensaje, pregunta, totalVotos, resultados }` |

---

## DOCUMENTOS `/api/documentos`

| Endpoint    | Respuesta                                         | Frontend                 |
| ----------- | ------------------------------------------------- | ------------------------ |
| GET /       | array directo                                     | `const docs = data`      |
| POST /      | FormData `{ titulo, descripcion, tipo, archivo }` | `{ mensaje, documento }` |
| DELETE /:id | `{ mensaje }`                                     | —                        |

---

## ⚠️ Reglas críticas

1. **Login**: `const { token, ...usuario } = data` — único endpoint con respuesta plana
2. **Listas**: siempre `data` directo, nunca `data.data`
3. **FormData**: pagos, multas/pagar, mantenimiento, gastos, documentos, actas
4. **motivoRechazo obligatorio** al rechazar pagos y reservas
5. **403** al reservar si residente es moroso
6. **apartamentoId** viene como objeto populado en login, no solo el ID
