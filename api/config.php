<?php
// api/config.php

/**
 * Configuración global de la API
 * Este archivo se incluye en todos los endpoints para establecer configuraciones comunes.
 */

//Definimos el token secreto para la autenticación simple
define('SECRET_TOKEN', 'CLAVE_SEGURA_TIENDA_2025');

//Configuración de Cabeceras HTTP (CORS y Tipo de contenido)
//Permite peticiones desde cualquier origen (útil para desarrollo, restringir en producción)
header('Access-Control-Allow-Origin: *');
//Permite cabeceras específicas, necesario para enviar JSON en el cuerpo de la petición
header('Access-Control-Allow-Headers: Content-Type');
//Define que la respuesta siempre será en formato JSON con codificación UTF-8
header('Content-Type: application/json; charset=utf-8');

/**
 * Función auxiliar para enviar respuestas JSON estandarizadas y terminar la ejecución.
 *
 * @param bool $success Indica si la operación fue exitosa.
 * @param string $message Mensaje descriptivo del resultado.
 * @param array $extraData Datos adicionales a incluir en la respuesta (opcional).
 */
function enviarRespuesta($success, $message, $extraData = [])
{
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $extraData));
    exit; //Detiene la ejecución del script inmediatamente después de enviar la respuesta
}
?>