const phone = "542615188484";
const appShell = document.querySelector(".phone-shell");
const currentTime = document.querySelector("#currentTime");
const detailTriggers = document.querySelectorAll("[data-detail]");
const closeDetailButtons = document.querySelectorAll("[data-close-detail]");
const detailPanels = document.querySelectorAll(".detail-panel");
const lockPhotoInput = document.querySelector("#lockPhotoInput");
const lockPhotoPreview = document.querySelector("#lockPhotoPreview");
const homeOpenPhotoInput = document.querySelector("#homeOpenPhotoInput");
const homeOpenPhotoPreview = document.querySelector("#homeOpenPhotoPreview");
const homeOpenWhatsapp = document.querySelector("#homeOpenWhatsapp");
const homeReasonOptions = document.querySelectorAll("[data-home-reason]");
const vehicleInput = document.querySelector("#vehicleInput");
const vehicleYearInput = document.querySelector("#vehicleYearInput");
const vehicleWhatsapp = document.querySelector("#vehicleWhatsapp");
const safePhotoInput = document.querySelector("#safePhotoInput");
const safePhotoPreview = document.querySelector("#safePhotoPreview");
const safeWhatsapp = document.querySelector("#safeWhatsapp");
const safeReasonOptions = document.querySelectorAll("[data-safe-reason]");
const homeKeyPhotoInput = document.querySelector("#homeKeyPhotoInput");
const homeKeyPhotoPreview = document.querySelector("#homeKeyPhotoPreview");
const carKeyVehicleInput = document.querySelector("#carKeyVehicleInput");
const carKeyYearInput = document.querySelector("#carKeyYearInput");
const carKeyPhotoInput = document.querySelector("#carKeyPhotoInput");
const carKeyPhotoPreview = document.querySelector("#carKeyPhotoPreview");
const carKeyWhatsapp = document.querySelector("#carKeyWhatsapp");
const smartDoorPhotoInput = document.querySelector("#smartDoorPhotoInput");
const smartDoorPhotoPreview = document.querySelector("#smartDoorPhotoPreview");
const smartLockPhotoInput = document.querySelector("#smartLockPhotoInput");
const smartLockPhotoPreview = document.querySelector("#smartLockPhotoPreview");
const smartLockWhatsapp = document.querySelector("#smartLockWhatsapp");
const smartLockReasonOptions = document.querySelectorAll("[data-smart-lock-reason]");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartSubtotal = document.querySelector("#cartSubtotal");
const cartDelivery = document.querySelector("#cartDelivery");
const cartTotal = document.querySelector("#cartTotal");
const cartAddress = document.querySelector("#cartAddress");
const cartCheckout = document.querySelector("#cartCheckout");
const mercadoPagoBackendUrl = "https://apri-cerrajeria-1.onrender.com";

let homeOpenReason = "perdida de llaves";
let safeReason = "apertura sola";
let smartLockReason = "solo instalar";
const cart = [];

