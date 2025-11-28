<?php
// api/login.php

//Incluimos el archivo de configuración para obtener funciones comunes y constantes
require 'config.php';
//1. Leer el JSON enviado por el cliente (cuerpo de la petición POST)
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

//Extraemos usuario y contraseña del input
$user = $input['usuario'] ?? '';
$pass = $input['password'] ?? '';

//2. Cargar datos necesarios (Simulación de Base de Datos)
$rutaUsuarios = '../data/usuarios.json'; //Archivo con credenciales de usuarios
$rutaTienda = '../data/tienda.json';     //Archivo con datos de productos y categorías

//Verificamos que existan los archivos de datos
if (!file_exists($rutaUsuarios) || !file_exists($rutaTienda)) {
    enviarRespuesta(false, 'Error del servidor: Archivos de datos no encontrados.');
}

//Decodificamos el JSON de usuarios
$usuariosData = json_decode(file_get_contents($rutaUsuarios), true);
$loginExitoso = false;

//3. Verificar credenciales
//Recorremos la lista de usuarios para buscar coincidencia
foreach ($usuariosData as $u) {
    //Comparación directa (en producción usar hash de contraseñas como password_verify)
    if ($u['user'] === $user && $u['pass'] === $pass) {
        $loginExitoso = true;
        break;
    }
}

//4. Responder al cliente
if ($loginExitoso) {
    //Leemos los datos de la tienda para enviarlos al cliente
    //Esto permite que el cliente tenga la información inicial (productos, categorías) al iniciar sesión
    $tiendaData = json_decode(file_get_contents($rutaTienda), true);
    
    //Enviamos respuesta de éxito con el token y los datos de la tienda
    enviarRespuesta(true, 'Login correcto', [
        'token' => SECRET_TOKEN, //Enviamos el token definido en config.php
        'data' => $tiendaData    //Enviamos productos y categorías
    ]);
} else {
    //Si las credenciales son incorrectas
    http_response_code(401); //Código HTTP 401 Unauthorized
    enviarRespuesta(false, 'Usuario o contraseña incorrectos');
}
?>