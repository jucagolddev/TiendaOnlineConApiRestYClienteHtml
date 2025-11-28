/* js/app.js */

/**
 * 1. Estado global de la aplicación
 * Se intenta cargar los datos de productos y categorías desde localStorage.
 * Si hay un error o no existen, se inicializa con arrays vacíos.
 */
let storeData;
try {
  storeData = JSON.parse(localStorage.getItem(KEYS.TIENDA_DATA)) || {
    productos: [],
    categorias: [],
  };
} catch (e) {
  storeData = { productos: [], categorias: [] };
}

// Carga del carrito y productos vistos recientemente desde localStorage
let carrito = JSON.parse(localStorage.getItem(KEYS.CARRITO)) || [];
let vistos = JSON.parse(localStorage.getItem(KEYS.VISTOS)) || [];

/**
 * 2. Utilidades generales
 * Funciones auxiliares para formateo de moneda, búsqueda de productos y manejo del menú móvil.
 */
const Utils = {
  /**
   * Formatea un número como moneda (Euro).
   * @param {number} num - El número a formatear.
   * @returns {string} - El valor formateado con el símbolo de Euro.
   */
  money: (num) => parseFloat(num).toFixed(2) + "€",

  /**
   * Busca un producto por su ID en los datos cargados.
   * @param {number|string} id - El ID del producto.
   * @returns {object|undefined} - El objeto producto o undefined si no se encuentra.
   */
  getById: (id) => storeData.productos.find((p) => p.id == id),

  /**
   * Inicializa el comportamiento del menú hamburguesa para móviles.
   */
  initMobileMenu: () => {
    const toggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (toggle && navLinks) {
      toggle.addEventListener("click", () => {
        navLinks.classList.toggle("active");
      });
    }
  },
};

/**
 * 3. Gestión del carrito de compras
 * Objeto que maneja todas las operaciones relacionadas con el carrito:
 * añadir, disminuir cantidad, eliminar, guardar y finalizar compra.
 */