function updateCurrentTime() {
  if (!currentTime) return;
  const now = new Date();
  currentTime.textContent = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

function whatsappUrl(service) {
  const message = `Hola Cerrajeria APRI, necesito ${service}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function formatMoney(value) {
  return `$ ${Math.round(value).toLocaleString("es-AR")}`;
}

function orderTotals() {
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const delivery = Math.round(subtotal * 0.2);
  return { subtotal, delivery, total: subtotal + delivery };
}

updateCurrentTime();
setInterval(updateCurrentTime, 15000);

document.querySelectorAll("[data-service]").forEach((link) => {
  if (link.dataset.detail) return;
  if (link.dataset.cartArt) return;
  const service = link.dataset.service || "ayuda de cerrajeria";
  link.href = whatsappUrl(service);
  link.target = "_blank";
  link.rel = "noreferrer";
});

function updateCart() {
  if (!cartItems || !cartCount || !cartSubtotal || !cartDelivery || !cartTotal || !cartCheckout) return;

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const { subtotal, delivery, total } = orderTotals();

  cartCount.textContent = `${itemCount} ${itemCount === 1 ? "producto" : "productos"}`;
  cartSubtotal.textContent = formatMoney(subtotal);
  cartDelivery.textContent = formatMoney(delivery);
  cartTotal.textContent = formatMoney(total);

  if (!cart.length) {
    cartItems.innerHTML = '<p class="cart-empty">Tocá una cerradura para agregarla al pedido.</p>';
    cartCheckout.classList.add("disabled");
    cartCheckout.removeAttribute("href");
    cartCheckout.setAttribute("aria-disabled", "true");
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item, index) => `
        <div class="cart-item">
          <div>
            <strong>ART. ${item.art}</strong>
            <span>${item.name}</span>
            <small>${formatMoney(item.price)} x ${item.quantity}</small>
          </div>
          <div class="cart-qty">
            <button type="button" data-cart-minus="${index}" aria-label="Quitar uno">-</button>
            <b>${item.quantity}</b>
            <button type="button" data-cart-plus="${index}" aria-label="Agregar uno">+</button>
          </div>
        </div>`
    )
    .join("");

  const address = cartAddress?.value.trim() || "domicilio a confirmar";
  const order = cart
    .map((item) => `ART. ${item.art} - ${item.name} x ${item.quantity}: ${formatMoney(item.price * item.quantity)}`)
    .join("; ");
  cartCheckout.href = whatsappUrl(
    `comprar estos productos PRIVE: ${order}. Subtotal: ${formatMoney(subtotal)}. Domicilio 20%: ${formatMoney(delivery)}. Total: ${formatMoney(total)}. Domicilio: ${address}. Quiero coordinar pago y entrega`
  );
  cartCheckout.target = "_blank";
  cartCheckout.rel = "noreferrer";
  cartCheckout.classList.remove("disabled");
  cartCheckout.setAttribute("aria-disabled", "false");
}

document.querySelectorAll("[data-cart-art]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const art = button.dataset.cartArt;
    const name = button.dataset.cartName;
    const price = Number(button.dataset.cartPrice || 0);
    if (!art || !name || !price) return;

    const existing = cart.find((item) => item.art === art);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ art, name, price, quantity: 1 });
    }

    button.classList.add("added");
    button.textContent = "Agregado al carrito";
    setTimeout(() => {
      button.classList.remove("added");
      button.textContent = `Agregar / ${formatMoney(price)}`;
    }, 1100);
    updateCart();
    document.querySelector("#priveCart")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

cartItems?.addEventListener("click", (event) => {
  const minus = event.target.closest("[data-cart-minus]");
  const plus = event.target.closest("[data-cart-plus]");
  if (!minus && !plus) return;

  const index = Number((minus || plus).dataset.cartMinus ?? (minus || plus).dataset.cartPlus);
  const item = cart[index];
  if (!item) return;

  if (plus) item.quantity += 1;
  if (minus) item.quantity -= 1;
  if (item.quantity <= 0) cart.splice(index, 1);
  updateCart();
});

cartAddress?.addEventListener("input", updateCart);
updateCart();

async function startMercadoPagoCheckout() {
  const address = cartAddress?.value.trim();
  if (!cart.length) return;
  if (!address) {
    alert("Escribi el domicilio de entrega antes de finalizar la compra.");
    cartAddress?.focus();
    return;
  }

  cartCheckout.classList.add("loading");
  cartCheckout.textContent = "Abriendo Mercado Pago...";

  try {
    const response = await fetch(`${mercadoPagoBackendUrl}/api/create-preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, address }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se pudo crear el pago");

    const paymentUrl = data.init_point || data.sandbox_init_point;
    if (!paymentUrl) throw new Error("Mercado Pago no devolvio link de pago");
    window.location.href = paymentUrl;
  } catch (error) {
    const { subtotal, delivery, total } = orderTotals();
    const order = cart
      .map((item) => `ART. ${item.art} - ${item.name} x ${item.quantity}: ${formatMoney(item.price * item.quantity)}`)
      .join("; ");
    window.location.href = whatsappUrl(
      `comprar estos productos PRIVE: ${order}. Subtotal: ${formatMoney(subtotal)}. Domicilio 20%: ${formatMoney(delivery)}. Total: ${formatMoney(total)}. Domicilio: ${address}. No pude abrir Mercado Pago automaticamente, quiero coordinar pago`
    );
  } finally {
    cartCheckout.classList.remove("loading");
    cartCheckout.textContent = "Finalizar compra";
  }
}

cartCheckout?.addEventListener("click", (event) => {
  if (cartCheckout.classList.contains("disabled")) return;
  event.preventDefault();
  startMercadoPagoCheckout();
});

detailTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    const panel = document.querySelector(trigger.getAttribute("href"));
    detailPanels.forEach((detailPanel) => detailPanel.classList.remove("active-detail"));
    panel?.classList.add("active-detail");
    appShell.classList.add("detail-open");
    appShell.scrollTo({ top: 0, behavior: "smooth" });
  });
});

closeDetailButtons.forEach((button) => {
  button.addEventListener("click", () => {
    appShell.classList.remove("detail-open");
    detailPanels.forEach((detailPanel) => detailPanel.classList.remove("active-detail"));
  });
});

lockPhotoInput?.addEventListener("change", () => {
  const file = lockPhotoInput.files?.[0];
  if (!file) return;

  lockPhotoPreview.src = URL.createObjectURL(file);
  lockPhotoPreview.classList.add("has-photo");
});

