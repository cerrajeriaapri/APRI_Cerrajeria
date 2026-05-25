# APRI Mercado Pago Server

Este backend crea el link de pago de Mercado Pago para el carrito PRIVE.

## Configuracion

1. Copia `.env.example` y renombralo como `.env`.
2. En `.env`, pega tu `MERCADOPAGO_ACCESS_TOKEN`.
3. No compartas el `.env` y no lo subas a internet.

## Probar local

```powershell
cd C:\Users\cerra\Documents\Codex\2026-05-23\files-mentioned-by-the-user-whatsapp\mercadopago-server
npm start
```

El servidor queda en:

```text
http://localhost:3001
```

Para emulador Android, la app usa:

```text
http://10.0.2.2:3001
```

Para un celular real o Play Store, este backend debe estar publicado en una URL HTTPS.
