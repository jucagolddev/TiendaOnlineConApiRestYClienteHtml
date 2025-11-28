# 🛒 JUCASHOP - E-commerce Fullstack (Native PHP & JS)

![Status](https://img.shields.io/badge/Status-Completed-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-Educational-orange)

> **JUCASHOP** es una aplicación web de comercio electrónico desarrollada desde cero (Vanilla Stack) para simular el funcionamiento de una tienda de tecnología real.

Este proyecto ha sido construido sin depender de frameworks pesados (como React, Laravel o Bootstrap) con el objetivo de demostrar un **dominio sólido de los estándares web**, arquitectura de software y comunicación Cliente-Servidor.

---

## 📸 Capturas de Pantalla

*(Puedes subir capturas de tu web a la carpeta assets y enlazarlas aquí)*
| Login | Catálogo | Carrito |
|:---:|:---:|:---:|
| ![Login](https://via.placeholder.assets/img/CLog.png) | ![Dashboard](https://via.placeholder.assets/img/CDashboard.png?text=Catalogo) | ![Cart](https://via.placeholder.assets/img/CCarrito.png) |

---

## 🛠️ Stack Tecnológico

El proyecto sigue una arquitectura **MVC simplificada** con separación clara entre Frontend y Backend.

### 🎨 Frontend
* **HTML5 Semántico:** Estructura limpia y accesible.
* **SCSS (Sass):** Arquitectura modular (BEM), uso de `Mixins` para diseño **Responsive**, variables para tematización y separación en componentes (`_header`, `_cart`, `_login`).
* **JavaScript (ES6+):**
    * Manejo del DOM.
    * `Fetch API` para consumo de servicios REST.
    * Gestión de estado local con `LocalStorage` (persistencia del carrito).

### 🐘 Backend (API REST)
* **PHP Nativo:** Lógica de negocio sin frameworks.
* **JSON Database:** Sistema de almacenamiento de datos basado en archivos (`tienda.json`, `usuarios.json`) simulando una base de datos NoSQL.
* **Validación de Stock:** El servidor verifica el stock real antes de confirmar la compra para evitar errores de concurrencia.

---

## ✨ Funcionalidades Clave

1.  **Autenticación y Seguridad:**
    * Sistema de Login con verificación de usuarios.
    * Protección de rutas (redirección si no hay sesión activa).
    * Uso de Tokens (simulados) para peticiones seguras.

2.  **Experiencia de Compra:**
    * Carga dinámica de productos y categorías.
    * **Carrito de Compras:** Añadir, eliminar y modificar cantidades en tiempo real.
    * Cálculo automático de totales.

3.  **Gestión de Datos:**
    * Validación de stock en el servidor (Backend-side validation).
    * Persistencia de datos del usuario en el navegador.

4.  **Páginas Informativas:**
    * Secciones de "Sobre el Proyecto", "Tiendas" y "Legal" totalmente estilizadas.
    * Navegación fluida y diseño adaptable a Móvil, Tablet y Escritorio.

---

## 📂 Estructura del Proyecto
📁TiendaOnline/
├── 📁 api
│   ├── 🐘 carrito.php
│   ├── 🐘 config.php
│   └── 🐘 login.php
├── 📁 assets
│   └── 📁 img
│       ├── 🖼️ 1.jpg
│       ├── 🖼️ 10.jpg
│       ├── 🖼️ 11.jpg
│       ├── 🖼️ 12.jpg
│       ├── 🖼️ 13.jpg
│       ├── 🖼️ 14.jpg
│       ├── 🖼️ 15.jpg
│       ├── 🖼️ 16.jpg
│       ├── 🖼️ 2.jpg
│       ├── 🖼️ 3.jpg
│       ├── 🖼️ 4.jpg
│       ├── 🖼️ 5.jpg
│       ├── 🖼️ 6.jpg
│       ├── 🖼️ 7.jpg
│       ├── 🖼️ 8.jpg
│       └── 🖼️ 9.jpg
├── 📁 css
│   └── 🎨 estilos.css
├── 📁 data
│   ├── ⚙️ tienda.json
│   └── ⚙️ usuarios.json
├── 📁 js
│   ├── 📄 app.js
│   └── 📄 auth.js
├── 📁 scss
│   ├── 🎨 _cart.scss
│   ├── 🎨 _components.scss
│   ├── 🎨 _footer.scss
│   ├── 🎨 _header.scss
│   ├── 🎨 _layout.scss
│   ├── 🎨 _login.scss
│   ├── 🎨 _main.scss
│   ├── 🎨 _mixins.scss
│   ├── 🎨 _pages.scss
│   ├── 🎨 _reset.scss
│   ├── 🎨 _variables.scss
│   └── 🎨 estilos.scss
├── 🌐 acerca.html
├── 🌐 cart.html
├── 🌐 categories.html
├── 🌐 contacto.html
├── 🌐 dashboard.html
├── 🌐 legal.html
├── 🌐 login.html
├── 🌐 product.html
└── 🌐 tiendas.html
