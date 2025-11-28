/* js/auth.js */

/**
 * Definición de constantes globales
 * Se definen aquí para que estén disponibles en toda la aplicación.
 * API_URL: URL base para las peticiones al backend.
 * KEYS: Claves utilizadas para almacenar datos en localStorage.
 */
const API_URL = "http://localhost/TiendaOnlineConApiRestYClienteHtml/api";
const KEYS = {
  TOKEN: "mitienda_token", // Token de sesión
  TIENDA_DATA: "mitienda_data", // Datos de productos y categorías
  CARRITO: "mitienda_cart", // Estado del carrito
  VISTOS: "mitienda_viewed", // Historial de productos vistos
};

/**
 * Servicio de Autenticación
 * Maneja el inicio de sesión, cierre de sesión y verificación de seguridad.
 */
const AuthService = {
  /**
   * Inicia sesión en la aplicación.
   * Envía las credenciales al servidor y, si son correctas, guarda el token y los datos iniciales.
   * @param {string} usuario - Nombre de usuario.
   * @param {string} password - Contraseña.
   */
  async login(usuario, password) {
    try {
      const response = await fetch(`${API_URL}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });

      const result = await response.json();

      if (result.success) {
        // 1. Guardar Token de sesión
        localStorage.setItem(KEYS.TOKEN, result.token);
        // 2. Guardar Datos iniciales de la Tienda (productos y categorías)
        localStorage.setItem(KEYS.TIENDA_DATA, JSON.stringify(result.data));

        // 3. Inicializar estructuras vacías en localStorage si no existen
        if (!localStorage.getItem(KEYS.CARRITO))
          localStorage.setItem(KEYS.CARRITO, "[]");
        if (!localStorage.getItem(KEYS.VISTOS))
          localStorage.setItem(KEYS.VISTOS, "[]");

        // Redirigir al dashboard
        window.location.href = "dashboard.html";
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
    }
  },

  /**
   * Cierra la sesión del usuario.
   * Elimina todos los datos almacenados en localStorage y redirige al login.
   */
  logout() {
    if (confirm("¿Seguro que quieres cerrar sesión?")) {
      localStorage.removeItem(KEYS.TOKEN);
      localStorage.removeItem(KEYS.TIENDA_DATA);
      localStorage.removeItem(KEYS.CARRITO);
      localStorage.removeItem(KEYS.VISTOS);
      window.location.href = "login.html";
    }
  },

  /**
   * Verifica si el usuario tiene una sesión activa (token).
   * Si no hay token, redirige a la página de login.
   */
  checkGuard() {
    const token = localStorage.getItem(KEYS.TOKEN);
    if (!token) {
      window.location.href = "login.html";
    }
  },
};