function updateHomeOpenWhatsapp() {
  if (!homeOpenWhatsapp) return;
  homeOpenWhatsapp.href = whatsappUrl(
    `apertura casa porque ${homeOpenReason}. Ya tengo una foto de la boca llave para enviar por WhatsApp`
  );
}

homeReasonOptions.forEach((button) => {
  button.addEventListener("click", () => {
    homeOpenReason = button.dataset.homeReason;
    homeReasonOptions.forEach((option) => option.classList.remove("active"));
    button.classList.add("active");
    updateHomeOpenWhatsapp();
  });
});

homeOpenPhotoInput?.addEventListener("change", () => {
  const file = homeOpenPhotoInput.files?.[0];
  if (!file) return;

  homeOpenPhotoPreview.src = URL.createObjectURL(file);
  homeOpenPhotoPreview.classList.add("has-photo");
});

updateHomeOpenWhatsapp();

function updateVehicleWhatsapp() {
  if (!vehicleWhatsapp) return;
  const vehicle = vehicleInput?.value.trim() || "mi vehiculo";
  const year = vehicleYearInput?.value.trim() || "año a confirmar";
  vehicleWhatsapp.href = whatsappUrl(
    `apertura auto. Vehiculo: ${vehicle}. Año: ${year}. Voy a enviar mi ubicacion por WhatsApp`
  );
}

vehicleInput?.addEventListener("input", updateVehicleWhatsapp);
vehicleYearInput?.addEventListener("input", updateVehicleWhatsapp);

updateVehicleWhatsapp();

function updateSafeWhatsapp() {
  if (!safeWhatsapp) return;
  safeWhatsapp.href = whatsappUrl(
    `apertura de caja fuerte, ${safeReason}. Ya tengo una foto del frente y voy a enviar mi ubicacion por WhatsApp`
  );
}

safeReasonOptions.forEach((button) => {
  button.addEventListener("click", () => {
    safeReason = button.dataset.safeReason;
    safeReasonOptions.forEach((option) => option.classList.remove("active"));
    button.classList.add("active");
    updateSafeWhatsapp();
  });
});

safePhotoInput?.addEventListener("change", () => {
  const file = safePhotoInput.files?.[0];
  if (!file) return;

  safePhotoPreview.src = URL.createObjectURL(file);
  safePhotoPreview.classList.add("has-photo");
});

updateSafeWhatsapp();

homeKeyPhotoInput?.addEventListener("change", () => {
  const file = homeKeyPhotoInput.files?.[0];
  if (!file) return;

  homeKeyPhotoPreview.src = URL.createObjectURL(file);
  homeKeyPhotoPreview.classList.add("has-photo");
});

function updateCarKeyWhatsapp() {
  if (!carKeyWhatsapp) return;
  const vehicle = carKeyVehicleInput?.value.trim() || "mi vehiculo";
  const year = carKeyYearInput?.value.trim() || "año a confirmar";
  carKeyWhatsapp.href = whatsappUrl(
    `copia llave vehiculo. Vehiculo: ${vehicle}. Año: ${year}. Voy a enviar foto de la llave que tengo`
  );
}

carKeyVehicleInput?.addEventListener("input", updateCarKeyWhatsapp);
carKeyYearInput?.addEventListener("input", updateCarKeyWhatsapp);

carKeyPhotoInput?.addEventListener("change", () => {
  const file = carKeyPhotoInput.files?.[0];
  if (!file) return;

  carKeyPhotoPreview.src = URL.createObjectURL(file);
  carKeyPhotoPreview.classList.add("has-photo");
});

updateCarKeyWhatsapp();

function updateSmartLockWhatsapp() {
  if (!smartLockWhatsapp) return;
  smartLockWhatsapp.href = whatsappUrl(
    `cerradura inteligente, ${smartLockReason}. Voy a enviar foto de la puerta, foto de la cerradura comprada y mi ubicacion por WhatsApp`
  );
}

smartLockReasonOptions.forEach((button) => {
  button.addEventListener("click", () => {
    smartLockReason = button.dataset.smartLockReason;
    smartLockReasonOptions.forEach((option) => option.classList.remove("active"));
    button.classList.add("active");
    updateSmartLockWhatsapp();
  });
});

smartDoorPhotoInput?.addEventListener("change", () => {
  const file = smartDoorPhotoInput.files?.[0];
  if (!file) return;

  smartDoorPhotoPreview.src = URL.createObjectURL(file);
  smartDoorPhotoPreview.classList.add("has-photo");
});

smartLockPhotoInput?.addEventListener("change", () => {
  const file = smartLockPhotoInput.files?.[0];
  if (!file) return;

  smartLockPhotoPreview.src = URL.createObjectURL(file);
  smartLockPhotoPreview.classList.add("has-photo");
});

updateSmartLockWhatsapp();