const Cart = {
  /**
   * Añade un producto al carrito o incrementa su cantidad.
   * Verifica el stock disponible antes de añadir.
   * @param {number|string} id - El ID del producto a añadir.
   */
  add: (id) => {
    const product = Utils.getById(id);
    const itemEnCarrito = carrito.find((item) => item.id == id);

    // Cantidad actual en el carrito
    const currentQty = itemEnCarrito ? itemEnCarrito.cantidad : 0;

    // Validación de stock máximo
    if (product && product.stock !== undefined && currentQty >= product.stock) {
      alert(
        `⚠️ Stock máximo alcanzado. Solo quedan ${product.stock} unidades.`
      );
      return;
    }

    if (itemEnCarrito) {
      itemEnCarrito.cantidad++;
    } else {
      carrito.push({ id: id, cantidad: 1 });
    }

    Cart.save();

    // Refrescar la vista si el usuario está en la página del carrito
    if (document.getElementById("cart-table-body")) {
      UI.renderCartPage();
    } else {
      alert("Producto añadido al carrito 🛒");
    }
  },

  /**
   * Disminuye la cantidad de un producto en el carrito.
   * Si la cantidad llega a 0, elimina el producto.
   * @param {number|string} id - El ID del producto.
   */
  decrease: (id) => {
    const item = carrito.find((i) => i.id == id);
    if (item) {
      item.cantidad--;
      if (item.cantidad <= 0) {
        Cart.remove(id);
        return;
      }
      Cart.save();
      UI.renderCartPage();
    }
  },

  /**
   * Elimina un producto del carrito tras confirmación del usuario.
   * @param {number|string} id - El ID del producto a eliminar.
   */
  remove: (id) => {
    if (confirm("¿Eliminar producto del carrito?")) {
      carrito = carrito.filter((i) => i.id != id);
      Cart.save();
      UI.renderCartPage();
    }
  },

  /**
   * Guarda el estado actual del carrito en localStorage y actualiza el contador en el header.
   */
  save: () => {
    localStorage.setItem(KEYS.CARRITO, JSON.stringify(carrito));
    UI.updateCartCount();
  },

  /**
   * Procesa el pedido enviando los datos al servidor (API).
   * Maneja la respuesta, actualiza el stock local y limpia el carrito si es exitoso.
   */
  checkout: async () => {
    if (carrito.length === 0) return;
    const token = localStorage.getItem(KEYS.TOKEN);

    // Calcular el total del lado del cliente para enviarlo al servidor
    let totalCliente = 0;
    carrito.forEach((item) => {
      const p = Utils.getById(item.id);
      if (p) {
        totalCliente += p.precio * item.cantidad;
      }
    });

    try {
      // Usamos API_URL que viene de auth.js
      const res = await fetch(`${API_URL}/carrito.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          carrito: carrito,
          total_cliente: totalCliente, // Enviamos el total calculado localmente
        }),
      });
      const data = await res.json();

      if (data.success) {
        alert(
          `${data.message}\nTotal Validado: ${Utils.money(data.total_validado)}`
        );

        // Actualizar datos locales con la respuesta del servidor (nuevo stock actualizado)
        if (data.data) {
          localStorage.setItem(KEYS.TIENDA_DATA, JSON.stringify(data.data));
        }

        // Limpieza post-compra (Solo se borra el carrito)
        localStorage.removeItem(KEYS.CARRITO);
        // Ya no borramos TIENDA_DATA porque la acabamos de actualizar con los nuevos stocks

        window.location.href = "dashboard.html";
      } else {
        // Si hay error (por ejemplo, precio incorrecto)
        alert("❌ Error: " + data.message);

        // Si el servidor envió datos actualizados (por ejemplo, precios corregidos)
        if (data.data) {
          localStorage.setItem(KEYS.TIENDA_DATA, JSON.stringify(data.data));
          // Recargar la página para mostrar los precios correctos
          window.location.reload();
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error al procesar el pedido");
    }
  },
};

/**
 * 4. Productos vistos recientemente
 * Gestiona la lista de los últimos productos visitados por el usuario.
 */
const Recent = {
  /**
   * Añade un producto a la lista de vistos recientemente.
   * Mantiene un máximo de 4 productos en la lista.
   * @param {object} product - El objeto producto a añadir.
   */
  add: (product) => {
    // Evitar duplicados: primero filtramos si ya existe
    vistos = vistos.filter((p) => p.id !== product.id);
    // Añadimos al inicio
    vistos.unshift(product);
    // Limitamos a 4 items
    if (vistos.length > 4) vistos.pop();
    localStorage.setItem(KEYS.VISTOS, JSON.stringify(vistos));
  },
};

/**
 * 5. Renderizado de Interfaz de Usuario (UI)
 * Contiene funciones para dibujar elementos en el DOM.
 */
const UI = {
  /**
   * Renderiza una cuadrícula de productos en un contenedor específico.
   * @param {string} containerId - El ID del elemento contenedor.
   * @param {Array} products - Array de productos a renderizar.
   */
  renderGrid: (containerId, products) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    if (products.length === 0) {
      container.innerHTML = "<p>Cargando o no hay productos...</p>";
      return;
    }

    products.forEach((p) => {
      const cardHTML = `
                <article class="card">
                    <a href="product.html?id=${
                      p.id
                    }" class="card-link" data-id="${p.id}">
                        <img src="${p.img}" alt="${p.nombre}">
                        <div class="card-body">
                            <h3>${p.nombre}</h3>
                            <div class="price">${Utils.money(p.precio)}</div>
                        </div>
                    </a>
                    <button class="btn btn-primary" onclick="Cart.add(${p.id})">
                        Añadir
                    </button>
                </article>
            `;
      container.innerHTML += cardHTML;
    });

    // Añadir listeners a los enlaces para registrar "vistos recientemente"
    document.querySelectorAll(".card-link").forEach((link) => {
      link.addEventListener("click", () => {
        const prod = Utils.getById(link.dataset.id);
        if (prod) Recent.add(prod);
      });
    });
  },

  /**
   * Actualiza el contador de productos en el icono del carrito del header.
   */
  updateCartCount: () => {
    const count = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const badge = document.getElementById("cart-count");
    if (badge) badge.innerText = count;
  },

  /**
   * Renderiza la tabla de productos en la página del carrito.
   * Calcula totales y muestra controles de cantidad.
   */
  renderCartPage: () => {
    const tbody = document.getElementById("cart-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center; padding:2rem;">El carrito está vacío 🛒</td></tr>';
      document.getElementById("cart-total").innerText = "0.00€";
      return;
    }

    carrito.forEach((item) => {
      const p = Utils.getById(item.id);
      if (p) {
        const subtotal = p.precio * item.cantidad;
        total += subtotal;

        // Verificar si se ha alcanzado el stock máximo
        const isMaxed = p.stock !== undefined && item.cantidad >= p.stock;

        tbody.innerHTML += `
                    <tr>
                        <td data-label="Producto">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <img src="${
                                  p.img
                                }" style="width:50px; height:50px; object-fit:contain;">
                                <strong>${p.nombre}</strong>
                            </div>
                        </td>
                        <td data-label="Precio">${Utils.money(p.precio)}</td>
                        <td data-label="Cantidad">
                            <div class="qty-controls">
                                <button onclick="Cart.decrease(${
                                  item.id
                                })">-</button>
                                <span>${item.cantidad}</span>
                                <button onclick="Cart.add(${item.id})" ${
          isMaxed ? "disabled" : ""
        }>+</button>
                            </div>
                            ${
                              isMaxed
                                ? '<small style="color:red; font-size:0.7em;">Max. Stock</small>'
                                : ""
                            }
                        </td>
                        <td data-label="Subtotal">${Utils.money(subtotal)}</td>
                        <td data-label="Acciones" style="text-align:center;">
                            <button class="btn-delete" onclick="Cart.remove(${
                              item.id
                            })" title="Eliminar">🗑️</button>
                        </td>
                    </tr>
                `;
      }
    });

    document.getElementById("cart-total").innerText = Utils.money(total);
  },
};

/**
 * 6. Inicializador principal
 * Se ejecuta cuando el DOM está completamente cargado.
 * Maneja la lógica específica para cada página (Dashboard, Categorías, Producto, Carrito).
 */
document.addEventListener("DOMContentLoaded", () => {
  // Chequeo de seguridad: Redirigir al login si no hay token (Excepto en login.html)
  if (!window.location.href.includes("login.html")) {
    // Usamos KEYS que viene de auth.js
    const token = localStorage.getItem(KEYS.TOKEN);
    if (!token) window.location.href = "login.html";
  }

  // Inicializaciones comunes
  UI.updateCartCount();
  Utils.initMobileMenu();

  // --- Lógica específica por página ---

  // Página: Dashboard (Inicio)
  if (document.getElementById("destacados-container")) {
    if (storeData && storeData.productos) {
      const destacados = storeData.productos.filter((p) => p.destacado);
      UI.renderGrid("destacados-container", destacados);
    }
    // Mostrar vistos recientemente si existen
    if (vistos.length > 0) {
      document.getElementById("recientes-section").style.display = "block";
      UI.renderGrid("recientes-container", vistos);
    }
  }

  // Página: Categorías
  if (document.getElementById("cat-list")) {
    const catList = document.getElementById("cat-list");
    // Renderizar botones de categorías
    if (storeData && storeData.categorias) {
      storeData.categorias.forEach((c) => {
        catList.innerHTML += `<a href="?cat=${c.id}" class="btn btn-primary" style="padding:10px 20px;">${c.nombre}</a>`;
      });
    }

    // Filtrar productos si hay una categoría seleccionada en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const catId = urlParams.get("cat");
    if (catId && storeData.productos) {
      const filtered = storeData.productos.filter(
        (p) => p.id_categoria == catId
      );
      UI.renderGrid("cat-products-container", filtered);
    }
  }

  // Página: Detalle de Producto
  if (document.getElementById("product-detail")) {
    const urlParams = new URLSearchParams(window.location.search);
    const prodId = urlParams.get("id");
    const p = Utils.getById(prodId);

    if (p) {
      // Añadir a vistos recientemente al entrar al detalle
      Recent.add(p);
      const container = document.getElementById("product-detail");
      container.innerHTML = `
                <div style="display:flex; flex-wrap:wrap; gap:2rem;">
                    <img src="${
                      p.img
                    }" style="max-width:400px; width:100%; object-fit:contain;">
                    <div style="flex:1;">
                        <h1 style="color:var(--color-primary);">${p.nombre}</h1>
                        <h2 style="font-size:2.5rem; margin:1rem 0;">${Utils.money(
                          p.precio
                        )}</h2>
                        <p>Stock disponible: <strong>${
                          p.stock
                        } unidades</strong></p>
                        <p>ID Referencia: ${p.id}</p>
                        <p>Descripción del producto...</p>
                        <br>
                        <button class="btn btn-primary" onclick="Cart.add(${
                          p.id
                        })">Añadir al Carrito</button>
                    </div>
                </div>
            `;
    }
  }

  // Página: Carrito
  if (document.getElementById("cart-table-body")) {
    UI.renderCartPage();
    const btnCheckout = document.getElementById("btn-checkout");
    if (btnCheckout) btnCheckout.addEventListener("click", Cart.checkout);
  }
});
