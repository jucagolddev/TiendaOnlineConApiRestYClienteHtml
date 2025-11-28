<?php
//api/carrito.php

//Incluimos el archivo de configuración para obtener funciones comunes y constantes
require 'config.php';

//1. Leer el JSON enviado por el cliente (cuerpo de la petición POST)
$input = json_decode(file_get_contents('php://input'), true);

//Verificamos que la entrada sea un array válido
if (!is_array($input)) {
    enviarRespuesta(false, 'Datos inválidos');
}

//Extraemos el token y el carrito del input
$token = $input['token'] ?? '';
$carrito = $input['carrito'] ?? [];

//2. Validar Token (Simulado)
//Comprobamos si el token recibido coincide con el token secreto del servidor
if ($token !== SECRET_TOKEN) {
    http_response_code(401); // No autorizado
    enviarRespuesta(false, 'Sesión no válida o expirada');
}

//Verificamos que el carrito no esté vacío
if (empty($carrito)) {
    enviarRespuesta(false, 'El carrito está vacío');
}

//3. Cargar datos de la tienda (base de datos JSON)
$rutaTienda = '../data/tienda.json';
if (!file_exists($rutaTienda)) {
    enviarRespuesta(false, 'Error del servidor: Base de datos no encontrada');
}

//Decodificamos el JSON de la tienda
$tiendaData = json_decode(file_get_contents($rutaTienda), true);
$productos = &$tiendaData['productos']; // Usamos referencia (&) para poder modificar el array original

$totalCliente = $input['total_cliente'] ?? 0;
$totalValidado = 0;
$cambiosRealizados = false;

//4. Procesar Carrito y Calcular Totales (Sin modificar stock aún)
//Primero verificamos precios y stock antes de confirmar nada
$errorPrecio = false;
$errorStock = false;

//Copia temporal para cálculos
$productosTemp = $productos; 

foreach ($carrito as $item) {
    $id = $item['id'];
    $cantidad = $item['cantidad'];

    foreach ($productosTemp as $p) {
        if ($p['id'] == $id) {
            $totalValidado += ($p['precio'] * $cantidad);
            if ($p['stock'] < $cantidad) {
                $errorStock = true;
            }
            break;
        }
    }
}

//Validación de Seguridad: Precio
//Permitimos una diferencia mínima por redondeo (epsilon)
if (abs($totalValidado - $totalCliente) > 0.01) {
    enviarRespuesta(false, 'El precio de los productos ha cambiado o es incorrecto. Se han actualizado los datos.', [
        'data' => $tiendaData //Enviamos datos reales para corregir al cliente
    ]);
}

if ($errorStock) {
    enviarRespuesta(false, 'No hay suficiente stock para algunos productos.');
}

//5. Si todo es correcto, procedemos a restar stock
foreach ($carrito as $item) {
    $id = $item['id'];
    $cantidad = $item['cantidad'];

    foreach ($productos as &$p) {
        if ($p['id'] == $id) {
            $p['stock'] -= $cantidad;
            $cambiosRealizados = true;
            break;
        }
    }
}

//6. Guardar cambios
if ($cambiosRealizados) {
    if (file_put_contents($rutaTienda, json_encode($tiendaData, JSON_PRETTY_PRINT))) {
        enviarRespuesta(true, 'Compra realizada con éxito', [
            'total_validado' => $totalValidado,
            'data' => $tiendaData
        ]);
    } else {
        enviarRespuesta(false, 'Error al guardar los datos de la compra');
    }
} else {
    enviarRespuesta(false, 'No se pudo procesar ningún producto');
}
?>