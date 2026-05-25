const phone = "542615188484";
const appShell = document.querySelector(".phone-shell");
const currentTime = document.querySelector("#currentTime");
const detailTriggers = document.querySelectorAll("[data-detail]");
const closeDetailButtons = document.querySelectorAll("[data-close-detail]");
const detailPanels = document.querySelectorAll(".detail-panel");
const priveCategoryButtons = document.querySelectorAll("[data-prive-filter]");
const priveProducts = document.querySelector("#catalogo-prive .prive-products");
const priveCategoryEmpty = document.querySelector("#catalogo-prive .prive-category-empty");
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
const cartBoxes = Array.from(document.querySelectorAll(".cart-box"));
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
  const highestItemPrice = cart.reduce((highest, item) => Math.max(highest, item.price), 0);
  const delivery = Math.round(highestItemPrice * 0.2);
  return { subtotal, delivery, total: subtotal + delivery };
}

function normalizePriveCategory(title) {
  const normalized = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (normalized.includes("euro")) return "europerfil";
  if (normalized.includes("cerrojo")) return "cerrojos";
  if (normalized.includes("candado")) return "candados";
  if (normalized.includes("eslinga")) return "eslingas";
  if (normalized.includes("caja")) return "caja-seguridad";
  return "cerraduras";
}

function setupPriveCategories() {
  if (!priveProducts || !priveCategoryButtons.length) return;

  let currentCategory = "";
  priveProducts.querySelectorAll(".prive-section-title, .prive-product-card").forEach((element) => {
    if (element.classList.contains("prive-section-title")) {
      currentCategory = normalizePriveCategory(element.textContent || "");
      element.dataset.priveCategory = currentCategory;
      element.hidden = true;
      return;
    }
    element.dataset.priveCategory = currentCategory || "cerraduras";
    element.hidden = true;
  });

  priveCategoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.priveFilter;
      priveCategoryButtons.forEach((item) => item.classList.toggle("active", item === button));
      priveProducts.querySelectorAll("[data-prive-category]").forEach((element) => {
        element.hidden = element.dataset.priveCategory !== category;
      });
      if (priveCategoryEmpty) {
        priveCategoryEmpty.hidden = true;
      }
      appShell.scrollTo({ top: priveProducts.offsetTop - 12, behavior: "smooth" });
    });
  });
}

updateCurrentTime();
setInterval(updateCurrentTime, 15000);
setupPriveCategories();

document.querySelectorAll("[data-service]").forEach((link) => {
  if (link.dataset.detail) return;
  if (link.dataset.cartArt) return;
  const service = link.dataset.service || "ayuda de cerrajeria";
  link.href = whatsappUrl(service);
  link.target = "_blank";
  link.rel = "noreferrer";
});

function getCartParts(cartBox) {
  return {
    items: cartBox.querySelector(".cart-items"),
    count: cartBox.querySelector("#cartCount, [data-cart-count]"),
    subtotal: cartBox.querySelector("#cartSubtotal, [data-cart-subtotal]"),
    delivery: cartBox.querySelector("#cartDelivery, [data-cart-delivery]"),
    total: cartBox.querySelector("#cartTotal, [data-cart-total]"),
    address: cartBox.querySelector(".cart-address input"),
    checkout: cartBox.querySelector(".cart-checkout"),
  };
}

function updateCart() {
  if (!cartBoxes.length) return;

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const { subtotal, delivery, total } = orderTotals();

  cartBoxes.forEach((cartBox) => {
    const parts = getCartParts(cartBox);
    if (!parts.items || !parts.count || !parts.subtotal || !parts.delivery || !parts.total || !parts.checkout) return;

    parts.count.textContent = `${itemCount} ${itemCount === 1 ? "producto" : "productos"}`;
    parts.subtotal.textContent = formatMoney(subtotal);
    parts.delivery.textContent = formatMoney(delivery);
    parts.total.textContent = formatMoney(total);

    if (!cart.length) {
      parts.items.innerHTML = '<p class="cart-empty">Toca una cerradura para agregarla al pedido.</p>';
      parts.checkout.classList.add("disabled");
      parts.checkout.removeAttribute("href");
      parts.checkout.setAttribute("aria-disabled", "true");
      return;
    }

    parts.items.innerHTML = cart
      .map(
        (item, index) => `
          <div class="cart-item">
            <div>
              <strong>${item.brand} ART. ${item.art}</strong>
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

    const address = parts.address?.value.trim() || "domicilio a confirmar";
    const order = cart
      .map((item) => `${item.brand} ART. ${item.art} - ${item.name} x ${item.quantity}: ${formatMoney(item.price * item.quantity)}`)
      .join("; ");
    parts.checkout.href = whatsappUrl(
      `comprar estos productos: ${order}. Subtotal: ${formatMoney(subtotal)}. Envio a domicilio: ${formatMoney(delivery)}. Total: ${formatMoney(total)}. Domicilio: ${address}. Quiero coordinar pago y entrega`
    );
    parts.checkout.target = "_blank";
    parts.checkout.rel = "noreferrer";
    parts.checkout.classList.remove("disabled");
    parts.checkout.setAttribute("aria-disabled", "false");
  });
}

document.querySelectorAll("[data-cart-art]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const art = button.dataset.cartArt;
    const brand = button.dataset.cartBrand || "PRIVE";
    const name = button.dataset.cartName;
    const price = Number(button.dataset.cartPrice || 0);
    if (!art || !name || !price) return;

    const existing = cart.find((item) => item.brand === brand && item.art === art);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ brand, art, name, price, quantity: 1 });
    }

    button.classList.add("added");
    button.textContent = "Agregado al carrito";
    setTimeout(() => {
      button.classList.remove("added");
      button.textContent = `Agregar / ${formatMoney(price)}`;
    }, 1100);
    updateCart();
    const cartBox = button.closest(".detail-panel")?.querySelector(".cart-box") || document.querySelector(".cart-box");
    cartBox?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

document.addEventListener("click", (event) => {
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

cartBoxes.forEach((cartBox) => getCartParts(cartBox).address?.addEventListener("input", updateCart));
updateCart();

async function startMercadoPagoCheckout(checkoutButton) {
  const cartBox = checkoutButton.closest(".cart-box");
  const { address: addressInput } = getCartParts(cartBox);
  const address = addressInput?.value.trim();
  if (!cart.length) return;
  if (!address) {
    alert("Escribi el domicilio de entrega antes de finalizar la compra.");
    addressInput?.focus();
    return;
  }

  checkoutButton.classList.add("loading");
  checkoutButton.textContent = "Abriendo Mercado Pago...";

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
    console.error(error);
    alert("No se pudo abrir Mercado Pago. Revisa la conexion o intenta nuevamente en unos minutos.");
  } finally {
    checkoutButton.classList.remove("loading");
    checkoutButton.textContent = "Finalizar compra";
  }
}

document.querySelectorAll(".cart-checkout").forEach((checkoutButton) => {
  checkoutButton.addEventListener("click", (event) => {
    if (checkoutButton.classList.contains("disabled")) return;
    event.preventDefault();
    startMercadoPagoCheckout(checkoutButton);
  });
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
