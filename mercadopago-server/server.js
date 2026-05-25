import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

const port = Number(process.env.PORT || 3001);
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const ordersFile = path.join(process.cwd(), "orders-paid.jsonl");

function sendJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  });
  response.end(JSON.stringify(data));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Pedido demasiado grande"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function normalizeItems(items = []) {
  return items
    .map((item) => ({
      art: String(item.art || "").trim(),
      name: String(item.name || "").trim(),
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
    }))
    .filter((item) => item.art && item.name && item.quantity > 0 && item.price > 0);
}

async function createPreference(order) {
  if (!accessToken || accessToken.includes("PEGAR_ACA")) {
    throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN en mercadopago-server/.env");
  }

  const items = normalizeItems(order.items);
  if (!items.length) throw new Error("El carrito esta vacio");

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const highestItemPrice = items.reduce((highest, item) => Math.max(highest, item.price), 0);
  const delivery = Math.round(highestItemPrice * 0.2);
  const total = subtotal + delivery;
  const address = String(order.address || "domicilio a confirmar").trim();
  const reference = `APRI-${Date.now()}`;

  const preference = {
    items: [
      ...items.map((item) => ({
        id: `PRIVE-${item.art}`,
        title: `PRIVE ART. ${item.art} - ${item.name}`,
        quantity: item.quantity,
        currency_id: "ARS",
        unit_price: item.price,
      })),
      {
        id: "DOMICILIO-20",
        title: "Domicilio 20%",
        quantity: 1,
        currency_id: "ARS",
        unit_price: delivery,
      },
    ],
    external_reference: reference,
    statement_descriptor: "APRI CERRAJERIA",
    back_urls: {
      success: process.env.APP_SUCCESS_URL || "https://wa.me/542615188484",
      failure: process.env.APP_FAILURE_URL || "https://wa.me/542615188484",
      pending: process.env.APP_PENDING_URL || "https://wa.me/542615188484",
    },
    auto_return: "approved",
    metadata: {
      address,
      subtotal,
      delivery,
      total,
      items: items.map((item) => `${item.art} x ${item.quantity}`).join(", "),
    },
  };

  if (process.env.MERCADOPAGO_WEBHOOK_URL) {
    preference.notification_url = process.env.MERCADOPAGO_WEBHOOK_URL;
  }

  const mercadoPagoResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preference),
  });

  const data = await mercadoPagoResponse.json();
  if (!mercadoPagoResponse.ok) {
    console.error("Mercado Pago error:", JSON.stringify(data, null, 2));
    throw new Error(data.message || data.error || "Mercado Pago rechazo la preferencia");
  }

  return {
    id: data.id,
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
    reference,
    subtotal,
    delivery,
    total,
  };
}

async function getMercadoPagoPayment(paymentId) {
  if (!paymentId) return null;
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();
  if (!response.ok) {
    console.error("Mercado Pago payment lookup error:", JSON.stringify(data, null, 2));
    return null;
  }
  return data;
}

async function handleWebhook(request, response) {
  const body = await readBody(request);
  let payload = {};
  try {
    payload = body ? JSON.parse(body) : {};
  } catch {
    payload = {};
  }

  const url = new URL(request.url, `http://localhost:${port}`);
  const paymentId =
    payload?.data?.id ||
    payload?.id ||
    url.searchParams.get("data.id") ||
    url.searchParams.get("id");
  const payment = await getMercadoPagoPayment(paymentId);
  const approved = payment?.status === "approved";

  const record = {
    date: new Date().toISOString(),
    approved,
    payment_id: paymentId || null,
    status: payment?.status || null,
    status_detail: payment?.status_detail || null,
    external_reference: payment?.external_reference || null,
    transaction_amount: payment?.transaction_amount || null,
    metadata: payment?.metadata || null,
    payload,
  };

  fs.appendFileSync(ordersFile, JSON.stringify(record) + "\n");
  if (approved) {
    console.log("PAGO APROBADO:", JSON.stringify(record, null, 2));
  } else {
    console.log("Webhook recibido:", JSON.stringify(record, null, 2));
  }
  sendJson(response, 200, { ok: true });
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") return sendJson(response, 200, { ok: true });
  if (request.method === "GET" && request.url === "/health") return sendJson(response, 200, { ok: true });

  try {
    if (request.method === "POST" && request.url === "/api/create-preference") {
      const body = await readBody(request);
      const order = JSON.parse(body || "{}");
      const result = await createPreference(order);
      return sendJson(response, 200, result);
    }

    if (request.method === "POST" && request.url?.startsWith("/api/webhook")) {
      return handleWebhook(request, response);
    }

    sendJson(response, 404, { error: "No encontrado" });
  } catch (error) {
    sendJson(response, 400, { error: error.message || "Error inesperado" });
  }
});

server.listen(port, () => {
  console.log(`APRI Mercado Pago server listo en http://localhost:${port}`);
});
