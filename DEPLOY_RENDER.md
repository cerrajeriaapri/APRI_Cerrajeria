# Subir APRI Mercado Pago Server a Render

## 1. Subir el proyecto a GitHub

Render necesita leer el codigo desde un repositorio. Subi esta carpeta completa a GitHub:

```text
C:\Users\cerra\Documents\Codex\2026-05-23\files-mentioned-by-the-user-whatsapp
```

No subas `mercadopago-server/.env`.

## 2. Crear Web Service en Render

1. Entra a [Render](https://render.com/).
2. Crea una cuenta o inicia sesion.
3. New > Web Service.
4. Conecta GitHub y elegi el repositorio de APRI.
5. Configura:

```text
Name: apri-mercadopago-server
Root Directory: mercadopago-server
Runtime: Node
Build Command: dejar vacio
Start Command: node server.js
Health Check Path: /health
```

Segun la documentacion oficial de Render, los Web Services sirven para apps Node.js y el Start Command puede ser `node app.js` o `npm start`. Render tambien permite configurar variables de entorno desde el panel.

## 3. Variables de entorno

En Render > Environment, agrega:

```text
MERCADOPAGO_PUBLIC_KEY=APP_USR-5d1ce656-d74a-49f2-b6d7-7279bf437872
MERCADOPAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN_REAL
APP_SUCCESS_URL=https://wa.me/542615188484?text=Hola%20Cerrajeria%20APRI%2C%20ya%20realice%20el%20pago.
APP_FAILURE_URL=https://wa.me/542615188484?text=Hola%20Cerrajeria%20APRI%2C%20tuve%20un%20problema%20con%20el%20pago.
APP_PENDING_URL=https://wa.me/542615188484?text=Hola%20Cerrajeria%20APRI%2C%20mi%20pago%20quedo%20pendiente.
```

Despues de que Render te de la URL, agrega esta variable:

```text
MERCADOPAGO_WEBHOOK_URL=https://apri-cerrajeria-1.onrender.com/api/webhook
```

## 4. Configurar Webhook en Mercado Pago

En Mercado Pago Developers, en tu aplicacion:

1. Busca Webhooks o Notificaciones.
2. Agrega la URL:

```text
https://apri-cerrajeria-1.onrender.com/api/webhook
```

3. Activa el evento `payment`.

Mercado Pago envia notificaciones cuando un pago se crea o cambia de estado. El backend consulta el pago y guarda los aprobados en `orders-paid.jsonl`.

## 5. Conectar la app

Cuando tengas tu URL de Render, hay que cambiar en `app.js` el backend:

```js
const mercadoPagoBackendUrl = "https://apri-cerrajeria-1.onrender.com";
```

Luego se vuelve a compilar Android.
